"use client";

import { UserPlus } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { listConnections } from "@/lib/api";
import { formatDate, initials } from "@/lib/format";
import type { AcceptedConnection } from "@/lib/types";

export default function ConnectionsPage() {
  const [connections, setConnections] = useState<AcceptedConnection[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError("");
      try {
        const rows = await listConnections();
        setConnections(rows);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Erro ao carregar conexões");
        setConnections([]);
      } finally {
        setLoading(false);
      }
    }
    void load();
  }, []);

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#e8f4fc] text-[var(--li-blue)]">
          <UserPlus className="h-5 w-5" />
        </div>
        <div>
          <h1 className="text-xl font-semibold">Conexões</h1>
          <p className="text-sm text-[var(--li-muted)]">
            Pessoas com quem você está conectado
          </p>
        </div>
      </div>

      {error && (
        <p className="rounded border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      )}

      {loading ? (
        <p className="text-sm text-[var(--li-muted)]">Carregando...</p>
      ) : connections.length === 0 ? (
        <div className="li-card p-6 text-sm text-[var(--li-muted)]">
          Você ainda não tem conexões aceitas.
        </div>
      ) : (
        <ul className="li-card divide-y divide-[var(--li-border)] overflow-hidden">
          {connections.map((c) => (
            <li key={c.id} className="li-list-row items-center">
              {c.avatar_url ? (
                <img
                  src={c.avatar_url}
                  alt=""
                  className="li-avatar li-avatar-sm object-cover"
                />
              ) : (
                <div className="li-avatar li-avatar-sm bg-[var(--li-blue)]">
                  {initials(c.full_name)}
                </div>
              )}
              <div className="min-w-0 flex-1">
                <Link
                  href={`/users/${c.slug}`}
                  className="font-semibold hover:text-[var(--li-blue)] hover:underline"
                >
                  {c.full_name}
                </Link>
                {c.headline && (
                  <p className="truncate text-sm text-[var(--li-muted)]">
                    {c.headline}
                  </p>
                )}
                <p className="text-xs text-[var(--li-muted)]">
                  Conectado em {formatDate(c.connected_at)}
                </p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
