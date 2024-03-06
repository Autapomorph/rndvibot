import { ErrorHandler, GrammyError } from 'grammy';

import type { AppContext } from 'bot/context.js';
import { getUpdateInfo } from 'bot/helpers/logging.js';

export const errorHandler: ErrorHandler<AppContext> = async error => {
  const { ctx } = error;

  if (error.error instanceof GrammyError) {
    const { description } = error.error;
    const voiceForbiddenErrorRegex = /voice.*message.*forbidden/i;

    if (voiceForbiddenErrorRegex.test(description)) {
      return ctx.reply('Нет прав на голосовухи');
    }
  }

  ctx.logger.error({
    err: error.error,
    update: getUpdateInfo(ctx),
  });
};
