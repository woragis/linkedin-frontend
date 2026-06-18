"use client";

import Link from "next/link";
import { Send } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { addComment, listComments } from "@/lib/api";
import { formatDate, initials } from "@/lib/format";
import type { Comment, Post } from "@/lib/types";
import { ReactionBar } from "./ReactionBar";

function postAuthor(post: Post) {
  return (
    post.author ?? {
      user_id: post.author_id,
      slug: "",
      full_name: "Usuário",
      headline: "",
    }
  );
}

function commentAuthor(comment: Comment) {
  return (
    comment.author ?? {
      user_id: comment.author_id,
      slug: "",
      full_name: "Usuário",
      headline: "",
    }
  );
}

export function FeedPost({ post }: { post: Post }) {
  const author = postAuthor(post);
  const [commentCount, setCommentCount] = useState(post.comment_count);
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loadingComments, setLoadingComments] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const loadComments = useCallback(async () => {
    setLoadingComments(true);
    try {
      const rows = await listComments(post.id);
      setComments(rows);
      setCommentCount(rows.length);
    } catch {
      setComments([]);
    } finally {
      setLoadingComments(false);
    }
  }, [post.id]);

  useEffect(() => {
    if (showComments) {
      void loadComments();
    }
  }, [showComments, loadComments]);

  async function handleComment(e: React.FormEvent) {
    e.preventDefault();
    const body = commentText.trim();
    if (!body) return;
    setSubmitting(true);
    try {
      const created = await addComment(post.id, body);
      setComments((prev) => [...prev, created]);
      setCommentCount((n) => n + 1);
      setCommentText("");
    } catch {
      /* ignore */
    } finally {
      setSubmitting(false);
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
            className="font-semibold hover:text-[var(--li-blue)] hover:underline"
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

      <ReactionBar
        postId={post.id}
        reactionCount={post.reaction_count}
        commentCount={commentCount}
        commentsOpen={showComments}
        onToggleComments={() => setShowComments((v) => !v)}
      />

      {showComments && (
        <div className="li-tab-panel mt-3 space-y-3 border-t border-[var(--li-border)] pt-3">
          {loadingComments ? (
            <p className="text-xs text-[var(--li-muted)]">Carregando...</p>
          ) : comments.length === 0 ? (
            <p className="text-xs text-[var(--li-muted)]">
              Nenhum comentário ainda.
            </p>
          ) : (
            <ul className="space-y-3">
              {comments.map((c) => {
                const ca = commentAuthor(c);
                return (
                  <li key={c.id} className="flex gap-2">
                    <div className="li-avatar li-avatar-sm shrink-0 bg-[#057642] text-xs">
                      {initials(ca.full_name)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm">
                        <Link
                          href={ca.slug ? `/users/${ca.slug}` : "#"}
                          className="font-semibold hover:text-[var(--li-blue)] hover:underline"
                        >
                          {ca.full_name}
                        </Link>{" "}
                        <span className="text-[var(--li-muted)]">
                          · {formatDate(c.created_at)}
                        </span>
                      </p>
                      <p className="text-sm">{c.body}</p>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
          <form onSubmit={handleComment} className="flex gap-2">
            <input
              className="li-input flex-1 text-sm"
              placeholder="Escreva um comentário..."
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              disabled={submitting}
            />
            <button
              type="submit"
              disabled={submitting || !commentText.trim()}
              className="li-btn li-btn-primary gap-1.5 px-3 text-xs"
            >
              <Send className="h-3.5 w-3.5" />
              Enviar
            </button>
          </form>
        </div>
      )}
    </article>
  );
}
