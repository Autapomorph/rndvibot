import { Composer } from 'grammy';
import { chatAction } from '@grammyjs/auto-chat-action';

import type { AppContext } from 'bot/context.js';
import { isAdmin } from 'bot/filters/index.js';
import { setCommandsHandler } from 'bot/handlers/index.js';
import { logHandle } from 'bot/helpers/logging.js';

const composer = new Composer<AppContext>();

const feature = composer.chatType('private').filter(isAdmin);

feature.command(
  'setcommands',
  logHandle('command-setcommands'),
  chatAction('typing'),
  setCommandsHandler,
);

export { composer as adminFeature };
