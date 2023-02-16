import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';

import { CoinMarketCapService } from './coin-market-cap.service';

@Module({
  imports: [
    HttpModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        baseURL: configService.get('coinMarketCap.url'),
        headers: {
          'X-CMC_PRO_API_KEY': configService.get('coinMarketCap.apiKey'),
        },
      }),
      inject: [ConfigService],
    }),
  ],
  providers: [CoinMarketCapService],
})
export class CoinMarketCapModule {}
