/**
 * examples/github.ts
 *
 * Contoh penggunaan GitHub scrapers dari @ptheus/tools.
 * Jalankan: npx tsx examples/github.ts
 */

import {
  getGitHubRepository,
  getGitHubUser,
  getGitHubTrending,
} from "../src/index.js";

// ─────────────────────────────────────────────
// 1. Fetch detail sebuah repository
// ─────────────────────────────────────────────
async function contohGetRepository() {
  console.log("=== getGitHubRepository ===");

  const result = await getGitHubRepository("facebook", "react");

  if (!result.success) {
    console.error("Gagal:", result.error.code, "-", result.error.message);
    return;
  }

  const repo = result.data;
  console.log(`Nama     : ${repo.fullName}`);
  console.log(`Deskripsi: ${repo.description}`);
  console.log(`Bintang  : ${repo.stars.toLocaleString()}`);
  console.log(`Forks    : ${repo.forks.toLocaleString()}`);
  console.log(`Bahasa   : ${repo.language}`);
  console.log(`Lisensi  : ${repo.license ?? "tidak ada"}`);
  console.log(`URL      : ${repo.url}`);
  console.log();
}

// ─────────────────────────────────────────────
// 2. Fetch profil pengguna GitHub
// ─────────────────────────────────────────────
async function contohGetUser() {
  console.log("=== getGitHubUser ===");

  const result = await getGitHubUser("torvalds");

  if (!result.success) {
    console.error("Gagal:", result.error.code, "-", result.error.message);
    return;
  }

  const user = result.data;
  console.log(`Login    : ${user.login}`);
  console.log(`Nama     : ${user.name ?? "(tidak ada)"}`);
  console.log(`Bio      : ${user.bio ?? "(tidak ada)"}`);
  console.log(`Lokasi   : ${user.location ?? "(tidak ada)"}`);
  console.log(`Repo     : ${user.publicRepos}`);
  console.log(`Followers: ${user.followers.toLocaleString()}`);
  console.log();
}

// ─────────────────────────────────────────────
// 3. Fetch trending repositories
// ─────────────────────────────────────────────
async function contohGetTrending() {
  console.log("=== getGitHubTrending (TypeScript, weekly) ===");

  const result = await getGitHubTrending({
    language: "typescript",
    since: "weekly",
  });

  if (!result.success) {
    console.error("Gagal:", result.error.code, "-", result.error.message);
    return;
  }

  const top5 = result.data.slice(0, 5);
  for (const repo of top5) {
    console.log(
      `#${repo.rank} ${repo.fullName} ⭐ ${repo.stars.toLocaleString()} (+${repo.starsToday ?? 0} minggu ini)`
    );
    if (repo.description) console.log(`    ${repo.description}`);
  }
  console.log();
}

// ─────────────────────────────────────────────
// 4. Contoh error handling — repo tidak ada
// ─────────────────────────────────────────────
async function contohRepoTidakAda() {
  console.log("=== Error handling: repo tidak ditemukan ===");

  const result = await getGitHubRepository("owner-tidak-ada", "repo-palsu-xyz");

  if (!result.success) {
    switch (result.error.code) {
      case "NOT_FOUND":
        console.log("Repository tidak ditemukan di GitHub.");
        break;
      case "NETWORK_ERROR":
        console.log("Tidak dapat terhubung ke GitHub API.");
        break;
      case "RATE_LIMITED":
        console.log("Terlalu banyak request. Coba lagi nanti.");
        break;
      default:
        console.log(`Error tidak terduga: ${result.error.message}`);
    }
  }
  console.log();
}

// ─────────────────────────────────────────────
// 5. Menggunakan ScraperOptions (timeout kustom)
// ─────────────────────────────────────────────
async function contohDenganOptions() {
  console.log("=== Menggunakan ScraperOptions ===");

  const result = await getGitHubRepository("microsoft", "vscode", {
    timeoutMs: 5000,
    userAgent: "contoh-skrip/1.0",
  });

  if (result.success) {
    console.log(`VSCode — ${result.data.stars.toLocaleString()} bintang`);
  } else {
    console.error("Gagal:", result.error.message);
  }
  console.log();
}

// ─────────────────────────────────────────────
// Jalankan semua contoh
// ─────────────────────────────────────────────
async function main() {
  await contohGetRepository();
  await contohGetUser();
  await contohGetTrending();
  await contohRepoTidakAda();
  await contohDenganOptions();
}

main().catch(console.error);
