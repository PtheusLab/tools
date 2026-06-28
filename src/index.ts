export { getGitHubRepository, getGitHubUser, getGitHubTrending } from "./scrapers/github.js";
export { getNpmPackage, searchNpmPackages } from "./scrapers/npm-registry.js";
export {
  getHackerNewsItem,
  getHackerNewsFeed,
  getHackerNewsMaxItem,
} from "./scrapers/hacker-news.js";
export {
  getExchangeRates,
  convertCurrency,
  getSupportedCurrencies,
} from "./scrapers/exchange-rate.js";

export type {
  Result,
  ScraperError,
  ScraperErrorCode,
  ScraperOptions,
  GitHubRepository,
  GitHubUser,
  GitHubTrendingRepository,
  GitHubTrendingOptions,
  NpmPackage,
  NpmPerson,
  NpmRepository,
  NpmDownloads,
  NpmSearchResult,
  NpmSearchOptions,
  HackerNewsItem,
  HackerNewsItemType,
  HackerNewsStory,
  HackerNewsFeedType,
  HackerNewsFeedOptions,
  ExchangeRate,
  ConvertedAmount,
  ExchangeRateOptions,
} from "./types/index.js";
