export interface NpmPackage {
  name: string;
  version: string;
  description: string | null;
  keywords: string[];
  license: string | null;
  author: NpmPerson | null;
  maintainers: NpmPerson[];
  repository: NpmRepository | null;
  homepage: string | null;
  bugs: string | null;
  downloads: NpmDownloads | null;
  createdAt: string;
  updatedAt: string;
  versions: string[];
  latestVersion: string;
  dependencies: Record<string, string>;
  devDependencies: Record<string, string>;
  peerDependencies: Record<string, string>;
}

export interface NpmPerson {
  name: string;
  email: string | null;
  url: string | null;
}

export interface NpmRepository {
  type: string;
  url: string;
}

export interface NpmDownloads {
  weekly: number;
  monthly: number;
}

export interface NpmSearchResult {
  name: string;
  version: string;
  description: string | null;
  keywords: string[];
  author: NpmPerson | null;
  score: number;
  searchScore: number;
}

export interface NpmSearchOptions {
  limit?: number;
  offset?: number;
}
