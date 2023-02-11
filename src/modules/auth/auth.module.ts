import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';

import { JwtAccessStrategy, JwtRefreshStrategy } from 'src/common/guards';

import { UsersModule } from 'src/modules/users/users.module';

import { BcryptModule } from 'src/services/bcrypt/bcrypt.module';
import { RedisModule } from 'src/services/redis/redis.module';

import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

@Module({
  imports: [
    JwtModule.register({}),
    PassportModule,
    BcryptModule,
    RedisModule,
    UsersModule,
  ],
  controllers: [AuthController],
  providers: [JwtAccessStrategy, JwtRefreshStrategy, AuthService],
})
export class AuthModule {}
