"use client";

import Link from "next/link";
import { useCallback, useState } from "react";
import { searchPeople, searchPosts } from "@/lib/api";
import { initials } from "@/lib/format";
import type { PersonSearchHit, PostSearchHit } from "@/lib/types";

export default function SearchPage() {
  const [q, setQ] = useState("");
  const [tab, setTab] = useState<"people" | "posts">("people");
  const [people, setPeople] = useState<PersonSearchHit[]>([]);
  const [posts, setPosts] = useState<PostSearchHit[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const runSearch = useCallback(async (query: string, activeTab: "people" | "posts") => {
    setLoading(true);
    setSearched(true);
    setError(null);
    try {
      if (activeTab === "people") {
        setPeople(await searchPeople(query));
      } else {
        setPosts(await searchPosts(query));
      }
    } catch {
      if (activeTab === "people") setPeople([]);
      else setPosts([]);
      setError("Não foi possível buscar. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }, []);

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    const query = q.trim();
    if (!query) return;
    await runSearch(query, tab);
  }

  function switchTab(next: "people" | "posts") {
    setTab(next);
    const query = q.trim();
    if (searched && query) {
      void runSearch(query, next);
    }
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <h1 className="text-xl font-semibold">Busca</h1>
      <form onSubmit={handleSearch} className="li-card flex gap-2 p-3">
        <input
          className="li-input flex-1 border-0 focus:ring-0"
          placeholder="Buscar pessoas ou posts..."
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
        <button type="submit" className="li-btn li-btn-primary" disabled={loading}>
          {loading ? "..." : "Buscar"}
        </button>
      </form>

      <div className="flex gap-2">
        {(["people", "posts"] as const).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => switchTab(t)}
            className={`li-btn text-xs ${tab === t ? "li-btn-primary" : "li-btn-ghost"}`}
          >
            {t === "people" ? "Pessoas" : "Posts"}
          </button>
        ))}
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      {searched && tab === "people" && (
        <ul className="space-y-3">
          {people.length === 0 ? (
            <p className="text-sm text-[var(--li-muted)]">Nenhum resultado.</p>
          ) : (
            people.map((p) => (
              <li key={p.user_id} className="li-card flex gap-3 p-4">
                <div className="li-avatar li-avatar-sm bg-[var(--li-blue)]">
                  {initials(p.full_name)}
                </div>
                <div>
                  <Link
                    href={`/users/${p.slug}`}
                    className="font-semibold hover:underline"
                  >
                    {p.full_name}
                  </Link>
                  <p className="text-sm text-[var(--li-muted)]">{p.headline}</p>
                  {p.location && (
                    <p className="text-xs text-[var(--li-muted)]">{p.location}</p>
                  )}
                </div>
              </li>
            ))
          )}
        </ul>
      )}

      {searched && tab === "posts" && (
        <ul className="space-y-3">
          {posts.length === 0 ? (
            <p className="text-sm text-[var(--li-muted)]">Nenhum resultado.</p>
          ) : (
            posts.map((p) => (
              <li key={p.post_id} className="li-card p-4">
                <p className="text-sm font-semibold">{p.author_name}</p>
                <p className="mt-2 text-sm">{p.body}</p>
              </li>
            ))
          )}
        </ul>
      )}
    </div>
  );
}
