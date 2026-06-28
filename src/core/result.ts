import type { Result, ScraperError } from "../types/index.js";

export function ok<T>(data: T): Result<T> {
  return { success: true, data };
}

export function err<T = never>(error: ScraperError): Result<T> {
  return { success: false, error };
}
