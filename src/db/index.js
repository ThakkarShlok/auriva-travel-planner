import { neon } from '@neondatabase/serverless'
import { drizzle } from 'drizzle-orm/neon-http'
import * as schema from './schema.js'

const DATABASE_ENV_KEYS = [
  'DATABASE_URL',
  'POSTGRES_URL',
  'POSTGRES_PRISMA_URL',
  'DATABASE_URL_UNPOOLED',
]

export function getDatabaseUrlSource() {
  return DATABASE_ENV_KEYS.find((key) => Boolean(process.env[key])) ?? null
}

export function getDatabaseUrl() {
  const key = getDatabaseUrlSource()
  return key ? process.env[key] : null
}

function createDb() {
  const url = getDatabaseUrl()
  if (!url) {
    throw new Error(
      `Database connection string is not set. Add one of: ${DATABASE_ENV_KEYS.join(', ')}.`,
    )
  }

  const sql = neon(url)
  return drizzle(sql, { schema })
}

let dbInstance

function getDb() {
  if (!dbInstance) dbInstance = createDb()
  return dbInstance
}

export const db = new Proxy({}, {
  get(_target, prop) {
    const value = getDb()[prop]
    return typeof value === 'function' ? value.bind(getDb()) : value
  },
})

export * from './schema.js'
