import { readdirSync, statSync, writeFileSync, readFileSync } from "fs";
import { join } from "path";

const scrapersDir = "src/scrapers";
const pkg = JSON.parse(readFileSync("package.json", "utf-8"));

const exports = { ".": pkg.exports["."] };

for (const category of readdirSync(scrapersDir)) {
  const categoryPath = join(scrapersDir, category);
  if (!statSync(categoryPath).isDirectory()) continue;

  for (const scraper of readdirSync(categoryPath)) {
    const scraperPath = join(categoryPath, scraper);
    if (!statSync(scraperPath).isDirectory()) continue;

    const key = `./scrapers/${category}/${scraper}`;
    exports[key] = {
      types:   `./dist/scrapers/${category}/${scraper}.d.ts`,
      import:  `./dist/scrapers/${category}/${scraper}.mjs`,
      require: `./dist/scrapers/${category}/${scraper}.js`,
    };
  }
}

pkg.exports = exports;
writeFileSync("package.json", JSON.stringify(pkg, null, 2) + "\n");
console.log(`Generated ${Object.keys(exports).length - 1} scraper export(s)`);
