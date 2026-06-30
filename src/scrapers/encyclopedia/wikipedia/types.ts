export interface WikipediaArticleSummary {
  pageId: number;
  title: string;
  url: string;
  extract: string;
  thumbnailUrl: string | null;
  thumbnailWidth: number | null;
  thumbnailHeight: number | null;
  lastEdited: string | null;
  lang: string;
  description: string | null;
}

export interface WikipediaSearchResult {
  pageId: number;
  title: string;
  snippet: string;
  url: string;
  wordCount: number;
  size: number;
  lastEdited: string;
}

export interface WikipediaSection {
  title: string;
  level: number;
  content: string;
}

export interface WikipediaArticleFull {
  pageId: number;
  title: string;
  url: string;
  lang: string;
  description: string | null;
  lastEdited: string | null;
  sections: WikipediaSection[];
  plainText: string;
}

export interface WikipediaSearchOptions {
  limit?: number;
  lang?: string;
}

export interface WikipediaArticleOptions {
  lang?: string;
}
