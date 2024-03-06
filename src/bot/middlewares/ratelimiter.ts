import { limit } from '@grammyjs/ratelimiter';
import type { Redis } from 'ioredis';

import type { AppContext } from 'bot/context.js';

export function ratelimiter(storageClient: Redis) {
  return limit({
    timeFrame: 1000,
    limit: 3,
    alwaysReply: false,
    storageClient,
    keyGenerator: (ctx: AppContext) => {
      return ctx.from?.id.toString();
    },
    onLimitExceeded: async ctx => {
      return ctx.reply(ctx.t('ratelimit.hit'));
    },
  });
}
