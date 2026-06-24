"use client";

import {
  BarChart3,
  FlaskConical,
  Home,
  LogOut,
  Network,
  Search,
  Users,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuth } from "./AuthProvider";
import { RealmToggle } from "./RealmToggle";
import { initials } from "@/lib/format";
import { getRealm } from "@/lib/realm";

const BASE_NAV = [
  { href: "/feed", label: "Início", Icon: Home },
  { href: "/search", label: "Busca", Icon: Search },
  { href: "/connections", label: "Conexões", Icon: Users },
  { href: "/network", label: "Rede", Icon: Network },
  { href: "/analytics", label: "Analytics", Icon: BarChart3 },
] as const;

const LAB_NAV = {
  href: "/lab",
  label: "Lab",
  Icon: FlaskConical,
} as const;

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { profile, logout } = useAuth();
  const [isVolume, setIsVolume] = useState(false);

  useEffect(() => {
    setIsVolume(getRealm() === "volume");
  }, []);

  const nav = isVolume ? [...BASE_NAV, LAB_NAV] : [...BASE_NAV];

  return (
    <div className="min-h-screen bg-[var(--li-bg)]">
      <header className="sticky top-0 z-50 border-b border-[var(--li-border)] bg-white/95 backdrop-blur-sm">
        <div className="mx-auto flex h-14 max-w-6xl items-center gap-4 px-4">
          <Link
            href="/feed"
            className="rounded-md px-1 text-xl font-bold text-[var(--li-blue)] transition-transform duration-200 hover:scale-105 active:scale-95"
          >
            in
          </Link>
          <nav className="flex flex-1 items-center justify-center gap-0.5">
            {nav.map((item) => {
              const active = pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="li-nav-link"
                  data-active={active ? "true" : "false"}
                >
                  <item.Icon strokeWidth={active ? 2.25 : 2} />
                  {item.label}
                </Link>
              );
            })}
          </nav>
          <div className="flex items-center gap-2">
            <RealmToggle />
            {profile && (
              <Link
                href="/profile/edit"
                className="li-avatar li-avatar-sm bg-[var(--li-blue)]"
                title={profile.full_name}
              >
                {initials(profile.full_name)}
              </Link>
            )}
            <button
              type="button"
              onClick={logout}
              className="li-btn li-btn-ghost gap-1.5 px-3 py-1.5 text-xs"
            >
              <LogOut className="h-3.5 w-3.5" />
              Sair
            </button>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-6">{children}</main>
    </div>
  );
}
