import { Module } from '@nestjs/common';

import { BcryptModule } from 'src/services/bcrypt/bcrypt.module';

import { usersProviders } from './users.providers';
import { UsersService } from './users.service';

@Module({
  imports: [BcryptModule],
  providers: [UsersService, ...usersProviders],
  exports: [UsersService],
})
export class UsersModule {}
