"use client";

import { Send } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { createPost } from "@/lib/api";
import { initials } from "@/lib/format";
import type { Profile } from "@/lib/types";

export function PostComposer({
  profile,
  onPosted,
}: {
  profile: Profile;
  onPosted: () => void;
}) {
  const [body, setBody] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!body.trim()) return;
    setLoading(true);
    setError("");
    try {
      await createPost(body.trim());
      setBody("");
      onPosted();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao publicar");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="li-card p-4">
      <form onSubmit={handleSubmit} className="flex gap-3">
        <Link
          href={`/users/${profile.slug}`}
          className="li-avatar bg-[var(--li-blue)]"
        >
          {initials(profile.full_name)}
        </Link>
        <div className="flex-1 space-y-2">
          <textarea
            className="li-input min-h-[88px] resize-none"
            placeholder="Comece uma publicação..."
            value={body}
            onChange={(e) => setBody(e.target.value)}
          />
          {error && <p className="text-sm text-red-600">{error}</p>}
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={loading || !body.trim()}
              className="li-btn li-btn-primary gap-2 disabled:opacity-50"
            >
              <Send className="h-4 w-4" />
              {loading ? "Publicando..." : "Publicar"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
