import { describe, it, expect, vi, beforeEach } from "vitest";
import { getRandomQuote, getQuoteOfTheDay, getRandomQuotes } from "./index.js";

const randomQuoteResponse = [
  {
    q: "The only way to do great work is to love what you do.",
    a: "Steve Jobs",
    h: "<blockquote>&ldquo;The only way to do great work is to love what you do.&rdquo; &mdash; <footer>Steve Jobs</footer></blockquote>",
  },
];

const quoteOfTheDayResponse = [
  {
    q: "Life is what happens when you're busy making other plans.",
    a: "John Lennon",
    h: "<blockquote>&ldquo;Life is what happens when you're busy making other plans.&rdquo; &mdash; <footer>John Lennon</footer></blockquote>",
  },
];

const quotesListResponse = [
  { q: "Quote one.", a: "Author One" },
  { q: "Quote two.", a: "Author Two" },
  { q: "Quote three.", a: "Author Three" },
];

vi.mock("ofetch", () => ({
  ofetch: vi.fn((url: string) => {
    if (url.includes("/random")) {
      return randomQuoteResponse;
    }
    if (url.includes("/today")) {
      return quoteOfTheDayResponse;
    }
    if (url.includes("/quotes")) {
      return quotesListResponse;
    }
    throw new Error(`Unexpected URL: ${url}`);
  }),
}));

beforeEach(() => {
  vi.clearAllMocks();
});

describe("Quotes Scraper", () => {
  describe("getRandomQuote", () => {
    it("returns a random quote with required fields", async () => {
      const result = await getRandomQuote();

      expect(result.success).toBe(true);
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

      expect(result.success).toBe(true);
      if (!result.success) return;

      expect(typeof result.data.quote).toBe("string");
      expect(result.data.quote.length).toBeGreaterThan(0);
      expect(typeof result.data.author).toBe("string");
    });

    it("returns the same quote across multiple calls on the same day", async () => {
      const first = await getQuoteOfTheDay();
      const second = await getQuoteOfTheDay();

      expect(first.success).toBe(true);
      expect(second.success).toBe(true);
      if (!first.success || !second.success) return;

      expect(first.data.quote).toBe(second.data.quote);
    });
  });

  describe("getRandomQuotes", () => {
    it("returns an array of quotes", async () => {
      const result = await getRandomQuotes();

      expect(result.success).toBe(true);
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

  describe("error handling", () => {
    it("returns RATE_LIMITED when the API responds with an error body", async () => {
      const { ofetch } = await import("ofetch");
      vi.mocked(ofetch).mockImplementationOnce(() =>
        Promise.resolve({ Error: "Too many requests. Obtain an auth key for unlimited access." })
      );

      const result = await getRandomQuote();

      expect(result.success).toBe(false);
      if (result.success) return;

      expect(result.error.code).toBe("RATE_LIMITED");
    });

    it("returns RATE_LIMITED when the request throws a 429", async () => {
      const { ofetch } = await import("ofetch");
      vi.mocked(ofetch).mockImplementationOnce(() => {
        const error = new Error("Request failed with status code 429") as Error & {
          statusCode: number;
        };
        error.statusCode = 429;
        throw error;
      });

      const result = await getRandomQuote();

      expect(result.success).toBe(false);
      if (result.success) return;

      expect(result.error.code).toBe("RATE_LIMITED");
    });

    it("returns VALIDATION_ERROR when the response shape is unexpected", async () => {
      const { ofetch } = await import("ofetch");
      vi.mocked(ofetch).mockImplementationOnce(() => Promise.resolve({ unexpected: "shape" }));

      const result = await getRandomQuote();

      expect(result.success).toBe(false);
      if (result.success) return;

      expect(result.error.code).toBe("VALIDATION_ERROR");
    });
  });
});
