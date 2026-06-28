/**
 * examples/npm-registry.ts
 *
 * Contoh penggunaan NPM Registry scrapers dari @ptheus/tools.
 * Jalankan: npx tsx examples/npm-registry.ts
 */

import { getNpmPackage, searchNpmPackages } from "../src/index.js";

// ─────────────────────────────────────────────
// 1. Fetch detail sebuah package npm
// ─────────────────────────────────────────────
async function contohGetPackage() {
  console.log("=== getNpmPackage ===");

  const result = await getNpmPackage("zod");

  if (!result.success) {
    console.error("Gagal:", result.error.code, "-", result.error.message);
    return;
  }

  const pkg = result.data;
  console.log(`Nama        : ${pkg.name}`);
  console.log(`Versi       : ${pkg.latestVersion}`);
  console.log(`Deskripsi   : ${pkg.description ?? "(tidak ada)"}`);
  console.log(`Lisensi     : ${pkg.license ?? "(tidak ada)"}`);
  console.log(`Penulis     : ${pkg.author?.name ?? "(tidak ada)"}`);
  console.log(`Dibuat      : ${new Date(pkg.createdAt).toLocaleDateString("id-ID")}`);
  console.log(`Di-update   : ${new Date(pkg.updatedAt).toLocaleDateString("id-ID")}`);

  if (pkg.downloads) {
    console.log(`Unduhan/minggu : ${pkg.downloads.weekly.toLocaleString()}`);
    console.log(`Unduhan/bulan  : ${pkg.downloads.monthly.toLocaleString()}`);
  }

  const depCount = Object.keys(pkg.dependencies).length;
  const devDepCount = Object.keys(pkg.devDependencies).length;
  console.log(`Dependencies    : ${depCount}`);
  console.log(`DevDependencies : ${devDepCount}`);
  console.log(`Total versi     : ${pkg.versions.length}`);
  console.log();
}

// ─────────────────────────────────────────────
// 2. Fetch package dengan scope (@scope/package)
// ─────────────────────────────────────────────
async function contohGetScopedPackage() {
  console.log("=== getNpmPackage (scoped: @tanstack/react-query) ===");

  const result = await getNpmPackage("@tanstack/react-query");

  if (!result.success) {
    console.error("Gagal:", result.error.code, "-", result.error.message);
    return;
  }

  const pkg = result.data;
  console.log(`${pkg.name}@${pkg.latestVersion}`);
  console.log(`Deskripsi: ${pkg.description}`);

  const maintainerNames = pkg.maintainers.map((m) => m.name).join(", ");
  console.log(`Maintainers: ${maintainerNames}`);

  if (pkg.repository) {
    console.log(`Repository: ${pkg.repository.url}`);
  }
  console.log();
}

// ─────────────────────────────────────────────
// 3. Cari packages berdasarkan kata kunci
// ─────────────────────────────────────────────
async function contohSearchPackages() {
  console.log("=== searchNpmPackages ===");

  const result = await searchNpmPackages("react state management", { limit: 5 });

  if (!result.success) {
    console.error("Gagal:", result.error.code, "-", result.error.message);
    return;
  }

  console.log(`Hasil pencarian "react state management" (top 5):\n`);
  for (const pkg of result.data) {
    console.log(`📦 ${pkg.name}@${pkg.version}`);
    console.log(`   Deskripsi : ${pkg.description ?? "(tidak ada)"}`);
    console.log(`   Skor      : ${(pkg.score * 100).toFixed(1)}%`);
    if (pkg.keywords.length > 0) {
      console.log(`   Keywords  : ${pkg.keywords.slice(0, 5).join(", ")}`);
    }
    console.log();
  }
}

// ─────────────────────────────────────────────
// 4. Contoh error handling — package tidak ada
// ─────────────────────────────────────────────
async function contohPackageTidakAda() {
  console.log("=== Error handling: package tidak ditemukan ===");

  const result = await getNpmPackage("package-yang-pasti-tidak-ada-xyzabc123");

  if (!result.success) {
    switch (result.error.code) {
      case "NOT_FOUND":
        console.log("Package tidak ditemukan di npm registry.");
        break;
      case "NETWORK_ERROR":
        console.log("Tidak dapat terhubung ke npm registry.");
        break;
      default:
        console.log(`Error: ${result.error.message}`);
    }
  }
  console.log();
}

// ─────────────────────────────────────────────
// 5. Membandingkan beberapa packages sekaligus
// ─────────────────────────────────────────────
async function contohBandingkanPackages() {
  console.log("=== Membandingkan packages (axios vs ky vs got) ===");

  const packages = ["axios", "ky", "got"];
  const results = await Promise.all(packages.map((name) => getNpmPackage(name)));

  for (const result of results) {
    if (!result.success) {
      console.log(`  ✗ ${result.error.message}`);
      continue;
    }
    const pkg = result.data;
    const weekly = pkg.downloads?.weekly.toLocaleString() ?? "N/A";
    console.log(`  ${pkg.name}@${pkg.latestVersion} — ${weekly} unduhan/minggu`);
  }
  console.log();
}

// ─────────────────────────────────────────────
// Jalankan semua contoh
// ─────────────────────────────────────────────
async function main() {
  await contohGetPackage();
  await contohGetScopedPackage();
  await contohSearchPackages();
  await contohPackageTidakAda();
  await contohBandingkanPackages();
}

main().catch(console.error);
