import { Composer } from 'grammy';

import { changeLanguageData } from 'bot/callback-data/index.js';
import type { AppContext } from 'bot/context.js';
import { logHandle } from 'bot/helpers/logging.js';
import { languageCommandHandler, changeLanguageCqHandler } from 'bot/handlers/index.js';

const composer = new Composer<AppContext>();

const feature = composer.chatType('private');

feature.command('language', logHandle('command-language'), languageCommandHandler);

feature.callbackQuery(
  changeLanguageData.filter(),
  logHandle('keyboard-language-select'),
  changeLanguageCqHandler,
);

export { composer as languageFeature };
