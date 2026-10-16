import axios, { AxiosError } from 'axios'
import type { ApiErrorBody } from '../types'

const TOKEN_KEY = 'retain.token'

export const tokenStorage = {
  get: (): string | null => {
    try {
      return localStorage.getItem(TOKEN_KEY)
    } catch {
      return null
    }
  },
  set: (token: string) => {
    try {
      localStorage.setItem(TOKEN_KEY, token)
    } catch {
      /* storage unavailable (private mode) — session-only login */
    }
  },
  clear: () => {
    try {
      localStorage.removeItem(TOKEN_KEY)
    } catch {
      /* ignore */
    }
  },
}

/** Fired when the API rejects our token so the auth context can sign out. */
export const UNAUTHORIZED_EVENT = 'retain:unauthorized'

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  timeout: 20000,
})

api.interceptors.request.use((config) => {
  const token = tokenStorage.get()
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

api.interceptors.response.use(
  (response) => response,
  (error: AxiosError<ApiErrorBody>) => {
    const isAuthCall = error.config?.url?.startsWith('/auth/login') || error.config?.url?.startsWith('/auth/register')
    if (error.response?.status === 401 && !isAuthCall) {
      window.dispatchEvent(new Event(UNAUTHORIZED_EVENT))
    }
    return Promise.reject(error)
  },
)

/** Extracts a human-readable message from any error thrown by the API layer. */
export function getErrorMessage(error: unknown, fallback = 'Something went wrong. Please try again.'): string {
  if (axios.isAxiosError<ApiErrorBody>(error)) {
    if (error.response?.data?.message) return error.response.data.message
    if (error.code === 'ECONNABORTED') return 'The server took too long to respond. Please try again.'
    if (!error.response) return 'Unable to reach the server. Check your connection and try again.'
  }
  if (error instanceof Error && error.message) return error.message
  return fallback
}

/** Field-level validation messages from a 400 response, keyed by field name. */
export function getFieldErrors(error: unknown): Record<string, string> {
  if (!axios.isAxiosError<ApiErrorBody>(error)) return {}
  const details = error.response?.data?.details ?? []
  return Object.fromEntries(details.map((d) => [d.field, d.message]))
}
