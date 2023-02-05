import { Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';

interface Exchange {
  id: string;
  name: string;
}

interface Companies {
  id: string;
  exchangeId: string;
  name: string;
}

@Injectable()
export class TelegramMockService {
  private readonly PAGE_LIMIT = 3;

  private readonly exchanges = [{ id: randomUUID(), name: 'Тинькоф' }];

  private readonly companies = [
    { id: randomUUID(), exchangeId: this.exchanges[0].id, name: 'A' },
    { id: randomUUID(), exchangeId: this.exchanges[0].id, name: 'B' },
    { id: randomUUID(), exchangeId: this.exchanges[0].id, name: 'C' },
    { id: randomUUID(), exchangeId: this.exchanges[0].id, name: 'D' },
    { id: randomUUID(), exchangeId: this.exchanges[0].id, name: 'E' },
  ]

  getExchanges(): Exchange[] {
    return this.exchanges
  }

  getExchangeById(id: string): Exchange {
    return this.exchanges.find((item) => item.id === id);
  }

  getCompaniesByExchangeId(id: string, page: number = 1): Companies[] {
    return this.companies.filter((item) => item.exchangeId === id)
      .slice((page - 1) * this.PAGE_LIMIT, page * this.PAGE_LIMIT);
  }
}