import { defineConfig } from "tsup";
import { readdirSync, statSync } from "fs";
import { join } from "path";

const scrapersDir = "src/scrapers";
const scraperEntries: Record<string, string> = {};

for (const category of readdirSync(scrapersDir)) {
  const categoryPath = join(scrapersDir, category);
  if (!statSync(categoryPath).isDirectory()) continue;

  for (const scraper of readdirSync(categoryPath)) {
    const scraperPath = join(categoryPath, scraper);
    if (!statSync(scraperPath).isDirectory()) continue;

    scraperEntries[`scrapers/${category}/${scraper}`] =
      `${scraperPath}/index.ts`;
  }
}

export default defineConfig({
  entry: {
    index: "src/index.ts",
    ...scraperEntries,
  },
  format: ["cjs", "esm"],
  dts: true,
  splitting: false,
  sourcemap: true,
  clean: true,
  treeshake: true,
});
