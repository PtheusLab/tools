import { defineConfig } from "tsup";

export default defineConfig({
  entry: {
    index: "src/index.ts",
    "scrapers/registry/github": "src/scrapers/registry/github/index.ts",
    "scrapers/registry/npm": "src/scrapers/registry/npm/index.ts",
    "scrapers/social/hacker-news": "src/scrapers/social/hacker-news/index.ts",
    "scrapers/finance/exchange-rate": "src/scrapers/finance/exchange-rate/index.ts",
  },
  format: ["cjs", "esm"],
  dts: true,
  splitting: false,
  sourcemap: true,
  clean: true,
  treeshake: true,
});
