import { assertGeminiKey } from './_lib/gemini.js'
import { db, getDatabaseUrlSource } from '../../db/index.js'
import { sql } from 'drizzle-orm'

export default async function handler(req, res) {
  try {
    if (req.method !== 'GET') {
      return res.status(405).json({ error: 'Method not allowed' })
    }

    const checks = {
      geminiKey: 'unknown',
      databaseUrl: 'unknown',
      databaseUrlSource: 'unknown',
      clerkSecret: 'unknown',
      databaseConnection: 'unknown',
    }

    try { assertGeminiKey(); checks.geminiKey = 'present' }
    catch { checks.geminiKey = 'missing or malformed' }

    const databaseUrlSource = getDatabaseUrlSource()
    checks.databaseUrl = databaseUrlSource ? 'present' : 'missing'
    checks.databaseUrlSource = databaseUrlSource ?? 'none'
    checks.clerkSecret = process.env.CLERK_SECRET_KEY ? 'present' : 'missing'

    try {
      await db.execute(sql`SELECT 1`)
      checks.databaseConnection = 'ok'
    } catch (err) {
      checks.databaseConnection = `failed: ${err.message?.slice(0, 100)}`
    }

    const ok = checks.geminiKey === 'present'
      && checks.databaseUrl === 'present'
      && checks.clerkSecret === 'present'
      && checks.databaseConnection === 'ok'

    return res.status(200).json({
      ok,
      checks,
      node: process.version,
      timestamp: new Date().toISOString(),
    })

  } catch (error) {
    return res.status(500).json({
      ok: false,
      error: error?.message || 'health check crashed',
      timestamp: new Date().toISOString(),
    })
  }
}
