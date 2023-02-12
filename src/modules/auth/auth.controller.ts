import {
  Controller,
  Post,
  Get,
  Body,
  Req,
  BadRequestException,
  UseGuards,
  HttpCode,
} from '@nestjs/common';
import { ApiResponse, ApiTags } from '@nestjs/swagger';

import { AccessGuard, RefreshGuard } from 'src/common/guards';

import { LoginBodyDto, RefreshBodyDto } from './auth.dto';
import { AuthService } from './auth.service';
import { TokenData, RequestUser, UserWithTokens } from './auth.types';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @ApiResponse({
    status: 200,
    description: 'login',
  })
  @Post('/login')
  async login(@Body() body: LoginBodyDto): Promise<TokenData> {
    try {
      return this.authService.login(body);
    } catch (error) {
      throw new BadRequestException(error);
    }
  }

  @ApiResponse({
    status: 201,
    description: 'sign up process',
  })
  @Post('/signup')
  @HttpCode(201)
  async signUp(@Body() body: LoginBodyDto): Promise<UserWithTokens> {
    try {
      return this.authService.signUp(body);
    } catch (error) {
      throw new BadRequestException(error);
    }
  }

  @ApiResponse({
    status: 200,
    description: 'refresh tokens',
  })
  @UseGuards(RefreshGuard)
  @Post('/refresh')
  async refresh(
    @Req() request: { user: { id: string } },
    @Body() body: RefreshBodyDto,
  ): Promise<TokenData> {
    try {
      return this.authService.refresh({
        userId: request.user.id,
        refreshToken: body.token,
      });
    } catch (error) {
      throw new BadRequestException(error);
    }
  }

  @ApiResponse({
    status: 200,
    description: 'check access token',
  })
  @UseGuards(AccessGuard)
  @Get('/check-token')
  async checkToken(
    @Req() request: { user: RequestUser },
  ): Promise<RequestUser> {
    try {
      return request.user;
    } catch (error) {
      throw new BadRequestException(error);
    }
  }
}
