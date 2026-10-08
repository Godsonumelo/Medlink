import { useEffect, useState } from "react";

export default function LiveBadge({ lastUpdated }) {
  const [age, setAge] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setAge(lastUpdated ? Math.max(0, Math.floor((Date.now() - lastUpdated) / 1000)) : 0);
    }, 1000);
    return () => clearInterval(id);
  }, [lastUpdated]);

  return (
    <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-success/10 text-success caption font-medium shrink-0">
      <span className="relative flex h-2 w-2">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-75" />
        <span className="relative inline-flex rounded-full h-2 w-2 bg-success" />
      </span>
      Live
      {lastUpdated && (
        <span className="text-success/70">
          · updated {age === 0 ? "just now" : `${age}s ago`}
        </span>
      )}
    </span>
  );
}