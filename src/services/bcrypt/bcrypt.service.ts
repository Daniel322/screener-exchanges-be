import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class BcryptService {
  private readonly saltRounds: string;
  private readonly logger = new Logger(BcryptService.name);

  constructor(private readonly configService: ConfigService) {
    this.saltRounds = this.configService.get('salt.rounds');
  }

  async compare(reqPassword: string, dbPassword: string): Promise<boolean> {
    try {
      return bcrypt.compare(reqPassword, dbPassword);
    } catch (error) {
      this.logger.error(error);
      throw new BadRequestException(error);
    }
  }

  async hash(password: string): Promise<string> {
    try {
      const salt = await bcrypt.genSalt(Number(this.saltRounds));
      return bcrypt.hash(password, salt);
    } catch (error) {
      this.logger.error(error);
      throw new BadRequestException(error);
    }
  }
}
