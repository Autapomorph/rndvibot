import { Middleware } from 'grammy';
import type { Update } from '@grammyjs/types';

import type { AppContext } from 'bot/context.js';

export function getUpdateInfo(ctx: AppContext): Omit<Update, 'update_id'> {
  // eslint-disable-next-line @typescript-eslint/naming-convention
  const { update_id, ...update } = ctx.update;
  return update;
}

export function logHandle(id: string): Middleware<AppContext> {
  return (ctx, next) => {
    ctx.logger.info({
      msg: `Handle ${id}`,
      ...(id.startsWith('unhandled') ? { update: getUpdateInfo(ctx) } : {}),
    });

    return next();
  };
}
