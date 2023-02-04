import {
  Controller,
  Body,
  Param,
  Query,
  Post,
  Get,
  Patch,
  BadRequestException,
  UseGuards,
  Req,
} from '@nestjs/common';
import { ApiResponse, ApiTags } from '@nestjs/swagger';

import { CreateUserDto, UpdateUserDto } from './users.dto';

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
  @Get('/:id')
  async getCurrentUser(@Param('id') id: string): Promise<User> {
    try {
      return this.usersService.findUserByPk(id);
    } catch (error) {
      throw new BadRequestException(error);
    }
  }

  @ApiResponse({
    status: 200,
    description: 'create user',
  })
  @Post('/')
  async createUser(@Body() body: CreateUserDto) {
    try {
      return this.usersService.createUser(body);
    } catch (error) {
      throw new BadRequestException(error);
    }
  }
}
