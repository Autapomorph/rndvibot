import { BotConfig, Bot as TelegramBot, StorageAdapter } from 'grammy';
import { hydrateContext, hydrateApi } from '@grammyjs/hydrate';
import { hydrateReply, parseMode } from '@grammyjs/parse-mode';
import { hydrateFiles } from '@grammyjs/files';
import { conversations } from '@grammyjs/conversations';
import { autoChatAction } from '@grammyjs/auto-chat-action';
import { autoRetry } from '@grammyjs/auto-retry';

import { type AppContext, type AppApi, createContextConstructor } from 'bot/context.js';
import { SessionData } from 'bot/types/session.js';
import {
  adminFeature,
  languageFeature,
  unhandledFeature,
  welcomeFeature,
  videoFeature,
} from 'bot/features/index.js';
import { errorHandler } from 'bot/handlers/index.js';
import { i18n, isMultipleLocales } from 'bot/i18n.js';
import {
  updateLogger,
  ratelimiter,
  session,
  getUser,
  logSessionAccess,
} from 'bot/middlewares/index.js';
import { config } from 'config.js';
import { getRedisInstance } from 'redis.js';
import { logger } from 'logger.js';

interface Options {
  sessionStorage?: StorageAdapter<SessionData>;
  config?: Omit<BotConfig<AppContext>, 'ContextConstructor'>;
}

export type Bot = ReturnType<typeof createBot>;

export function createBot(token: string, options: Options = {}) {
  const redis = getRedisInstance(config.REDIS_URI);

  const bot = new TelegramBot<AppContext, AppApi>(token, {
    ...options.config,
    ContextConstructor: createContextConstructor({ redis, logger }),
  });
  const protectedBot = bot.errorBoundary(errorHandler);

  // Middlewares
  bot.api.config.use(autoRetry());
  bot.api.config.use(parseMode('HTML'));
  bot.api.config.use(hydrateApi());
  bot.api.config.use(hydrateFiles(bot.token));

  if (config.isDev) {
    protectedBot.use(updateLogger());
  }

  protectedBot.use(session(options.sessionStorage));
  protectedBot.use(logSessionAccess);
  protectedBot.use(getUser);
  protectedBot.use(i18n);
  protectedBot.use(hydrateReply);
  protectedBot.use(hydrateContext());
  protectedBot.use(ratelimiter(redis));
  protectedBot.use(conversations());
  protectedBot.use(autoChatAction(bot.api));

  // Handlers
  protectedBot.use(videoFeature);
  protectedBot.use(welcomeFeature);
  protectedBot.use(adminFeature);

  if (isMultipleLocales) {
    protectedBot.use(languageFeature);
  }

  // Must be the last handler
  protectedBot.use(unhandledFeature);

  return bot;
}
