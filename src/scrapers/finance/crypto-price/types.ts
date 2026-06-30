export interface CryptoPrice {
  id: string;
  symbol: string;
  name: string;
  currentPrice: number;
  marketCap: number | null;
  marketCapRank: number | null;
  fullyDilutedValuation: number | null;
  totalVolume: number | null;
  high24h: number | null;
  low24h: number | null;
  priceChange24h: number | null;
  priceChangePercent24h: number | null;
  circulatingSupply: number | null;
  totalSupply: number | null;
  maxSupply: number | null;
  ath: number | null;
  athChangePercent: number | null;
  athDate: string | null;
  atl: number | null;
  atlChangePercent: number | null;
  atlDate: string | null;
  lastUpdated: string | null;
  currency: string;
}

export interface CryptoMarket {
  id: string;
  symbol: string;
  name: string;
  currentPrice: number;
  marketCapRank: number | null;
  priceChangePercent24h: number | null;
  marketCap: number | null;
  totalVolume: number | null;
  currency: string;
}

export interface CryptoCoin {
  id: string;
  symbol: string;
  name: string;
}

export interface CryptoPriceOptions {
  currency?: string;
}

export interface CryptoMarketsOptions {
  currency?: string;
  limit?: number;
  page?: number;
}
