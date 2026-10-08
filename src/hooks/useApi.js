import { useState, useCallback, useEffect, useRef } from "react";

export function useApi(apiFn, { immediate = false, args = [] } = {}) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(immediate);
  const [error, setError] = useState(null);
  const abortRef = useRef(null);
  const mountedRef = useRef(true);

  const execute = useCallback(
    async (...callArgs) => {
      if (abortRef.current) {
        abortRef.current.abort();
      }

      const controller = new AbortController();
      abortRef.current = controller;

      setLoading(true);
      setError(null);

      try {
        const result = await apiFn(...callArgs, controller.signal);
        if (mountedRef.current && !controller.signal.aborted) {
          setData(result);
        }
        return result;
      } catch (err) {
        if (err?.name === "CanceledError" || err?.name === "AbortError") {
          return null;
        }
        const message = err?.message || "Something went wrong";
        if (mountedRef.current && !controller.signal.aborted) {
          setError(message);
        }
        throw err;
      } finally {
        if (mountedRef.current && !controller.signal.aborted) {
          setLoading(false);
        }
      }
    },
    [apiFn]
  );

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      if (abortRef.current) {
        abortRef.current.abort();
      }
    };
  }, []);

  useEffect(() => {
    if (immediate) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      execute(...args);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const reset = useCallback(() => {
    setData(null);
    setError(null);
    setLoading(false);
  }, []);

  return { data, loading, error, execute, reset, setData };
}
