"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { getProfileBySlug, requestConnection } from "@/lib/api";
import { useAuth } from "@/components/AuthProvider";
import { initials } from "@/lib/format";
import {
  educationDegree,
  educationField,
  educationInstitution,
  experienceCompany,
  experienceTitle,
  recordId,
} from "@/lib/profile-helpers";
import type { Profile } from "@/lib/types";

export default function UserProfilePage() {
  const params = useParams<{ slug: string }>();
  const slug = params.slug;
  const { user } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [error, setError] = useState("");
  const [connecting, setConnecting] = useState(false);

  useEffect(() => {
    if (!slug) return;
    getProfileBySlug(slug)
      .then(setProfile)
      .catch((err) =>
        setError(err instanceof Error ? err.message : "Perfil não encontrado"),
      );
  }, [slug]);

  const isSelf = user?.slug === slug;

  async function handleConnect() {
    if (!profile) return;
    setConnecting(true);
    try {
      await requestConnection(profile.user_id);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao conectar");
    } finally {
      setConnecting(false);
    }
  }

  if (error) {
    return <p className="text-sm text-red-600">{error}</p>;
  }

  if (!profile) {
    return <p className="text-sm text-[var(--li-muted)]">Carregando perfil...</p>;
  }

  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <div className="li-card overflow-hidden">
        <div className="h-24 bg-gradient-to-r from-[var(--li-blue)] to-[#004182]" />
        <div className="px-6 pb-6">
          <div className="-mt-10 flex flex-wrap items-end justify-between gap-4">
            <div className="li-avatar h-20 w-20 border-4 border-white bg-[var(--li-blue)] text-lg">
              {initials(profile.full_name)}
            </div>
            {!isSelf && (
              <button
                type="button"
                onClick={handleConnect}
                disabled={connecting}
                className="li-btn li-btn-primary"
              >
                {connecting ? "Enviando..." : "Conectar"}
              </button>
            )}
            {isSelf && (
              <Link href="/profile/edit" className="li-btn li-btn-ghost">
                Editar perfil
              </Link>
            )}
          </div>
          <h1 className="mt-3 text-2xl font-semibold">{profile.full_name}</h1>
          <p className="text-[var(--li-muted)]">{profile.headline}</p>
          {profile.location && (
            <p className="mt-1 text-sm text-[var(--li-muted)]">{profile.location}</p>
          )}
          {profile.bio && (
            <p className="mt-4 text-sm leading-relaxed">{profile.bio}</p>
          )}
        </div>
      </div>

      {profile.experiences && profile.experiences.length > 0 && (
        <section className="li-card p-6">
          <h2 className="font-semibold">Experiência</h2>
          <ul className="mt-4 space-y-4">
            {profile.experiences.map((e, i) => (
              <li key={i}>
                <p className="font-medium">{experienceTitle(e)}</p>
                <p className="text-sm text-[var(--li-muted)]">
                  {experienceCompany(e)}
                </p>
              </li>
            ))}
          </ul>
        </section>
      )}

      {profile.educations && profile.educations.length > 0 && (
        <section className="li-card p-6">
          <h2 className="font-semibold">Formação</h2>
          <ul className="mt-4 space-y-4">
            {profile.educations.map((e, i) => (
              <li key={i}>
                <p className="font-medium">{educationInstitution(e)}</p>
                <p className="text-sm text-[var(--li-muted)]">
                  {[educationDegree(e), educationField(e)]
                    .filter(Boolean)
                    .join(" · ")}
                </p>
              </li>
            ))}
          </ul>
        </section>
      )}

      {profile.skills && profile.skills.length > 0 && (
        <section className="li-card p-6">
          <h2 className="font-semibold">Competências</h2>
          <div className="mt-3 flex flex-wrap gap-2">
            {profile.skills.map((s, i) => (
              <span
                key={recordId(s) || `skill-${i}`}
                className="rounded-full border border-[var(--li-border)] px-3 py-1 text-sm"
              >
                {s.name ?? s.Name}
              </span>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
