const SUPABASE_URL =
  process.env.VITE_SUPABASE_URL ||
  process.env.SUPABASE_URL ||
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  ''

const SUPABASE_ANON_KEY =
  process.env.VITE_SUPABASE_ANON_KEY ||
  process.env.SUPABASE_ANON_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  ''

const SUPABASE_SERVICE_ROLE_KEY =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.SUPABASE_SERVICE_KEY ||
  process.env.SUPABASE_SERVICE_ROLE ||
  ''

function isJwtLike(value) {
  if (!value || typeof value !== 'string') return false
  // JWTs are 3 base64url-ish segments separated by dots.
  return /^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+$/.test(value.trim())
}

function buildSupabaseHeaders(apiKey, { accept, contentType } = {}) {
  const headers = {
    apikey: apiKey,
    accept: accept || 'application/json',
  }

  // For legacy `anon`/`service_role` JWT keys, Supabase expects a Bearer JWT.
  // For new `sb_publishable_...` / `sb_secret_...` keys (non-JWT), do NOT send them in Authorization.
  if (isJwtLike(apiKey)) {
    headers.authorization = `Bearer ${apiKey}`
  }

  if (contentType) headers['content-type'] = contentType
  return headers
}

function json(res, statusCode, payload) {
  res.statusCode = statusCode
  res.setHeader('content-type', 'application/json; charset=utf-8')
  res.end(JSON.stringify(payload))
}

async function fetchWithTimeout(url, init, timeoutMs) {
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs)
  try {
    return await fetch(url, { ...init, signal: controller.signal })
  } finally {
    clearTimeout(timeoutId)
  }
}

export default async function handler(req, res) {
  if (req.method && !['GET', 'HEAD'].includes(req.method)) {
    return json(res, 405, { ok: false, error: 'Method Not Allowed' })
  }

  // Optional: if you set CRON_SECRET in Vercel, Vercel will send it automatically
  // as `Authorization: Bearer <CRON_SECRET>` when invoking the cron.
  if (process.env.CRON_SECRET) {
    const authHeader = req.headers?.authorization
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return json(res, 401, { ok: false, error: 'Unauthorized' })
    }
  }

  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    return json(res, 500, {
      ok: false,
      error:
        'Missing Supabase env vars. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in Vercel Environment Variables.',
    })
  }

  const startedAt = Date.now()
  const timeoutMs = 25_000

  const headers = buildSupabaseHeaders(SUPABASE_ANON_KEY, { accept: 'application/json' })

  // Primary: touch Postgres via PostgREST (keeps project active).
  const activitiesUrl = new URL('/rest/v1/activities', SUPABASE_URL)
  activitiesUrl.searchParams.set('select', 'id')
  activitiesUrl.searchParams.set('limit', '1')

  let primary = { ok: false, status: null }
  let fallback = null

  try {
    const resp = await fetchWithTimeout(activitiesUrl.toString(), { headers }, timeoutMs)
    primary = { ok: resp.ok, status: resp.status }
  } catch (e) {
    primary = { ok: false, status: 'fetch_error' }
  }

  // Fallback: fetch PostgREST OpenAPI (still touches the REST service / DB metadata).
  if (!primary.ok) {
    try {
      const openApiUrl = new URL('/rest/v1/', SUPABASE_URL)
      const resp = await fetchWithTimeout(
        openApiUrl.toString(),
        {
          headers: buildSupabaseHeaders(SUPABASE_ANON_KEY, { accept: 'application/openapi+json' }),
        },
        timeoutMs,
      )
      fallback = { ok: resp.ok, status: resp.status }
    } catch {
      fallback = { ok: false, status: 'fetch_error' }
    }
  }

  const latencyMs = Date.now() - startedAt
  const checkedAt = new Date().toISOString()
  const ok = primary.ok || fallback?.ok || false

  // Store the check in DB (optional but useful for the Admin "Health" tab).
  // Recommended: set SUPABASE_SERVICE_ROLE_KEY in Vercel so inserts can't be spoofed from the public anon key.
  const insertKey = SUPABASE_SERVICE_ROLE_KEY || SUPABASE_ANON_KEY
  const logPayload = {
    checked_at: checkedAt,
    ok,
    latency_ms: latencyMs,
    primary_ok: primary.ok,
    primary_status: primary.status === null ? null : String(primary.status),
    fallback_ok: fallback ? fallback.ok : null,
    fallback_status: fallback ? String(fallback.status) : null,
    source: 'vercel-cron',
  }

  let logged = null
  let logStatus = null
  try {
    const insertUrl = new URL('/rest/v1/health_checks', SUPABASE_URL)
    const insertHeaders = {
      ...buildSupabaseHeaders(insertKey, { contentType: 'application/json' }),
      prefer: 'return=minimal',
    }
    const resp = await fetchWithTimeout(
      insertUrl.toString(),
      {
        method: 'POST',
        headers: insertHeaders,
        body: JSON.stringify(logPayload),
      },
      timeoutMs,
    )
    logged = resp.ok
    logStatus = resp.status
  } catch {
    logged = false
    logStatus = 'fetch_error'
  }

  // Always return 200 so cron invocations don't show as failed unless env/secret is wrong.
  return json(res, 200, {
    ok,
    checked_at: checkedAt,
    latency_ms: latencyMs,
    primary,
    ...(fallback ? { fallback } : {}),
    log: { ok: logged, status: logStatus },
  })
}

