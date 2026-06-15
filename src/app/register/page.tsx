"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { AuthProvider, useAuth } from "@/components/AuthProvider";
import { register, ApiRequestError } from "@/lib/api";

function RegisterForm() {
  const router = useRouter();
  const { setSession } = useAuth();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await register({ email, password, full_name: fullName });
      setSession(res.token, res.user_id, res.slug);
      router.push("/feed");
    } catch (err) {
      setError(
        err instanceof ApiRequestError ? err.message : "Falha no cadastro",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--li-bg)] px-4">
      <div className="li-card w-full max-w-md p-8">
        <h1 className="text-2xl font-bold text-[var(--li-blue)]">in</h1>
        <p className="mt-2 text-sm text-[var(--li-muted)]">Crie sua conta</p>
        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label className="text-sm font-medium">Nome completo</label>
            <input
              className="li-input mt-1"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="text-sm font-medium">E-mail</label>
            <input
              type="email"
              className="li-input mt-1"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="text-sm font-medium">Senha (mín. 8)</label>
            <input
              type="password"
              className="li-input mt-1"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              minLength={8}
              required
            />
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="li-btn li-btn-primary w-full"
          >
            {loading ? "Criando..." : "Cadastrar"}
          </button>
        </form>
        <p className="mt-4 text-center text-sm text-[var(--li-muted)]">
          Já tem conta?{" "}
          <Link href="/login" className="font-semibold text-[var(--li-blue)]">
            Entrar
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <AuthProvider>
      <RegisterForm />
    </AuthProvider>
  );
}
