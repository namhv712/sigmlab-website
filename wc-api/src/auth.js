import crypto from 'node:crypto'

const b64url = (buf) =>
  Buffer.from(buf).toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')

const fromB64url = (s) =>
  Buffer.from(s.replace(/-/g, '+').replace(/_/g, '/'), 'base64')

function hmac(payloadB64, secret) {
  return b64url(crypto.createHmac('sha256', secret).update(payloadB64).digest())
}

// Sign a token: base64url(JSON {name, exp}) + "." + base64url(HMAC-SHA256).
// exp is an absolute expiry in epoch SECONDS.
export function signToken(name, secret, exp) {
  const payloadB64 = b64url(JSON.stringify({ name, exp }))
  const sig = hmac(payloadB64, secret)
  return `${payloadB64}.${sig}`
}

// Verify a token. Returns { name, exp } on success, or null on any failure
// (malformed, bad signature, or expired). Signature compared timing-safe.
export function verifyToken(token, secret) {
  if (typeof token !== 'string') return null
  const dot = token.indexOf('.')
  if (dot < 0) return null
  const payloadB64 = token.slice(0, dot)
  const sig = token.slice(dot + 1)
  const expected = hmac(payloadB64, secret)
  const a = Buffer.from(sig)
  const b = Buffer.from(expected)
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return null
  let payload
  try {
    payload = JSON.parse(fromB64url(payloadB64).toString('utf8'))
  } catch {
    return null
  }
  if (!payload || typeof payload.exp !== 'number') return null
  const now = Math.floor(Date.now() / 1000)
  if (payload.exp <= now) return null
  return payload
}

// Constant-time compare of sha256(input) hex against a stored hex digest.
// Used for the shared single-secret passcodes (view gate, admin) only.
export function checkPasscode(input, sha256hex) {
  if (typeof input !== 'string' || typeof sha256hex !== 'string') return false
  const got = crypto.createHash('sha256').update(input).digest('hex')
  const a = Buffer.from(got)
  const b = Buffer.from(sha256hex)
  if (a.length !== b.length) return false
  return crypto.timingSafeEqual(a, b)
}

// --- per-user password hashing -------------------------------------------
// Salted scrypt (built-in, no native deps) for individual betting accounts.
// Stored as a hex-encoded derived key + the hex salt it was derived with.
const SCRYPT_KEYLEN = 32

export function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex')
  const hash = crypto.scryptSync(password, salt, SCRYPT_KEYLEN).toString('hex')
  return { hash, salt }
}

// Verify a password against a stored {hash, salt}. Timing-safe; returns false
// for any missing/empty/mismatched input rather than throwing.
export function verifyPassword(password, hash, salt) {
  if (typeof password !== 'string') return false
  if (typeof hash !== 'string' || typeof salt !== 'string' || !hash || !salt) return false
  let got
  try {
    got = crypto.scryptSync(password, salt, SCRYPT_KEYLEN).toString('hex')
  } catch {
    return false
  }
  const a = Buffer.from(got)
  const b = Buffer.from(hash)
  if (a.length !== b.length) return false
  return crypto.timingSafeEqual(a, b)
}
