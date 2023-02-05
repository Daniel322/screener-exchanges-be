import { Module } from '@nestjs/common';

import { TelegramMockService } from './telegram.mock.service';
import { TelegramService } from './telegram.service';

@Module({
  providers: [TelegramService, TelegramMockService],
})
export class TelegramModule {}