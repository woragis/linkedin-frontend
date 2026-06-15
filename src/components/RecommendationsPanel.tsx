"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  acceptConnection,
  getRecommendations,
  listPending,
  rejectConnection,
  requestConnection,
} from "@/lib/api";
import { initials } from "@/lib/format";
import type { Connection, PersonSuggestion } from "@/lib/types";

export function RecommendationsPanel() {
  const [recs, setRecs] = useState<PersonSuggestion[]>([]);
  const [pending, setPending] = useState<Connection[]>([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    try {
      const [r, p] = await Promise.all([
        getRecommendations(),
        listPending(),
      ]);
      setRecs(r);
      setPending(p);
    } catch {
      setRecs([]);
      setPending([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
  }, []);

  async function connect(userId: string) {
    await requestConnection(userId);
    await load();
  }

  async function accept(id: string) {
    await acceptConnection(id);
    await load();
  }

  async function reject(id: string) {
    await rejectConnection(id);
    await load();
  }

  return (
    <div className="space-y-4">
      {pending.length > 0 && (
        <div className="li-card p-4">
          <h2 className="mb-3 text-sm font-semibold">Convites pendentes</h2>
          <ul className="space-y-3">
            {pending.map((c) => (
              <li key={c.id} className="flex items-center justify-between gap-2">
                <span className="text-sm text-[var(--li-muted)]">
                  Pedido de conexão
                </span>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => accept(c.id)}
                    className="li-btn li-btn-primary px-3 py-1 text-xs"
                  >
                    Aceitar
                  </button>
                  <button
                    type="button"
                    onClick={() => reject(c.id)}
                    className="li-btn li-btn-ghost px-3 py-1 text-xs"
                  >
                    Recusar
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="li-card p-4">
        <h2 className="mb-3 text-sm font-semibold">Pessoas que você pode conhecer</h2>
        {loading ? (
          <p className="text-sm text-[var(--li-muted)]">Carregando...</p>
        ) : recs.length === 0 ? (
          <p className="text-sm text-[var(--li-muted)]">
            Nenhuma sugestão ainda. Rode o seed e o worker batch.
          </p>
        ) : (
          <ul className="space-y-4">
            {recs.map((r) => (
              <li key={r.user_id}>
                <div className="flex gap-3">
                  <Link
                    href={`/users/${r.slug}`}
                    className="li-avatar li-avatar-sm bg-[#057642]"
                  >
                    {initials(r.full_name)}
                  </Link>
                  <div className="min-w-0 flex-1">
                    <Link
                      href={`/users/${r.slug}`}
                      className="text-sm font-semibold hover:underline"
                    >
                      {r.full_name}
                    </Link>
                    <p className="truncate text-xs text-[var(--li-muted)]">
                      {r.headline}
                    </p>
                    {r.reasons?.length > 0 && (
                      <p className="mt-1 text-xs text-[var(--li-blue)]">
                        {r.reasons.join(" · ")}
                      </p>
                    )}
                    <button
                      type="button"
                      onClick={() => connect(r.user_id)}
                      className="li-btn li-btn-ghost mt-2 px-3 py-1 text-xs"
                    >
                      Conectar
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
