import {
  Controller,
  Param,
  Get,
  BadRequestException,
  UseGuards,
} from '@nestjs/common';
import { ApiResponse, ApiTags } from '@nestjs/swagger';

import { AccessGuard } from 'src/common/guards';

import { UsersService } from './users.service';
import { User } from './users.entity';

@ApiTags('users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @ApiResponse({
    status: 200,
    description: 'Get user for pk',
  })
  @UseGuards(AccessGuard)
  @Get('/:id')
  async getCurrentUser(@Param('id') id: string): Promise<User> {
    try {
      return this.usersService.findUserByPk(id);
    } catch (error) {
      throw new BadRequestException(error);
    }
  }
}
