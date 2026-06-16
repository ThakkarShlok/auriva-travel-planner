import { createPublicKey, createVerify } from 'node:crypto'
import { db, users } from '../../src/db/index.js'
import { eq } from 'drizzle-orm'

export class AuthError extends Error {
  constructor(message, status = 401) {
    super(message)
    this.name = 'AuthError'
    this.status = status
  }
}

// Cache JWKS for 1 hour — avoids a round-trip on every request
let jwksCache = null
let jwksCacheTime = 0
const JWKS_TTL_MS = 60 * 60 * 1000

async function getJwks(issuer) {
  const now = Date.now()
  if (jwksCache && now - jwksCacheTime < JWKS_TTL_MS) return jwksCache
  const res = await fetch(`${issuer}/.well-known/jwks.json`)
  if (!res.ok) throw new AuthError(`Failed to fetch JWKS: ${res.status}`, 500)
  jwksCache = await res.json()
  jwksCacheTime = now
  return jwksCache
}

/**
 * Verifies the Clerk session JWT from the Authorization header.
 * Uses Clerk's JWKS endpoint for RS256 signature verification — no extra packages.
 * Returns the matching Neon `users` row.
 * Throws AuthError on any failure.
 */
export async function requireUser(req) {
  const authHeader = req.headers?.authorization || req.headers?.Authorization
  if (!authHeader?.startsWith('Bearer ')) {
    throw new AuthError('Missing or malformed Authorization header')
  }
  const token = authHeader.slice(7).trim()

  const parts = token.split('.')
  if (parts.length !== 3) throw new AuthError('Malformed JWT')

  let header, payload
  try {
    header  = JSON.parse(Buffer.from(parts[0], 'base64url').toString())
    payload = JSON.parse(Buffer.from(parts[1], 'base64url').toString())
  } catch {
    throw new AuthError('Could not decode JWT claims')
  }

  // Check expiry before the network round-trip
  if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) {
    throw new AuthError('Token expired')
  }

  const issuer = payload.iss
  if (!issuer) throw new AuthError('JWT missing iss claim')

  // Fetch JWKS from Clerk's well-known endpoint and find the matching key
  const jwks = await getJwks(issuer)
  const jwk = jwks.keys?.find(k => k.kid === header.kid)
  if (!jwk) throw new AuthError('No matching signing key found for token')

  // Verify RS256 signature using Node.js built-in crypto
  try {
    const publicKey = createPublicKey({ key: jwk, format: 'jwk' })
    const verifier = createVerify('RSA-SHA256')
    verifier.update(`${parts[0]}.${parts[1]}`)
    const valid = verifier.verify(publicKey, Buffer.from(parts[2], 'base64url'))
    if (!valid) throw new AuthError('Invalid JWT signature')
  } catch (err) {
    if (err instanceof AuthError) throw err
    throw new AuthError(`JWT verification failed: ${err.message}`)
  }

  const clerkId = payload.sub
  if (!clerkId) throw new AuthError('JWT missing sub claim')

  // Look up the synced Neon user — created by JIT sync on first sign-in
  const [user] = await db.select().from(users).where(eq(users.clerkId, clerkId)).limit(1)
  if (!user) {
    throw new AuthError('User not found in database. Sign in again to trigger sync.', 403)
  }

  return user
}
