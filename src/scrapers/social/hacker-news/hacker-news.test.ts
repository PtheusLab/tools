import { describe, it, expect } from "vitest";
import {
  getHackerNewsItem,
  getHackerNewsFeed,
  getHackerNewsMaxItem,
} from "./index.js";

describe("Hacker News Scraper", () => {
  describe("getHackerNewsItem", () => {
    it("returns a known story item by ID", async () => {
      const result = await getHackerNewsItem(1);

      expect(result.success).toBe(true);
      if (!result.success) return;

      expect(result.data.id).toBe(1);
      expect(typeof result.data.by).toBe("string");
    });

    it("returns all expected fields on a story item", async () => {
      const result = await getHackerNewsItem(8863);

      expect(result.success).toBe(true);
      if (!result.success) return;

      const item = result.data;
      expect(typeof item.id).toBe("number");
      expect(typeof item.type).toBe("string");
      expect(Array.isArray(item.kids)).toBe(true);
      expect(typeof item.deleted).toBe("boolean");
      expect(typeof item.dead).toBe("boolean");
    });

    it("returns title for a story item", async () => {
      const result = await getHackerNewsItem(8863);

      expect(result.success).toBe(true);
      if (!result.success) return;

      expect(typeof result.data.title).toBe("string");
      expect((result.data.title?.length ?? 0)).toBeGreaterThan(0);
    });

    it("returns a score that is a number", async () => {
      const result = await getHackerNewsItem(8863);

      expect(result.success).toBe(true);
      if (!result.success) return;

      expect(typeof result.data.score).toBe("number");
    });
  });

  describe("getHackerNewsFeed", () => {
    it("returns top stories feed by default", async () => {
      const result = await getHackerNewsFeed("top", { limit: 10 });

      expect(result.success).toBe(true);
      if (!result.success) return;

      expect(result.data.length).toBeGreaterThan(0);
      expect(result.data.length).toBeLessThanOrEqual(10);
    });

    it("returns stories with required fields", async () => {
      const result = await getHackerNewsFeed("top", { limit: 5 });

      expect(result.success).toBe(true);
      if (!result.success) return;

      for (const story of result.data) {
        expect(typeof story.id).toBe("number");
        expect(typeof story.title).toBe("string");
        expect(story.title.length).toBeGreaterThan(0);
        expect(typeof story.by).toBe("string");
        expect(typeof story.score).toBe("number");
        expect(typeof story.time).toBe("number");
        expect(Array.isArray(story.kids)).toBe(true);
      }
    });

    it("returns new stories feed", async () => {
      const result = await getHackerNewsFeed("new", { limit: 5 });

      expect(result.success).toBe(true);
      if (!result.success) return;

      expect(result.data.length).toBeGreaterThan(0);
    });

    it("returns best stories feed", async () => {
      const result = await getHackerNewsFeed("best", { limit: 5 });

      expect(result.success).toBe(true);
      if (!result.success) return;

      expect(result.data.length).toBeGreaterThan(0);
    });

    it("returns ask stories feed", async () => {
      const result = await getHackerNewsFeed("ask", { limit: 5 });

      expect(result.success).toBe(true);
      if (!result.success) return;

      expect(result.data.length).toBeGreaterThan(0);
    });

    it("respects the limit option", async () => {
      const result = await getHackerNewsFeed("top", { limit: 3 });

      expect(result.success).toBe(true);
      if (!result.success) return;

      expect(result.data.length).toBeLessThanOrEqual(3);
    });

    it("returns stories with valid unix timestamps", async () => {
      const result = await getHackerNewsFeed("top", { limit: 5 });

      expect(result.success).toBe(true);
      if (!result.success) return;

      const TEN_YEARS_AGO = Date.now() / 1000 - 10 * 365 * 24 * 60 * 60;
      const NOW = Date.now() / 1000;

      for (const story of result.data) {
        expect(story.time).toBeGreaterThan(TEN_YEARS_AGO);
        expect(story.time).toBeLessThanOrEqual(NOW);
      }
    });
  });

  describe("getHackerNewsMaxItem", () => {
    it("returns the current max item ID as a number", async () => {
      const result = await getHackerNewsMaxItem();

      expect(result.success).toBe(true);
      if (!result.success) return;

      expect(typeof result.data).toBe("number");
      expect(result.data).toBeGreaterThan(38_000_000);
    });
  });
});
