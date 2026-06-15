"use client";

import Link from "next/link";
import { useState } from "react";
import { reactToPost, trackEvents } from "@/lib/api";
import { formatDate, initials } from "@/lib/format";
import type { Post } from "@/lib/types";

function postAuthor(post: Post) {
  return post.Author ?? {
    user_id: post.author_id,
    slug: "",
    full_name: "Usuário",
    headline: "",
  };
}

export function FeedPost({ post }: { post: Post }) {
  const author = postAuthor(post);
  const [reactions, setReactions] = useState(post.reaction_count);
  const [liked, setLiked] = useState(false);

  async function handleLike() {
    if (liked) return;
    try {
      await reactToPost(post.id);
      setReactions((n) => n + 1);
      setLiked(true);
      void trackEvents([
        {
          type: "post_liked",
          payload: { post_id: post.id },
        },
      ]);
    } catch {
      /* ignore duplicate */
    }
  }

  return (
    <article className="li-card p-4">
      <div className="flex gap-3">
        <Link
          href={author.slug ? `/users/${author.slug}` : "#"}
          className="li-avatar li-avatar-sm bg-[var(--li-blue)]"
        >
          {initials(author.full_name)}
        </Link>
        <div className="min-w-0 flex-1">
          <Link
            href={author.slug ? `/users/${author.slug}` : "#"}
            className="font-semibold hover:underline"
          >
            {author.full_name}
          </Link>
          {author.headline && (
            <p className="truncate text-xs text-[var(--li-muted)]">
              {author.headline}
            </p>
          )}
          <p className="text-xs text-[var(--li-muted)]">
            {formatDate(post.created_at)}
          </p>
        </div>
      </div>
      <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed">
        {post.body}
      </p>
      <div className="mt-3 flex items-center gap-4 border-t border-[var(--li-border)] pt-3 text-sm text-[var(--li-muted)]">
        <button
          type="button"
          onClick={handleLike}
          className={`hover:text-[var(--li-blue)] ${liked ? "font-semibold text-[var(--li-blue)]" : ""}`}
        >
          Curtir ({reactions})
        </button>
        <span>{post.comment_count} comentários</span>
      </div>
    </article>
  );
}
