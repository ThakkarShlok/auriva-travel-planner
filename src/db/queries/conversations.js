import { db, conversationMessages } from '../index.js'
import { eq, and, asc } from 'drizzle-orm'

export async function appendMessage({ tripId, userId, role, content }) {
  const [message] = await db
    .insert(conversationMessages)
    .values({ tripId, userId, role, content })
    .returning()
  return message
}

export async function getConversationForTrip(tripId, userId) {
  return await db
    .select()
    .from(conversationMessages)
    .where(and(eq(conversationMessages.tripId, tripId), eq(conversationMessages.userId, userId)))
    .orderBy(asc(conversationMessages.createdAt))
}
