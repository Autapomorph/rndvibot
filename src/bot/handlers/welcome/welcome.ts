import { CommandContext } from 'grammy';

import type { AppContext } from 'bot/context.js';

export async function welcomeHandler(ctx: CommandContext<AppContext>) {
  return ctx.reply(ctx.t('welcome'));
}
