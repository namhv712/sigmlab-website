import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

// --- tiny .env loader (no dependency) -------------------------------------
// Loads KEY=VALUE lines from a .env file next to the project root if present.
// Existing process.env values win; missing file is silently ignored.
function loadDotEnv() {
  try {
    const here = dirname(fileURLToPath(import.meta.url))
    const envPath = join(here, '..', '.env')
    const text = readFileSync(envPath, 'utf8')
    for (const rawLine of text.split('\n')) {
      const line = rawLine.trim()
      if (!line || line.startsWith('#')) continue
      const eq = line.indexOf('=')
      if (eq < 0) continue
      const key = line.slice(0, eq).trim()
      let val = line.slice(eq + 1).trim()
      if (
        (val.startsWith('"') && val.endsWith('"')) ||
        (val.startsWith("'") && val.endsWith("'"))
      ) {
        val = val.slice(1, -1)
      }
      if (!(key in process.env)) process.env[key] = val
    }
  } catch {
    // no .env file — fine, rely on process env
  }
}

loadDotEnv()

const Fastify = (await import('fastify')).default
const { default: routes } = await import('./routes.js')
const { ingest } = await import('./ingest.js')
const { default: db } = await import('./db.js')

const fastify = Fastify({ logger: true })
await fastify.register(routes)

const start = async () => {
  // Seed/refresh on boot, then hourly. Failures are tolerated inside ingest().
  ingest(db).catch((e) => fastify.log.error(e))
  setInterval(() => ingest(db).catch((e) => fastify.log.error(e)), 3600_000)

  try {
    await fastify.listen({ port: 4100, host: '127.0.0.1' })
  } catch (err) {
    fastify.log.error(err)
    process.exit(1)
  }
}

start()
