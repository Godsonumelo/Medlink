import { useEffect } from "react";

export default function usePolling(callback, interval = 30000, enabled = true) {
  useEffect(() => {
    if (!enabled) return undefined;
    const id = setInterval(callback, interval);
    return () => clearInterval(id);
  }, [callback, interval, enabled]);
}