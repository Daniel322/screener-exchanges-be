import {
  Controller,
  Body,
  Param,
  Post,
  Get,
  Patch,
  BadRequestException,
  UseGuards,
  Req,
  HttpCode,
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
    status: 201,
    description: 'create user',
  })
  @Post('/')
  @HttpCode(201)
  async createUser(@Body() body: CreateUserDto): Promise<User> {
    try {
      return this.usersService.createUser(body);
    } catch (error) {
      throw new BadRequestException(error);
    }
  }
}
