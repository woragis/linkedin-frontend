"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  getAnalyticsOverview,
  getChurnUsers,
  getCohorts,
  getDau,
  getExperiments,
  getMLModels,
  getTopPosts,
  seedDemo,
} from "@/lib/api";
import { formatPct } from "@/lib/format";
import type {
  ABExperimentResult,
  AnalyticsOverview,
  ChurnUser,
  CohortRow,
  DauPoint,
  MLModel,
  TopPost,
} from "@/lib/types";

function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="li-card p-4">
      <p className="text-xs text-[var(--li-muted)]">{label}</p>
      <p className="mt-1 text-2xl font-semibold">{value}</p>
    </div>
  );
}

export function AnalyticsDashboard() {
  const [overview, setOverview] = useState<AnalyticsOverview | null>(null);
  const [dau, setDau] = useState<DauPoint[]>([]);
  const [topPosts, setTopPosts] = useState<TopPost[]>([]);
  const [cohorts, setCohorts] = useState<CohortRow[]>([]);
  const [churn, setChurn] = useState<ChurnUser[]>([]);
  const [experiments, setExperiments] = useState<ABExperimentResult[]>([]);
  const [mlModels, setMlModels] = useState<MLModel[]>([]);
  const [error, setError] = useState("");
  const [seeding, setSeeding] = useState(false);

  async function load() {
    setError("");
    try {
      const [o, d, t, c, ch, exp, models] = await Promise.all([
        getAnalyticsOverview(),
        getDau(14),
        getTopPosts(5),
        getCohorts(),
        getChurnUsers(10),
        getExperiments(),
        getMLModels(),
      ]);
      setOverview(o);
      setDau(d);
      setTopPosts(t);
      setCohorts(c.slice(0, 12));
      setChurn(ch);
      setExperiments(exp);
      setMlModels(models);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao carregar analytics");
    }
  }

  useEffect(() => {
    void load();
  }, []);

  async function handleSeed() {
    setSeeding(true);
    try {
      await seedDemo();
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro no seed");
    } finally {
      setSeeding(false);
    }
  }

  const maxDau = Math.max(...dau.map((p) => p.dau), 1);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Analytics do produto</h1>
        <button
          type="button"
          onClick={handleSeed}
          disabled={seeding}
          className="li-btn li-btn-ghost text-xs"
        >
          {seeding ? "Seedando..." : "Seed demo (dev)"}
        </button>
      </div>

      {error && (
        <p className="rounded border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      )}

      {overview && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard label="DAU (hoje)" value={overview.dau} />
          <StatCard label="MAU (30d)" value={overview.mau} />
          <StatCard label="Usuários" value={overview.total_users} />
          <StatCard label="Posts" value={overview.total_posts} />
        </div>
      )}

      {overview && (
        <div className="grid gap-4 sm:grid-cols-3">
          <StatCard label="Churn alto" value={overview.churn_high_count} />
          <StatCard label="Churn médio" value={overview.churn_medium_count} />
          <StatCard label="Churn baixo" value={overview.churn_low_count} />
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="li-card p-4">
          <h2 className="mb-4 text-sm font-semibold">DAU (14 dias)</h2>
          {dau.length === 0 ? (
            <p className="text-sm text-[var(--li-muted)]">Sem dados ainda.</p>
          ) : (
            <div className="flex h-32 items-end gap-1">
              {dau.map((p) => (
                <div
                  key={p.day}
                  className="flex-1 rounded-t bg-[var(--li-blue)]"
                  style={{ height: `${(p.dau / maxDau) * 100}%`, minHeight: 4 }}
                  title={`${p.day}: ${p.dau}`}
                />
              ))}
            </div>
          )}
        </div>

        <div className="li-card p-4">
          <h2 className="mb-4 text-sm font-semibold">Top posts (hoje)</h2>
          {topPosts.length === 0 ? (
            <p className="text-sm text-[var(--li-muted)]">Sem engajamento registrado.</p>
          ) : (
            <ul className="space-y-3">
              {topPosts.map((p) => (
                <li key={p.post_id} className="text-sm">
                  <p className="line-clamp-2">{p.body}</p>
                  <p className="mt-1 text-xs text-[var(--li-muted)]">
                    {p.author_name} · {p.views} views · {p.reactions} reações
                  </p>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="li-card p-4">
          <h2 className="mb-4 text-sm font-semibold">Coortes (retenção)</h2>
          {cohorts.length === 0 ? (
            <p className="text-sm text-[var(--li-muted)]">Worker batch pendente.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="text-left text-[var(--li-muted)]">
                    <th className="pb-2">Coorte</th>
                    <th className="pb-2">Semana</th>
                    <th className="pb-2">Retenção</th>
                  </tr>
                </thead>
                <tbody>
                  {cohorts.map((c, i) => (
                    <tr key={`${c.cohort_week}-${c.week_offset}-${i}`} className="border-t border-[var(--li-border)]">
                      <td className="py-2">{c.cohort_week.slice(0, 10)}</td>
                      <td className="py-2">+{c.week_offset}</td>
                      <td className="py-2">{formatPct(c.retention_pct)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="li-card p-4">
          <h2 className="mb-4 text-sm font-semibold">Risco de churn</h2>
          {churn.length === 0 ? (
            <p className="text-sm text-[var(--li-muted)]">Scores ainda não calculados.</p>
          ) : (
            <ul className="space-y-2">
              {churn.map((u) => (
                <li
                  key={u.user_id}
                  className="flex items-center justify-between text-sm"
                >
                  <Link href={`/users/${u.slug}`} className="hover:underline">
                    {u.full_name}
                  </Link>
                  <span
                    className={`rounded px-2 py-0.5 text-xs font-medium ${
                      u.risk_tier === "high"
                        ? "bg-red-100 text-red-700"
                        : u.risk_tier === "medium"
                          ? "bg-amber-100 text-amber-800"
                          : "bg-green-100 text-green-800"
                    }`}
                  >
                    {(u.churn_probability * 100).toFixed(0)}%
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="li-card p-4">
          <h2 className="mb-4 text-sm font-semibold">Experimentos A/B</h2>
          {experiments.length === 0 ? (
            <p className="text-sm text-[var(--li-muted)]">
              Nenhum resultado de experimento ainda.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="text-left text-[var(--li-muted)]">
                    <th className="pb-2">Experimento</th>
                    <th className="pb-2">Variante</th>
                    <th className="pb-2">Métrica</th>
                    <th className="pb-2">IC 95%</th>
                  </tr>
                </thead>
                <tbody>
                  {experiments.map((e, i) => (
                    <tr
                      key={`${e.experiment_id}-${e.variant}-${i}`}
                      className="border-t border-[var(--li-border)]"
                    >
                      <td className="py-2">{e.experiment_name}</td>
                      <td className="py-2">{e.variant}</td>
                      <td className="py-2">
                        {formatPct(e.metric_value)} (n={e.sample_size})
                      </td>
                      <td className="py-2">
                        {e.ci_lower != null && e.ci_upper != null
                          ? `${formatPct(e.ci_lower)} – ${formatPct(e.ci_upper)}`
                          : "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="li-card p-4">
          <h2 className="mb-4 text-sm font-semibold">Modelos ML</h2>
          {mlModels.length === 0 ? (
            <p className="text-sm text-[var(--li-muted)]">
              Nenhum modelo treinado ainda.
            </p>
          ) : (
            <ul className="space-y-3">
              {mlModels.map((m) => (
                <li key={m.id} className="text-sm">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">
                      {m.model_name} v{m.version}
                    </span>
                    {m.is_active && (
                      <span className="rounded bg-green-100 px-2 py-0.5 text-xs text-green-800">
                        ativo
                      </span>
                    )}
                  </div>
                  <p className="mt-1 text-xs text-[var(--li-muted)]">
                    Treinado em {new Date(m.trained_at).toLocaleDateString()}
                  </p>
                  {m.metrics && Object.keys(m.metrics).length > 0 && (
                    <p className="mt-1 text-xs">
                      {Object.entries(m.metrics)
                        .map(([k, v]) => `${k}: ${v}`)
                        .join(" · ")}
                    </p>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
