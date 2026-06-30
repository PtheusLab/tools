import { z } from "zod";
import { createHttpClient, classifyFetchError, ok, err } from "../../../core/index.js";
import { buildUrl } from "../../../utils/index.js";
import type { Result, ScraperOptions } from "../../../types/index.js";
import type {
  CryptoPrice,
  CryptoMarket,
  CryptoCoin,
  CryptoPriceOptions,
  CryptoMarketsOptions,
} from "./types.js";

const COINGECKO_BASE = "https://api.coingecko.com/api/v3";

const coinMarketSchema = z.object({
  id: z.string(),
  symbol: z.string(),
  name: z.string(),
  current_price: z.number(),
  market_cap: z.number().nullable(),
  market_cap_rank: z.number().nullable(),
  fully_diluted_valuation: z.number().nullable(),
  total_volume: z.number().nullable(),
  high_24h: z.number().nullable(),
  low_24h: z.number().nullable(),
  price_change_24h: z.number().nullable(),
  price_change_percentage_24h: z.number().nullable(),
  circulating_supply: z.number().nullable(),
  total_supply: z.number().nullable(),
  max_supply: z.number().nullable(),
  ath: z.number().nullable(),
  ath_change_percentage: z.number().nullable(),
  ath_date: z.string().nullable(),
  atl: z.number().nullable(),
  atl_change_percentage: z.number().nullable(),
  atl_date: z.string().nullable(),
  last_updated: z.string().nullable(),
});

const coinListItemSchema = z.object({
  id: z.string(),
  symbol: z.string(),
  name: z.string(),
});

export async function getCryptoPrice(
  coinId: string,
  priceOptions: CryptoPriceOptions = {},
  scraperOptions?: ScraperOptions
): Promise<Result<CryptoPrice>> {
  const currency = (priceOptions.currency ?? "usd").toLowerCase();
  const client = createHttpClient(scraperOptions);

  const url = buildUrl(COINGECKO_BASE, "/coins/markets", {
    vs_currency: currency,
    ids: coinId,
    per_page: "1",
    page: "1",
  });

  try {
    const raw = await client.get<unknown>(url);
    const parsed = z.array(coinMarketSchema).safeParse(raw);

    if (!parsed.success) {
      return err({
        code: "VALIDATION_ERROR",
        message: "Unexpected CoinGecko API response shape",
        cause: parsed.error,
      });
    }

    const coin = parsed.data[0];
    if (!coin) {
      return err({
        code: "NOT_FOUND",
        message: `Coin "${coinId}" not found`,
      });
    }

    return ok({
      id: coin.id,
      symbol: coin.symbol,
      name: coin.name,
      currentPrice: coin.current_price,
      marketCap: coin.market_cap,
      marketCapRank: coin.market_cap_rank,
      fullyDilutedValuation: coin.fully_diluted_valuation,
      totalVolume: coin.total_volume,
      high24h: coin.high_24h,
      low24h: coin.low_24h,
      priceChange24h: coin.price_change_24h,
      priceChangePercent24h: coin.price_change_percentage_24h,
      circulatingSupply: coin.circulating_supply,
      totalSupply: coin.total_supply,
      maxSupply: coin.max_supply,
      ath: coin.ath,
      athChangePercent: coin.ath_change_percentage,
      athDate: coin.ath_date,
      atl: coin.atl,
      atlChangePercent: coin.atl_change_percentage,
      atlDate: coin.atl_date,
      lastUpdated: coin.last_updated,
      currency,
    });
  } catch (error) {
    return err(classifyFetchError(error));
  }
}

export async function getCryptoMarkets(
  marketsOptions: CryptoMarketsOptions = {},
  scraperOptions?: ScraperOptions
): Promise<Result<CryptoMarket[]>> {
  const currency = (marketsOptions.currency ?? "usd").toLowerCase();
  const limit = Math.min(marketsOptions.limit ?? 20, 250);
  const page = marketsOptions.page ?? 1;
  const client = createHttpClient(scraperOptions);

  const url = buildUrl(COINGECKO_BASE, "/coins/markets", {
    vs_currency: currency,
    order: "market_cap_desc",
    per_page: String(limit),
    page: String(page),
  });

  try {
    const raw = await client.get<unknown>(url);
    const parsed = z.array(coinMarketSchema).safeParse(raw);

    if (!parsed.success) {
      return err({
        code: "VALIDATION_ERROR",
        message: "Unexpected CoinGecko API response shape",
        cause: parsed.error,
      });
    }

    return ok(
      parsed.data.map((coin) => ({
        id: coin.id,
        symbol: coin.symbol,
        name: coin.name,
        currentPrice: coin.current_price,
        marketCapRank: coin.market_cap_rank,
        priceChangePercent24h: coin.price_change_percentage_24h,
        marketCap: coin.market_cap,
        totalVolume: coin.total_volume,
        currency,
      }))
    );
  } catch (error) {
    return err(classifyFetchError(error));
  }
}

export async function getCoinList(
  scraperOptions?: ScraperOptions
): Promise<Result<CryptoCoin[]>> {
  const client = createHttpClient(scraperOptions);

  try {
    const raw = await client.get<unknown>(`${COINGECKO_BASE}/coins/list`);
    const parsed = z.array(coinListItemSchema).safeParse(raw);

    if (!parsed.success) {
      return err({
        code: "VALIDATION_ERROR",
        message: "Unexpected CoinGecko coin list response shape",
        cause: parsed.error,
      });
    }

    return ok(parsed.data);
  } catch (error) {
    return err(classifyFetchError(error));
  }
}
