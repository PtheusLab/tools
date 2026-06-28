import { describe, it, expect } from "vitest";
import {
  parseIntOrNull,
  parseFloatOrNull,
  normalizeWhitespace,
  parseKiloSuffix,
} from "../../src/utils/parse.js";
import { buildUrl } from "../../src/utils/url.js";

describe("parse utils", () => {
  describe("parseIntOrNull", () => {
    it("parses a plain integer string", () => {
      expect(parseIntOrNull("42")).toBe(42);
    });

    it("strips non-numeric characters", () => {
      expect(parseIntOrNull("1,234")).toBe(1234);
      expect(parseIntOrNull("$500")).toBe(500);
    });

    it("returns null for empty string", () => {
      expect(parseIntOrNull("")).toBeNull();
    });

    it("returns null for null input", () => {
      expect(parseIntOrNull(null)).toBeNull();
    });

    it("returns null for undefined input", () => {
      expect(parseIntOrNull(undefined)).toBeNull();
    });

    it("returns null for non-numeric string", () => {
      expect(parseIntOrNull("abc")).toBeNull();
    });
  });

  describe("parseFloatOrNull", () => {
    it("parses a float string", () => {
      expect(parseFloatOrNull("3.14")).toBeCloseTo(3.14);
    });

    it("parses an integer string as float", () => {
      expect(parseFloatOrNull("42")).toBe(42);
    });

    it("returns null for empty string", () => {
      expect(parseFloatOrNull("")).toBeNull();
    });

    it("returns null for null input", () => {
      expect(parseFloatOrNull(null)).toBeNull();
    });

    it("returns null for non-numeric string", () => {
      expect(parseFloatOrNull("abc")).toBeNull();
    });
  });

  describe("normalizeWhitespace", () => {
    it("collapses multiple spaces", () => {
      expect(normalizeWhitespace("hello   world")).toBe("hello world");
    });

    it("trims leading and trailing whitespace", () => {
      expect(normalizeWhitespace("  hello  ")).toBe("hello");
    });

    it("handles newlines and tabs", () => {
      expect(normalizeWhitespace("hello\n\tworld")).toBe("hello world");
    });

    it("returns empty string unchanged", () => {
      expect(normalizeWhitespace("")).toBe("");
    });
  });

  describe("parseKiloSuffix", () => {
    it("parses plain number", () => {
      expect(parseKiloSuffix("500")).toBe(500);
    });

    it("parses number with k suffix", () => {
      expect(parseKiloSuffix("1.5k")).toBe(1500);
    });

    it("parses uppercase K suffix", () => {
      expect(parseKiloSuffix("2K")).toBe(2000);
    });

    it("parses number with comma", () => {
      expect(parseKiloSuffix("1,500")).toBe(1500);
    });

    it("returns null for empty string", () => {
      expect(parseKiloSuffix("")).toBeNull();
    });
  });
});

describe("url utils", () => {
  describe("buildUrl", () => {
    it("builds a URL with path", () => {
      expect(buildUrl("https://example.com", "/api/test")).toBe(
        "https://example.com/api/test"
      );
    });

    it("appends query params", () => {
      const url = buildUrl("https://example.com", "/search", {
        q: "hello",
        limit: 10,
      });
      const parsed = new URL(url);
      expect(parsed.searchParams.get("q")).toBe("hello");
      expect(parsed.searchParams.get("limit")).toBe("10");
    });

    it("omits undefined params", () => {
      const url = buildUrl("https://example.com", "/search", {
        q: "hello",
        limit: undefined,
      });
      const parsed = new URL(url);
      expect(parsed.searchParams.has("limit")).toBe(false);
    });

    it("handles boolean params", () => {
      const url = buildUrl("https://example.com", "/api", { active: true });
      const parsed = new URL(url);
      expect(parsed.searchParams.get("active")).toBe("true");
    });
  });
});
