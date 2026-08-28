// Thin fetch wrapper around the .NET API.
// All requests go through the Vite dev proxy at /api (see vite.config.js),
// which forwards to the HTTPS backend and skips certificate checks.

const BASE = '/api'

let onUnauthorized = () => {}
export function setUnauthorizedHandler(fn) {
  onUnauthorized = fn
}

function token() {
  return localStorage.getItem('oficina.token')
}

async function request(method, path, body) {
  const headers = {}
  if (body !== undefined) headers['Content-Type'] = 'application/json'
  const t = token()
  if (t) headers['Authorization'] = `Bearer ${t}`

  let res
  try {
    res = await fetch(BASE + path, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    })
  } catch (err) {
    throw new ApiError(
      'Não foi possível falar com a API. Confira se o backend está rodando e a porta em vite.config.js.',
      0,
    )
  }

  if (res.status === 401) {
    onUnauthorized()
    throw new ApiError('Sessão expirada. Entre novamente.', 401)
  }

  if (res.status === 204) return null

  const text = await res.text()
  let data = null
  if (text) {
    try {
      data = JSON.parse(text)
    } catch {
      data = text
    }
  }

  if (!res.ok) {
    throw new ApiError(extractMessage(data) || `Erro ${res.status}`, res.status, data)
  }
  return data
}

function extractMessage(data) {
  if (!data) return null
  if (typeof data === 'string') return data
  if (Array.isArray(data)) return data.join(' ')
  if (data.title) return data.title
  if (data.errors) {
    const flat = Object.values(data.errors).flat()
    if (flat.length) return flat.join(' ')
  }
  if (data.message) return data.message
  return null
}

export class ApiError extends Error {
  constructor(message, status, data) {
    super(message)
    this.status = status
    this.data = data
  }
}

export const api = {
  get: (p) => request('GET', p),
  post: (p, b) => request('POST', p, b),
  put: (p, b) => request('PUT', p, b),
  del: (p) => request('DELETE', p),
}
