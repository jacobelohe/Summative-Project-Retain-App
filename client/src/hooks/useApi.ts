import { useCallback, useEffect, useState } from 'react'
import { getErrorMessage } from '../api/client'

interface ApiResult<T> {
  fetcher: (signal: AbortSignal) => Promise<T>
  reloadCount: number
  data: T | null
  error: string | null
}

export interface UseApiState<T> {
  /** Latest successful response. Kept while a refetch is in flight to avoid flicker. */
  data: T | null
  error: string | null
  loading: boolean
  /** Fetch again (e.g. after a mutation or from a "Retry" button). */
  reload: () => void
  /** Locally replace the data, e.g. after a successful update. */
  setData: (updater: (current: T | null) => T | null) => void
}

/**
 * Runs `fetcher` whenever it changes (memoise it with `useCallback`) and tracks
 * loading / error / data. In-flight requests are aborted when superseded.
 */
export function useApi<T>(fetcher: (signal: AbortSignal) => Promise<T>): UseApiState<T> {
  const [reloadCount, setReloadCount] = useState(0)
  const [result, setResult] = useState<ApiResult<T> | null>(null)

  useEffect(() => {
    const controller = new AbortController()
    fetcher(controller.signal)
      .then((data) => setResult({ fetcher, reloadCount, data, error: null }))
      .catch((err: unknown) => {
        if (controller.signal.aborted) return
        setResult((prev) => ({ fetcher, reloadCount, data: prev?.data ?? null, error: getErrorMessage(err) }))
      })
    return () => controller.abort()
  }, [fetcher, reloadCount])

  const loading = result === null || result.fetcher !== fetcher || result.reloadCount !== reloadCount

  const reload = useCallback(() => setReloadCount((n) => n + 1), [])

  const setData = useCallback((updater: (current: T | null) => T | null) => {
    setResult((prev) => (prev ? { ...prev, data: updater(prev.data) } : prev))
  }, [])

  return {
    data: result?.data ?? null,
    error: loading ? null : (result?.error ?? null),
    loading,
    reload,
    setData,
  }
}
