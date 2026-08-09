import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * Run an API call and track its lifecycle.
 *
 *   const { data, error, loading, reload } = useApi(
 *     () => listLearners(classId),
 *     [classId],
 *     { skip: !classId, initial: [] },
 *   );
 *
 * `deps` behaves like a useEffect dependency list: the call re-runs when they
 * change. `skip` holds the call back until its inputs exist — a screen that
 * needs a class id should skip rather than request `/classes/undefined/...`.
 *
 * Responses from a superseded call are dropped, so switching classes quickly
 * cannot leave the previous class's data on screen.
 */
export function useApi(fn, deps = [], { skip = false, initial = null } = {}) {
  const [data, setData] = useState(initial);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(!skip);

  // Identifies the newest call. Anything older resolves into the void.
  const runId = useRef(0);
  const mounted = useRef(true);
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  const run = useCallback(() => {
    if (skip) {
      setLoading(false);
      return Promise.resolve();
    }
    const id = ++runId.current;
    setLoading(true);
    setError(null);
    return Promise.resolve()
      .then(fn)
      .then((result) => {
        if (!mounted.current || id !== runId.current) return;
        setData(result);
      })
      .catch((err) => {
        if (!mounted.current || id !== runId.current) return;
        setError(err);
      })
      .finally(() => {
        if (!mounted.current || id !== runId.current) return;
        setLoading(false);
      });
    // fn is redefined on every render by design — deps describe when to re-run.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [skip, ...deps]);

  useEffect(() => {
    run();
  }, [run]);

  return { data, error, loading, reload: run, setData };
}

/**
 * A one-shot action (save, submit, delete) with its own pending/error state, so
 * a button can disable itself and a screen can surface why a write failed.
 */
export function useAction(fn) {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState(null);
  const mounted = useRef(true);
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  const run = useCallback(
    async (...args) => {
      setPending(true);
      setError(null);
      try {
        return await fn(...args);
      } catch (err) {
        if (mounted.current) setError(err);
        throw err;
      } finally {
        if (mounted.current) setPending(false);
      }
    },
    [fn],
  );

  return { run, pending, error };
}
