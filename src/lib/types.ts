export interface ApiError {
  code: string;
  message: string;
}

export interface AuthResponse {
  token: string;
  expires_at: string;
  user_id: string;
  slug: string;
}

export interface Profile {
  user_id: string;
  slug: string;
  full_name: string;
  headline: string;
  bio: string;
  location: string;
  birth_year?: number;
  avatar_url?: string;
  skills?: Skill[];
  experiences?: Experience[];
  educations?: Education[];
}

export interface Skill {
  id: string;
  name: string;
  slug?: string;
}

export interface Experience {
  id: string;
  title: string;
  description: string;
  start_year?: number;
  end_year?: number;
  is_current: boolean;
  company?: { id: string; name: string; slug: string };
}

export interface Education {
  id: string;
  field_of_study: string;
  degree: string;
  start_year?: number;
  end_year?: number;
  institution?: { id: string; name: string; slug: string };
}

export interface PostAuthor {
  user_id: string;
  slug: string;
  full_name: string;
  headline?: string;
  avatar_url?: string;
}

export interface Post {
  id: string;
  author_id: string;
  body: string;
  created_at: string;
  author?: PostAuthor;
  reaction_count: number;
  comment_count: number;
}

export interface Comment {
  id: string;
  post_id: string;
  author_id: string;
  body: string;
  created_at: string;
  author?: PostAuthor;
}

export interface FeedResponse {
  variant: string;
  posts: Post[];
}

export interface Connection {
  id: string;
  requester_id: string;
  addressee_id: string;
  status: string;
  created_at: string;
}

export interface AcceptedConnection {
  id: string;
  user_id: string;
  slug: string;
  full_name: string;
  headline: string;
  avatar_url?: string;
  connected_at: string;
}

export interface PersonSuggestion {
  user_id: string;
  slug: string;
  full_name: string;
  headline: string;
  score: number;
  rank: number;
  reasons: string[];
}

export interface RecommendationsMeta {
  scoring_method: string;
  ml_model?: MLModel | null;
  suggestions: PersonSuggestion[];
}

export interface PersonSearchHit {
  user_id: string;
  slug: string;
  full_name: string;
  headline: string;
  location: string;
  score: number;
  affinity_score?: number;
  final_score: number;
  reasons?: string[];
}

export interface PostSearchHit {
  post_id: string;
  author_id: string;
  author_name: string;
  body: string;
  score: number;
}

export interface GraphNode {
  user_id: string;
  slug: string;
  full_name: string;
  headline: string;
  pagerank: number;
  degree: number;
  community_id?: number;
}

export interface GraphEdge {
  source: string;
  target: string;
}

export interface GraphResponse {
  nodes: GraphNode[];
  edges: GraphEdge[];
}

export interface LabSampleResponse extends GraphResponse {
  total_users: number;
  total_edges: number;
  sample_size: number;
  seed_user_id: string;
}

export interface LinkPrediction {
  user_id: string;
  slug: string;
  full_name: string;
  headline: string;
  score: number;
  reasons: string[];
}

export interface AnalyticsOverview {
  dau: number;
  mau: number;
  total_users: number;
  total_posts: number;
  churn_high_count: number;
  churn_medium_count: number;
  churn_low_count: number;
}

export interface TopPost {
  post_id: string;
  body: string;
  author_name: string;
  views: number;
  reactions: number;
  comments: number;
}

export interface CohortRow {
  cohort_week: string;
  week_offset: number;
  active_users: number;
  cohort_size: number;
  retention_pct: number;
}

export interface ChurnUser {
  user_id: string;
  slug: string;
  full_name: string;
  churn_probability: number;
  risk_tier: string;
}

export interface DauPoint {
  day: string;
  dau: number;
}

export interface ABExperimentResult {
  experiment_id: string;
  experiment_name: string;
  primary_metric: string;
  variant: string;
  sample_size: number;
  metric_value: number;
  ci_lower?: number;
  ci_upper?: number;
  computed_at: string;
}

export interface MLModel {
  id: string;
  model_name: string;
  version: string;
  metrics: Record<string, number>;
  artifact_path?: string;
  is_active: boolean;
  trained_at: string;
}
