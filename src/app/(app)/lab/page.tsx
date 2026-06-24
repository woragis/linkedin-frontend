"use client";

import Link from "next/link";
import { FlaskConical, RefreshCw } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { GraphLegend, NetworkGraph } from "@/components/NetworkGraph";
import { getLabSample } from "@/lib/api";
import { getRealm, realmLabel } from "@/lib/realm";
import type { GraphResponse, LabSampleResponse } from "@/lib/types";

export default function LabPage() {
  const [realm, setRealmState] = useState<"live" | "volume">("live");
  const [sample, setSample] = useState<LabSampleResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getLabSample(180);
      setSample(data);
    } catch (e) {
      setSample(null);
      setError(
        e instanceof Error
          ? e.message
          : "Não foi possível carregar a amostra do laboratório.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    setRealmState(getRealm());
    void load();
  }, [load]);

  if (realm !== "volume") {
    return (
      <div className="space-y-4">
        <h1 className="text-xl font-semibold">Laboratório de grafos</h1>
        <div className="li-card space-y-3 p-6">
          <p className="text-sm text-[var(--li-muted)]">
            Esta visualização interativa está disponível apenas no realm{" "}
            <strong>Volume</strong> (laboratório de grafos em escala).
          </p>
          <p className="text-sm text-[var(--li-muted)]">
            Use o toggle no topo da página para alternar para{" "}
            {realmLabel("volume")} e faça login novamente.
          </p>
          <Link href="/network" className="li-btn li-btn-primary inline-flex text-sm">
            Ir para sua rede
          </Link>
        </div>
      </div>
    );
  }

  const graph: GraphResponse = {
    nodes: sample?.nodes ?? [],
    edges: sample?.edges ?? [],
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="mb-1 flex items-center gap-2">
            <FlaskConical className="h-5 w-5 text-[var(--li-blue)]" />
            <h1 className="text-xl font-semibold">Laboratório de grafos</h1>
          </div>
          <p className="text-sm text-[var(--li-muted)]">
            Amostra interativa do grafo sintético — arraste, dê zoom e explore
            comunidades
          </p>
        </div>
        <button
          type="button"
          onClick={() => void load()}
          disabled={loading}
          className="li-btn li-btn-ghost gap-1.5 text-sm"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          Nova amostra
        </button>
      </div>

      <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
        <strong>Modo laboratório.</strong> Dados sintéticos com ~
        {sample?.total_users?.toLocaleString("pt-BR") ?? "…"} usuários e ~
        {sample?.total_edges?.toLocaleString("pt-BR") ?? "…"} conexões. A tela
        mostra uma amostra de {sample?.sample_size ?? "…"} nós — não o grafo
        inteiro.
      </div>

      {error && (
        <p className="rounded border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          {error}
        </p>
      )}

      {loading ? (
        <p className="text-sm text-[var(--li-muted)]">Carregando amostra…</p>
      ) : (
        <>
          <NetworkGraph
            nodes={graph.nodes}
            edges={graph.edges}
            centerUserId={sample?.seed_user_id}
            height={560}
            layoutMode="physics"
          />
          <GraphLegend nodes={graph.nodes} />
        </>
      )}

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Usuários no lab" value={sample?.total_users} />
        <StatCard label="Conexões totais" value={sample?.total_edges} />
        <StatCard label="Nós na amostra" value={sample?.sample_size} />
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
}: {
  label: string;
  value?: number;
}) {
  return (
    <div className="li-card p-4">
      <p className="text-xs text-[var(--li-muted)]">{label}</p>
      <p className="text-2xl font-semibold">
        {value != null ? value.toLocaleString("pt-BR") : "—"}
      </p>
    </div>
  );
}
