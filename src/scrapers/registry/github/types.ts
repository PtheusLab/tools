export interface GitHubRepository {
  id: number;
  name: string;
  fullName: string;
  description: string | null;
  url: string;
  stars: number;
  forks: number;
  watchers: number;
  openIssues: number;
  language: string | null;
  topics: string[];
  isPrivate: boolean;
  isFork: boolean;
  isArchived: boolean;
  createdAt: string;
  updatedAt: string;
  pushedAt: string;
  license: string | null;
  defaultBranch: string;
  size: number;
}

export interface GitHubUser {
  id: number;
  login: string;
  name: string | null;
  bio: string | null;
  avatarUrl: string;
  url: string;
  company: string | null;
  location: string | null;
  email: string | null;
  blog: string | null;
  publicRepos: number;
  publicGists: number;
  followers: number;
  following: number;
  createdAt: string;
  updatedAt: string;
}

export interface GitHubTrendingRepository {
  rank: number;
  name: string;
  fullName: string;
  url: string;
  description: string | null;
  language: string | null;
  stars: number;
  forks: number;
  starsToday: number | null;
}

export interface GitHubTrendingOptions {
  language?: string;
  since?: "daily" | "weekly" | "monthly";
}
