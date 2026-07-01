export interface RssFeedItem {
  title: string;
  link: string;
  description: string | null;
  pubDate: string | null;
  author: string | null;
  source: string | null;
}

export interface RssFeed {
  title: string;
  link: string | null;
  description: string | null;
  items: RssFeedItem[];
}

export interface NewsSearchOptions {
  lang?: string;
  country?: string;
  limit?: number;
}
