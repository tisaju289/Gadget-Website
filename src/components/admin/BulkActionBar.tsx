import { Trash2, EyeOff, Eye, X } from "lucide-react";

type Props = {
  count: number;
  onClear: () => void;
  onDelete: () => void;
  onDeactivate?: () => void;
  onActivate?: () => void;
};

export function BulkActionBar({ count, onClear, onDelete, onDeactivate, onActivate }: Props) {
  if (count === 0) return null;
  return (
    <div className="sticky top-2 z-10 mb-3 flex flex-wrap items-center gap-2 rounded-xl border border-primary/30 bg-primary/10 px-3 py-2 shadow-sm backdrop-blur">
      <button
        type="button"
        onClick={onClear}
        className="inline-flex h-7 w-7 items-center justify-center rounded-full hover:bg-background"
        aria-label="Clear selection"
      >
        <X className="h-4 w-4" />
      </button>
      <span className="text-sm font-semibold text-primary">{count} selected</span>
      <div className="ml-auto flex flex-wrap items-center gap-2">
        {onActivate && (
          <button
            type="button"
            onClick={onActivate}
            className="inline-flex items-center gap-1.5 rounded-md border border-success/40 bg-background px-3 py-1.5 text-xs font-semibold text-success hover:bg-success/10"
          >
            <Eye className="h-3.5 w-3.5" /> Activate
          </button>
        )}
        {onDeactivate && (
          <button
            type="button"
            onClick={onDeactivate}
            className="inline-flex items-center gap-1.5 rounded-md border bg-background px-3 py-1.5 text-xs font-semibold text-foreground hover:bg-secondary"
          >
            <EyeOff className="h-3.5 w-3.5" /> Deactivate
          </button>
        )}
        <button
          type="button"
          onClick={onDelete}
          className="inline-flex items-center gap-1.5 rounded-md border border-sale/40 bg-background px-3 py-1.5 text-xs font-semibold text-sale hover:bg-sale/10"
        >
          <Trash2 className="h-3.5 w-3.5" /> Delete
        </button>
      </div>
    </div>
  );
}
