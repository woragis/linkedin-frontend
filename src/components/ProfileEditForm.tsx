"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@/components/AuthProvider";
import {
  createEducation,
  createExperience,
  deleteEducation,
  deleteExperience,
  getMe,
  patchProfile,
  replaceSkills,
  ApiRequestError,
} from "@/lib/api";
import {
  educationDegree,
  educationField,
  educationInstitution,
  experienceCompany,
  experienceTitle,
  recordId,
} from "@/lib/profile-helpers";
import type { Profile } from "@/lib/types";

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="text-sm font-medium">{label}</label>
      <div className="mt-1">{children}</div>
    </div>
  );
}

export function ProfileEditForm() {
  const router = useRouter();
  const { refreshProfile } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [saving, setSaving] = useState(false);

  const [fullName, setFullName] = useState("");
  const [slug, setSlug] = useState("");
  const [headline, setHeadline] = useState("");
  const [bio, setBio] = useState("");
  const [location, setLocation] = useState("");
  const [skillsText, setSkillsText] = useState("");

  const [expCompany, setExpCompany] = useState("");
  const [expTitle, setExpTitle] = useState("");
  const [expDesc, setExpDesc] = useState("");
  const [expCurrent, setExpCurrent] = useState(false);

  const [eduInstitution, setEduInstitution] = useState("");
  const [eduDegree, setEduDegree] = useState("");
  const [eduField, setEduField] = useState("");

  const load = useCallback(async () => {
    setError("");
    try {
      const me = await getMe();
      setProfile(me);
      setFullName(me.full_name);
      setSlug(me.slug);
      setHeadline(me.headline);
      setBio(me.bio);
      setLocation(me.location);
      setSkillsText(
        (me.skills ?? [])
          .map((s) => s.name ?? s.Name ?? "")
          .filter(Boolean)
          .join(", "),
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao carregar perfil");
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function saveBasic(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSuccess("");
    const prevSlug = profile?.slug;
    try {
      const updated = await patchProfile({
        full_name: fullName,
        slug,
        headline,
        bio,
        location,
      });
      setProfile(updated);
      await refreshProfile();
      setSuccess("Perfil atualizado.");
      if (prevSlug && updated.slug !== prevSlug) {
        router.push(`/users/${updated.slug}`);
      }
    } catch (err) {
      setError(
        err instanceof ApiRequestError ? err.message : "Erro ao salvar perfil",
      );
    } finally {
      setSaving(false);
    }
  }

  async function saveSkills(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSuccess("");
    try {
      const skills = skillsText
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
      await replaceSkills(skills);
      await load();
      await refreshProfile();
      setSuccess("Competências atualizadas.");
    } catch (err) {
      setError(
        err instanceof ApiRequestError
          ? err.message
          : "Erro ao salvar competências",
      );
    } finally {
      setSaving(false);
    }
  }

  async function addExperience(e: React.FormEvent) {
    e.preventDefault();
    if (!expCompany.trim() || !expTitle.trim()) return;
    setSaving(true);
    setError("");
    try {
      await createExperience({
        company_name: expCompany.trim(),
        title: expTitle.trim(),
        description: expDesc.trim(),
        is_current: expCurrent,
      });
      setExpCompany("");
      setExpTitle("");
      setExpDesc("");
      setExpCurrent(false);
      await load();
      setSuccess("Experiência adicionada.");
    } catch (err) {
      setError(
        err instanceof ApiRequestError ? err.message : "Erro ao adicionar",
      );
    } finally {
      setSaving(false);
    }
  }

  async function removeExperience(id: string) {
    setSaving(true);
    try {
      await deleteExperience(id);
      await load();
      setSuccess("Experiência removida.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao remover");
    } finally {
      setSaving(false);
    }
  }

  async function addEducation(e: React.FormEvent) {
    e.preventDefault();
    if (!eduInstitution.trim()) return;
    setSaving(true);
    setError("");
    try {
      await createEducation({
        institution_name: eduInstitution.trim(),
        degree: eduDegree.trim(),
        field_of_study: eduField.trim(),
      });
      setEduInstitution("");
      setEduDegree("");
      setEduField("");
      await load();
      setSuccess("Formação adicionada.");
    } catch (err) {
      setError(
        err instanceof ApiRequestError ? err.message : "Erro ao adicionar",
      );
    } finally {
      setSaving(false);
    }
  }

  async function removeEducation(id: string) {
    setSaving(true);
    try {
      await deleteEducation(id);
      await load();
      setSuccess("Formação removida.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao remover");
    } finally {
      setSaving(false);
    }
  }

  if (!profile) {
    return <p className="text-sm text-[var(--li-muted)]">Carregando...</p>;
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Editar perfil</h1>
        <Link href={`/users/${profile.slug}`} className="li-btn li-btn-ghost text-xs">
          Ver perfil público
        </Link>
      </div>

      {error && (
        <p className="rounded border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      )}
      {success && (
        <p className="rounded border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-800">
          {success}
        </p>
      )}

      <form onSubmit={saveBasic} className="li-card space-y-4 p-6">
        <h2 className="font-semibold">Informações básicas</h2>
        <Field label="Nome completo">
          <input
            className="li-input"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            required
          />
        </Field>
        <Field label="URL do perfil (slug)">
          <input
            className="li-input"
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            pattern="[a-z0-9]+(-[a-z0-9]+)*"
            title="Letras minúsculas, números e hífens"
            required
          />
        </Field>
        <Field label="Título profissional">
          <input
            className="li-input"
            value={headline}
            onChange={(e) => setHeadline(e.target.value)}
            placeholder="Ex: Engenheiro de Software"
          />
        </Field>
        <Field label="Localização">
          <input
            className="li-input"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
          />
        </Field>
        <Field label="Sobre">
          <textarea
            className="li-input min-h-[100px]"
            value={bio}
            onChange={(e) => setBio(e.target.value)}
          />
        </Field>
        <button
          type="submit"
          disabled={saving}
          className="li-btn li-btn-primary"
        >
          Salvar informações
        </button>
      </form>

      <section className="li-card space-y-4 p-6">
        <h2 className="font-semibold">Experiência</h2>
        {(profile.experiences ?? []).length === 0 ? (
          <p className="text-sm text-[var(--li-muted)]">Nenhuma experiência.</p>
        ) : (
          <ul className="space-y-3">
            {(profile.experiences ?? []).map((e) => {
              const id = recordId(e);
              return (
                <li
                  key={id}
                  className="flex items-start justify-between gap-3 border-b border-[var(--li-border)] pb-3 last:border-0"
                >
                  <div>
                    <p className="font-medium">{experienceTitle(e)}</p>
                    <p className="text-sm text-[var(--li-muted)]">
                      {experienceCompany(e)}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeExperience(id)}
                    disabled={saving}
                    className="text-xs text-red-600 hover:underline"
                  >
                    Remover
                  </button>
                </li>
              );
            })}
          </ul>
        )}
        <form onSubmit={addExperience} className="space-y-3 border-t border-[var(--li-border)] pt-4">
          <p className="text-sm font-medium">Adicionar experiência</p>
          <div className="grid gap-3 sm:grid-cols-2">
            <input
              className="li-input"
              placeholder="Empresa"
              value={expCompany}
              onChange={(e) => setExpCompany(e.target.value)}
              required
            />
            <input
              className="li-input"
              placeholder="Cargo"
              value={expTitle}
              onChange={(e) => setExpTitle(e.target.value)}
              required
            />
          </div>
          <textarea
            className="li-input min-h-[60px]"
            placeholder="Descrição (opcional)"
            value={expDesc}
            onChange={(e) => setExpDesc(e.target.value)}
          />
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={expCurrent}
              onChange={(e) => setExpCurrent(e.target.checked)}
            />
            Trabalho atual
          </label>
          <button type="submit" disabled={saving} className="li-btn li-btn-ghost text-xs">
            Adicionar
          </button>
        </form>
      </section>

      <section className="li-card space-y-4 p-6">
        <h2 className="font-semibold">Formação</h2>
        {(profile.educations ?? []).length === 0 ? (
          <p className="text-sm text-[var(--li-muted)]">Nenhuma formação.</p>
        ) : (
          <ul className="space-y-3">
            {(profile.educations ?? []).map((e) => {
              const id = recordId(e);
              return (
                <li
                  key={id}
                  className="flex items-start justify-between gap-3 border-b border-[var(--li-border)] pb-3 last:border-0"
                >
                  <div>
                    <p className="font-medium">{educationInstitution(e)}</p>
                    <p className="text-sm text-[var(--li-muted)]">
                      {[educationDegree(e), educationField(e)]
                        .filter(Boolean)
                        .join(" · ")}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeEducation(id)}
                    disabled={saving}
                    className="text-xs text-red-600 hover:underline"
                  >
                    Remover
                  </button>
                </li>
              );
            })}
          </ul>
        )}
        <form onSubmit={addEducation} className="space-y-3 border-t border-[var(--li-border)] pt-4">
          <p className="text-sm font-medium">Adicionar formação</p>
          <input
            className="li-input"
            placeholder="Instituição"
            value={eduInstitution}
            onChange={(e) => setEduInstitution(e.target.value)}
            required
          />
          <div className="grid gap-3 sm:grid-cols-2">
            <input
              className="li-input"
              placeholder="Grau (ex: Bacharelado)"
              value={eduDegree}
              onChange={(e) => setEduDegree(e.target.value)}
            />
            <input
              className="li-input"
              placeholder="Área de estudo"
              value={eduField}
              onChange={(e) => setEduField(e.target.value)}
            />
          </div>
          <button type="submit" disabled={saving} className="li-btn li-btn-ghost text-xs">
            Adicionar
          </button>
        </form>
      </section>

      <form onSubmit={saveSkills} className="li-card space-y-4 p-6">
        <h2 className="font-semibold">Competências</h2>
        <Field label="Separadas por vírgula">
          <input
            className="li-input"
            value={skillsText}
            onChange={(e) => setSkillsText(e.target.value)}
            placeholder="React, Go, PostgreSQL"
          />
        </Field>
        <button type="submit" disabled={saving} className="li-btn li-btn-primary">
          Salvar competências
        </button>
      </form>
    </div>
  );
}
