export function resolveDatabaseUrl() {
  const url = process.env.DATABASE_URL_UNPOOLED || process.env.DATABASE_URL

  if (!url) {
    console.error('DATABASE_URL_UNPOOLED or DATABASE_URL must be set')
    process.exit(1)
  }

  process.env.DATABASE_URL = url
  return url
}

