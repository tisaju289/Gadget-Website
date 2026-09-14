import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import type { ReactNode } from "react";

type Props = {
  title: string;
  children: ReactNode;
  viewAllTo?: string;
  viewAllSearch?: Record<string, string>;
  viewAllLabel?: string;
  rightSlot?: ReactNode;
};

/**
 * Sheitech-style section: white rounded card, red pill title overlapping
 * the top-left, and a dark "See all products →" button bottom-right.
 */
export function SectionShell({ title, children, viewAllTo, viewAllSearch, viewAllLabel = "See all products", rightSlot }: Props) {
  return (
    <section className="mx-auto max-w-7xl px-3 py-4 md:px-4 md:py-6">
      <div className="relative rounded-2xl border bg-card px-3 pt-7 pb-5 shadow-[var(--shadow-card)] md:px-6 md:pt-8 md:pb-6">
        <div className="absolute -top-3 left-0 right-0 flex justify-center md:left-6 md:right-auto md:justify-start">
          <span className="inline-flex items-center rounded-full bg-sale px-4 py-1.5 text-sm font-bold text-sale-foreground shadow md:text-base">
            {title}
          </span>
        </div>

        {rightSlot && (
          <div className="mb-4 flex justify-end">{rightSlot}</div>
        )}

        {children}

        {viewAllTo && (
          <div className="mt-5 flex justify-end">
            <Link
              to={viewAllTo}
              search={viewAllSearch as never}
              className="inline-flex items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground transition-colors hover:bg-primary/90 md:text-sm"
            >
              {viewAllLabel}
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}
