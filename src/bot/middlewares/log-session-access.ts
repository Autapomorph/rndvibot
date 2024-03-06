import type { NextFunction } from 'grammy';

import type { AppContext } from 'bot/context.js';

export async function logSessionAccess(ctx: AppContext, next: NextFunction) {
  try {
    await next();
  } finally {
    const nowISO = new Date(Date.now()).toISOString();
    ctx.session.updatedAt = nowISO;
  }
}
