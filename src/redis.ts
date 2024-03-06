import { Redis } from 'ioredis';

import { logger } from 'logger.js';

let redisInstance: Redis | undefined;

export const getRedisInstance = (path: string) => {
  if (!redisInstance) {
    const redis = new Redis(path);
    redis.on('connect', () => logger.info('Redis connected'));
    redis.on('error', error => logger.error(error));
    redisInstance = redis;
  }

  return redisInstance;
};
