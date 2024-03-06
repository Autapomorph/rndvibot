import { CallbackQueryContext, Filter } from 'grammy';

import type { AppContext } from 'bot/context.js';
import { changeLanguageData } from 'bot/callback-data/index.js';
import { i18n } from 'bot/i18n.js';
import { createChangeLanguageKeyboard } from 'bot/keyboards/index.js';

export async function languageCommandHandler(ctx: Filter<AppContext, 'message'>) {
  return ctx.reply(ctx.t('language.select'), {
    reply_markup: await createChangeLanguageKeyboard(ctx),
  });
}

export async function changeLanguageCqHandler(ctx: CallbackQueryContext<AppContext>) {
  const { code: languageCode } = changeLanguageData.unpack(ctx.callbackQuery.data);

  if (i18n.locales.includes(languageCode)) {
    ctx.i18n.useLocale(languageCode);
    ctx.user.settings.locale = languageCode;
    await ctx.user.save();

    return ctx.editMessageText(ctx.t('language.changed'), {
      reply_markup: await createChangeLanguageKeyboard(ctx),
    });
  }
}
