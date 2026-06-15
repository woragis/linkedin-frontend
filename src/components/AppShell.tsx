"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "./AuthProvider";
import { initials } from "@/lib/format";

const NAV = [
  { href: "/feed", label: "Início" },
  { href: "/search", label: "Busca" },
  { href: "/network", label: "Rede" },
  { href: "/analytics", label: "Analytics" },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { profile, logout } = useAuth();

  return (
    <div className="min-h-screen bg-[var(--li-bg)]">
      <header className="sticky top-0 z-50 border-b border-[var(--li-border)] bg-white">
        <div className="mx-auto flex h-14 max-w-6xl items-center gap-4 px-4">
          <Link href="/feed" className="text-xl font-bold text-[var(--li-blue)]">
            in
          </Link>
          <nav className="flex flex-1 items-center justify-center gap-1">
            {NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="li-nav-link"
                data-active={pathname.startsWith(item.href) ? "true" : "false"}
              >
                <span className="text-base">●</span>
                {item.label}
              </Link>
            ))}
          </nav>
          <div className="flex items-center gap-3">
            {profile && (
              <Link
                href={`/users/${profile.slug}`}
                className="li-avatar li-avatar-sm bg-[var(--li-blue)]"
              >
                {initials(profile.full_name)}
              </Link>
            )}
            <button type="button" onClick={logout} className="li-btn li-btn-ghost text-xs">
              Sair
            </button>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-6">{children}</main>
    </div>
  );
}
