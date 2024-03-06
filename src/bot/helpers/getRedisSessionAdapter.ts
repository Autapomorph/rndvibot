import { RedisAdapter } from '@grammyjs/storage-redis';
import type { Redis } from 'ioredis';

import { SessionData } from 'bot/types/session.js';

// 24h ttl
const ttl = 24 * 60 * 60;

export const getRedisSessionAdapter = (redisInstance: Redis) => {
  return new RedisAdapter<SessionData>({ instance: redisInstance, ttl });
};
