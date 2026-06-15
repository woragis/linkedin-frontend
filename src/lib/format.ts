export function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? "")
    .join("");
}

export function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString("pt-BR", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function formatPct(n: number): string {
  return `${n.toFixed(1)}%`;
}

export function communityColor(id: number): string {
  const palette = [
    "#0a66c2",
    "#057642",
    "#915907",
    "#b24020",
    "#7f3df3",
    "#e068ad",
  ];
  return palette[id % palette.length];
}
