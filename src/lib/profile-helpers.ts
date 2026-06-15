import type { Education, Experience } from "./types";

/** Go API returns PascalCase for nested GORM models without json tags. */
export function recordId(item: { id?: string; ID?: string }): string {
  return item.id ?? item.ID ?? "";
}

export function experienceCompany(e: Experience): string {
  const raw = e as Experience & { Company?: { Name?: string } };
  return e.company?.name ?? raw.Company?.Name ?? "";
}

export function experienceTitle(e: Experience): string {
  const raw = e as Experience & { Title?: string };
  return e.title ?? raw.Title ?? "";
}

export function educationInstitution(e: Education): string {
  const raw = e as Education & { Institution?: { Name?: string } };
  return e.institution?.name ?? raw.Institution?.Name ?? "";
}

export function educationDegree(e: Education): string {
  const raw = e as Education & { Degree?: string };
  return e.degree ?? raw.Degree ?? "";
}

export function educationField(e: Education): string {
  const raw = e as Education & { FieldOfStudy?: string };
  return e.field_of_study ?? raw.FieldOfStudy ?? "";
}
