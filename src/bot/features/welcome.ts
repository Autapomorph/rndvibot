import { Composer } from 'grammy';

import type { AppContext } from 'bot/context.js';
import { welcomeHandler } from 'bot/handlers/index.js';
import { logHandle } from 'bot/helpers/logging.js';

const composer = new Composer<AppContext>();

const feature = composer.chatType('private');

feature.command('start', logHandle('command-start'), welcomeHandler);

export { composer as welcomeFeature };
