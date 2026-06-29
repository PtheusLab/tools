export type HackerNewsItemType =
  | "story"
  | "ask"
  | "show"
  | "job"
  | "comment"
  | "poll"
  | "pollopt";

export interface HackerNewsItem {
  id: number;
  type: HackerNewsItemType;
  by: string | null;
  time: number;
  url: string | null;
  title: string | null;
  text: string | null;
  score: number | null;
  descendants: number | null;
  kids: number[];
  parent: number | null;
  deleted: boolean;
  dead: boolean;
}

export interface HackerNewsStory {
  id: number;
  title: string;
  url: string | null;
  by: string;
  score: number;
  descendants: number;
  time: number;
  type: HackerNewsItemType;
  text: string | null;
  kids: number[];
}

export type HackerNewsFeedType =
  | "top"
  | "new"
  | "best"
  | "ask"
  | "show"
  | "job";

export interface HackerNewsFeedOptions {
  limit?: number;
}
