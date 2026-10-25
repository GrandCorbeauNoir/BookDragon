// Thin fetch client for the Supabase Edge Function API. Public anon key only.
const SUPABASE_URL = (import.meta.env.VITE_SUPABASE_URL ?? '').replace(/\/+$/, '')
const ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY ?? ''
const BASE_URL = `${SUPABASE_URL}/functions/v1`
const TIMEOUT_MS = 20000

export class ApiError extends Error {
  constructor(message, { status = 0, code = 'network_error' } = {}) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.code = code
  }
}

/** api('/books', { params: { genre: 'horror' } }), api('/logs', { method: 'POST', body: {...} }) */
export async function api(path, { method = 'GET', params, body } = {}) {
  const qs = new URLSearchParams()
  for (const [k, v] of Object.entries(params ?? {})) {
    if (v !== undefined && v !== null && v !== '') qs.set(k, String(v))
  }
  const url = `${BASE_URL}${path}${qs.size ? `?${qs}` : ''}`
  const headers = { apikey: ANON_KEY }
  if (body !== undefined) headers['Content-Type'] = 'application/json'

  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS)
  let res
  try {
    res = await fetch(url, {
      method,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
      signal: controller.signal,
    })
  } catch {
    throw new ApiError('The server could not be reached.', { code: 'network_error' })
  } finally {
    clearTimeout(timer)
  }

  let data = null
  try {
    data = await res.json()
  } catch {
    // non-JSON body; handled below
  }
  if (!res.ok) {
    throw new ApiError(data?.error?.message ?? `Request failed (${res.status}).`, {
      status: res.status,
      code: data?.error?.code ?? 'request_failed',
    })
  }
  if (data === null) throw new ApiError('Unexpected response from the server.', { status: res.status, code: 'bad_response' })
  return data
}
