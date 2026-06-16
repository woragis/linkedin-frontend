"use client";

import cytoscape, { type Core, type ElementDefinition } from "cytoscape";
import { useEffect, useRef, useState } from "react";
import { layoutNetworkGraph } from "@/lib/graph-layout";
import type { GraphEdge, GraphNode } from "@/lib/types";

interface NetworkGraphProps {
  nodes: GraphNode[];
  edges: GraphEdge[];
  centerUserId?: string;
  height?: number;
}

export function NetworkGraph({
  nodes,
  edges,
  centerUserId,
  height = 480,
}: NetworkGraphProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const cyRef = useRef<Core | null>(null);
  const [tooltip, setTooltip] = useState<string | null>(null);
  const [renderError, setRenderError] = useState<string | null>(null);

  useEffect(() => {
    if (!containerRef.current || nodes.length === 0) return;

    setRenderError(null);

    try {
      const width = containerRef.current.clientWidth || 600;
      const laid = layoutNetworkGraph(nodes, width, height, centerUserId);
      const nodeIds = new Set(laid.map((n) => n.id));
      const posById = Object.fromEntries(laid.map((n) => [n.id, n]));

      const validEdges = edges.filter(
        (e) => nodeIds.has(String(e.source)) && nodeIds.has(String(e.target)),
      );

      const elements: ElementDefinition[] = [
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
              width: 36,
              height: 36,
              "background-color": (ele) =>
                posById[ele.id()]?.color ?? "#0a66c2",
              color: "#191919",
            },
          },
          {
            selector: "edge",
            style: {
              width: 2,
              "line-color": "#c7c7c7",
              "curve-style": "bezier",
              opacity: 0.7,
            },
          },
        ],
        layout: { name: "preset" },
        userZoomingEnabled: true,
        userPanningEnabled: true,
      });

      cy.on("mouseover", "node", (evt) => {
        const d = evt.target.data();
        setTooltip(
          `${d.label} · PageRank ${Number(d.pagerank ?? 0).toFixed(4)} · grau ${d.degree ?? 0}`,
        );
      });
      cy.on("mouseout", "node", () => setTooltip(null));

      cyRef.current = cy;
      cy.fit(undefined, 40);

      return () => {
        cy.destroy();
        cyRef.current = null;
      };
    } catch (err) {
      setRenderError(
        err instanceof Error ? err.message : "Erro ao renderizar o grafo",
      );
    }
  }, [nodes, edges, centerUserId, height]);

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
      <div ref={containerRef} style={{ height }} className="w-full" />
      {tooltip && (
        <p className="border-t border-[var(--li-border)] px-4 py-2 text-xs text-[var(--li-muted)]">
          {tooltip}
        </p>
      )}
    </div>
  );
}
