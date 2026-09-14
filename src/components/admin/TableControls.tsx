import { Search, ArrowUpDown } from "lucide-react";

export type SortOpt<T extends string = string> = { value: T; label: string };

type Props<T extends string> = {
  q: string;
  onQ: (v: string) => void;
  placeholder?: string;
  sort: T;
  onSort: (v: T) => void;
  sortOptions: readonly SortOpt<T>[];
  right?: React.ReactNode;
};

export function TableControls<T extends string>({
  q, onQ, placeholder = "Search…", sort, onSort, sortOptions, right,
}: Props<T>) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <div className="relative min-w-[220px] flex-1 max-w-md">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          value={q}
          onChange={(e) => onQ(e.target.value)}
          placeholder={placeholder}
          className="h-10 w-full rounded-lg border bg-background pl-10 pr-3 text-sm outline-none focus:border-primary"
        />
      </div>
      <div className="relative">
        <ArrowUpDown className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <select
          value={sort}
          onChange={(e) => onSort(e.target.value as T)}
          className="h-10 appearance-none rounded-lg border bg-background pl-9 pr-8 text-sm outline-none focus:border-primary"
        >
          {sortOptions.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
      </div>
      {right}
    </div>
  );
}

export function sortBy<T>(arr: T[], get: (x: T) => string | number | null | undefined, dir: "asc" | "desc" = "asc") {
  const copy = [...arr];
  copy.sort((a, b) => {
    const av = get(a) ?? "";
    const bv = get(b) ?? "";
    if (typeof av === "number" && typeof bv === "number") return dir === "asc" ? av - bv : bv - av;
    const as = String(av).toLowerCase();
    const bs = String(bv).toLowerCase();
    return dir === "asc" ? as.localeCompare(bs) : bs.localeCompare(as);
  });
  return copy;
}
