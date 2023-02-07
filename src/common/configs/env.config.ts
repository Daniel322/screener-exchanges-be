import * as Joi from '@hapi/joi';
import { registerAs } from '@nestjs/config';

const env = registerAs('env', () => ({
  type: process.env.NODE_ENV,
}));

const database = registerAs('db', () => ({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  name: process.env.DB_NAME,
}));

const throttle = registerAs('throttle', () => ({
  ttl: process.env.THROTTLE_TTL,
  limit: process.env.THROTTLE_LIMIT,
}));

const times = registerAs('times', () => ({
  archiveTime: process.env.ARCHIVE_TIME,
}));

export const EnvConfig = {
  envFilePath: `.env.${process.env.NODE_ENV}`,
  validationSchema: Joi.object({
    NODE_ENV: Joi.string()
      .valid('development', 'production', 'test')
      .required(),

    DB_HOST: Joi.string().required(),
    DB_PORT: Joi.number().required(),
    DB_USERNAME: Joi.string().required(),
    DB_PASSWORD: Joi.string().required(),
    DB_NAME: Joi.string().required(),

    THROTTLE_TTL: Joi.string().required(),
    THROTTLE_LIMIT: Joi.string().required(),

    ARCHIVE_TIME: Joi.string().required(),
  }),
  load: [env, database, throttle, times],
  isGlobal: true,
};
