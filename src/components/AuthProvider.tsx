"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useRouter } from "next/navigation";
import { getMe } from "@/lib/api";
import {
  clearSession,
  getStoredUser,
  getToken,
  saveSession,
  type StoredUser,
} from "@/lib/auth";
import type { Profile } from "@/lib/types";

interface AuthContextValue {
  user: StoredUser | null;
  profile: Profile | null;
  loading: boolean;
  setSession: (token: string, userId: string, slug: string) => void;
  logout: () => void;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<StoredUser | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshProfile = useCallback(async () => {
    if (!getToken()) {
      setProfile(null);
      return;
    }
    try {
      const me = await getMe();
      setProfile(me);
    } catch {
      clearSession();
      setUser(null);
      setProfile(null);
    }
  }, []);

  useEffect(() => {
    const stored = getStoredUser();
    if (stored && getToken()) {
      setUser(stored);
      refreshProfile().finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [refreshProfile]);

  const setSession = useCallback(
    (token: string, userId: string, slug: string) => {
      saveSession(token, userId, slug);
      setUser({ userId, slug });
      refreshProfile();
    },
    [refreshProfile],
  );

  const logout = useCallback(() => {
    clearSession();
    setUser(null);
    setProfile(null);
    router.push("/login");
  }, [router]);

  const value = useMemo(
    () => ({ user, profile, loading, setSession, logout, refreshProfile }),
    [user, profile, loading, setSession, logout, refreshProfile],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

export function useRequireAuth() {
  const auth = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!auth.loading && !auth.user) {
      router.replace("/login");
    }
  }, [auth.loading, auth.user, router]);

  return auth;
}
