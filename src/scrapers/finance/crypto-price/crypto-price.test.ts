import { describe, it, expect, vi, beforeEach } from "vitest";
import { getCryptoPrice, getCryptoMarkets, getCoinList } from "./index.js";

const mockMarketsResponse = (ids?: string) => {
  const allCoins = [
    {
      id: "bitcoin",
      symbol: "btc",
      name: "Bitcoin",
      current_price: 65000,
      market_cap: 1280000000000,
      market_cap_rank: 1,
      fully_diluted_valuation: 1365000000000,
      total_volume: 28000000000,
      high_24h: 66000,
      low_24h: 64000,
      price_change_24h: 500,
      price_change_percentage_24h: 0.77,
      circulating_supply: 19700000,
      total_supply: 21000000,
      max_supply: 21000000,
      ath: 73750,
      ath_change_percentage: -11.8,
      ath_date: "2024-03-14T07:10:36.635Z",
      atl: 67.81,
      atl_change_percentage: 95728.5,
      atl_date: "2013-07-06T00:00:00.000Z",
      last_updated: "2024-06-01T00:00:00.000Z",
    },
    {
      id: "ethereum",
      symbol: "eth",
      name: "Ethereum",
      current_price: 3500,
      market_cap: 420000000000,
      market_cap_rank: 2,
      fully_diluted_valuation: 420000000000,
      total_volume: 15000000000,
      high_24h: 3600,
      low_24h: 3400,
      price_change_24h: -50,
      price_change_percentage_24h: -1.41,
      circulating_supply: 120000000,
      total_supply: null,
      max_supply: null,
      ath: 4878.26,
      ath_change_percentage: -28.3,
      ath_date: "2021-11-10T14:24:19.604Z",
      atl: 0.432979,
      atl_change_percentage: 808386.5,
      atl_date: "2015-10-20T00:00:00.000Z",
      last_updated: "2024-06-01T00:00:00.000Z",
    },
  ];

  if (ids) {
    const idList = ids.split(",");
    return allCoins.filter((c) => idList.includes(c.id));
  }
  return allCoins;
};

const mockCoinListResponse = [
  { id: "bitcoin", symbol: "btc", name: "Bitcoin" },
  { id: "ethereum", symbol: "eth", name: "Ethereum" },
  { id: "tether", symbol: "usdt", name: "Tether" },
];

vi.mock("ofetch", () => ({
  ofetch: vi.fn((url: string) => {
    if (url.includes("/coins/markets")) {
      const urlObj = new URL(url);
      const ids = urlObj.searchParams.get("ids") ?? undefined;
      const perPage = parseInt(urlObj.searchParams.get("per_page") ?? "250");
      const result = mockMarketsResponse(ids).slice(0, perPage);
      if (ids && result.length === 0) {
        const error = new Error("Not found") as Error & { statusCode: number };
        error.statusCode = 404;
        throw error;
      }
      return result;
    }
    if (url.includes("/coins/list")) {
      return mockCoinListResponse;
    }
    throw new Error(`Unexpected URL: ${url}`);
  }),
}));

beforeEach(() => {
  vi.clearAllMocks();
});

describe("Crypto Price Scraper", () => {
  describe("getCryptoPrice", () => {
    it("returns price data for bitcoin", async () => {
      const result = await getCryptoPrice("bitcoin");

      expect(result.success).toBe(true);
      if (!result.success) return;

      expect(result.data.id).toBe("bitcoin");
      expect(result.data.symbol).toBe("btc");
      expect(typeof result.data.currentPrice).toBe("number");
      expect(result.data.currentPrice).toBeGreaterThan(0);
    });

    it("returns all required fields with correct types", async () => {
      const result = await getCryptoPrice("ethereum");

      expect(result.success).toBe(true);
      if (!result.success) return;

      const coin = result.data;
      expect(typeof coin.id).toBe("string");
      expect(typeof coin.symbol).toBe("string");
      expect(typeof coin.name).toBe("string");
      expect(typeof coin.currentPrice).toBe("number");
      expect(coin.currency).toBe("usd");
    });

    it("supports custom currency", async () => {
      const result = await getCryptoPrice("bitcoin", { currency: "eur" });

      expect(result.success).toBe(true);
      if (!result.success) return;

      expect(result.data.currency).toBe("eur");
      expect(result.data.currentPrice).toBeGreaterThan(0);
    });

    it("returns market cap and volume when available", async () => {
      const result = await getCryptoPrice("bitcoin");

      expect(result.success).toBe(true);
      if (!result.success) return;

      if (result.data.marketCap !== null) {
        expect(typeof result.data.marketCap).toBe("number");
        expect(result.data.marketCap).toBeGreaterThan(0);
      }
      if (result.data.totalVolume !== null) {
        expect(typeof result.data.totalVolume).toBe("number");
      }
    });

    it("returns NOT_FOUND for a non-existent coin", async () => {
      const result = await getCryptoPrice("this-coin-does-not-exist-xyz-abc");

      expect(result.success).toBe(false);
      if (result.success) return;

      expect(result.error.code).toBe("NOT_FOUND");
    });
  });

  describe("getCryptoMarkets", () => {
    it("returns a list of top coins by market cap", async () => {
      const result = await getCryptoMarkets();

      expect(result.success).toBe(true);
      if (!result.success) return;

      expect(result.data.length).toBeGreaterThan(0);
    });

    it("returns coins with required fields", async () => {
      const result = await getCryptoMarkets({ limit: 5 });

      expect(result.success).toBe(true);
      if (!result.success) return;

      const first = result.data[0]!;
      expect(typeof first.id).toBe("string");
      expect(typeof first.symbol).toBe("string");
      expect(typeof first.name).toBe("string");
      expect(typeof first.currentPrice).toBe("number");
      expect(first.currency).toBe("usd");
    });

    it("respects the limit option", async () => {
      const result = await getCryptoMarkets({ limit: 1 });

      expect(result.success).toBe(true);
      if (!result.success) return;

      expect(result.data.length).toBeLessThanOrEqual(1);
    });

    it("bitcoin appears in top coins", async () => {
      const result = await getCryptoMarkets({ limit: 5 });

      expect(result.success).toBe(true);
      if (!result.success) return;

      const ids = result.data.map((c) => c.id);
      expect(ids).toContain("bitcoin");
    });

    it("supports custom currency", async () => {
      const result = await getCryptoMarkets({ currency: "idr", limit: 3 });

      expect(result.success).toBe(true);
      if (!result.success) return;

      for (const coin of result.data) {
        expect(coin.currency).toBe("idr");
      }
    });
  });

  describe("getCoinList", () => {
    it("returns a list of all coins", async () => {
      const result = await getCoinList();

      expect(result.success).toBe(true);
      if (!result.success) return;

      expect(result.data.length).toBeGreaterThan(0);
    });

    it("returns coins with id, symbol, and name", async () => {
      const result = await getCoinList();

      expect(result.success).toBe(true);
      if (!result.success) return;

      const bitcoin = result.data.find((c) => c.id === "bitcoin");
      expect(bitcoin).toBeDefined();
      expect(bitcoin?.symbol).toBe("btc");
      expect(bitcoin?.name).toBe("Bitcoin");
    });
  });
});
