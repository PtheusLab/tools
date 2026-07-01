<div align="center">

# @ptheus/tools

**A collection of type-safe web scrapers as importable TypeScript functions.**

[![npm](https://img.shields.io/npm/v/@ptheus/tools?style=for-the-badge&logo=npm&logoColor=white)](https://www.npmjs.com/package/@ptheus/tools)
[![Downloads](https://img.shields.io/npm/dm/@ptheus/tools?style=for-the-badge&logo=npm&logoColor=white)](https://www.npmjs.com/package/@ptheus/tools)
[![GitHub Release](https://img.shields.io/github/v/release/PtheusLab/tools?style=for-the-badge&logo=github)](https://github.com/PtheusLab/tools/releases)
[![CI](https://img.shields.io/github/actions/workflow/status/PtheusLab/tools/ci.yml?branch=main&style=for-the-badge&logo=github&label=CI)](https://github.com/PtheusLab/tools/actions/workflows/ci.yml)

[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-%E2%89%A521-339933?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/)
[![MIT License](https://img.shields.io/github/license/PtheusLab/tools?style=for-the-badge)](./LICENSE)
[![Types Included](https://img.shields.io/badge/Types-Included-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.npmjs.com/package/@ptheus/tools)

[Installation](#installation) •
[Quick Start](#quick-start) •
[API Reference](#api-reference) •
[Error Handling](#error-handling) •
[Contributing](#contributing)

</div>

---

## Overview

`@ptheus/tools` provides ready-to-use scrapers for common data sources — GitHub, npm, Hacker News, live exchange rates, and more. Every function follows the same **`Result<T>` pattern**: no exceptions are thrown, ever.

| Scraper | Functions |
|---|---|
| **GitHub** | `getGitHubRepository` · `getGitHubUser` · `getGitHubTrending` |
| **PyPI** | `getPypiPackage` |
| **npm Registry** | `getNpmPackage` · `searchNpmPackages` |
| **Hacker News** | `getHackerNewsFeed` · `getHackerNewsItem` · `getHackerNewsMaxItem` |
| **Exchange Rates** | `getExchangeRates` · `convertCurrency` · `getSupportedCurrencies` |
| **Crypto Price** | `getCryptoPrice` · `getCryptoMarkets` · `getCoinList` |
| **Wikipedia** | `getWikipediaSummary` · `searchWikipedia` · `getWikipediaArticle` |
| **Wikiquote** | `getWikiquotePage` · `searchWikiquote` |
| **IP Geolocation** | `getIpGeoLocation` |
| **Quotes** | `getRandomQuote` · `getQuoteOfTheDay` · `getRandomQuotes` |
| **Weather** | `getWeatherForecast` · `searchWeatherLocations` |
| **Dictionary** | `getWordDefinition` · `getAllWordDefinitions` |
| **News / RSS** | `getRssFeed` · `searchNews` · `getTopNews` |

---

## Installation

```bash
npm install @ptheus/tools
```

> **Requirements:** Node.js ≥ 21

---

## Quick Start

```typescript
import { getGitHubRepository } from "@ptheus/tools";

const result = await getGitHubRepository("facebook", "react");

if (result.success) {
  console.log(result.data.stars);
  console.log(result.data.language);
} else {
  console.error(result.error.code);
}
```

---

## API Reference

### Registry

**GitHub**

```typescript
import { getGitHubRepository, getGitHubUser, getGitHubTrending } from "@ptheus/tools";

const repo = await getGitHubRepository("microsoft", "vscode");
const user = await getGitHubUser("torvalds");
const trending = await getGitHubTrending({ language: "typescript", since: "weekly" });
```

**npm**

```typescript
import { getNpmPackage, searchNpmPackages } from "@ptheus/tools";

const pkg = await getNpmPackage("lodash");
const scoped = await getNpmPackage("@tanstack/react-query");
const results = await searchNpmPackages("react state management", { limit: 5 });
```

**PyPi**

```typescript
import { getPypiPackage } from "@ptheus/tools";

const pkg = await getPypiPackage("requests");
```

### Social

**Hacker News**

```typescript
import { getHackerNewsFeed, getHackerNewsItem, getHackerNewsMaxItem } from "@ptheus/tools";

const feed = await getHackerNewsFeed("top", { limit: 20 });
const item = await getHackerNewsItem(8863);
const max = await getHackerNewsMaxItem();
```

### Finance

**Exchange Rates**

```typescript
import { getExchangeRates, convertCurrency, getSupportedCurrencies } from "@ptheus/tools";

const rates = await getExchangeRates("USD");
const converted = await convertCurrency(100, "USD", "IDR");
const currencies = await getSupportedCurrencies();
```

**Crypto Price**

```typescript
import { getCryptoPrice, getCryptoMarkets, getCoinList } from "@ptheus/tools";

const bitcoin = await getCryptoPrice("bitcoin");
const top10 = await getCryptoMarkets({ limit: 10 });
const allCoins = await getCoinList();

// Supports custom currency (default: "usd")
const btcIdr = await getCryptoPrice("bitcoin", { currency: "idr" });
```

### Encyclopedia

**Wikipedia**

```typescript
import { getWikipediaSummary, searchWikipedia, getWikipediaArticle } from "@ptheus/tools";

const summary = await getWikipediaSummary("TypeScript");
const results = await searchWikipedia("open source software", { limit: 5 });
const article = await getWikipediaArticle("Node.js");

// All three accept a language option (default: "en")
const idSummary = await getWikipediaSummary("Pemrograman komputer", { lang: "id" });
```

**Wikiquote**

```typescript
import { getWikiquotePage, searchWikiquote } from "@ptheus/tools";

const page = await getWikiquotePage("Albert Einstein");
const results = await searchWikiquote("science", { limit: 5 });

// Supports multiple languages
const dePage = await getWikiquotePage("Albert Einstein", { lang: "de" });
```

### Network

**IP Geolocation**

```typescript
import { getIpGeoLocation } from "@ptheus/tools";

const location = await getIpGeoLocation("8.8.8.8");
console.log(location.data.city, location.data.country);

// Omit the IP to look up the requester's own address
const self = await getIpGeoLocation();
```

### Entertainment

**Quotes**

```typescript
import { getRandomQuote, getQuoteOfTheDay, getRandomQuotes } from "@ptheus/tools";

const quote = await getRandomQuote();
const today = await getQuoteOfTheDay();
const batch = await getRandomQuotes(); // ~50 quotes at once
```

### Weather

**Forecast**

```typescript
import { getWeatherForecast, searchWeatherLocations } from "@ptheus/tools";

const forecast = await getWeatherForecast("Jakarta", { days: 5 });
console.log(forecast.data.current.temperatureC);
console.log(forecast.data.daily);

const matches = await searchWeatherLocations("Springfield");
```

### Reference

**Dictionary**

```typescript
import { getWordDefinition, getAllWordDefinitions } from "@ptheus/tools";

const entry = await getWordDefinition("ubiquitous");
console.log(entry.data.meanings[0].definitions[0].definition);

// All entries (e.g. multiple parts of speech from different sources)
const entries = await getAllWordDefinitions("run");
```

### News

**RSS Feed**

```typescript
import { getRssFeed, searchNews, getTopNews } from "@ptheus/tools";

const feed = await getRssFeed("https://hnrss.org/frontpage");
const results = await searchNews("artificial intelligence", { limit: 10 });
const headlines = await getTopNews({ country: "US", lang: "en" });
```

### Scraper Options

```typescript
interface ScraperOptions {
  timeoutMs?: number;  // default: 10000 (10 seconds)
  userAgent?: string;  // default: "@ptheus/tools scraper"
}

const result = await getGitHubRepository("owner", "repo", { timeoutMs: 5000 });
```

---

## Error Handling

All functions return a `Result<T>` discriminated union — exceptions are never thrown.

```typescript
type Result<T> =
  | { success: true;  data: T }
  | { success: false; error: ScraperError };

type ScraperErrorCode =
  | "NETWORK_ERROR"
  | "PARSE_ERROR"
  | "VALIDATION_ERROR"
  | "NOT_FOUND"
  | "RATE_LIMITED"
  | "UNKNOWN";
```

```typescript
const result = await getNpmPackage("some-package");

if (!result.success) {
  switch (result.error.code) {
    case "NOT_FOUND":
      console.log("Package does not exist");
      break;
    case "NETWORK_ERROR":
      console.log("Could not reach npm registry");
      break;
    case "RATE_LIMITED":
      console.log("Too many requests — try again later");
      break;
    default:
      console.error(result.error.message);
  }
}
```

---

## Project Structure

```
@ptheus/tools
└── src/
    ├── index.ts
    ├── core/
    │   ├── http.ts
    │   └── result.ts
    ├── scrapers/
    │   ├── encyclopedia/
    │   │   ├── wikipedia/
    │   │   │   ├── index.ts
    │   │   │   ├── types.ts
    │   │   │   └── wikipedia.test.ts
    │   │   └── wikiquote/
    │   │       ├── index.ts
    │   │       ├── types.ts
    │   │       └── wikiquote.test.ts
    │   ├── entertainment/
    │   │   └── quotes/
    │   │       ├── index.ts
    │   │       ├── types.ts
    │   │       └── quotes.test.ts
    │   ├── finance/
    │   │   ├── exchange-rate/
    │   │   │   ├── index.ts
    │   │   │   ├── types.ts
    │   │   │   └── exchange-rate.test.ts
    │   │   └── crypto-price/
    │   │       ├── index.ts
    │   │       ├── types.ts
    │   │       └── crypto-price.test.ts
    │   ├── network/
    │   │   └── ip-geo/
    │   │       ├── index.ts
    │   │       ├── types.ts
    │   │       └── ip-geo.test.ts
    │   ├── news/
    │   │   └── rss-feed/
    │   │       ├── index.ts
    │   │       ├── types.ts
    │   │       └── rss-feed.test.ts
    │   ├── reference/
    │   │   └── dictionary/
    │   │       ├── index.ts
    │   │       ├── types.ts
    │   │       └── dictionary.test.ts
    │   ├── registry/
    │   │   ├── github/
    │   │   │   ├── index.ts
    │   │   │   ├── types.ts
    │   │   │   └── github.test.ts
    │   │   ├── npm/
    │   │   │   ├── index.ts
    │   │   │   ├── types.ts
    │   │   │   └── npm.test.ts
    │   │   └── pypi/
    │   │       ├── index.ts
    │   │       ├── types.ts
    │   │       └── pypi.test.ts
    │   ├── social/
    │   │   └── hacker-news/
    │   │       ├── index.ts
    │   │       ├── types.ts
    │   │       └── hacker-news.test.ts
    │   └── weather/
    │       └── forecast/
    │           ├── index.ts
    │           ├── types.ts
    │           └── forecast.test.ts
    ├── types/
    │   └── common.ts
    └── utils/
        ├── parse.ts
        ├── parse.test.ts
        └── url.ts
```

---

## Contributing

### Adding a New Scraper

1. Create a new folder under `src/scrapers/{category}/{name}/`
2. Add `types.ts` with your type definitions
3. Implement the scraper in `index.ts`
4. Write tests in `{name}.test.ts`
5. Export types from `src/types/index.ts`
6. Export functions from `src/index.ts`
7. Add an entry to `tsup.config.ts` and `package.json` exports

### Development

```bash
npm install
npm run typecheck
npm run lint
npm run test
npm run test:watch
npm run build
```

---

## License

MIT © [ptheus](https://github.com/PtheusLab)
