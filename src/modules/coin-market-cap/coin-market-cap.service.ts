import { HttpService } from '@nestjs/axios';
import { Injectable, Logger } from '@nestjs/common';
import { AxiosError } from 'axios';
import { catchError, firstValueFrom } from 'rxjs';

import {
  IdMap,
  GetCurrencyListResponse,
  GetCurrencyQuotesLatestResponse,
  GetCurrencyQuotesOptions,
  MarketQuote,
} from './@types';

@Injectable()
export class CoinMarketCapService {
  private readonly logger = new Logger(CoinMarketCapService.name);

  constructor(private readonly httpService: HttpService) {}

  // pagination limit doesn't work, it's ignored by Coin Market Cap API
  async getCurrencyListMap(page = 1, limit = 5): Promise<IdMap[]> {
    const start = (page - 1) * limit || 1; // start from 1
    const { data: { data } } = await firstValueFrom(
      this.httpService.get<GetCurrencyListResponse>('/v1/cryptocurrency/map', { params: { start, limit }}).pipe(
        catchError((error: AxiosError) => {
          this.logger.error(error.response.data);
          // TODO how to handle error
          throw error.response.data;
        }),
      ),
    );
    return data;
  }

  async getCurrencyQuotesLatest(options: GetCurrencyQuotesOptions = {}): Promise<Record<string, MarketQuote>> {
    const { data: { data } } = await firstValueFrom(
      this.httpService.get<GetCurrencyQuotesLatestResponse>('/v2/cryptocurrency/quotes/latest', { params: options }).pipe(
        catchError((error: AxiosError) => {
          this.logger.error(error.response.data);
          // TODO how to handle error
          throw error.response.data;
        }),
      ),
    );
    return data;
  }
} 