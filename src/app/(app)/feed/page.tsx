"use client";

import { useCallback, useEffect, useState } from "react";
import { FeedPost } from "@/components/FeedPost";
import { PostComposer } from "@/components/PostComposer";
import { RecommendationsPanel } from "@/components/RecommendationsPanel";
import { useAuth } from "@/components/AuthProvider";
import { getFeed, trackEvents } from "@/lib/api";
import type { FeedResponse } from "@/lib/types";

export default function FeedPage() {
  const { profile } = useAuth();
  const [feed, setFeed] = useState<FeedResponse | null>(null);
  const [loading, setLoading] = useState(true);

  const loadFeed = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getFeed();
      setFeed(data);
      if (data.posts.length > 0) {
        void trackEvents(
          data.posts.slice(0, 5).map((p) => ({
            type: "post_viewed",
            payload: { post_id: p.id },
          })),
        );
      }
    } catch {
      setFeed(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadFeed();
  }, [loadFeed]);

  if (!profile) return null;

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
      <div className="space-y-4">
        <PostComposer profile={profile} onPosted={loadFeed} />
        {feed?.variant && (
          <p className="text-xs text-[var(--li-muted)]">
            Feed: <span className="font-medium">{feed.variant}</span> (experimento A/B)
          </p>
        )}
        {loading ? (
          <p className="text-sm text-[var(--li-muted)]">Carregando feed...</p>
        ) : !feed?.posts.length ? (
          <div className="li-card p-6 text-center text-sm text-[var(--li-muted)]">
            Nenhum post no feed. Crie um post ou rode o seed demo.
          </div>
        ) : (
          feed.posts.map((post) => <FeedPost key={post.id} post={post} />)
        )}
      </div>
      <aside>
        <RecommendationsPanel />
      </aside>
    </div>
  );
}
