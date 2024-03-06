import { Filter } from 'grammy';

import type { AppContext } from 'bot/context.js';

export async function unhandledMessageHandler(ctx: Filter<AppContext, 'message'>) {
  return ctx.reply(ctx.t('unhandled'));
}

export async function unhandledCallbackQueryHandler(ctx: Filter<AppContext, 'callback_query'>) {
  return ctx.answerCallbackQuery();
}
