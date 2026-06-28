import { ofetch } from "ofetch";
import type { ScraperError, ScraperOptions } from "../types/index.js";

const DEFAULT_TIMEOUT_MS = 10_000;
const DEFAULT_USER_AGENT =
  "@ptheus/tools scraper (+https://github.com/ptheus/tools)";

type ExtraHeaders = Record<string, string>;

export function createHttpClient(options: ScraperOptions = {}): HttpClient {
  return new HttpClient(options);
}

export class HttpClient {
  private readonly timeoutMs: number;
  private readonly userAgent: string;

  constructor(options: ScraperOptions = {}) {
    this.timeoutMs = options.timeoutMs ?? DEFAULT_TIMEOUT_MS;
    this.userAgent = options.userAgent ?? DEFAULT_USER_AGENT;
  }

  private hardTimeout<T>(): Promise<T> {
    return new Promise<T>((_, reject) =>
      setTimeout(
        () => reject(new Error("Request timed out")),
        this.timeoutMs
      )
    );
  }

  async get<T>(url: string, extraHeaders: ExtraHeaders = {}): Promise<T> {
    return Promise.race([
      ofetch<T>(url, {
        method: "GET",
        timeout: this.timeoutMs,
        headers: {
          "User-Agent": this.userAgent,
          ...extraHeaders,
        },
      }),
      this.hardTimeout<T>(),
    ]);
  }

  async getText(url: string, extraHeaders: ExtraHeaders = {}): Promise<string> {
    const result = await Promise.race([
      ofetch<string, "text">(url, {
        method: "GET",
        timeout: this.timeoutMs,
        responseType: "text",
        headers: {
          "User-Agent": this.userAgent,
          ...extraHeaders,
        },
      }),
      this.hardTimeout<string>(),
    ]);
    return result;
  }
}

export function buildScraperError(
  code: ScraperError["code"],
  message: string,
  cause?: unknown
): ScraperError {
  return { code, message, cause };
}

export function classifyFetchError(error: unknown): ScraperError {
  if (error instanceof Error) {
    // ofetch exposes a numeric statusCode on its FetchError — check this
    // first so 404/429 responses aren't misclassified as NETWORK_ERROR when
    // string matching fails (e.g. when the message format changes).
    const statusCode = (error as { statusCode?: number }).statusCode;
    if (statusCode === 404) {
      return buildScraperError("NOT_FOUND", "Resource not found", error);
    }
    if (statusCode === 429) {
      return buildScraperError("RATE_LIMITED", "Rate limit exceeded", error);
    }

    const message = error.message.toLowerCase();

    if (message.includes("timeout") || message.includes("aborted")) {
      return buildScraperError("NETWORK_ERROR", "Request timed out", error);
    }

    if (message.includes("429") || message.includes("rate limit")) {
      return buildScraperError(
        "RATE_LIMITED",
        "Rate limit exceeded",
        error
      );
    }

    if (message.includes("404") || message.includes("not found")) {
      return buildScraperError("NOT_FOUND", "Resource not found", error);
    }

    if (
      message.includes("network") ||
      message.includes("fetch") ||
      message.includes("econnrefused") ||
      message.includes("enotfound")
    ) {
      return buildScraperError(
        "NETWORK_ERROR",
        "Network request failed",
        error
      );
    }
  }

  return buildScraperError("UNKNOWN", "An unexpected error occurred", error);
}
