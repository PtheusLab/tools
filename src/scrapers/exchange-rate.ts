import { z } from "zod";
import { createHttpClient, classifyFetchError, ok, err } from "../core/index.js";
import type { Result, ScraperOptions } from "../types/index.js";
import type { ExchangeRate, ConvertedAmount } from "../types/exchange-rate.js";

const EXCHANGE_RATE_API_BASE = "https://open.er-api.com/v6";

const exchangeRateSchema = z.object({
  result: z.literal("success"),
  base_code: z.string(),
  time_last_update_utc: z.string(),
  rates: z.record(z.number()),
});

export async function getExchangeRates(
  baseCurrency: string,
  options?: ScraperOptions
): Promise<Result<ExchangeRate>> {
  const client = createHttpClient(options);
  const upper = baseCurrency.toUpperCase();

  try {
    const raw = await client.get<unknown>(
      `${EXCHANGE_RATE_API_BASE}/latest/${upper}`
    );

    const parsed = exchangeRateSchema.safeParse(raw);

    if (!parsed.success) {
      return err({
        code: "VALIDATION_ERROR",
        message: "Unexpected exchange rate API response",
        cause: parsed.error,
      });
    }

    return ok({
      base: parsed.data.base_code,
      date: parsed.data.time_last_update_utc,
      rates: parsed.data.rates,
    });
  } catch (error) {
    return err(classifyFetchError(error));
  }
}

export async function convertCurrency(
  amount: number,
  from: string,
  to: string,
  options?: ScraperOptions
): Promise<Result<ConvertedAmount>> {
  const rateResult = await getExchangeRates(from, options);

  if (!rateResult.success) {
    return err(rateResult.error);
  }

  const toUpper = to.toUpperCase();
  const rate = rateResult.data.rates[toUpper];

  if (rate === undefined) {
    return err({
      code: "NOT_FOUND",
      message: `Currency "${to}" not found in exchange rates`,
    });
  }

  return ok({
    from: from.toUpperCase(),
    to: toUpper,
    amount,
    result: amount * rate,
    rate,
    date: rateResult.data.date,
  });
}

export async function getSupportedCurrencies(
  options?: ScraperOptions
): Promise<Result<string[]>> {
  const ratesResult = await getExchangeRates("USD", options);

  if (!ratesResult.success) {
    return err(ratesResult.error);
  }

  return ok(Object.keys(ratesResult.data.rates).sort());
}
