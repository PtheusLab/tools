export type Result<T, E = ScraperError> =
  | { success: true; data: T }
  | { success: false; error: E };

export interface ScraperError {
  code: ScraperErrorCode;
  message: string;
  cause?: unknown;
}

export type ScraperErrorCode =
  | "NETWORK_ERROR"
  | "PARSE_ERROR"
  | "VALIDATION_ERROR"
  | "NOT_FOUND"
  | "RATE_LIMITED"
  | "UNKNOWN";

export interface ScraperOptions {
  timeoutMs?: number;
  userAgent?: string;
}
