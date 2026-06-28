<div align="center">

# @ptheus/tools

**A collection of type-safe web scrapers as importable TypeScript functions.**

[![npm version](https://img.shields.io/npm/v/@ptheus/tools?color=CB3837&label=npm&logo=npm)](https://www.npmjs.com/package/@ptheus/tools)
[![npm downloads](https://img.shields.io/npm/dm/@ptheus/tools?color=CB3837&logo=npm)](https://www.npmjs.com/package/@ptheus/tools)
[![CI](https://img.shields.io/github/actions/workflow/status/PtheusLab/tools/ci.yml?branch=main&label=CI&logo=github)](https://github.com/PtheusLab/tools/actions/workflows/ci.yml)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-%3E%3D18-339933?logo=node.js&logoColor=white)](https://nodejs.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](./LICENSE)

[Installation](#installation) · [Quick Start](#quick-start) · [API Reference](#api-reference) · [Error Handling](#error-handling) · [Examples](#examples) · [Contributing](#contributing)

</div>

---

## Overview

`@ptheus/tools` provides ready-to-use scrapers for common data sources — GitHub, npm, Hacker News, and live exchange rates. Every function follows the same **`Result<T>` pattern**: no exceptions are thrown, ever.

| Scraper | Functions |
|---|---|
| **GitHub** | `getGitHubRepository` · `getGitHubUser` · `getGitHubTrending` |
| **npm Registry** | `getNpmPackage` · `searchNpmPackages` |
| **Hacker News** | `getHackerNewsFeed` · `getHackerNewsItem` · `getHackerNewsMaxItem` |
| **Exchange Rates** | `getExchangeRates` · `convertCurrency` · `getSupportedCurrencies` |

---

## Installation

```bash
npm install @ptheus/tools
```

> **Requirements:** Node.js ≥ 18

---

## Quick Start

```typescript
import { getGitHubRepository } from "@ptheus/tools";

// Every function returns Result<T> — never throws
const result = await getGitHubRepository("facebook", "react");

if (result.success) {
  console.log(result.data.stars);      // number
  console.log(result.data.language);   // string | null
} else {
  console.error(result.error.code);    // "NOT_FOUND" | "NETWORK_ERROR" | ...
}
```

---

## API Reference

### GitHub

```typescript
import { getGitHubRepository, getGitHubUser, getGitHubTrending } from "@ptheus/tools";

// Fetch a repository
const repo = await getGitHubRepository("microsoft", "vscode");
// repo.data → GitHubRepository { stars, forks, language, topics, license, ... }

// Fetch a user profile
const user = await getGitHubUser("torvalds");
// user.data → GitHubUser { login, name, bio, followers, publicRepos, ... }

// Fetch trending repositories
const trending = await getGitHubTrending({
  language: "typescript",   // optional
  since: "weekly",          // "daily" | "weekly" | "monthly"
});
// trending.data → GitHubTrendingRepository[] { rank, fullName, stars, starsToday, ... }
```

### npm Registry

```typescript
import { getNpmPackage, searchNpmPackages } from "@ptheus/tools";

// Fetch a package (supports scoped packages)
const pkg = await getNpmPackage("lodash");
const scoped = await getNpmPackage("@tanstack/react-query");
// pkg.data → NpmPackage { version, downloads, dependencies, maintainers, ... }

// Search packages
const results = await searchNpmPackages("react state management", { limit: 5 });
// results.data → NpmSearchResult[] { name, version, description, score, ... }
```

### Hacker News

```typescript
import { getHackerNewsFeed, getHackerNewsItem, getHackerNewsMaxItem } from "@ptheus/tools";

// Fetch a feed
const feed = await getHackerNewsFeed("top", { limit: 20 });
// feed type: "top" | "new" | "best" | "ask" | "show" | "job"
// feed.data → HackerNewsStory[] { title, url, score, descendants, by, ... }

// Fetch a specific item
const item = await getHackerNewsItem(8863);
// item.data → HackerNewsItem { id, type, title, score, kids, ... }

// Get the latest item ID
const max = await getHackerNewsMaxItem();
```

### Exchange Rates

```typescript
import { getExchangeRates, convertCurrency, getSupportedCurrencies } from "@ptheus/tools";

// Get all rates relative to a base currency
const rates = await getExchangeRates("USD");
// rates.data → ExchangeRate { base, date, rates: Record<string, number> }

// Convert an amount between currencies
const converted = await convertCurrency(100, "USD", "IDR");
// converted.data → ConvertedAmount { from, to, amount, result, rate, date }

// List all supported currency codes
const currencies = await getSupportedCurrencies();
// currencies.data → string[]  e.g. ["AED", "AFN", "ALL", ...]
```

### Scraper Options

Every function accepts an optional `ScraperOptions` as its last parameter:

```typescript
interface ScraperOptions {
  timeoutMs?: number;   // default: 10000 (10 seconds)
  userAgent?: string;   // default: "@ptheus/tools scraper"
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
  | "NETWORK_ERROR"     // Request failed or timed out
  | "PARSE_ERROR"       // Could not parse the response
  | "VALIDATION_ERROR"  // Response shape was unexpected
  | "NOT_FOUND"         // Resource does not exist
  | "RATE_LIMITED"      // Too many requests
  | "UNKNOWN";          // Unclassified error
```

Use the `code` field to handle errors precisely:

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

## Examples

Runnable example scripts live in the [`examples/`](./examples) folder. Each file covers the full API surface for its scraper, including error handling and `ScraperOptions`.

```bash
# GitHub — repos, users, trending
npx tsx examples/github.ts

# npm Registry — packages, scoped packages, search
npx tsx examples/npm-registry.ts

# Hacker News — feeds and items
npx tsx examples/hacker-news.ts

# Exchange Rates — rates, conversion, currency list
npx tsx examples/exchange-rate.ts

# Combined dashboard — all scrapers at once
npx tsx examples/all-scrapers.ts
```

---

## Project Structure

```
@ptheus/tools
├── examples/
│   ├── github.ts             # GitHub scraper examples
│   ├── npm-registry.ts       # npm Registry scraper examples
│   ├── hacker-news.ts        # Hacker News scraper examples
│   ├── exchange-rate.ts      # Exchange Rate scraper examples
│   └── all-scrapers.ts       # Combined dashboard
├── src/
│   ├── index.ts              # Public API entry point
│   ├── core/
│   │   ├── http.ts           # HTTP client & error classification
│   │   └── result.ts         # ok() / err() helpers
│   ├── scrapers/
│   │   ├── github.ts
│   │   ├── npm-registry.ts
│   │   ├── hacker-news.ts
│   │   └── exchange-rate.ts
│   ├── types/
│   │   ├── common.ts
│   │   ├── github.ts
│   │   ├── npm-registry.ts
│   │   ├── hacker-news.ts
│   │   └── exchange-rate.ts
│   └── utils/
│       ├── parse.ts
│       └── url.ts
└── tests/
    ├── scrapers/             # Per-scraper test suites
    └── utils/
```

---

## Contributing

### Adding a New Scraper

1. Add type definitions in `src/types/your-scraper.ts`
2. Export them from `src/types/index.ts`
3. Implement the scraper in `src/scrapers/your-scraper.ts`
4. Export functions from `src/index.ts`
5. Add an entry to `tsup.config.ts`
6. Write tests in `tests/scrapers/your-scraper.test.ts`
7. Add an example script in `examples/your-scraper.ts`

### Development

```bash
npm install
npm run typecheck     # TypeScript check
npm run lint          # Lint source and tests
npm run test          # Run all tests
npm run test:watch    # Watch mode
npm run build         # Build for production
```

---

## License

MIT © [ptheus](https://github.com/PtheusLab)
