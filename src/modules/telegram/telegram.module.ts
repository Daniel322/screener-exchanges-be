import { Module } from '@nestjs/common';

import { UsersModule } from 'src/modules/users/users.module';
import { TelegramService } from 'src/modules/telegram/telegram.service';
import { CoinMarketCapModule } from 'src/modules/coin-market-cap/coin-market-cap.module';
import { RedisModule } from 'src/services/redis/redis.module';

@Module({
  imports: [
    UsersModule,
    CoinMarketCapModule,
    RedisModule,
  ],
  providers: [TelegramService],
})
export class TelegramModule {}