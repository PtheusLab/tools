export interface WikiquotePage {
  pageId: number;
  title: string;
  url: string;
  lang: string;
  quotes: WikiquoteSection[];
}

export interface WikiquoteSection {
  title: string;
  quotes: string[];
}

export interface WikiquoteSearchResult {
  pageId: number;
  title: string;
  snippet: string;
  url: string;
}

export interface WikiquoteOptions {
  lang?: string;
}

export interface WikiquoteSearchOptions {
  lang?: string;
  limit?: number;
}
