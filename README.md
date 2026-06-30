<div align="center">

# @ptheus/tools

**A collection of type-safe web scrapers as importable TypeScript functions.**

[![npm version](https://img.shields.io/npm/v/@ptheus/tools?color=CB3837&label=npm&logo=npm)](https://www.npmjs.com/package/@ptheus/tools)
[![npm downloads](https://img.shields.io/npm/dm/@ptheus/tools?color=CB3837&logo=npm)](https://www.npmjs.com/package/@ptheus/tools)
[![CI](https://img.shields.io/github/actions/workflow/status/PtheusLab/tools/ci.yml?branch=main&label=CI&logo=github)](https://github.com/PtheusLab/tools/actions/workflows/ci.yml)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-%3E%3D21-339933?logo=node.js&logoColor=white)](https://nodejs.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](./LICENSE)

[Installation](#installation) · [Quick Start](#quick-start) · [API Reference](#api-reference) · [Error Handling](#error-handling) · [Contributing](#contributing)

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
| **Wikipedia** | `getWikipediaSummary` · `searchWikipedia` · `getWikipediaArticle` |

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

### GitHub

```typescript
import { getGitHubRepository, getGitHubUser, getGitHubTrending } from "@ptheus/tools";

const repo = await getGitHubRepository("microsoft", "vscode");
const user = await getGitHubUser("torvalds");
const trending = await getGitHubTrending({ language: "typescript", since: "weekly" });
```

### npm Registry

```typescript
import { getNpmPackage, searchNpmPackages } from "@ptheus/tools";

const pkg = await getNpmPackage("lodash");
const scoped = await getNpmPackage("@tanstack/react-query");
const results = await searchNpmPackages("react state management", { limit: 5 });
```

### Hacker News

```typescript
import { getHackerNewsFeed, getHackerNewsItem, getHackerNewsMaxItem } from "@ptheus/tools";

const feed = await getHackerNewsFeed("top", { limit: 20 });
const item = await getHackerNewsItem(8863);
const max = await getHackerNewsMaxItem();
```

### Exchange Rates

```typescript
import { getExchangeRates, convertCurrency, getSupportedCurrencies } from "@ptheus/tools";

const rates = await getExchangeRates("USD");
const converted = await convertCurrency(100, "USD", "IDR");
const currencies = await getSupportedCurrencies();
```

### Wikipedia

```typescript
import { getWikipediaSummary, searchWikipedia, getWikipediaArticle } from "@ptheus/tools";

const summary = await getWikipediaSummary("TypeScript");
const results = await searchWikipedia("open source software", { limit: 5 });
const article = await getWikipediaArticle("Node.js");

// All three accept a language option (default: "en")
const idSummary = await getWikipediaSummary("Pemrograman komputer", { lang: "id" });
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
    │   │   └── wikipedia/
    │   │       ├── index.ts
    │   │       ├── types.ts
    │   │       └── wikipedia.test.ts
    │   ├── finance/
    │   │   └── exchange-rate/
    │   │       ├── index.ts
    │   │       ├── types.ts
    │   │       └── exchange-rate.test.ts
    │   ├── registry/
    │   │   ├── github/
    │   │   │   ├── index.ts
    │   │   │   ├── types.ts
    │   │   │   └── github.test.ts
    │   │   └── npm/
    │   │       ├── index.ts
    │   │       ├── types.ts
    │   │       └── npm.test.ts
    │   └── social/
    │       └── hacker-news/
    │           ├── index.ts
    │           ├── types.ts
    │           └── hacker-news.test.ts
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
