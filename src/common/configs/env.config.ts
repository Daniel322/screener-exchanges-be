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

const jwt = registerAs('jwt', () => ({
  accessSecret: process.env.JWT_ACCESS_SECRET,
  refreshSecret: process.env.JWT_REFRESH_SECRET,
  accessTtl: Number(process.env.JWT_ACCESS_TTL),
  refreshTtl: Number(process.env.JWT_REFRESH_TTL),
}));

const redis = registerAs('redis', () => ({
  host: process.env.REDIS_HOST,
  port: process.env.REDIS_PORT,
  ttl: process.env.REDIS_TTL,
}));

const throttle = registerAs('throttle', () => ({
  ttl: process.env.THROTTLE_TTL,
  limit: process.env.THROTTLE_LIMIT,
}));

const times = registerAs('times', () => ({
  archiveTime: process.env.ARCHIVE_TIME,
}));

const telegram = registerAs('telegram', () => ({
  token: process.env.TELEGRAM_BOT_TOKEN,
}));

const coinMarketCap = registerAs('coinMarketCap', () => ({
  apiKey: process.env.COIN_MARKET_CAP_API_KEY,
  url: process.env.COIN_MARKET_CAP_API_URL,
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

    JWT_ACCESS_SECRET: Joi.string().required(),
    JWT_REFRESH_SECRET: Joi.string().required(),
    JWT_ACCESS_TTL: Joi.number().required(),
    JWT_REFRESH_TTL: Joi.number().required(),

    REDIS_HOST: Joi.string().required(),
    REDIS_PORT: Joi.string().required(),

    THROTTLE_TTL: Joi.string().required(),
    THROTTLE_LIMIT: Joi.string().required(),

    TELEGRAM_BOT_TOKEN: Joi.string().required(),

    COIN_MARKET_CAP_API_KEY: Joi.string().required(),
    COIN_MARKET_CAP_API_URL: Joi.string().required(),
  }),
  load: [
    env,
    database,
    throttle,
    times,
    telegram,
    jwt,
    redis,
    coinMarketCap,
  ],
  isGlobal: true,
};
