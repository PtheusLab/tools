import { describe, it, expect } from "vitest";
import { getWikiquotePage, searchWikiquote } from "./index.js";

describe("Wikiquote Scraper", () => {
  describe("getWikiquotePage", () => {
    it("returns quotes for a known person", async () => {
      const result = await getWikiquotePage("Albert Einstein");

      expect(result.success).toBe(true);
      if (!result.success) return;

      expect(result.data.title).toBe("Albert Einstein");
      expect(Array.isArray(result.data.quotes)).toBe(true);
      expect(result.data.quotes.length).toBeGreaterThan(0);
    });

    it("returns all required fields", async () => {
      const result = await getWikiquotePage("Mark Twain");

      expect(result.success).toBe(true);
      if (!result.success) return;

      const page = result.data;
      expect(typeof page.pageId).toBe("number");
      expect(typeof page.title).toBe("string");
      expect(typeof page.url).toBe("string");
      expect(page.url.startsWith("https://en.wikiquote.org")).toBe(true);
      expect(page.lang).toBe("en");
      expect(Array.isArray(page.quotes)).toBe(true);
    });

    it("returns sections with title and quotes array", async () => {
      const result = await getWikiquotePage("Albert Einstein");

      expect(result.success).toBe(true);
      if (!result.success) return;

      for (const section of result.data.quotes) {
        expect(typeof section.title).toBe("string");
        expect(Array.isArray(section.quotes)).toBe(true);
        for (const quote of section.quotes) {
          expect(typeof quote).toBe("string");
          expect(quote.length).toBeGreaterThan(0);
        }
      }
    });

    it("returns quotes with meaningful content", async () => {
      const result = await getWikiquotePage("Oscar Wilde");

      expect(result.success).toBe(true);
      if (!result.success) return;

      const allQuotes = result.data.quotes.flatMap((s) => s.quotes);
      expect(allQuotes.length).toBeGreaterThan(0);
      expect(allQuotes[0]!.length).toBeGreaterThan(10);
    });

    it("supports non-English language", async () => {
      const result = await getWikiquotePage("Albert Einstein", { lang: "de" });

      expect(result.success).toBe(true);
      if (!result.success) return;

      expect(result.data.lang).toBe("de");
      expect(result.data.url.startsWith("https://de.wikiquote.org")).toBe(true);
    });

    it("returns NOT_FOUND for a non-existent page", async () => {
      const result = await getWikiquotePage(
        "ThisPersonAbsolutelyDoesNotExistXyzAbc99999"
      );

      expect(result.success).toBe(false);
      if (result.success) return;

      expect(result.error.code).toBe("NOT_FOUND");
    });
  });

  describe("searchWikiquote", () => {
    it("returns results for a query", async () => {
      const result = await searchWikiquote("Einstein");

      expect(result.success).toBe(true);
      if (!result.success) return;

      expect(result.data.length).toBeGreaterThan(0);
    });

    it("returns results with required fields", async () => {
      const result = await searchWikiquote("Shakespeare");

      expect(result.success).toBe(true);
      if (!result.success) return;

      const first = result.data[0]!;
      expect(typeof first.pageId).toBe("number");
      expect(typeof first.title).toBe("string");
      expect(typeof first.snippet).toBe("string");
      expect(first.url.startsWith("https://en.wikiquote.org")).toBe(true);
    });

    it("respects the limit option", async () => {
      const result = await searchWikiquote("science", { limit: 3 });

      expect(result.success).toBe(true);
      if (!result.success) return;

      expect(result.data.length).toBeLessThanOrEqual(3);
    });

    it("snippet does not contain HTML tags", async () => {
      const result = await searchWikiquote("philosophy");

      expect(result.success).toBe(true);
      if (!result.success) return;

      for (const item of result.data) {
        expect(item.snippet).not.toMatch(/<[^>]+>/);
      }
    });
  });
});
