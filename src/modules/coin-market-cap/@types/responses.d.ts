import { IdMap } from './id-map';

export interface GetCurrencyListResponse {
  data: IdMap[];
}

export interface GetCurrencyQuotesLatestResponse {
  data: Record<string, MarketQuote>;
}