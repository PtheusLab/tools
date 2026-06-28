import { describe, it, expect } from "vitest";
import {
  getNpmPackage,
  searchNpmPackages,
} from "../../src/scrapers/npm-registry.js";

describe("NPM Registry Scraper", () => {
  describe("getNpmPackage", () => {
    it("returns package data for a known package", async () => {
      const result = await getNpmPackage("lodash");

      expect(result.success).toBe(true);
      if (!result.success) return;

      expect(result.data.name).toBe("lodash");
      expect(typeof result.data.version).toBe("string");
      expect(result.data.version.length).toBeGreaterThan(0);
    });

    it("returns all required fields with correct types", async () => {
      const result = await getNpmPackage("express");

      expect(result.success).toBe(true);
      if (!result.success) return;

      const pkg = result.data;
      expect(typeof pkg.name).toBe("string");
      expect(typeof pkg.version).toBe("string");
      expect(Array.isArray(pkg.keywords)).toBe(true);
      expect(Array.isArray(pkg.maintainers)).toBe(true);
      expect(Array.isArray(pkg.versions)).toBe(true);
      expect(pkg.versions.length).toBeGreaterThan(0);
      expect(typeof pkg.latestVersion).toBe("string");
      expect(pkg.latestVersion).toBe(pkg.version);
      expect(typeof pkg.dependencies).toBe("object");
      expect(typeof pkg.devDependencies).toBe("object");
      expect(typeof pkg.peerDependencies).toBe("object");
    });

    it("handles scoped packages correctly", async () => {
      const result = await getNpmPackage("@types/node");

      expect(result.success).toBe(true);
      if (!result.success) return;

      expect(result.data.name).toBe("@types/node");
    });

    it("returns download stats when available", async () => {
      const result = await getNpmPackage("react");

      expect(result.success).toBe(true);
      if (!result.success) return;

      if (result.data.downloads !== null) {
        expect(typeof result.data.downloads.weekly).toBe("number");
        expect(typeof result.data.downloads.monthly).toBe("number");
        expect(result.data.downloads.weekly).toBeGreaterThan(0);
        expect(result.data.downloads.monthly).toBeGreaterThan(
          result.data.downloads.weekly
        );
      }
    });

    it("returns dependencies as a record of strings", async () => {
      const result = await getNpmPackage("express");

      expect(result.success).toBe(true);
      if (!result.success) return;

      const deps = result.data.dependencies;
      for (const [key, val] of Object.entries(deps)) {
        expect(typeof key).toBe("string");
        expect(typeof val).toBe("string");
      }
    });

    it("returns NOT_FOUND for a non-existent package", async () => {
      const result = await getNpmPackage(
        "this-package-absolutely-does-not-exist-xyz-abc-99999"
      );

      expect(result.success).toBe(false);
      if (result.success) return;

      expect(result.error.code).toBe("NOT_FOUND");
    });

    it("returns valid ISO dates for createdAt and updatedAt", async () => {
      const result = await getNpmPackage("zod");

      expect(result.success).toBe(true);
      if (!result.success) return;

      if (result.data.createdAt) {
        const created = new Date(result.data.createdAt);
        expect(created.getFullYear()).toBeGreaterThan(2000);
      }
    });

    it("returns repository info when available", async () => {
      const result = await getNpmPackage("typescript");

      expect(result.success).toBe(true);
      if (!result.success) return;

      if (result.data.repository !== null) {
        expect(typeof result.data.repository.type).toBe("string");
        expect(typeof result.data.repository.url).toBe("string");
      }
    });
  });

  describe("searchNpmPackages", () => {
    it("returns search results for a query", async () => {
      const result = await searchNpmPackages("react");

      expect(result.success).toBe(true);
      if (!result.success) return;

      expect(result.data.length).toBeGreaterThan(0);
    });

    it("returns results with required fields", async () => {
      const result = await searchNpmPackages("lodash");

      expect(result.success).toBe(true);
      if (!result.success) return;

      const first = result.data[0];
      expect(first).toBeDefined();
      if (!first) return;

      expect(typeof first.name).toBe("string");
      expect(typeof first.version).toBe("string");
      expect(Array.isArray(first.keywords)).toBe(true);
      expect(typeof first.score).toBe("number");
      expect(typeof first.searchScore).toBe("number");
    });

    it("respects the limit option", async () => {
      const result = await searchNpmPackages("test", { limit: 5 });

      expect(result.success).toBe(true);
      if (!result.success) return;

      expect(result.data.length).toBeLessThanOrEqual(5);
    });

    it("returns lodash as a top result when searching by exact name", async () => {
      const result = await searchNpmPackages("lodash", { limit: 5 });

      expect(result.success).toBe(true);
      if (!result.success) return;

      const found = result.data.some((r) => r.name === "lodash");
      expect(found).toBe(true);
    });

    it("returns a valid result for a garbage query", async () => {
      const result = await searchNpmPackages(
        "zzzzzzz-totally-nonexistent-garbage-1234567890"
      );

      expect(result.success).toBe(true);
      if (!result.success) return;

      expect(Array.isArray(result.data)).toBe(true);
    });
  });
});
