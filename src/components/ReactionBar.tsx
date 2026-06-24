"use client";

import { MessageCircle } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { reactToComment, reactToPost, trackEvents } from "@/lib/api";
import {
  getReaction,
  REACTIONS,
  type ReactionKind,
} from "@/lib/reactions";
import type { ReactionSummary } from "@/lib/types";
import { ReactionSummaryStrip } from "./ReactionSummaryStrip";

const HOVER_OPEN_MS = 350;
const HOVER_CLOSE_MS = 280;

type ReactionTarget =
  | { type: "post"; id: string }
  | { type: "comment"; id: string };

type ReactionBarProps = {
  target: ReactionTarget;
  reactionCount: number;
  reactionSummary?: ReactionSummary;
  myReaction?: ReactionKind | string | null;
  commentCount?: number;
  onToggleComments?: () => void;
  commentsOpen?: boolean;
  compact?: boolean;
};

export function ReactionBar({
  target,
  reactionCount,
  reactionSummary,
  myReaction: initialMyReaction,
  commentCount = 0,
  onToggleComments,
  commentsOpen = false,
  compact = false,
}: ReactionBarProps) {
  const [count, setCount] = useState(reactionCount);
  const [summary, setSummary] = useState<ReactionSummary>(reactionSummary ?? {});
  const [activeKind, setActiveKind] = useState<ReactionKind | null>(
    (initialMyReaction as ReactionKind) || null,
  );
  const [trayOpen, setTrayOpen] = useState(false);
  const [popping, setPopping] = useState(false);
  const openTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const zoneRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setCount(reactionCount);
  }, [reactionCount]);

  useEffect(() => {
    setSummary(reactionSummary ?? {});
  }, [reactionSummary]);

  useEffect(() => {
    setActiveKind((initialMyReaction as ReactionKind) || null);
  }, [initialMyReaction]);

  const clearTimers = useCallback(() => {
    if (openTimer.current) clearTimeout(openTimer.current);
    if (closeTimer.current) clearTimeout(closeTimer.current);
    openTimer.current = null;
    closeTimer.current = null;
  }, []);

  const scheduleOpen = useCallback(() => {
    clearTimers();
    openTimer.current = setTimeout(() => setTrayOpen(true), HOVER_OPEN_MS);
  }, [clearTimers]);

  const scheduleClose = useCallback(() => {
    clearTimers();
    closeTimer.current = setTimeout(() => setTrayOpen(false), HOVER_CLOSE_MS);
  }, [clearTimers]);

  useEffect(() => () => clearTimers(), [clearTimers]);

  async function applyReaction(kind: ReactionKind) {
    const wasNew = activeKind === null;
    const prevKind = activeKind;
    const prevSummary = { ...summary };
    const prevCount = count;

    setActiveKind(kind);
    setTrayOpen(false);
    setPopping(true);
    window.setTimeout(() => setPopping(false), 320);

    setSummary((s) => {
      const next = { ...s };
      if (prevKind && next[prevKind]) next[prevKind] = Math.max(0, next[prevKind] - 1);
      next[kind] = (next[kind] ?? 0) + (prevKind === kind ? 0 : 1);
      return next;
    });
    if (wasNew) setCount((n) => n + 1);

    try {
      if (target.type === "post") {
        await reactToPost(target.id, kind);
        if (wasNew) {
          void trackEvents([{ type: "post_liked", payload: { post_id: target.id, kind } }]);
        } else if (prevKind !== kind) {
          void trackEvents([
            { type: "post_reaction_changed", payload: { post_id: target.id, kind } },
          ]);
        }
      } else {
        await reactToComment(target.id, kind);
      }
    } catch {
      setActiveKind(prevKind);
      setSummary(prevSummary);
      setCount(prevCount);
    }
  }

  function handleQuickLike() {
    void applyReaction(activeKind ?? "like");
  }

  const current = activeKind ? getReaction(activeKind) : null;
  const CurrentIcon = current?.Icon;
  const DefaultIcon = REACTIONS[0].Icon;
  const showComments = target.type === "post" && onToggleComments;

  return (
    <div className={compact ? "mt-1" : "mt-3 border-t border-[var(--li-border)] pt-1"}>
      {!compact && (
        <ReactionSummaryStrip summary={summary} total={count} className="mb-1 px-1" />
      )}
      <div className={`flex items-stretch ${compact ? "gap-1" : ""}`}>
        <div
          ref={zoneRef}
          className={showComments ? "relative flex-1" : "relative w-full"}
          onMouseEnter={scheduleOpen}
          onMouseLeave={scheduleClose}
        >
          {trayOpen && (
            <div
              className="li-reaction-tray"
              onMouseEnter={scheduleOpen}
              onMouseLeave={scheduleClose}
            >
              {REACTIONS.map((r, i) => (
                <button
                  key={r.kind}
                  type="button"
                  title={r.label}
                  className="li-reaction-bubble"
                  style={
                    {
                      "--rxn-color": r.color,
                      "--rxn-bg": r.bg,
                      "--rxn-delay": `${i * 35}ms`,
                    } as React.CSSProperties
                  }
                  onClick={() => void applyReaction(r.kind)}
                >
                  <r.Icon className="h-6 w-6" strokeWidth={2} />
                </button>
              ))}
            </div>
          )}

          <button
            type="button"
            onClick={handleQuickLike}
            className={`li-action-btn ${showComments ? "w-full" : "w-full"} ${activeKind ? "is-active" : ""} ${popping ? "is-pop" : ""} ${compact ? "!py-1 text-xs" : ""}`}
            style={
              current
                ? ({ "--action-color": current.color } as React.CSSProperties)
                : undefined
            }
          >
            {CurrentIcon ? (
              <CurrentIcon className={compact ? "h-4 w-4" : "h-5 w-5"} strokeWidth={2.25} />
            ) : (
              <DefaultIcon className={compact ? "h-4 w-4" : "h-5 w-5"} strokeWidth={2} />
            )}
            <span>{current?.label ?? "Gostei"}</span>
            {count > 0 && <span className="text-xs opacity-80">({count})</span>}
          </button>
        </div>

        {showComments && (
          <button
            type="button"
            onClick={onToggleComments}
            className={`li-action-btn flex-1 ${commentsOpen ? "is-active" : ""}`}
          >
            <MessageCircle className="h-5 w-5" strokeWidth={2} />
            <span>Comentar</span>
            {commentCount > 0 && (
              <span className="text-xs opacity-80">({commentCount})</span>
            )}
          </button>
        )}
      </div>
    </div>
  );
}
