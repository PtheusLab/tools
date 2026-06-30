import { describe, it, expect } from "vitest";
import {
  getWikipediaSummary,
  searchWikipedia,
  getWikipediaArticle,
} from "./index.js";

describe("Wikipedia Scraper", () => {
  describe("getWikipediaSummary", () => {
    it("returns a summary for a well-known article", async () => {
      const result = await getWikipediaSummary("JavaScript");

      expect(result.success).toBe(true);
      if (!result.success) return;

      expect(result.data.title).toBe("JavaScript");
      expect(result.data.pageId).toBeGreaterThan(0);
      expect(result.data.extract.length).toBeGreaterThan(0);
      expect(result.data.url).toContain("wikipedia.org");
      expect(result.data.lang).toBe("en");
    });

    it("returns all expected fields", async () => {
      const result = await getWikipediaSummary("TypeScript");

      expect(result.success).toBe(true);
      if (!result.success) return;

      const s = result.data;
      expect(typeof s.pageId).toBe("number");
      expect(typeof s.title).toBe("string");
      expect(typeof s.url).toBe("string");
      expect(typeof s.extract).toBe("string");
      expect(s.extract.length).toBeGreaterThan(0);
      expect(typeof s.lang).toBe("string");
      // thumbnailUrl is string or null
      expect(s.thumbnailUrl === null || typeof s.thumbnailUrl === "string").toBe(true);
    });

    it("returns a summary in a non-English language", async () => {
      const result = await getWikipediaSummary("Python", { lang: "id" });

      expect(result.success).toBe(true);
      if (!result.success) return;

      expect(result.data.url).toContain("id.wikipedia.org");
    });

    it("returns NOT_FOUND for a non-existent article", async () => {
      const result = await getWikipediaSummary(
        "XxNonExistentArticle999ZzZzZzZz"
      );

      expect(result.success).toBe(false);
      if (result.success) return;

      expect(result.error.code).toBe("NOT_FOUND");
    });
  });

  describe("searchWikipedia", () => {
    it("returns results for a basic query", async () => {
      const result = await searchWikipedia("Node.js runtime");

      expect(result.success).toBe(true);
      if (!result.success) return;

      expect(result.data.length).toBeGreaterThan(0);
    });

    it("returns results with required fields", async () => {
      const result = await searchWikipedia("open source software", {
        limit: 5,
      });

      expect(result.success).toBe(true);
      if (!result.success) return;

      for (const item of result.data) {
        expect(typeof item.pageId).toBe("number");
        expect(typeof item.title).toBe("string");
        expect(item.title.length).toBeGreaterThan(0);
        expect(typeof item.snippet).toBe("string");
        expect(typeof item.url).toBe("string");
        expect(item.url).toContain("wikipedia.org");
        expect(typeof item.wordCount).toBe("number");
        expect(typeof item.size).toBe("number");
        expect(typeof item.lastEdited).toBe("string");
      }
    });

    it("respects the limit option", async () => {
      const result = await searchWikipedia("programming language", {
        limit: 3,
      });

      expect(result.success).toBe(true);
      if (!result.success) return;

      expect(result.data.length).toBeLessThanOrEqual(3);
    });

    it("returns results in the specified language", async () => {
      const result = await searchWikipedia("bahasa pemrograman", {
        lang: "id",
        limit: 5,
      });

      expect(result.success).toBe(true);
      if (!result.success) return;

      expect(result.data.length).toBeGreaterThan(0);
      for (const item of result.data) {
        expect(item.url).toContain("id.wikipedia.org");
      }
    });

    it("snippet does not contain HTML tags", async () => {
      const result = await searchWikipedia("Linux kernel");

      expect(result.success).toBe(true);
      if (!result.success) return;

      for (const item of result.data) {
        expect(item.snippet).not.toMatch(/<[^>]+>/);
      }
    });
  });

  describe("getWikipediaArticle", () => {
    it("returns a full article with sections", async () => {
      const result = await getWikipediaArticle("Rust (programming language)");

      expect(result.success).toBe(true);
      if (!result.success) return;

      const article = result.data;
      expect(typeof article.pageId).toBe("number");
      expect(typeof article.title).toBe("string");
      expect(typeof article.url).toBe("string");
      expect(article.url).toContain("wikipedia.org");
      expect(typeof article.plainText).toBe("string");
      expect(article.plainText.length).toBeGreaterThan(0);
      expect(Array.isArray(article.sections)).toBe(true);
      expect(article.sections.length).toBeGreaterThan(0);
    });

    it("sections have required fields", async () => {
      const result = await getWikipediaArticle("Python (programming language)");

      expect(result.success).toBe(true);
      if (!result.success) return;

      for (const section of result.data.sections) {
        expect(typeof section.title).toBe("string");
        expect(typeof section.level).toBe("number");
        expect(typeof section.content).toBe("string");
      }
    });

    it("first section is the lead (empty title)", async () => {
      const result = await getWikipediaArticle("TypeScript");

      expect(result.success).toBe(true);
      if (!result.success) return;

      const lead = result.data.sections[0];
      expect(lead).toBeDefined();
      expect(lead.title).toBe("");
      expect(lead.content.length).toBeGreaterThan(0);
    });

    it("returns NOT_FOUND for a non-existent article", async () => {
      const result = await getWikipediaArticle(
        "XxNonExistentArticle999ZzZzZzZz"
      );

      expect(result.success).toBe(false);
      if (result.success) return;

      expect(["NOT_FOUND", "PARSE_ERROR", "VALIDATION_ERROR"]).toContain(
        result.error.code
      );
    });
  });
});
