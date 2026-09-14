import { useEffect, useState } from "react";

function getTimeLeft(target: number) {
  const diff = Math.max(0, target - Date.now());
  return {
    d: Math.floor(diff / (1000 * 60 * 60 * 24)),
    h: Math.floor((diff / (1000 * 60 * 60)) % 24),
    m: Math.floor((diff / (1000 * 60)) % 60),
    s: Math.floor((diff / 1000) % 60),
  };
}

export function CountdownTimer() {
  const [target] = useState(() => Date.now() + 3 * 24 * 60 * 60 * 1000 + 5 * 60 * 60 * 1000);
  const [t, setT] = useState(() => getTimeLeft(target));

  useEffect(() => {
    const id = setInterval(() => setT(getTimeLeft(target)), 1000);
    return () => clearInterval(id);
  }, [target]);

  const cells: Array<[string, number]> = [
    ["Days", t.d],
    ["Hours", t.h],
    ["Mins", t.m],
    ["Secs", t.s],
  ];

  return (
    <div className="flex items-center gap-2">
      {cells.map(([label, val], i) => (
        <div key={label} className="flex items-center gap-2">
          <div className="flex min-w-[52px] flex-col items-center rounded-md bg-primary px-2 py-1.5 text-primary-foreground">
            <span className="text-lg font-bold leading-none tabular-nums">{String(val).padStart(2, "0")}</span>
            <span className="text-[9px] uppercase tracking-wider opacity-70">{label}</span>
          </div>
          {i < cells.length - 1 && <span className="text-primary font-bold">:</span>}
        </div>
      ))}
    </div>
  );
}
