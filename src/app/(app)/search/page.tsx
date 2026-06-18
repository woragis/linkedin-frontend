"use client";

import { FileText, Loader2, Search as SearchIcon, Users } from "lucide-react";
import Link from "next/link";
import { useCallback, useState } from "react";
import { TabGroup } from "@/components/TabGroup";
import { searchPeople, searchPosts } from "@/lib/api";
import { initials } from "@/lib/format";
import type { PersonSearchHit, PostSearchHit } from "@/lib/types";

const TABS = [
  { id: "people" as const, label: "Pessoas", icon: Users },
  { id: "posts" as const, label: "Posts", icon: FileText },
];

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
      <div>
        <h1 className="text-xl font-semibold">Busca</h1>
        <p className="text-sm text-[var(--li-muted)]">
          Encontre pessoas e publicações
        </p>
      </div>

      <form onSubmit={handleSearch} className="li-card flex items-center gap-2 p-2">
        <SearchIcon className="ml-2 h-5 w-5 shrink-0 text-[var(--li-muted)]" />
        <input
          className="li-input flex-1 border-0 shadow-none focus:shadow-none"
          placeholder="Buscar pessoas ou posts..."
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
        <button type="submit" className="li-btn li-btn-primary shrink-0" disabled={loading}>
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Buscando
            </>
          ) : (
            "Buscar"
          )}
        </button>
      </form>

      <TabGroup tabs={TABS} value={tab} onChange={switchTab} />

      {error && <p className="text-sm text-red-600">{error}</p>}

      {searched && tab === "people" && (
        <ul key="people" className="li-tab-panel li-card divide-y divide-[var(--li-border)]">
          {people.length === 0 ? (
            <li className="p-6 text-sm text-[var(--li-muted)]">Nenhum resultado.</li>
          ) : (
            people.map((p) => (
              <li key={p.user_id} className="li-list-row">
                <div className="li-avatar li-avatar-sm bg-[var(--li-blue)]">
                  {initials(p.full_name)}
                </div>
                <div>
                  <Link
                    href={`/users/${p.slug}`}
                    className="font-semibold hover:text-[var(--li-blue)] hover:underline"
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
        <ul key="posts" className="li-tab-panel space-y-3">
          {posts.length === 0 ? (
            <li className="li-card p-6 text-sm text-[var(--li-muted)]">
              Nenhum resultado.
            </li>
          ) : (
            posts.map((p) => (
              <li key={p.post_id} className="li-card p-4">
                <p className="text-sm font-semibold">{p.author_name}</p>
                <p className="mt-2 text-sm leading-relaxed">{p.body}</p>
              </li>
            ))
          )}
        </ul>
      )}
    </div>
  );
}
