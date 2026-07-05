import { db, users } from '../../db/index.js'
import { eq } from 'drizzle-orm'

export default async function handler(req, res) {
  try {
    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Method not allowed' })
    }

    const { clerkId, email, firstName, lastName, imageUrl } = req.body ?? {}

    if (!clerkId || typeof clerkId !== 'string' || !clerkId.startsWith('user_')) {
      return res.status(400).json({ error: 'Invalid clerkId' })
    }
    if (!email || typeof email !== 'string' || !email.includes('@')) {
      return res.status(400).json({ error: 'Invalid email' })
    }

    const now = new Date()
    await db
      .insert(users)
      .values({
        clerkId,
        email,
        firstName: firstName || null,
        lastName: lastName || null,
        imageUrl: imageUrl || null,
        updatedAt: now,
      })
      .onConflictDoUpdate({
        target: users.clerkId,
        set: {
          email,
          firstName: firstName || null,
          lastName: lastName || null,
          imageUrl: imageUrl || null,
          updatedAt: now,
        },
      })

    return res.status(200).json({ ok: true })
  } catch (error) {
    console.error('[sync-user]', error.message)
    return res.status(500).json({ error: 'Failed to sync user' })
  }
}
