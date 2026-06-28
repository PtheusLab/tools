/**
 * examples/exchange-rate.ts
 *
 * Contoh penggunaan Exchange Rate scrapers dari @ptheus/tools.
 * Jalankan: npx tsx examples/exchange-rate.ts
 */

import {
  getExchangeRates,
  convertCurrency,
  getSupportedCurrencies,
} from "../src/index.js";

// ─────────────────────────────────────────────
// 1. Fetch semua nilai tukar dari satu mata uang
// ─────────────────────────────────────────────
async function contohGetExchangeRates() {
  console.log("=== getExchangeRates (base: USD) ===");

  const result = await getExchangeRates("USD");

  if (!result.success) {
    console.error("Gagal:", result.error.code, "-", result.error.message);
    return;
  }

  const { base, date, rates } = result.data;
  console.log(`Mata uang dasar : ${base}`);
  console.log(`Update terakhir : ${date}`);
  console.log(`Jumlah mata uang: ${Object.keys(rates).length}`);
  console.log();

  // Tampilkan beberapa mata uang populer
  const populer = ["EUR", "GBP", "JPY", "IDR", "SGD", "AUD", "CAD"];
  console.log("Nilai tukar populer:");
  for (const kode of populer) {
    if (rates[kode] !== undefined) {
      console.log(`  1 ${base} = ${rates[kode].toLocaleString("id-ID")} ${kode}`);
    }
  }
  console.log();
}

// ─────────────────────────────────────────────
// 2. Konversi mata uang
// ─────────────────────────────────────────────
async function contohConvertCurrency() {
  console.log("=== convertCurrency ===");

  // USD → IDR
  const result1 = await convertCurrency(100, "USD", "IDR");
  if (result1.success) {
    const c = result1.data;
    console.log(
      `${c.amount} ${c.from} = ${c.result.toLocaleString("id-ID", { maximumFractionDigits: 2 })} ${c.to}`
    );
    console.log(`  Kurs: 1 ${c.from} = ${c.rate.toLocaleString("id-ID")} ${c.to}`);
  } else {
    console.error("Gagal:", result1.error.message);
  }

  // EUR → JPY
  const result2 = await convertCurrency(250, "EUR", "JPY");
  if (result2.success) {
    const c = result2.data;
    console.log(
      `${c.amount} ${c.from} = ${c.result.toLocaleString("ja-JP", { maximumFractionDigits: 0 })} ${c.to}`
    );
  } else {
    console.error("Gagal:", result2.error.message);
  }

  // SGD → IDR
  const result3 = await convertCurrency(1000, "SGD", "IDR");
  if (result3.success) {
    const c = result3.data;
    console.log(
      `${c.amount} ${c.from} = ${c.result.toLocaleString("id-ID", { maximumFractionDigits: 0 })} ${c.to}`
    );
  } else {
    console.error("Gagal:", result3.error.message);
  }

  console.log();
}

// ─────────────────────────────────────────────
// 3. Konversi beberapa mata uang sekaligus
// ─────────────────────────────────────────────
async function contohKonversiGanda() {
  console.log("=== Konversi ganda: 1 USD ke banyak mata uang ===");

  const targetCurrencies = ["IDR", "EUR", "JPY", "GBP", "SGD", "MYR", "THB"];

  const results = await Promise.all(
    targetCurrencies.map((to) => convertCurrency(1, "USD", to))
  );

  for (const result of results) {
    if (!result.success) {
      console.error(`  ✗ ${result.error.message}`);
      continue;
    }
    const c = result.data;
    console.log(
      `  1 USD = ${c.result.toLocaleString("id-ID", { maximumFractionDigits: 4 })} ${c.to}`
    );
  }
  console.log();
}

// ─────────────────────────────────────────────
// 4. Daftar semua mata uang yang didukung
// ─────────────────────────────────────────────
async function contohGetSupportedCurrencies() {
  console.log("=== getSupportedCurrencies ===");

  const result = await getSupportedCurrencies();

  if (!result.success) {
    console.error("Gagal:", result.error.code, "-", result.error.message);
    return;
  }

  const currencies = result.data;
  console.log(`Total mata uang didukung: ${currencies.length}`);
  console.log(`Contoh (10 pertama): ${currencies.slice(0, 10).join(", ")}`);
  console.log();
}

// ─────────────────────────────────────────────
// 5. Error handling — mata uang tidak valid
// ─────────────────────────────────────────────
async function contohMataUangTidakValid() {
  console.log("=== Error handling: mata uang tidak valid ===");

  const result = await convertCurrency(100, "USD", "XYZ");

  if (!result.success) {
    switch (result.error.code) {
      case "NOT_FOUND":
        console.log(`Mata uang tidak dikenali: ${result.error.message}`);
        break;
      case "NETWORK_ERROR":
        console.log("Tidak dapat terhubung ke exchange rate API.");
        break;
      default:
        console.log(`Error: ${result.error.message}`);
    }
  }
  console.log();
}

// ─────────────────────────────────────────────
// 6. Kalkulator konversi interaktif sederhana
// ─────────────────────────────────────────────
async function contohKalkulatorSederhana() {
  console.log("=== Kalkulator konversi (contoh hardcode) ===");

  // Simulasi: pengguna ingin tahu berapa IDR yang dibutuhkan untuk beli barang $499
  const hargaUSD = 499;
  const result = await convertCurrency(hargaUSD, "USD", "IDR");

  if (result.success) {
    const c = result.data;
    const formatted = c.result.toLocaleString("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    });
    console.log(`Harga $${hargaUSD} USD setara dengan ${formatted}`);
    console.log(`(kurs per ${c.date})`);
  } else {
    console.error("Gagal:", result.error.message);
  }
  console.log();
}

// ─────────────────────────────────────────────
// Jalankan semua contoh
// ─────────────────────────────────────────────
async function main() {
  await contohGetExchangeRates();
  await contohConvertCurrency();
  await contohKonversiGanda();
  await contohGetSupportedCurrencies();
  await contohMataUangTidakValid();
  await contohKalkulatorSederhana();
}

main().catch(console.error);
