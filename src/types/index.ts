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
  PypiPackage,
  PypiPerson,
  PypiDownloads,
} from "../scrapers/registry/pypi/types.js";
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
export type {
  WikipediaArticleSummary,
  WikipediaSearchResult,
  WikipediaSection,
  WikipediaArticleFull,
  WikipediaSearchOptions,
  WikipediaArticleOptions,
} from "../scrapers/encyclopedia/wikipedia/types.js";

export type {
  WikiquotePage,
  WikiquoteSection,
  WikiquoteSearchResult,
  WikiquoteOptions,
  WikiquoteSearchOptions,
} from "../scrapers/encyclopedia/wikiquote/types.js";

export type {
  CryptoPrice,
  CryptoMarket,
  CryptoCoin,
  CryptoPriceOptions,
  CryptoMarketsOptions,
} from "../scrapers/finance/crypto-price/types.js";
