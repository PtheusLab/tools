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
export { getCryptoPrice, getCryptoMarkets, getCoinList } from "./scrapers/finance/crypto-price/index.js";
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
  CryptoPrice,
  CryptoMarket,
  CryptoCoin,
  CryptoPriceOptions,
  CryptoMarketsOptions,
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
  IpGeoLocation,
  RandomQuote,
  QuoteOfTheDay,
  WeatherLocation,
  CurrentWeather,
  DailyForecastEntry,
  WeatherForecast,
  WeatherForecastOptions,
  WordPhonetic,
  WordDefinition,
  WordMeaning,
  DictionaryEntry,
  RssFeedItem,
  RssFeed,
  NewsSearchOptions,
} from "./types/index.js";

export { getWikiquotePage, searchWikiquote } from "./scrapers/encyclopedia/wikiquote/index.js";

export { getIpGeoLocation } from "./scrapers/network/ip-geo/index.js";

export {
  getRandomQuote,
  getQuoteOfTheDay,
  getRandomQuotes,
} from "./scrapers/entertainment/quotes/index.js";

export {
  getWeatherForecast,
  searchWeatherLocations,
} from "./scrapers/weather/forecast/index.js";

export {
  getWordDefinition,
  getAllWordDefinitions,
} from "./scrapers/reference/dictionary/index.js";

export {
  getRssFeed,
  searchNews,
  getTopNews,
} from "./scrapers/news/rss-feed/index.js";
