"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { NetworkGraph } from "@/components/NetworkGraph";
import { useAuth } from "@/components/AuthProvider";
import { getInfluencers, getLinkPredictions, getNetworkGraph } from "@/lib/api";
import { initials } from "@/lib/format";
import type { GraphNode, GraphResponse, LinkPrediction } from "@/lib/types";

export default function NetworkPage() {
  const { user } = useAuth();
  const [graph, setGraph] = useState<GraphResponse>({ nodes: [], edges: [] });
  const [influencers, setInfluencers] = useState<GraphNode[]>([]);
  const [predictions, setPredictions] = useState<LinkPrediction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const [g, inf, pred] = await Promise.all([
          getNetworkGraph(),
          getInfluencers(8),
          getLinkPredictions(8),
        ]);
        setGraph(g);
        setInfluencers(inf);
        setPredictions(pred);
      } catch (e) {
        setGraph({ nodes: [], edges: [] });
        setInfluencers([]);
        setPredictions([]);
        setError(
          e instanceof Error
            ? e.message
            : "Não foi possível carregar a rede. Verifique se a API está no ar.",
        );
      } finally {
        setLoading(false);
      }
    }
    void load();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold">Sua rede</h1>
        <p className="text-sm text-[var(--li-muted)]">
          Subgrafo de conexões com PageRank e comunidades
        </p>
      </div>

      {error && (
        <p className="rounded border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          {error}
        </p>
      )}

      {loading ? (
        <p className="text-sm text-[var(--li-muted)]">Carregando grafo...</p>
      ) : (
        <NetworkGraph
          nodes={graph.nodes}
          edges={graph.edges}
          centerUserId={user?.userId}
        />
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="li-card p-4">
          <h2 className="mb-4 text-sm font-semibold">Top influenciadores</h2>
          {influencers.length === 0 ? (
            <p className="text-sm text-[var(--li-muted)]">
              Métricas de grafo ainda não calculadas. Aguarde o worker batch.
            </p>
          ) : (
            <ul className="grid gap-3">
              {influencers.map((n, i) => (
                <li key={n.user_id} className="flex items-center gap-3">
                  <span className="w-6 text-sm font-bold text-[var(--li-muted)]">
                    {i + 1}
                  </span>
                  <div className="li-avatar li-avatar-sm bg-[#057642]">
                    {initials(n.full_name ?? "")}
                  </div>
                  <div className="min-w-0 flex-1">
                    <Link
                      href={`/users/${n.slug}`}
                      className="text-sm font-semibold hover:underline"
                    >
                      {n.full_name}
                    </Link>
                    <p className="truncate text-xs text-[var(--li-muted)]">
                      PR {(n.pagerank ?? 0).toFixed(4)} · grau {n.degree ?? 0}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="li-card p-4">
          <h2 className="mb-4 text-sm font-semibold">Previsão de links</h2>
          {predictions.length === 0 ? (
            <p className="text-sm text-[var(--li-muted)]">
              Previsões ainda não calculadas. Aguarde o worker batch.
            </p>
          ) : (
            <ul className="space-y-3">
              {predictions.map((p) => (
                <li key={p.user_id} className="flex items-start gap-3">
                  <div className="li-avatar li-avatar-sm bg-[var(--li-blue)]">
                    {initials(p.full_name ?? "")}
                  </div>
                  <div className="min-w-0 flex-1">
                    <Link
                      href={`/users/${p.slug}`}
                      className="text-sm font-semibold hover:underline"
                    >
                      {p.full_name}
                    </Link>
                    <p className="truncate text-xs text-[var(--li-muted)]">
                      {p.headline}
                    </p>
                    <p className="text-xs text-[var(--li-blue)]">
                      score {((p.score ?? 0) * 100).toFixed(0)}%
                      {(p.reasons?.length ?? 0) > 0 &&
                        ` · ${p.reasons!.join(" · ")}`}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
