"use client";

import { AuthProvider } from "@/components/AuthProvider";
import { AppShell } from "@/components/AppShell";
import { useRequireAuth } from "@/components/AuthProvider";

function AppLayoutInner({ children }: { children: React.ReactNode }) {
  const { loading, user } = useRequireAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center text-[var(--li-muted)]">
        Carregando...
      </div>
    );
  }

  if (!user) return null;

  return <AppShell>{children}</AppShell>;
}

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <AppLayoutInner>{children}</AppLayoutInner>
    </AuthProvider>
  );
}
