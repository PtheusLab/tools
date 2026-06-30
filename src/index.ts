export { getGitHubRepository, getGitHubUser, getGitHubTrending } from "./scrapers/registry/github/index.js";
export { getNpmPackage, searchNpmPackages } from "./scrapers/registry/npm/index.js";
export { getPypiPackage } from "./scrapers/registry/pypi/index.js";
export {
  getHackerNewsItem,
  getHackerNewsFeed,
  getHackerNewsMaxItem,
} from "./scrapers/social/hacker-news/index.js";
export {
  getExchangeRates,
  convertCurrency,
  getSupportedCurrencies,
} from "./scrapers/finance/exchange-rate/index.js";
export {
  getWikipediaSummary,
  searchWikipedia,
  getWikipediaArticle,
} from "./scrapers/encyclopedia/wikipedia/index.js";

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
  PypiPackage,
  PypiPerson,
  PypiDownloads,
  HackerNewsItem,
  HackerNewsItemType,
  HackerNewsStory,
  HackerNewsFeedType,
  HackerNewsFeedOptions,
  ExchangeRate,
  ConvertedAmount,
  ExchangeRateOptions,
  WikipediaArticleSummary,
  WikipediaSearchResult,
  WikipediaSection,
  WikipediaArticleFull,
  WikipediaSearchOptions,
  WikipediaArticleOptions,
  WikiquotePage,
  WikiquoteSection,
  WikiquoteSearchResult,
  WikiquoteOptions,
  WikiquoteSearchOptions,
} from "./types/index.js";

export { getWikiquotePage, searchWikiquote } from "./scrapers/encyclopedia/wikiquote/index.js";
