import { useCallback, useMemo, useState } from "react";

export function useBulkSelect<T extends { id: string }>(items: T[] | undefined) {
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const list = items ?? [];
  const allIds = useMemo(() => list.map((i) => i.id), [list]);
  const allSelected = allIds.length > 0 && allIds.every((id) => selected.has(id));
  const someSelected = !allSelected && allIds.some((id) => selected.has(id));

  const toggle = useCallback((id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const toggleAll = useCallback(() => {
    setSelected((prev) => {
      const allHere = allIds.every((id) => prev.has(id));
      if (allHere) {
        const next = new Set(prev);
        allIds.forEach((id) => next.delete(id));
        return next;
      }
      const next = new Set(prev);
      allIds.forEach((id) => next.add(id));
      return next;
    });
  }, [allIds]);

  const clear = useCallback(() => setSelected(new Set()), []);

  return {
    selected,
    ids: Array.from(selected),
    count: selected.size,
    isSelected: (id: string) => selected.has(id),
    toggle,
    toggleAll,
    allSelected,
    someSelected,
    clear,
  };
}
