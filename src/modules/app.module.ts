import {
  Module,
  ValidationPipe,
  CacheInterceptor,
  CacheModule,
} from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_PIPE, APP_GUARD, APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';
import { ScheduleModule } from '@nestjs/schedule';
import { SequelizeModule } from '@nestjs/sequelize';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';

import { EnvConfig, SequelizeConfig } from 'src/common/configs';
import { HttpExceptionFilter } from 'src/common/exceptions';
import { TelegramModule } from 'src/modules/telegram/telegram.module';

import { UsersModule } from './users/users.module';

@Module({
  imports: [
    CacheModule.register(),
    ConfigModule.forRoot(EnvConfig),
    SequelizeModule.forRootAsync(SequelizeConfig),
    ScheduleModule.forRoot(),
    ThrottlerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (config: ConfigService) => ({
        ttl: config.get('throttle.ttl'),
        limit: config.get('throttle.limit'),
      }),
    }),
    UsersModule,
    TelegramModule,
  ],
  controllers: [],
  providers: [
    {
      provide: APP_PIPE,
      useClass: ValidationPipe,
    },
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
    {
      provide: APP_FILTER,
      useClass: HttpExceptionFilter,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: CacheInterceptor,
    },
  ],
})
export class AppModule {}
