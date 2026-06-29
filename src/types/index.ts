export type { Result, ScraperError, ScraperErrorCode, ScraperOptions } from "./common.js";
export type {
  GitHubRepository,
  GitHubUser,
  GitHubTrendingRepository,
  GitHubTrendingOptions,
} from "../scrapers/registry/github/types.js";
export type {
  NpmPackage,
  NpmPerson,
  NpmRepository,
  NpmDownloads,
  NpmSearchResult,
  NpmSearchOptions,
} from "../scrapers/registry/npm/types.js";
export type {
  HackerNewsItem,
  HackerNewsItemType,
  HackerNewsStory,
  HackerNewsFeedType,
  HackerNewsFeedOptions,
} from "../scrapers/social/hacker-news/types.js";
export type {
  ExchangeRate,
  ConvertedAmount,
  ExchangeRateOptions,
} from "../scrapers/finance/exchange-rate/types.js";
