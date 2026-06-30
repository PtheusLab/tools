export interface PypiPackage {
  name: string;
  version: string;
  description: string | null;
  summary: string | null;
  keywords: string[];
  license: string | null;
  author: PypiPerson | null;
  maintainer: PypiPerson | null;
  homepage: string | null;
  repository: string | null;
  documentation: string | null;
  requiresPython: string | null;
  dependencies: string[];
  classifiers: string[];
  createdAt: string | null;
  updatedAt: string | null;
  versions: string[];
  latestVersion: string;
  downloads: PypiDownloads | null;
}

export interface PypiPerson {
  name: string;
  email: string | null;
}

export interface PypiDownloads {
  lastDay: number;
  lastWeek: number;
  lastMonth: number;
}
