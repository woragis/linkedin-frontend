"use client";

import { MessageCircle } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { reactToPost, trackEvents } from "@/lib/api";
import {
  getReaction,
  REACTIONS,
  type ReactionKind,
} from "@/lib/reactions";

const HOVER_OPEN_MS = 350;
const HOVER_CLOSE_MS = 280;

type ReactionBarProps = {
  postId: string;
  reactionCount: number;
  commentCount: number;
  onToggleComments: () => void;
  commentsOpen: boolean;
};

export function ReactionBar({
  postId,
  reactionCount,
  commentCount,
  onToggleComments,
  commentsOpen,
}: ReactionBarProps) {
  const [count, setCount] = useState(reactionCount);
  const [activeKind, setActiveKind] = useState<ReactionKind | null>(null);
  const [trayOpen, setTrayOpen] = useState(false);
  const [popping, setPopping] = useState(false);
  const openTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const zoneRef = useRef<HTMLDivElement>(null);

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
    setActiveKind(kind);
    setTrayOpen(false);
    setPopping(true);
    window.setTimeout(() => setPopping(false), 320);

    try {
      await reactToPost(postId, kind);
      if (wasNew) {
        setCount((n) => n + 1);
        void trackEvents([{ type: "post_liked", payload: { post_id: postId, kind } }]);
      } else if (prevKind !== kind) {
        void trackEvents([{ type: "post_reaction_changed", payload: { post_id: postId, kind } }]);
      }
    } catch {
      setActiveKind(prevKind);
    }
  }

  function handleQuickLike() {
    void applyReaction(activeKind ?? "like");
  }

  const current = activeKind ? getReaction(activeKind) : null;
  const CurrentIcon = current?.Icon;
  const DefaultIcon = REACTIONS[0].Icon;

  return (
    <div className="mt-3 border-t border-[var(--li-border)] pt-1">
      <div className="flex items-stretch">
        <div
          ref={zoneRef}
          className="relative flex-1"
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
            className={`li-action-btn w-full ${activeKind ? "is-active" : ""} ${popping ? "is-pop" : ""}`}
            style={
              current
                ? ({ "--action-color": current.color } as React.CSSProperties)
                : undefined
            }
          >
            {CurrentIcon ? (
              <CurrentIcon className="h-5 w-5" strokeWidth={2.25} />
            ) : (
              <DefaultIcon className="h-5 w-5" strokeWidth={2} />
            )}
            <span>{current?.label ?? "Gostei"}</span>
            {count > 0 && <span className="text-xs opacity-80">({count})</span>}
          </button>
        </div>

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
      </div>
    </div>
  );
}
