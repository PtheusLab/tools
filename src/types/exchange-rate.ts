export interface ExchangeRate {
  base: string;
  date: string;
  rates: Record<string, number>;
}

export interface ConvertedAmount {
  from: string;
  to: string;
  amount: number;
  result: number;
  rate: number;
  date: string;
}

export interface ExchangeRateOptions {
  date?: string;
}
