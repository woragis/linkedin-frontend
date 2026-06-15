import { authHeaders } from "./auth";
import type {
  ABExperimentResult,
  AcceptedConnection,
  AnalyticsOverview,
  AuthResponse,
  ChurnUser,
  CohortRow,
  Comment,
  Connection,
  DauPoint,
  Education,
  Experience,
  FeedResponse,
  GraphNode,
  GraphResponse,
  LinkPrediction,
  MLModel,
  PersonSearchHit,
  PersonSuggestion,
  Post,
  PostSearchHit,
  Profile,
  RecommendationsMeta,
  Skill,
  TopPost,
} from "./types";

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") ?? "http://127.0.0.1:8080";

const INTERNAL_TOKEN =
  process.env.NEXT_PUBLIC_INTERNAL_TOKEN ?? "dev-internal-token";

export class ApiRequestError extends Error {
  code: string;
  status: number;

  constructor(status: number, code: string, message: string) {
    super(message);
    this.name = "ApiRequestError";
    this.code = code;
    this.status = status;
  }
}

async function request<T>(
  path: string,
  init?: RequestInit,
  auth = false,
): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(auth ? authHeaders() : {}),
      ...init?.headers,
    },
  });
  if (!res.ok) {
    let code = "UNKNOWN";
    let message = res.statusText;
    try {
      const body = (await res.json()) as { code?: string; message?: string };
      code = body.code ?? code;
      message = body.message ?? message;
    } catch {
      /* empty */
    }
    throw new ApiRequestError(res.status, code, message);
  }
  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

export function getApiBase(): string {
  return API_BASE;
}

export async function checkHealth(): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE}/health`);
    return res.ok;
  } catch {
    return false;
  }
}

// Auth
export function register(body: {
  email: string;
  password: string;
  full_name: string;
}): Promise<AuthResponse> {
  return request<AuthResponse>("/v1/auth/register", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export function login(body: {
  email: string;
  password: string;
}): Promise<AuthResponse> {
  return request<AuthResponse>("/v1/auth/login", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

// Profile
export function getMe(): Promise<Profile> {
  return request<Profile>("/v1/me", undefined, true);
}

export function getProfileBySlug(slug: string): Promise<Profile> {
  return request<Profile>(`/v1/users/${slug}`);
}

export function patchProfile(body: {
  full_name?: string;
  slug?: string;
  headline?: string;
  bio?: string;
  location?: string;
  birth_year?: number | null;
  avatar_url?: string | null;
}): Promise<Profile> {
  return request<Profile>(
    "/v1/me/profile",
    { method: "PATCH", body: JSON.stringify(body) },
    true,
  );
}

export function createExperience(body: {
  company_name: string;
  title: string;
  description?: string;
  start_year?: number;
  end_year?: number;
  is_current?: boolean;
}): Promise<Experience> {
  return request<Experience>(
    "/v1/me/experiences",
    { method: "POST", body: JSON.stringify(body) },
    true,
  );
}

export function patchExperience(
  id: string,
  body: {
    company_name?: string;
    title?: string;
    description?: string;
    start_year?: number | null;
    end_year?: number | null;
    is_current?: boolean;
  },
): Promise<Experience> {
  return request<Experience>(
    `/v1/me/experiences/${id}`,
    { method: "PATCH", body: JSON.stringify(body) },
    true,
  );
}

export function deleteExperience(id: string): Promise<void> {
  return request<void>(`/v1/me/experiences/${id}`, { method: "DELETE" }, true);
}

export function createEducation(body: {
  institution_name: string;
  field_of_study?: string;
  degree?: string;
  start_year?: number;
  end_year?: number;
}): Promise<Education> {
  return request<Education>(
    "/v1/me/educations",
    { method: "POST", body: JSON.stringify(body) },
    true,
  );
}

export function deleteEducation(id: string): Promise<void> {
  return request<void>(`/v1/me/educations/${id}`, { method: "DELETE" }, true);
}

export function replaceSkills(skills: string[]): Promise<Skill[]> {
  return request<Skill[]>(
    "/v1/me/skills",
    { method: "PUT", body: JSON.stringify({ skills }) },
    true,
  );
}

// Connections
export function requestConnection(targetUserId: string): Promise<Connection> {
  return request<Connection>(
    "/v1/connections/request",
    {
      method: "POST",
      body: JSON.stringify({ target_user_id: targetUserId }),
    },
    true,
  );
}

export function acceptConnection(id: string): Promise<Connection> {
  return request<Connection>(
    `/v1/connections/${id}/accept`,
    { method: "PATCH" },
    true,
  );
}

export function rejectConnection(id: string): Promise<Connection> {
  return request<Connection>(
    `/v1/connections/${id}/reject`,
    { method: "PATCH" },
    true,
  );
}

export function listPending(): Promise<Connection[]> {
  return request<Connection[]>("/v1/connections/pending", undefined, true);
}

export function listConnections(): Promise<AcceptedConnection[]> {
  return request<AcceptedConnection[]>("/v1/connections", undefined, true);
}

// Posts & feed
export function getFeed(limit = 50): Promise<FeedResponse> {
  return request<FeedResponse>(`/v1/feed?limit=${limit}`, undefined, true);
}

export function createPost(body: string): Promise<Post> {
  return request<Post>(
    "/v1/posts",
    { method: "POST", body: JSON.stringify({ body }) },
    true,
  );
}

export function reactToPost(postId: string, kind = "like"): Promise<void> {
  return request<void>(
    `/v1/posts/${postId}/reactions`,
    { method: "POST", body: JSON.stringify({ kind }) },
    true,
  );
}

export function listComments(postId: string): Promise<Comment[]> {
  return request<Comment[]>(`/v1/posts/${postId}/comments`);
}

export function addComment(postId: string, body: string): Promise<Comment> {
  return request<Comment>(
    `/v1/posts/${postId}/comments`,
    { method: "POST", body: JSON.stringify({ body }) },
    true,
  );
}

export function trackEvents(
  events: { type: string; payload: Record<string, string>; at?: string }[],
): Promise<void> {
  return request<void>(
    "/v1/events",
    { method: "POST", body: JSON.stringify({ events }) },
    true,
  );
}

// Search & recommendations
export function searchPeople(q: string, limit = 20): Promise<PersonSearchHit[]> {
  return request<PersonSearchHit[]>(
    `/v1/search/people?q=${encodeURIComponent(q)}&limit=${limit}`,
    undefined,
    true,
  );
}

export function searchPosts(q: string, limit = 20): Promise<PostSearchHit[]> {
  return request<PostSearchHit[]>(
    `/v1/search/posts?q=${encodeURIComponent(q)}&limit=${limit}`,
    undefined,
    true,
  );
}

export function getRecommendations(): Promise<PersonSuggestion[]> {
  return request<PersonSuggestion[]>(
    "/v1/recommendations/people",
    undefined,
    true,
  );
}

export function getRecommendationsMeta(): Promise<RecommendationsMeta> {
  return request<RecommendationsMeta>(
    "/v1/recommendations/meta",
    undefined,
    true,
  );
}

// Network graph
export function getNetworkGraph(): Promise<GraphResponse> {
  return request<GraphResponse>("/v1/network/graph", undefined, true);
}

export function getInfluencers(limit = 10): Promise<GraphNode[]> {
  return request<GraphNode[]>(
    `/v1/network/influencers?limit=${limit}`,
    undefined,
    true,
  );
}

export function getLinkPredictions(limit = 10): Promise<LinkPrediction[]> {
  return request<LinkPrediction[]>(
    `/v1/network/link-predictions?limit=${limit}`,
    undefined,
    true,
  );
}

// Analytics
export function getAnalyticsOverview(): Promise<AnalyticsOverview> {
  return request<AnalyticsOverview>("/v1/analytics/overview", undefined, true);
}

export function getTopPosts(limit = 10): Promise<TopPost[]> {
  return request<TopPost[]>(
    `/v1/analytics/top-posts?limit=${limit}`,
    undefined,
    true,
  );
}

export function getCohorts(): Promise<CohortRow[]> {
  return request<CohortRow[]>("/v1/analytics/cohorts", undefined, true);
}

export function getChurnUsers(limit = 20): Promise<ChurnUser[]> {
  return request<ChurnUser[]>(
    `/v1/analytics/churn?limit=${limit}`,
    undefined,
    true,
  );
}

export function getDau(days = 30): Promise<DauPoint[]> {
  return request<DauPoint[]>(
    `/v1/analytics/dau?days=${days}`,
    undefined,
    true,
  );
}

export function getExperiments(): Promise<ABExperimentResult[]> {
  return request<ABExperimentResult[]>(
    "/v1/analytics/experiments",
    undefined,
    true,
  );
}

export function getMLModels(): Promise<MLModel[]> {
  return request<MLModel[]>("/v1/analytics/ml-models", undefined, true);
}

// Dev
export function seedDemo(): Promise<{ message: string }> {
  return request<{ message: string }>("/v1/internal/seed-demo", {
    method: "POST",
    headers: { "X-Internal-Token": INTERNAL_TOKEN },
  });
}
