import { Module } from '@nestjs/common';

import { UsersModule } from 'src/modules/users/users.module';
import { TelegramMockService } from 'src/modules/telegram/telegram.mock.service';
import { TelegramService } from 'src/modules/telegram/telegram.service';

@Module({
  imports: [UsersModule],
  providers: [TelegramService, TelegramMockService],
})
export class TelegramModule {}