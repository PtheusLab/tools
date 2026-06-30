/**
 * examples/wikipedia.ts
 *
 * Contoh penggunaan Wikipedia scraper:
 *   - getWikipediaSummary  → ringkasan artikel
 *   - searchWikipedia      → pencarian artikel
 *   - getWikipediaArticle  → artikel lengkap dengan seksi-seksi
 *
 * Jalankan: npx tsx examples/wikipedia.ts
 */

import {
  getWikipediaSummary,
  searchWikipedia,
  getWikipediaArticle,
} from "../src/index.js";

const SEPARATOR = "─".repeat(50);

function header(judul: string) {
  console.log(`\n${SEPARATOR}`);
  console.log(`  ${judul}`);
  console.log(SEPARATOR);
}

// ─────────────────────────────────────────────
// 1. Ringkasan artikel
// ─────────────────────────────────────────────
async function contohSummary() {
  header("📖 Wikipedia — Ringkasan Artikel");

  const result = await getWikipediaSummary("TypeScript");

  if (!result.success) {
    console.log(`  ✗ Gagal: ${result.error.message}`);
    return;
  }

  const s = result.data;
  console.log(`  Judul  : ${s.title}`);
  console.log(`  ID     : ${s.pageId}`);
  if (s.description) console.log(`  Deskripsi: ${s.description}`);
  console.log(`  URL    : ${s.url}`);
  console.log(`  Edit   : ${s.lastEdited ?? "—"}`);
  if (s.thumbnailUrl) console.log(`  Thumbnail: ${s.thumbnailUrl}`);
  console.log(`\n  ${s.extract.slice(0, 300)}…`);
}

// ─────────────────────────────────────────────
// 2. Pencarian artikel
// ─────────────────────────────────────────────
async function contohSearch() {
  header("🔍 Wikipedia — Hasil Pencarian \"open source\"");

  const result = await searchWikipedia("open source software", { limit: 5 });

  if (!result.success) {
    console.log(`  ✗ Gagal: ${result.error.message}`);
    return;
  }

  for (const item of result.data) {
    console.log(`  • ${item.title}`);
    console.log(`    ${item.snippet.slice(0, 100)}…`);
    console.log(`    🔗 ${item.url}`);
  }
}

// ─────────────────────────────────────────────
// 3. Artikel lengkap + daftar seksi
// ─────────────────────────────────────────────
async function contohArtikelLengkap() {
  header("📚 Wikipedia — Struktur Seksi Artikel \"Node.js\"");

  const result = await getWikipediaArticle("Node.js");

  if (!result.success) {
    console.log(`  ✗ Gagal: ${result.error.message}`);
    return;
  }

  const article = result.data;
  console.log(`  Judul   : ${article.title}`);
  console.log(`  URL     : ${article.url}`);
  console.log(`  Seksi   : ${article.sections.length} bagian`);
  console.log(`  Teks    : ${article.plainText.length.toLocaleString()} karakter\n`);

  for (const section of article.sections.slice(0, 8)) {
    const indent = "  " + "  ".repeat(section.level);
    const titleLabel = section.title || "(Lead)";
    console.log(`${indent}${"#".repeat(section.level + 1)} ${titleLabel}`);
    const preview = section.content.slice(0, 120).replace(/\n/g, " ");
    if (preview) console.log(`${indent}  ${preview}…`);
  }
}

// ─────────────────────────────────────────────
// 4. Artikel dalam Bahasa Indonesia
// ─────────────────────────────────────────────
async function contohBahasaIndonesia() {
  header("🇮🇩 Wikipedia Bahasa Indonesia — \"Pemrograman\"");

  const result = await getWikipediaSummary("Pemrograman komputer", {
    lang: "id",
  });

  if (!result.success) {
    console.log(`  ✗ Gagal: ${result.error.message}`);
    return;
  }

  const s = result.data;
  console.log(`  Judul : ${s.title}`);
  console.log(`  Bahasa: ${s.lang}`);
  console.log(`\n  ${s.extract.slice(0, 300)}…`);
}

// ─────────────────────────────────────────────
// Jalankan semua contoh
// ─────────────────────────────────────────────
async function main() {
  console.log("🌐 @ptheus/tools — Contoh Wikipedia Scraper");
  console.log(`Waktu: ${new Date().toLocaleString("id-ID")}`);

  await contohSummary();
  await contohSearch();
  await contohArtikelLengkap();
  await contohBahasaIndonesia();

  console.log(`\n${SEPARATOR}`);
  console.log("  ✅ Selesai");
  console.log(SEPARATOR);
}

main().catch(console.error);
