import { Composer } from 'grammy';

import type { AppContext } from 'bot/context.js';
import { logHandle } from 'bot/helpers/logging.js';
import { unhandledMessageHandler, unhandledCallbackQueryHandler } from 'bot/handlers/index.js';

const composer = new Composer<AppContext>();

const feature = composer.chatType('private');

feature.on('message', logHandle('unhandled-message'), unhandledMessageHandler);

feature.on('callback_query', logHandle('unhandled-callback-query'), unhandledCallbackQueryHandler);

export { composer as unhandledFeature };
