import { useCallback, useEffect, useRef, useState } from 'react'

/**
 * Load data from the API, tracking loading/error state.
 *
 * `fetcher` is re-run whenever `deps` change. Results from a superseded request
 * are discarded, so fast filter changes can't render stale data.
 *
 * Pass `enabled: false` to hold off (e.g. until a view is actually visible).
 */
export function useResource(fetcher, deps = [], { enabled = true } = {}) {
  const [state, setState] = useState({ data: null, loading: enabled, error: null })
  const runId = useRef(0)
  const fetcherRef = useRef(fetcher)
  fetcherRef.current = fetcher

  const load = useCallback(() => {
    if (!enabled) return
    const id = ++runId.current
    setState((s) => ({ data: s.data, loading: true, error: null }))
    Promise.resolve()
      .then(() => fetcherRef.current())
      .then((data) => {
        if (id === runId.current) setState({ data, loading: false, error: null })
      })
      .catch((error) => {
        if (id === runId.current) setState({ data: null, loading: false, error })
      })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, ...deps])

  useEffect(() => { load() }, [load])

  return { ...state, reload: load }
}

/**
 * Run a write (POST/PATCH/DELETE) with busy + error tracking.
 * Returns the result so callers can chain. It never throws;
 * check `error` instead.
 */
export function useAction() {
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState(null)

  const run = useCallback(async (fn) => {
    setBusy(true)
    setError(null)
    try {
      return { ok: true, value: await fn() }
    } catch (e) {
      setError(e)
      return { ok: false, error: e }
    } finally {
      setBusy(false)
    }
  }, [])

  return { run, busy, error, clearError: () => setError(null) }
}
