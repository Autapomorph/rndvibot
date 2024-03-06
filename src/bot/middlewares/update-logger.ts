import { performance } from 'node:perf_hooks';
import { Middleware } from 'grammy';

import type { AppContext } from 'bot/context.js';
import { getUpdateInfo } from 'bot/helpers/logging.js';

export function updateLogger(): Middleware<AppContext> {
  return async (ctx, next) => {
    ctx.api.config.use((previous, method, payload, signal) => {
      ctx.logger.debug({
        msg: 'Bot api call',
        method,
        payload,
      });

      return previous(method, payload, signal);
    });

    ctx.logger.debug({
      msg: 'Update received',
      update: getUpdateInfo(ctx),
    });

    const startTime = performance.now();
    try {
      await next();
    } finally {
      const endTime = performance.now();
      ctx.logger.debug({
        msg: 'Update processed',
        duration: endTime - startTime,
      });
    }
  };
}
