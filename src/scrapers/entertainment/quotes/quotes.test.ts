import { describe, it, expect } from "vitest";
import { getRandomQuote, getQuoteOfTheDay, getRandomQuotes } from "./index.js";

// ZenQuotes' free tier caps requests at 5 per 30 seconds. Since this suite
// makes several calls in quick succession, a RATE_LIMITED result is treated
// as an acceptable (non-failing) outcome rather than a scraper bug.
function expectSuccessOrRateLimited<T>(
  result: { success: true; data: T } | { success: false; error: { code: string } }
) {
  if (!result.success) {
    expect(result.error.code).toBe("RATE_LIMITED");
  }
  return result.success;
}

describe("Quotes Scraper", () => {
  describe("getRandomQuote", () => {
    it("returns a random quote with required fields", async () => {
      const result = await getRandomQuote();

      if (!expectSuccessOrRateLimited(result)) return;
      if (!result.success) return;

      expect(typeof result.data.quote).toBe("string");
      expect(result.data.quote.length).toBeGreaterThan(0);
      expect(typeof result.data.author).toBe("string");
      expect(result.data.author.length).toBeGreaterThan(0);
    });
  });

  describe("getQuoteOfTheDay", () => {
    it("returns the quote of the day", async () => {
      const result = await getQuoteOfTheDay();

      if (!expectSuccessOrRateLimited(result)) return;
      if (!result.success) return;

      expect(typeof result.data.quote).toBe("string");
      expect(result.data.quote.length).toBeGreaterThan(0);
      expect(typeof result.data.author).toBe("string");
    });

    it("returns the same quote across multiple calls on the same day", async () => {
      const first = await getQuoteOfTheDay();
      const second = await getQuoteOfTheDay();

      if (!first.success || !second.success) return;

      expect(first.data.quote).toBe(second.data.quote);
    });
  });

  describe("getRandomQuotes", () => {
    it("returns an array of quotes", async () => {
      const result = await getRandomQuotes();

      if (!expectSuccessOrRateLimited(result)) return;
      if (!result.success) return;

      expect(Array.isArray(result.data)).toBe(true);
      expect(result.data.length).toBeGreaterThan(0);

      const first = result.data[0];
      expect(first).toBeDefined();
      if (!first) return;

      expect(typeof first.quote).toBe("string");
      expect(typeof first.author).toBe("string");
    });
  });
});
