import { IdMap } from './id-map';
import { MarketQuote } from './market-quote';

export interface GetCurrencyListResponse {
  data: IdMap[];
}

export interface GetCurrencyQuotesLatestResponse {
  data: Record<string, MarketQuote>;
}