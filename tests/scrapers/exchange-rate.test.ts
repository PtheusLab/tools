import { describe, it, expect } from "vitest";
import {
  getExchangeRates,
  convertCurrency,
  getSupportedCurrencies,
} from "../../src/scrapers/exchange-rate.js";

describe("Exchange Rate Scraper", () => {
  describe("getExchangeRates", () => {
    it("returns exchange rates for USD base", async () => {
      const result = await getExchangeRates("USD");

      expect(result.success).toBe(true);
      if (!result.success) return;

      expect(result.data.base).toBe("USD");
      expect(typeof result.data.rates).toBe("object");
      expect(Object.keys(result.data.rates).length).toBeGreaterThan(50);
    });

    it("returns rates with the base currency itself at 1.0", async () => {
      const result = await getExchangeRates("USD");

      expect(result.success).toBe(true);
      if (!result.success) return;

      expect(result.data.rates["USD"]).toBe(1);
    });

    it("contains common currencies in the rates", async () => {
      const result = await getExchangeRates("USD");

      expect(result.success).toBe(true);
      if (!result.success) return;

      const rates = result.data.rates;
      expect(rates["EUR"]).toBeDefined();
      expect(rates["GBP"]).toBeDefined();
      expect(rates["JPY"]).toBeDefined();
      expect(rates["IDR"]).toBeDefined();
    });

    it("returns numeric values for all rates", async () => {
      const result = await getExchangeRates("USD");

      expect(result.success).toBe(true);
      if (!result.success) return;

      for (const [, rate] of Object.entries(result.data.rates)) {
        expect(typeof rate).toBe("number");
        expect(rate).toBeGreaterThan(0);
      }
    });

    it("works with EUR as base currency", async () => {
      const result = await getExchangeRates("EUR");

      expect(result.success).toBe(true);
      if (!result.success) return;

      expect(result.data.base).toBe("EUR");
      expect(result.data.rates["EUR"]).toBe(1);
      expect(result.data.rates["USD"]).toBeDefined();
    });

    it("handles lowercase currency codes", async () => {
      const result = await getExchangeRates("usd");

      expect(result.success).toBe(true);
      if (!result.success) return;

      expect(result.data.base).toBe("USD");
    });

    it("returns a date string", async () => {
      const result = await getExchangeRates("USD");

      expect(result.success).toBe(true);
      if (!result.success) return;

      expect(typeof result.data.date).toBe("string");
      expect(result.data.date.length).toBeGreaterThan(0);
    });
  });

  describe("convertCurrency", () => {
    it("converts USD to IDR correctly", async () => {
      const result = await convertCurrency(100, "USD", "IDR");

      expect(result.success).toBe(true);
      if (!result.success) return;

      expect(result.data.from).toBe("USD");
      expect(result.data.to).toBe("IDR");
      expect(result.data.amount).toBe(100);
      expect(result.data.result).toBeGreaterThan(1_000_000);
      expect(typeof result.data.rate).toBe("number");
    });

    it("returns the correct result as amount * rate", async () => {
      const result = await convertCurrency(50, "USD", "EUR");

      expect(result.success).toBe(true);
      if (!result.success) return;

      expect(result.data.result).toBeCloseTo(
        result.data.amount * result.data.rate,
        10
      );
    });

    it("returns NOT_FOUND for an invalid target currency", async () => {
      const result = await convertCurrency(100, "USD", "INVALID_CURRENCY_XYZ");

      expect(result.success).toBe(false);
      if (result.success) return;

      expect(result.error.code).toBe("NOT_FOUND");
    });

    it("handles lowercase currency codes", async () => {
      const result = await convertCurrency(1, "usd", "eur");

      expect(result.success).toBe(true);
      if (!result.success) return;

      expect(result.data.from).toBe("USD");
      expect(result.data.to).toBe("EUR");
    });

    it("converts 0 amount without error", async () => {
      const result = await convertCurrency(0, "USD", "EUR");

      expect(result.success).toBe(true);
      if (!result.success) return;

      expect(result.data.result).toBe(0);
    });
  });

  describe("getSupportedCurrencies", () => {
    it("returns a list of currency codes", async () => {
      const result = await getSupportedCurrencies();

      expect(result.success).toBe(true);
      if (!result.success) return;

      expect(Array.isArray(result.data)).toBe(true);
      expect(result.data.length).toBeGreaterThan(50);
    });

    it("returns currencies in sorted order", async () => {
      const result = await getSupportedCurrencies();

      expect(result.success).toBe(true);
      if (!result.success) return;

      const sorted = [...result.data].sort();
      expect(result.data).toEqual(sorted);
    });

    it("contains well-known currencies", async () => {
      const result = await getSupportedCurrencies();

      expect(result.success).toBe(true);
      if (!result.success) return;

      const currencies = result.data;
      expect(currencies).toContain("USD");
      expect(currencies).toContain("EUR");
      expect(currencies).toContain("GBP");
      expect(currencies).toContain("JPY");
      expect(currencies).toContain("IDR");
      expect(currencies).toContain("SGD");
    });

    it("returns strings as currency codes", async () => {
      const result = await getSupportedCurrencies();

      expect(result.success).toBe(true);
      if (!result.success) return;

      for (const code of result.data) {
        expect(typeof code).toBe("string");
        expect(code.length).toBeGreaterThanOrEqual(3);
      }
    });
  });
});
