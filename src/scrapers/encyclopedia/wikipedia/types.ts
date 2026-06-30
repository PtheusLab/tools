export interface WikipediaArticleSummary {
  /** Page ID in Wikipedia */
  pageId: number;
  /** Article title */
  title: string;
  /** Canonical URL of the article */
  url: string;
  /** Short plain-text extract (first paragraph or so) */
  extract: string;
  /** URL of the article's main thumbnail, or null if none */
  thumbnailUrl: string | null;
  /** Width of the thumbnail in pixels, or null */
  thumbnailWidth: number | null;
  /** Height of the thumbnail in pixels, or null */
  thumbnailHeight: number | null;
  /** ISO 8601 timestamp of the last edit */
  lastEdited: string | null;
  /** Language code of the article (e.g. "en") */
  lang: string;
  /** Description (short tagline), or null */
  description: string | null;
}

export interface WikipediaSearchResult {
  /** Page ID */
  pageId: number;
  /** Article title */
  title: string;
  /** Short description / snippet */
  snippet: string;
  /** Canonical URL */
  url: string;
  /** Word count of the article */
  wordCount: number;
  /** Size in bytes */
  size: number;
  /** ISO 8601 timestamp of the last edit */
  lastEdited: string;
}

export interface WikipediaSection {
  /** Section title (empty string for the lead section) */
  title: string;
  /** Nesting level (1 = top-level ==Heading==, 2 = ===Subheading===, …) */
  level: number;
  /** Plain-text content of the section */
  content: string;
}

export interface WikipediaArticleFull {
  /** Page ID */
  pageId: number;
  /** Article title */
  title: string;
  /** Canonical URL */
  url: string;
  /** Language code */
  lang: string;
  /** Short description / tagline */
  description: string | null;
  /** ISO 8601 timestamp of the last edit */
  lastEdited: string | null;
  /** All sections in document order */
  sections: WikipediaSection[];
  /** Flat plain-text of the entire article */
  plainText: string;
}

export interface WikipediaSearchOptions {
  /** Maximum number of results to return (default: 10, max: 50) */
  limit?: number;
  /** Language code (default: "en") */
  lang?: string;
}

export interface WikipediaArticleOptions {
  /** Language code (default: "en") */
  lang?: string;
}
