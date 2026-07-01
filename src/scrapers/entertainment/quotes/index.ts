import { z } from "zod";
import { createHttpClient, classifyFetchError, ok, err } from "../../../core/index.js";
import type { Result, ScraperOptions } from "../../../types/index.js";
import type { RandomQuote, QuoteOfTheDay } from "./types.js";

const ZEN_QUOTES_BASE = "https://zenquotes.io/api";

const quoteEntrySchema = z.object({
  q: z.string(),
  a: z.string(),
  h: z.string().optional(),
});

const quotesResponseSchema = z.array(quoteEntrySchema);

const errorResponseSchema = z.object({
  Error: z.string(),
});

function toRandomQuote(entry: z.infer<typeof quoteEntrySchema>): RandomQuote {
  return {
    quote: entry.q,
    author: entry.a,
    html: entry.h ?? null,
  };
}

function isRateLimitError(error: unknown): boolean {
  if (!(error instanceof Error)) return false;
  const statusCode = (error as { statusCode?: number }).statusCode;
  return (
    statusCode === 429 ||
    error.message.includes("429") ||
    error.message.toLowerCase().includes("too many requests")
  );
}

export async function getRandomQuote(
  options?: ScraperOptions
): Promise<Result<RandomQuote>> {
  const client = createHttpClient(options);

  try {
    const raw = await client.get<unknown>(`${ZEN_QUOTES_BASE}/random`);

    const errorParsed = errorResponseSchema.safeParse(raw);
    if (errorParsed.success) {
      return err({
        code: "RATE_LIMITED",
        message: errorParsed.data.Error,
      });
    }

    const parsed = quotesResponseSchema.safeParse(raw);

    if (!parsed.success || parsed.data.length === 0) {
      return err({
        code: "VALIDATION_ERROR",
        message: "Unexpected random quote API response shape",
        cause: parsed.success ? undefined : parsed.error,
      });
    }

    return ok(toRandomQuote(parsed.data[0] as z.infer<typeof quoteEntrySchema>));
  } catch (error) {
    if (isRateLimitError(error)) {
      return err({
        code: "RATE_LIMITED",
        message: "ZenQuotes rate limit exceeded (5 requests per 30 seconds)",
        cause: error,
      });
    }
    return err(classifyFetchError(error));
  }
}

export async function getQuoteOfTheDay(
  options?: ScraperOptions
): Promise<Result<QuoteOfTheDay>> {
  const client = createHttpClient(options);

  try {
    const raw = await client.get<unknown>(`${ZEN_QUOTES_BASE}/today`);

    const errorParsed = errorResponseSchema.safeParse(raw);
    if (errorParsed.success) {
      return err({
        code: "RATE_LIMITED",
        message: errorParsed.data.Error,
      });
    }

    const parsed = quotesResponseSchema.safeParse(raw);

    if (!parsed.success || parsed.data.length === 0) {
      return err({
        code: "VALIDATION_ERROR",
        message: "Unexpected quote of the day API response shape",
        cause: parsed.success ? undefined : parsed.error,
      });
    }

    return ok(toRandomQuote(parsed.data[0] as z.infer<typeof quoteEntrySchema>));
  } catch (error) {
    if (isRateLimitError(error)) {
      return err({
        code: "RATE_LIMITED",
        message: "ZenQuotes rate limit exceeded (5 requests per 30 seconds)",
        cause: error,
      });
    }
    return err(classifyFetchError(error));
  }
}

export async function getRandomQuotes(
  options?: ScraperOptions
): Promise<Result<RandomQuote[]>> {
  const client = createHttpClient(options);

  try {
    const raw = await client.get<unknown>(`${ZEN_QUOTES_BASE}/quotes`);

    const errorParsed = errorResponseSchema.safeParse(raw);
    if (errorParsed.success) {
      return err({
        code: "RATE_LIMITED",
        message: errorParsed.data.Error,
      });
    }

    const parsed = quotesResponseSchema.safeParse(raw);

    if (!parsed.success) {
      return err({
        code: "VALIDATION_ERROR",
        message: "Unexpected quotes list API response shape",
        cause: parsed.error,
      });
    }

    return ok(parsed.data.map(toRandomQuote));
  } catch (error) {
    if (isRateLimitError(error)) {
      return err({
        code: "RATE_LIMITED",
        message: "ZenQuotes rate limit exceeded (5 requests per 30 seconds)",
        cause: error,
      });
    }
    return err(classifyFetchError(error));
  }
}
