import {
  Injectable,
  Inject,
  Logger,
  BadRequestException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Cron, CronExpression } from '@nestjs/schedule';
import { FindOptions, Transaction, Op } from 'sequelize';
import * as dayjs from 'dayjs';

import { BcryptService } from 'src/services/bcrypt/bcrypt.service';

import { User } from './users.entity';
import {
  CreateUserData,
  UpdateUserData,
  UpdatePasswordData,
} from './users.types';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);
  private readonly archiveTime: number;

  constructor(
    @Inject('USER_REPOSITORY')
    private readonly userRepository: typeof User,
    private readonly bcryptService: BcryptService,
    private readonly configService: ConfigService,
  ) {
    this.archiveTime = Number(this.configService.get('times.archiveTime'));
  }

  @Cron(CronExpression.EVERY_DAY_AT_NOON)
  async handleCronToDeleteOldArchiveUsers() {
    try {
      const userForDelete = await this.userRepository.findAll({
        where: {
          deletedAt: {
            [Op.gte]: dayjs().subtract(this.archiveTime, 'hour').format(),
          },
        },
        raw: true,
      });
      await Promise.all(userForDelete.map((elem) => this.deleteUser(elem.id)));
    } catch (error) {
      this.logger.error('error for get access token cron tab', error);
    }
  }

  async archiveUser(id: string): Promise<User> {
    return this.updateUser(id, { deletedAt: dayjs().toDate() });
  }

  async unarchiveUser(id: string): Promise<User> {
    return this.updateUser(id, { deletedAt: null });
  }

  async updatePassword({
    email,
    password,
    newPassword,
  }: UpdatePasswordData): Promise<User> {
    const { password: dbPassword, id } = await this.findUser({
      where: { email },
      raw: true,
    });

    const isMatchPassword = await this.bcryptService.compare(
      password,
      dbPassword,
    );

    if (!isMatchPassword) {
      throw new BadRequestException('Password not valid');
    }

    const newHashPassword = await this.bcryptService.hash(newPassword);

    return this.updateUser(id, { password: newHashPassword });
  }

  async findUserByPk(pk: string, withPassword = false): Promise<User> {
    return this.userRepository.findByPk(pk, {
      attributes: {
        exclude: !withPassword && ['password'],
      },
    });
  }

  async findUser(options: FindOptions): Promise<User> {
    return this.userRepository.findOne(options);
  }

  async createUser(
    data: CreateUserData,
    transaction: Transaction = null,
    raw = true,
  ): Promise<User> {
    const { password, email, telegramId } = data;

    if (!email && !telegramId) {
      throw new BadRequestException(
        'for create user need email or telegram id!',
      );
    }

    if (email && !password) {
      throw new BadRequestException('need password!');
    }
    let hashedPassword = null;
    if (password) {
      hashedPassword = await this.bcryptService.hash(password);
    }
    return this.userRepository.create(
      { ...data, password: hashedPassword },
      { transaction, raw },
    );
  }

  async updateUser(
    id: string,
    data: UpdateUserData,
    transaction: Transaction = null,
  ): Promise<User> {
    const currentUser = await this.findUserByPk(id);
    await currentUser.update({ ...data }, { where: { id }, transaction });
    return currentUser;
  }

  async deleteUser(
    id: string,
    transaction: Transaction = null,
  ): Promise<number> {
    return this.userRepository.destroy({ where: { id }, transaction });
  }
}
