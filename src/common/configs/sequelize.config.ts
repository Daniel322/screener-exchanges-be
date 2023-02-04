import { SequelizeModuleAsyncOptions } from '@nestjs/sequelize';
import { ConfigService, ConfigModule } from '@nestjs/config';

export const SequelizeConfig: SequelizeModuleAsyncOptions = {
  useFactory: async (configService: ConfigService) => ({
    dialect: 'postgres',
    host: configService.get('db.host'),
    port: configService.get('db.port'),
    username: configService.get('db.username'),
    password: configService.get('db.password'),
    database: configService.get('db.name'),
    models: [],
  }),
  imports: [ConfigModule],
  inject: [ConfigService],
};
