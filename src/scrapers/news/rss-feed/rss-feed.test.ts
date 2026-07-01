import { describe, it, expect } from "vitest";
import { getRssFeed, searchNews, getTopNews } from "./index.js";

describe("RSS/News Scraper", () => {
  describe("getRssFeed", () => {
    it("parses a known public RSS feed", async () => {
      const result = await getRssFeed(
        "https://hnrss.org/frontpage"
      );

      expect(result.success).toBe(true);
      if (!result.success) return;

      expect(typeof result.data.title).toBe("string");
      expect(Array.isArray(result.data.items)).toBe(true);
      expect(result.data.items.length).toBeGreaterThan(0);
    });

    it("returns items with required fields", async () => {
      const result = await getRssFeed("https://hnrss.org/frontpage");

      expect(result.success).toBe(true);
      if (!result.success) return;

      const first = result.data.items[0];
      expect(first).toBeDefined();
      if (!first) return;

      expect(typeof first.title).toBe("string");
      expect(first.title.length).toBeGreaterThan(0);
      expect(typeof first.link).toBe("string");
      expect(first.link.length).toBeGreaterThan(0);
    });

    it("returns NETWORK_ERROR for an unreachable URL", async () => {
      const result = await getRssFeed(
        "https://this-domain-absolutely-does-not-exist-9999.invalid/feed.xml"
      );

      expect(result.success).toBe(false);
      if (result.success) return;

      expect(["NETWORK_ERROR", "NOT_FOUND", "UNKNOWN"]).toContain(
        result.error.code
      );
    });
  });

  describe("searchNews", () => {
    it("returns news items for a search query", async () => {
      const result = await searchNews("technology");

      expect(result.success).toBe(true);
      if (!result.success) return;

      expect(Array.isArray(result.data)).toBe(true);
    });

    it("respects the limit option", async () => {
      const result = await searchNews("world", { limit: 3 });

      expect(result.success).toBe(true);
      if (!result.success) return;

      expect(result.data.length).toBeLessThanOrEqual(3);
    });
  });

  describe("getTopNews", () => {
    it("returns top headlines", async () => {
      const result = await getTopNews({ limit: 5 });

      expect(result.success).toBe(true);
      if (!result.success) return;

      expect(Array.isArray(result.data)).toBe(true);
      expect(result.data.length).toBeLessThanOrEqual(5);
    });
  });
});
