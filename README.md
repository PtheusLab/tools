# @ptheus/tools

A collection of ready-to-use web scrapers as importable TypeScript functions.

## Installation

```bash
npm install @ptheus/tools
```

## Usage

```typescript
import {
  getGitHubRepository,
  getGitHubTrending,
  getNpmPackage,
  getHackerNewsFeed,
  convertCurrency,
} from "@ptheus/tools";

// All functions return a Result<T> — never throw
const result = await getGitHubRepository("facebook", "react");

if (result.success) {
  console.log(result.data.stars); // number
} else {
  console.error(result.error.code); // "NOT_FOUND" | "NETWORK_ERROR" | ...
}
```

## Scrapers

### GitHub

```typescript
import { getGitHubRepository, getGitHubUser, getGitHubTrending } from "@ptheus/tools";

// Fetch a repository
const repo = await getGitHubRepository("microsoft", "vscode");

// Fetch a user profile
const user = await getGitHubUser("torvalds");

// Fetch trending repositories
const trending = await getGitHubTrending({ language: "typescript", since: "weekly" });
```

### NPM Registry

```typescript
import { getNpmPackage, searchNpmPackages } from "@ptheus/tools";

// Fetch a package
const pkg = await getNpmPackage("lodash");

// Search packages
const results = await searchNpmPackages("react state management", { limit: 5 });
```

### Hacker News

```typescript
import { getHackerNewsFeed, getHackerNewsItem } from "@ptheus/tools";

// Fetch top stories
const stories = await getHackerNewsFeed("top", { limit: 20 });

// Fetch a specific item
const item = await getHackerNewsItem(8863);
```

### Exchange Rates

```typescript
import { getExchangeRates, convertCurrency, getSupportedCurrencies } from "@ptheus/tools";

// Get all rates relative to a base
const rates = await getExchangeRates("USD");

// Convert an amount
const converted = await convertCurrency(100, "USD", "IDR");

// List all supported currencies
const currencies = await getSupportedCurrencies();
```

## Error Handling

Every function returns a `Result<T>` discriminated union — no exceptions are thrown.

```typescript
type Result<T> =
  | { success: true; data: T }
  | { success: false; error: ScraperError };

type ScraperErrorCode =
  | "NETWORK_ERROR"
  | "PARSE_ERROR"
  | "VALIDATION_ERROR"
  | "NOT_FOUND"
  | "RATE_LIMITED"
  | "UNKNOWN";
```

Use the `code` field to handle errors specifically:

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
  }
}
```

## Scraper Options

All scrapers accept an optional `ScraperOptions` last parameter:

```typescript
interface ScraperOptions {
  timeoutMs?: number;   // default: 10000
  userAgent?: string;   // default: "@ptheus/tools scraper"
}
```

```typescript
const result = await getGitHubRepository("owner", "repo", { timeoutMs: 5000 });
```

## Project Structure

```
src/
├── index.ts              # Public API entry point
├── core/
│   ├── http.ts           # HTTP client and error classification
│   └── result.ts         # ok() / err() helpers
├── scrapers/
│   ├── github.ts
│   ├── npm-registry.ts
│   ├── hacker-news.ts
│   └── exchange-rate.ts
├── types/
│   ├── common.ts
│   ├── github.ts
│   ├── npm-registry.ts
│   ├── hacker-news.ts
│   └── exchange-rate.ts
└── utils/
    ├── parse.ts
    └── url.ts
```

## Adding a New Scraper

1. Add type definitions in `src/types/your-scraper.ts`
2. Export them from `src/types/index.ts`
3. Implement the scraper in `src/scrapers/your-scraper.ts`
4. Export functions from `src/index.ts`
5. Add an entry to `tsup.config.ts`
6. Write tests in `tests/scrapers/your-scraper.test.ts`

## Development

```bash
npm install
npm run typecheck   # TypeScript check
npm run test        # Run all tests
npm run test:watch  # Watch mode
npm run build       # Build for production
```

## License

MIT
