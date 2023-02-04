import {
  Injectable,
  Inject,
  Logger,
  BadRequestException,
} from '@nestjs/common';
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
  private readonly logger = new Logger('User service');
  private readonly banTime = 24 * 180;

  constructor(
    @Inject('USER_REPOSITORY')
    private readonly userRepository: typeof User,
    private readonly bcryptService: BcryptService,
  ) {}

  @Cron(CronExpression.EVERY_DAY_AT_NOON)
  async handleCronToDeleteOldArchiveUsers() {
    try {
      const userForDelete = await this.userRepository.findAll({
        where: {
          deletedAt: {
            [Op.gte]: dayjs().set('hour', -this.banTime).format(),
          },
        },
        raw: true,
      });
      return Promise.all(userForDelete.map((elem) => this.deleteUser(elem.id)));
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

  async findUserByPk(pk: string): Promise<User> {
    return this.userRepository.findByPk(pk);
  }

  async findUser(options: FindOptions): Promise<User> {
    return this.userRepository.findOne(options);
  }

  async createUser(
    data: CreateUserData,
    transaction: Transaction = null,
    raw = true,
  ): Promise<User> {
    let hashedPassword = null;
    const { password } = data;
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
