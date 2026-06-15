import type { GraphNode } from "./types";
import { communityColor } from "./format";

export interface LayoutNode {
  id: string;
  label: string;
  x: number;
  y: number;
  color: string;
  pagerank: number;
  degree: number;
}

export function layoutNetworkGraph(
  nodes: GraphNode[],
  width: number,
  height: number,
  centerId?: string,
): LayoutNode[] {
  const cx = width / 2;
  const cy = height / 2;
  const radius = Math.min(width, height) * 0.35;
  const sorted = [...nodes].sort((a, b) => b.pagerank - a.pagerank);
  const centerIdx = centerId
    ? sorted.findIndex((n) => n.user_id === centerId)
    : 0;
  const center = centerIdx >= 0 ? sorted[centerIdx] : sorted[0];
  const rest = sorted.filter((n) => n.user_id !== center?.user_id);

  const laid: LayoutNode[] = [];
  if (center) {
    laid.push({
      id: center.user_id,
      label: center.full_name,
      x: cx,
      y: cy,
      color: "#0a66c2",
      pagerank: center.pagerank,
      degree: center.degree,
    });
  }

  rest.forEach((n, i) => {
    const ang = (i / Math.max(rest.length, 1)) * 2 * Math.PI - Math.PI / 2;
    const r = radius * (0.7 + (i % 3) * 0.1);
    laid.push({
      id: n.user_id,
      label: n.full_name,
      x: cx + Math.cos(ang) * r,
      y: cy + Math.sin(ang) * r,
      color:
        n.community_id != null
          ? communityColor(n.community_id)
          : "#057642",
      pagerank: n.pagerank,
      degree: n.degree,
    });
  });

  return laid;
}
