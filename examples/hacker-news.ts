/**
 * examples/hacker-news.ts
 *
 * Contoh penggunaan Hacker News scrapers dari @ptheus/tools.
 * Jalankan: npx tsx examples/hacker-news.ts
 */

import {
  getHackerNewsFeed,
  getHackerNewsItem,
  getHackerNewsMaxItem,
} from "../src/index.js";

// Helper: format waktu Unix ke string yang mudah dibaca
function formatTime(unixTimestamp: number): string {
  return new Date(unixTimestamp * 1000).toLocaleString("id-ID");
}

// ─────────────────────────────────────────────
// 1. Fetch top stories (feed utama)
// ─────────────────────────────────────────────
async function contohTopStories() {
  console.log("=== getHackerNewsFeed (top, limit 5) ===");

  const result = await getHackerNewsFeed("top", { limit: 5 });

  if (!result.success) {
    console.error("Gagal:", result.error.code, "-", result.error.message);
    return;
  }

  for (const story of result.data) {
    console.log(`🔺 ${story.score} poin | ${story.by}`);
    console.log(`   ${story.title}`);
    if (story.url) console.log(`   ${story.url}`);
    console.log(`   💬 ${story.descendants} komentar | ${formatTime(story.time)}`);
    console.log();
  }
}

// ─────────────────────────────────────────────
// 2. Fetch feed "best" stories
// ─────────────────────────────────────────────
async function contohBestStories() {
  console.log("=== getHackerNewsFeed (best, limit 3) ===");

  const result = await getHackerNewsFeed("best", { limit: 3 });

  if (!result.success) {
    console.error("Gagal:", result.error.code, "-", result.error.message);
    return;
  }

  result.data.forEach((story, i) => {
    console.log(`${i + 1}. [${story.score}⬆] ${story.title}`);
  });
  console.log();
}

// ─────────────────────────────────────────────
// 3. Fetch Ask HN stories
// ─────────────────────────────────────────────
async function contohAskHN() {
  console.log("=== getHackerNewsFeed (ask, limit 3) ===");

  const result = await getHackerNewsFeed("ask", { limit: 3 });

  if (!result.success) {
    console.error("Gagal:", result.error.code, "-", result.error.message);
    return;
  }

  for (const story of result.data) {
    console.log(`❓ ${story.title} (${story.descendants} jawaban)`);
    if (story.text) {
      // Potong teks agar tidak terlalu panjang
      const preview = story.text.replace(/<[^>]+>/g, "").slice(0, 120);
      console.log(`   ${preview}...`);
    }
  }
  console.log();
}

// ─────────────────────────────────────────────
// 4. Fetch item spesifik berdasarkan ID
// ─────────────────────────────────────────────
async function contohGetItem() {
  console.log("=== getHackerNewsItem (ID: 8863) ===");

  // ID 8863 adalah salah satu story paling awal di HN
  const result = await getHackerNewsItem(8863);

  if (!result.success) {
    console.error("Gagal:", result.error.code, "-", result.error.message);
    return;
  }

  const item = result.data;
  console.log(`ID      : ${item.id}`);
  console.log(`Tipe    : ${item.type}`);
  console.log(`Judul   : ${item.title ?? "(tidak ada)"}`);
  console.log(`Penulis : ${item.by ?? "(anonim)"}`);
  console.log(`Skor    : ${item.score ?? 0}`);
  console.log(`URL     : ${item.url ?? "(tidak ada)"}`);
  console.log(`Waktu   : ${formatTime(item.time)}`);
  console.log(`Komentar: ${item.kids.length}`);
  console.log();
}

// ─────────────────────────────────────────────
// 5. Fetch ID item terbaru (maxitem)
// ─────────────────────────────────────────────
async function contohMaxItem() {
  console.log("=== getHackerNewsMaxItem ===");

  const result = await getHackerNewsMaxItem();

  if (!result.success) {
    console.error("Gagal:", result.error.code, "-", result.error.message);
    return;
  }

  console.log(`ID item terbaru di HN: ${result.data.toLocaleString()}`);
  console.log();
}

// ─────────────────────────────────────────────
// 6. Contoh error handling — item tidak ada
// ─────────────────────────────────────────────
async function contohItemTidakAda() {
  console.log("=== Error handling: item tidak ditemukan ===");

  const result = await getHackerNewsItem(999999999);

  if (!result.success) {
    switch (result.error.code) {
      case "NOT_FOUND":
        console.log("Item tidak ditemukan di Hacker News.");
        break;
      case "NETWORK_ERROR":
        console.log("Tidak dapat terhubung ke Hacker News API.");
        break;
      default:
        console.log(`Error: ${result.error.message}`);
    }
  }
  console.log();
}

// ─────────────────────────────────────────────
// 7. Mencari story Show HN terbaru
// ─────────────────────────────────────────────
async function contohShowHN() {
  console.log("=== getHackerNewsFeed (show, limit 3) ===");

  const result = await getHackerNewsFeed("show", { limit: 3 });

  if (!result.success) {
    console.error("Gagal:", result.error.code, "-", result.error.message);
    return;
  }

  for (const story of result.data) {
    console.log(`🚀 ${story.title}`);
    console.log(`   ${story.score} poin oleh ${story.by}`);
  }
  console.log();
}

// ─────────────────────────────────────────────
// Jalankan semua contoh
// ─────────────────────────────────────────────
async function main() {
  await contohTopStories();
  await contohBestStories();
  await contohAskHN();
  await contohGetItem();
  await contohMaxItem();
  await contohItemTidakAda();
  await contohShowHN();
}

main().catch(console.error);
