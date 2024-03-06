import { isUserHasId } from 'grammy-guard';

import { config } from 'config.js';

export const isAdmin = isUserHasId(...config.BOT_ADMINS);
