import { Webhook } from 'svix'
import { db, users } from '../../src/db/index.js'
import { eq } from 'drizzle-orm'

const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET

export default async function handler(req, res) {
  try {
    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Method not allowed' })
    }

    if (!WEBHOOK_SECRET) {
      console.error('[clerk webhook] CLERK_WEBHOOK_SECRET not set')
      return res.status(500).json({ error: 'Webhook secret not configured' })
    }

    const svix_id = req.headers['svix-id']
    const svix_timestamp = req.headers['svix-timestamp']
    const svix_signature = req.headers['svix-signature']

    if (!svix_id || !svix_timestamp || !svix_signature) {
      return res.status(400).json({ error: 'Missing svix headers' })
    }

    // Prefer the raw body string (attached by vite middleware) for correct signature
    // verification. Re-serialised JSON might differ in whitespace/key order.
    const payload = req.rawBody || (typeof req.body === 'string' ? req.body : JSON.stringify(req.body))

    const wh = new Webhook(WEBHOOK_SECRET)
    let event

    try {
      event = wh.verify(payload, {
        'svix-id': svix_id,
        'svix-timestamp': svix_timestamp,
        'svix-signature': svix_signature,
      })
    } catch (err) {
      console.error('[clerk webhook] signature verification failed:', err.message)
      return res.status(400).json({ error: 'Invalid signature' })
    }

    const { type, data } = event

    if (type === 'user.created' || type === 'user.updated') {
      const userData = {
        clerkId: data.id,
        email: data.email_addresses?.[0]?.email_address ?? '',
        firstName: data.first_name ?? null,
        lastName: data.last_name ?? null,
        imageUrl: data.image_url ?? null,
        updatedAt: new Date(),
      }

      if (type === 'user.created') {
        await db.insert(users).values(userData).onConflictDoNothing()
        console.log('[clerk webhook] user created:', data.id)
      } else {
        await db.update(users).set(userData).where(eq(users.clerkId, data.id))
        console.log('[clerk webhook] user updated:', data.id)
      }
    } else if (type === 'user.deleted') {
      await db.delete(users).where(eq(users.clerkId, data.id))
      console.log('[clerk webhook] user deleted:', data.id)
    } else {
      console.log('[clerk webhook] ignored event type:', type)
    }

    return res.status(200).json({ ok: true })

  } catch (error) {
    console.error('[clerk webhook] handler error:', error.message)
    return res.status(500).json({ error: 'Webhook processing failed' })
  }
}

export const config = { maxDuration: 30 }
