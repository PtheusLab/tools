/**
 * examples/all-scrapers.ts
 *
 * Contoh penggunaan semua scraper sekaligus dalam satu script.
 * Script ini membuat "dashboard" sederhana yang menampilkan
 * informasi dari GitHub, npm, Hacker News, dan kurs mata uang.
 *
 * Jalankan: npx tsx examples/all-scrapers.ts
 */

import {
  getGitHubTrending,
  getNpmPackage,
  getHackerNewsFeed,
  convertCurrency,
} from "../src/index.js";

const SEPARATOR = "─".repeat(50);

function header(judul: string) {
  console.log(`\n${SEPARATOR}`);
  console.log(`  ${judul}`);
  console.log(SEPARATOR);
}

// ─────────────────────────────────────────────
// Dashboard GitHub
// ─────────────────────────────────────────────
async function seksiGitHub() {
  header("📦 GitHub — Trending Repositories (Hari Ini)");

  const trending = await getGitHubTrending({ since: "daily" });

  if (!trending.success) {
    console.log(`  ✗ Gagal: ${trending.error.message}`);
    return;
  }

  for (const repo of trending.data.slice(0, 5)) {
    const starsToday =
      repo.starsToday !== null ? ` (+${repo.starsToday} hari ini)` : "";
    console.log(`  ${repo.rank}. ${repo.fullName}`);
    console.log(
      `     ⭐ ${repo.stars.toLocaleString()}${starsToday}  🍴 ${repo.forks.toLocaleString()}  [${repo.language ?? "—"}]`
    );
    if (repo.description) console.log(`     ${repo.description}`);
  }
}

// ─────────────────────────────────────────────
// Dashboard npm
// ─────────────────────────────────────────────
async function seksiNpm() {
  header("📦 npm — Statistik Package Populer");

  const packages = ["typescript", "vite", "zod"];
  const results = await Promise.all(packages.map((p) => getNpmPackage(p)));

  for (const result of results) {
    if (!result.success) {
      console.log(`  ✗ [${result.error.code}] ${result.error.message}`);
      continue;
    }
    const p = result.data;
    const weekly = p.downloads?.weekly.toLocaleString() ?? "N/A";
    const monthly = p.downloads?.monthly.toLocaleString() ?? "N/A";
    console.log(`  📦 ${p.name}@${p.latestVersion}`);
    console.log(`     Unduhan: ${weekly}/minggu | ${monthly}/bulan`);
    console.log(`     Deps   : ${Object.keys(p.dependencies).length} dependencies`);
  }
}

// ─────────────────────────────────────────────
// Dashboard Hacker News
// ─────────────────────────────────────────────
async function seksiHackerNews() {
  header("📰 Hacker News — Top 5 Hari Ini");

  const feed = await getHackerNewsFeed("top", { limit: 5 });

  if (!feed.success) {
    console.log(`  ✗ Gagal: ${feed.error.message}`);
    return;
  }

  for (const story of feed.data) {
    console.log(`  🔺 ${story.score} | ${story.title}`);
    console.log(`     💬 ${story.descendants} komentar oleh ${story.by}`);
  }
}

// ─────────────────────────────────────────────
// Dashboard Kurs Mata Uang
// ─────────────────────────────────────────────
async function seksiKurs() {
  header("💱 Kurs Mata Uang (base: USD)");

  const currencies = ["IDR", "EUR", "JPY", "SGD", "GBP"];
  const results = await Promise.all(
    currencies.map((to) => convertCurrency(1, "USD", to))
  );

  for (const result of results) {
    if (!result.success) {
      console.log(`  ✗ ${result.error.message}`);
      continue;
    }
    const c = result.data;
    console.log(
      `  1 USD = ${c.result.toLocaleString("id-ID", { maximumFractionDigits: 4 })} ${c.to}`
    );
  }
}

// ─────────────────────────────────────────────
// Jalankan semua seksi secara sequential agar output rapi
// ─────────────────────────────────────────────
async function main() {
  console.log("🚀 @ptheus/tools — Dashboard Semua Scraper");
  console.log(`Waktu: ${new Date().toLocaleString("id-ID")}`);

  await seksiGitHub();
  await seksiNpm();
  await seksiHackerNews();
  await seksiKurs();

  console.log(`\n${SEPARATOR}`);
  console.log("  ✅ Selesai");
  console.log(SEPARATOR);
}

main().catch(console.error);
