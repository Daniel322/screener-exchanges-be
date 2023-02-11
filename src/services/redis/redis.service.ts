import { Injectable, Inject, CACHE_MANAGER } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Cache } from 'cache-manager';

@Injectable()
export class RedisService {
  private readonly cacheTtl: string;

  constructor(
    @Inject(CACHE_MANAGER)
    private readonly cache: Cache,
    private readonly configService: ConfigService,
  ) {
    this.cacheTtl = this.configService.get('redis.ttl');
  }

  get<T>(key: string): Promise<T> {
    return this.cache.get(key);
  }

  async set<T>(
    key: string,
    value: T,
    ttl = Number(this.cacheTtl),
  ): Promise<T | void> {
    return this.cache.set(key, value, ttl);
  }

  async del<T>(key: string): Promise<T> {
    const [value] = await Promise.all([
      this.cache.get<T>(key),
      this.cache.del(key),
    ]);

    return value;
  }
}
