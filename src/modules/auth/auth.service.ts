import { Injectable, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as dayjs from 'dayjs';

import { BcryptService } from 'src/services/bcrypt/bcrypt.service';
import { RedisService } from 'src/services/redis/redis.service';

import { UsersService } from '../users/users.service';
import { User } from '../users/users.types';

import {
  LoginProps,
  TokenData,
  RefreshTokenProps,
  UserWithTokens,
} from './auth.types';
@Injectable()
export class AuthService {
  private readonly accessJwtSecret: string;
  private readonly refreshJwtSecret: string;
  private readonly accessJwtTtl: number;
  private readonly refreshJwtTtl: number;

  constructor(
    private readonly bcryptService: BcryptService,
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
    private readonly redisService: RedisService,
    private readonly usersService: UsersService,
  ) {
    this.accessJwtSecret = this.configService.get('jwt.accessSecret');
    this.refreshJwtSecret = this.configService.get('jwt.refreshSecret');
    this.accessJwtTtl = this.configService.get('jwt.accessTtl');
    this.refreshJwtTtl = this.configService.get('jwt.refreshTtl');
  }

  async generateTokens(user: Omit<User, 'password'>): Promise<TokenData> {
    try {
      const accessToken: string = this.jwtService.sign(user, {
        secret: this.accessJwtSecret,
        expiresIn: `${this.accessJwtTtl}m`,
      });

      const refreshToken: string = this.jwtService.sign(user, {
        secret: this.refreshJwtSecret,
        expiresIn: `${this.refreshJwtTtl}m`,
      });

      await this.redisService.set(
        `refresh_${user.id}`,
        refreshToken,
        this.refreshJwtTtl * 60,
      );

      return {
        accessToken,
        accessTokenExpired: dayjs().add(this.accessJwtTtl, 'minutes').format(),
        refreshToken,
        refreshTokenExpired: dayjs()
          .add(this.refreshJwtTtl, 'minutes')
          .format(),
      };
    } catch (error) {
      throw new BadRequestException(error);
    }
  }

  async login({ email, password }: LoginProps): Promise<TokenData> {
    const userData = await this.usersService.findUser({ where: { email } });

    if (!userData) {
      throw new BadRequestException({
        message: 'Email or password is invalid',
      });
    }

    const { password: userDataPassword, ...userDataWithoutPassword } = userData;

    const passwordCompared = await this.bcryptService.compare(
      password,
      userDataPassword,
    );

    if (!passwordCompared) {
      throw new BadRequestException({
        message: 'Email or password is invalid',
      });
    }

    return this.generateTokens(userDataWithoutPassword);
  }

  async signUp({ email, password }: LoginProps): Promise<UserWithTokens> {
    const userWithThisEmail = await this.usersService.findUser({
      where: { email },
    });

    if (userWithThisEmail) {
      throw new BadRequestException('user with this email already created');
    }

    const user = await this.usersService.createUser({ email, password });

    const { password: _, ...userData } = user.toJSON();

    const tokens = await this.generateTokens(userData);

    return {
      user: userData,
      tokens,
    };
  }

  async refresh({
    userId,
    refreshToken,
  }: RefreshTokenProps): Promise<TokenData> {
    const savedRefreshToken = await this.redisService.get(`refresh_${userId}`);

    if (savedRefreshToken !== refreshToken) {
      throw new BadRequestException({
        message: 'Refresh token is invalid',
      });
    }

    const tokenPayload = await this.jwtService.verify(refreshToken, {
      secret: this.refreshJwtSecret,
    });

    const userData = await this.usersService.findUserByPk(tokenPayload.id);

    if (!userData) {
      throw new BadRequestException({
        message: 'Refresh token is invalid',
      });
    }

    return this.generateTokens(userData);
  }
}
