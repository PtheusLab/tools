import { describe, it, expect } from "vitest";
import { getPypiPackage } from "./index.js";

describe("PyPI Registry Scraper", () => {
  describe("getPypiPackage", () => {
    it("returns package data for a known package", async () => {
      const result = await getPypiPackage("requests");

      expect(result.success).toBe(true);
      if (!result.success) return;

      expect(result.data.name).toBe("requests");
      expect(typeof result.data.version).toBe("string");
      expect(result.data.version.length).toBeGreaterThan(0);
    });

    it("returns all required fields with correct types", async () => {
      const result = await getPypiPackage("flask");

      expect(result.success).toBe(true);
      if (!result.success) return;

      const pkg = result.data;
      expect(typeof pkg.name).toBe("string");
      expect(typeof pkg.version).toBe("string");
      expect(typeof pkg.latestVersion).toBe("string");
      expect(pkg.version).toBe(pkg.latestVersion);
      expect(Array.isArray(pkg.keywords)).toBe(true);
      expect(Array.isArray(pkg.classifiers)).toBe(true);
      expect(Array.isArray(pkg.dependencies)).toBe(true);
      expect(Array.isArray(pkg.versions)).toBe(true);
      expect(pkg.versions.length).toBeGreaterThan(0);
    });

    it("returns author info when available", async () => {
      const result = await getPypiPackage("requests");

      expect(result.success).toBe(true);
      if (!result.success) return;

      if (result.data.author !== null) {
        expect(typeof result.data.author.name).toBe("string");
      }
    });

    it("returns requiresPython when set", async () => {
      const result = await getPypiPackage("black");

      expect(result.success).toBe(true);
      if (!result.success) return;

      if (result.data.requiresPython !== null) {
        expect(typeof result.data.requiresPython).toBe("string");
      }
    });

    it("returns dependencies as an array of strings", async () => {
      const result = await getPypiPackage("flask");

      expect(result.success).toBe(true);
      if (!result.success) return;

      for (const dep of result.data.dependencies) {
        expect(typeof dep).toBe("string");
      }
    });

    it("returns NOT_FOUND for a non-existent package", async () => {
      const result = await getPypiPackage(
        "this-package-absolutely-does-not-exist-xyz-abc-99999"
      );

      expect(result.success).toBe(false);
      if (result.success) return;

      expect(result.error.code).toBe("NOT_FOUND");
    });

    it("returns repository url when available", async () => {
      const result = await getPypiPackage("requests");

      expect(result.success).toBe(true);
      if (!result.success) return;

      if (result.data.repository !== null) {
        expect(typeof result.data.repository).toBe("string");
        expect(result.data.repository.startsWith("http")).toBe(true);
      }
    });
  });
});
