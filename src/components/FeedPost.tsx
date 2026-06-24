"use client";

import Link from "next/link";
import { Reply, Send } from "lucide-react";
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

function countThread(comments: Comment[]): number {
  return comments.reduce((n, c) => n + 1 + (c.replies?.length ?? 0), 0);
}

function CommentItem({
  comment,
  postId,
  depth = 0,
  onReplyAdded,
}: {
  comment: Comment;
  postId: string;
  depth?: number;
  onReplyAdded: (created: Comment) => void;
}) {
  const ca = commentAuthor(comment);
  const [replyOpen, setReplyOpen] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleReply(e: React.FormEvent) {
    e.preventDefault();
    const body = replyText.trim();
    if (!body) return;
    setSubmitting(true);
    try {
      const created = await addComment(postId, body, comment.id);
      onReplyAdded(created);
      setReplyText("");
      setReplyOpen(false);
    } catch {
      /* ignore */
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <li className={depth > 0 ? "ml-8 border-l-2 border-[var(--li-border)] pl-3" : ""}>
      <div className="flex gap-2">
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
              · {formatDate(comment.created_at)}
            </span>
          </p>
          <p className="text-sm">{comment.body}</p>

          <ReactionBar
            target={{ type: "comment", id: comment.id }}
            reactionCount={comment.reaction_count ?? 0}
            reactionSummary={comment.reaction_summary}
            myReaction={comment.my_reaction}
            compact
          />

          {depth === 0 && (
            <button
              type="button"
              onClick={() => setReplyOpen((v) => !v)}
              className="mt-1 inline-flex items-center gap-1 text-xs font-semibold text-[var(--li-muted)] hover:text-[var(--li-blue)]"
            >
              <Reply className="h-3.5 w-3.5" />
              Responder
            </button>
          )}

          {replyOpen && (
            <form onSubmit={handleReply} className="mt-2 flex gap-2">
              <input
                className="li-input flex-1 text-sm"
                placeholder="Escreva uma resposta..."
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                disabled={submitting}
              />
              <button
                type="submit"
                disabled={submitting || !replyText.trim()}
                className="li-btn li-btn-primary gap-1 px-2 text-xs"
              >
                <Send className="h-3.5 w-3.5" />
              </button>
            </form>
          )}

          {comment.replies && comment.replies.length > 0 && (
            <ul className="mt-3 space-y-3">
              {comment.replies.map((reply) => (
                <CommentItem
                  key={reply.id}
                  comment={reply}
                  postId={postId}
                  depth={1}
                  onReplyAdded={onReplyAdded}
                />
              ))}
            </ul>
          )}
        </div>
      </div>
    </li>
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
      setCommentCount(countThread(rows));
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

  function mergeReply(created: Comment) {
    if (created.parent_comment_id) {
      setComments((prev) =>
        prev.map((c) =>
          c.id === created.parent_comment_id
            ? { ...c, replies: [...(c.replies ?? []), created] }
            : c,
        ),
      );
    } else {
      setComments((prev) => [...prev, created]);
    }
    setCommentCount((n) => n + 1);
  }

  async function handleComment(e: React.FormEvent) {
    e.preventDefault();
    const body = commentText.trim();
    if (!body) return;
    setSubmitting(true);
    try {
      const created = await addComment(post.id, body);
      mergeReply(created);
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
        target={{ type: "post", id: post.id }}
        reactionCount={post.reaction_count}
        reactionSummary={post.reaction_summary}
        myReaction={post.my_reaction}
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
              {comments.map((c) => (
                <CommentItem
                  key={c.id}
                  comment={c}
                  postId={post.id}
                  onReplyAdded={mergeReply}
                />
              ))}
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
