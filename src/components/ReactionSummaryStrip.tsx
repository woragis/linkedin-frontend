"use client";

import { REACTIONS, type ReactionKind } from "@/lib/reactions";
import type { ReactionSummary } from "@/lib/types";

type ReactionSummaryStripProps = {
  summary: ReactionSummary;
  total: number;
  className?: string;
};

export function ReactionSummaryStrip({
  summary,
  total,
  className = "",
}: ReactionSummaryStripProps) {
  if (total <= 0) return null;

  const items = REACTIONS.map((r) => ({
    ...r,
    count: summary[r.kind] ?? 0,
  })).filter((r) => r.count > 0);

  if (items.length === 0) {
    return (
      <p className={`text-xs text-[var(--li-muted)] ${className}`}>
        {total} reação{total === 1 ? "" : "ões"}
      </p>
    );
  }

  return (
    <div className={`flex flex-wrap items-center gap-2 ${className}`}>
      {items.map((r) => (
        <span
          key={r.kind}
          className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs"
          style={{ backgroundColor: r.bg, color: r.color }}
          title={r.label}
        >
          <r.Icon className="h-3.5 w-3.5" strokeWidth={2.25} />
          {r.count}
        </span>
      ))}
    </div>
  );
}

export function topReactionKind(summary: ReactionSummary): ReactionKind | null {
  let best: ReactionKind | null = null;
  let bestCount = 0;
  for (const r of REACTIONS) {
    const n = summary[r.kind] ?? 0;
    if (n > bestCount) {
      best = r.kind;
      bestCount = n;
    }
  }
  return best;
}
