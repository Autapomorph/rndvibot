import type { NextFunction } from 'grammy';

import type { AppContext } from 'bot/context.js';
import { UserModel } from 'bot/models/user.model.js';
import { defaultLocale } from 'bot/i18n.js';

export async function getUser(ctx: AppContext, next: NextFunction) {
  const tgUser = ctx.from;

  if (!tgUser) {
    return next();
  }

  const userResult = await UserModel.findOneAndUpdate(
    { tgId: tgUser.id },
    {
      tgId: tgUser.id,
      firstName: tgUser.first_name,
      lastName: tgUser.last_name,
      username: tgUser.username,
      $setOnInsert: { 'settings.locale': tgUser.language_code || defaultLocale },
    },
    {
      new: true,
      upsert: true,
      setDefaultsOnInsert: true,
      includeResultMetadata: true,
      runValidators: true,
    },
  );

  const user = userResult.value;
  if (user) {
    ctx.user = user;
  }

  return next();
}
