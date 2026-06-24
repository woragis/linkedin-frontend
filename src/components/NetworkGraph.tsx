"use client";

import cytoscape, { type Core, type ElementDefinition } from "cytoscape";
import { useCallback, useEffect, useRef, useState } from "react";
import { communityColor, initials } from "@/lib/format";
import { layoutNetworkGraph } from "@/lib/graph-layout";
import type { GraphEdge, GraphNode } from "@/lib/types";

export type GraphLayoutMode = "preset" | "physics";

interface NetworkGraphProps {
  nodes: GraphNode[];
  edges: GraphEdge[];
  centerUserId?: string;
  height?: number;
  layoutMode?: GraphLayoutMode;
}

const COSE_OPTIONS = {
  name: "cose",
  animate: true,
  animationDuration: 900,
  animationEasing: "ease-out",
  randomize: true,
  fit: true,
  padding: 40,
  nodeRepulsion: 9000,
  idealEdgeLength: 90,
  edgeElasticity: 120,
  nestingFactor: 0.1,
  gravity: 0.35,
  numIter: 1200,
  initialTemp: 220,
  coolingFactor: 0.96,
  minTemp: 1.0,
} as const;

function nodeColor(node: GraphNode, centerUserId?: string): string {
  if (centerUserId && node.user_id === centerUserId) return "#0a66c2";
  if (node.community_id != null) return communityColor(node.community_id);
  return "#057642";
}

export function NetworkGraph({
  nodes,
  edges,
  centerUserId,
  height = 480,
  layoutMode = "preset",
}: NetworkGraphProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const cyRef = useRef<Core | null>(null);
  const [tooltip, setTooltip] = useState<string | null>(null);
  const [renderError, setRenderError] = useState<string | null>(null);
  const [settling, setSettling] = useState(false);

  const runPhysicsLayout = useCallback((cy: Core, eles?: ReturnType<Core["elements"]>) => {
    setSettling(true);
    const target = eles ?? cy.elements();
    const layout = target.layout(COSE_OPTIONS);
    layout.on("layoutstop", () => setSettling(false));
    layout.run();
  }, []);

  useEffect(() => {
    if (!containerRef.current || nodes.length === 0) return;

    setRenderError(null);

    try {
      const width = containerRef.current.clientWidth || 600;
      const nodeIds = new Set(nodes.map((n) => n.user_id));
      const validEdges = edges.filter(
        (e) => nodeIds.has(String(e.source)) && nodeIds.has(String(e.target)),
      );

      let elements: ElementDefinition[];
      let posById: Record<string, { color: string }> = {};

      if (layoutMode === "physics") {
        const radius = Math.min(width, height) * 0.35;
        elements = [
          ...nodes.map((n, i) => {
            const ang = (i / Math.max(nodes.length, 1)) * 2 * Math.PI;
            const color = nodeColor(n, centerUserId);
            posById[n.user_id] = { color };
            return {
              group: "nodes" as const,
              data: {
                id: n.user_id,
                label: (n.full_name || "?").split(" ")[0],
                pagerank: n.pagerank,
                degree: n.degree,
                community: n.community_id,
              },
              position: {
                x: width / 2 + Math.cos(ang) * radius * (0.4 + (i % 5) * 0.08),
                y: height / 2 + Math.sin(ang) * radius * (0.4 + (i % 5) * 0.08),
              },
            };
          }),
          ...validEdges.map((e) => ({
            group: "edges" as const,
            data: {
              id: `${e.source}-${e.target}`,
              source: String(e.source),
              target: String(e.target),
            },
          })),
        ];
      } else {
        const laid = layoutNetworkGraph(nodes, width, height, centerUserId);
        posById = Object.fromEntries(laid.map((n) => [n.id, { color: n.color }]));
        elements = [
          ...laid.map((n) => ({
            group: "nodes" as const,
            data: {
              id: n.id,
              label: (n.label || "?").split(" ")[0],
              pagerank: n.pagerank,
              degree: n.degree,
            },
            position: { x: n.x, y: n.y },
          })),
          ...validEdges.map((e) => ({
            group: "edges" as const,
            data: {
              id: `${e.source}-${e.target}`,
              source: String(e.source),
              target: String(e.target),
            },
          })),
        ];
      }

      if (cyRef.current) {
        cyRef.current.destroy();
      }

      const cy = cytoscape({
        container: containerRef.current,
        elements,
        style: [
          {
            selector: "node",
            style: {
              label: "data(label)",
              "text-valign": "bottom",
              "text-margin-y": 6,
              "font-size": 10,
              width: 34,
              height: 34,
              "background-color": (ele) => {
                const id = ele.id();
                if (layoutMode === "physics") {
                  const node = nodes.find((n) => n.user_id === id);
                  return node ? nodeColor(node, centerUserId) : "#057642";
                }
                return posById[id]?.color ?? "#0a66c2";
              },
              color: "#191919",
              "border-width": 2,
              "border-color": "#ffffff",
            },
          },
          {
            selector: "node:selected",
            style: {
              "border-color": "#0a66c2",
              "border-width": 3,
            },
          },
          {
            selector: "edge",
            style: {
              width: 2,
              "line-color": "#b0b0b0",
              "curve-style": "bezier",
              opacity: 0.75,
            },
          },
          {
            selector: "node:active",
            style: {
              "overlay-opacity": 0.12,
            },
          },
        ],
        layout: layoutMode === "physics" ? COSE_OPTIONS : { name: "preset" },
        userZoomingEnabled: true,
        userPanningEnabled: true,
        boxSelectionEnabled: false,
        autoungrabify: false,
      });

      cy.on("mouseover", "node", (evt) => {
        const d = evt.target.data();
        setTooltip(
          `${d.label} · PageRank ${Number(d.pagerank ?? 0).toFixed(4)} · grau ${d.degree ?? 0}`,
        );
      });
      cy.on("mouseout", "node", () => setTooltip(null));

      if (layoutMode === "physics") {
        cy.on("dragfree", "node", (evt) => {
          const node = evt.target;
          runPhysicsLayout(cy, node.closedNeighborhood());
        });
        cy.on("layoutstop", () => setSettling(false));
      }

      cyRef.current = cy;
      if (layoutMode !== "physics") {
        cy.fit(undefined, 40);
      }

      return () => {
        cy.destroy();
        cyRef.current = null;
      };
    } catch (err) {
      setRenderError(
        err instanceof Error ? err.message : "Erro ao renderizar o grafo",
      );
    }
  }, [nodes, edges, centerUserId, height, layoutMode, runPhysicsLayout]);

  const handleRelayout = () => {
    if (cyRef.current && layoutMode === "physics") {
      runPhysicsLayout(cyRef.current);
    }
  };

  if (nodes.length === 0) {
    return (
      <div
        className="li-card flex items-center justify-center text-sm text-[var(--li-muted)]"
        style={{ height }}
      >
        Sem dados de rede. Conecte-se a pessoas ou aguarde o worker batch.
      </div>
    );
  }

  if (renderError) {
    return (
      <div
        className="li-card flex items-center justify-center px-4 text-sm text-red-700"
        style={{ height }}
      >
        {renderError}
      </div>
    );
  }

  return (
    <div className="li-card overflow-hidden">
      {layoutMode === "physics" && (
        <div className="flex items-center justify-between border-b border-[var(--li-border)] px-4 py-2">
          <p className="text-xs text-[var(--li-muted)]">
            Arraste os nós · zoom com scroll · arestas elásticas
            {settling ? " · ajustando…" : ""}
          </p>
          <button
            type="button"
            onClick={handleRelayout}
            className="li-btn li-btn-ghost px-2 py-1 text-xs"
          >
            Reorganizar
          </button>
        </div>
      )}
      <div ref={containerRef} style={{ height }} className="w-full" />
      {tooltip && (
        <p className="border-t border-[var(--li-border)] px-4 py-2 text-xs text-[var(--li-muted)]">
          {tooltip}
        </p>
      )}
    </div>
  );
}

export function GraphLegend({ nodes }: { nodes: GraphNode[] }) {
  const communities = [...new Set(nodes.map((n) => n.community_id).filter((c) => c != null))];
  if (communities.length === 0) return null;
  return (
    <div className="flex flex-wrap gap-2 text-xs text-[var(--li-muted)]">
      {communities.slice(0, 8).map((cid) => (
        <span key={cid} className="inline-flex items-center gap-1">
          <span
            className="inline-block h-2.5 w-2.5 rounded-full"
            style={{ backgroundColor: communityColor(cid!) }}
          />
          comunidade {cid}
        </span>
      ))}
    </div>
  );
}

export function GraphNodeAvatar({ name }: { name: string }) {
  return (
    <span className="li-avatar li-avatar-sm bg-[var(--li-blue)]">
      {initials(name)}
    </span>
  );
}
