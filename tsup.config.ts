import { defineConfig } from "tsup";

export default defineConfig({
  entry: {
    index: "src/index.ts",
    "scrapers/github": "src/scrapers/github.ts",
    "scrapers/npm-registry": "src/scrapers/npm-registry.ts",
    "scrapers/hacker-news": "src/scrapers/hacker-news.ts",
    "scrapers/exchange-rate": "src/scrapers/exchange-rate.ts",
  },
  format: ["cjs", "esm"],
  dts: true,
  splitting: false,
  sourcemap: true,
  clean: true,
  treeshake: true,
});
