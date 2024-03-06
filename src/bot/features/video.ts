import { Composer, InputFile, InlineQueryResultBuilder } from 'grammy';
import { createConversation } from '@grammyjs/conversations';
import ffmpeg, { FfprobeData } from 'fluent-ffmpeg';

import type { AppContext } from 'bot/context.js';
import type { AppConversation } from 'bot/types/conversation.js';
import { VideoNoteModel } from 'bot/models/video-note.model.js';
import { i18n } from 'bot/i18n.js';
import { getUser } from 'bot/middlewares/index.js';
import { logHandle } from 'bot/helpers/logging.js';

async function getTitle(conversation: AppConversation, ctx: AppContext) {
  await ctx.reply('Give title to your video');

  const title = await conversation.form.text(async ctxOtherwise => {
    return ctxOtherwise.reply('Give title to your video');
  });

  return title;
}

async function getDescription(conversation: AppConversation, ctx: AppContext) {
  await ctx.reply('Give video description');

  const description = await conversation.form.text(async ctxOtherwise => {
    return ctxOtherwise.reply('Give video description');
  });

  return description;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
async function getKeywords(conversation: AppConversation, ctx: AppContext) {
  await ctx.reply('Send video keywords for easy find, comma delimeted');

  const keywordsString = await conversation.form.text(async ctxOtherwise => {
    return ctxOtherwise.reply('Send video keywords for easy find, comma delimeted');
  });

  return keywordsString.split(',');
}

async function videoConversation(conversation: AppConversation, ctx: AppContext) {
  await conversation.run(getUser);
  await conversation.run(i18n);

  const title = await getTitle(conversation, ctx);
  const description = await getDescription(conversation, ctx);
  // const keywords = await getKeywords(conversation, ctx);

  const { videoConversationData } = conversation.session;
  if (!videoConversationData) {
    return ctx.reply('Ошибка');
  }

  if (!ctx.from) {
    return ctx.reply('Ошибка');
  }

  await conversation.external(async () => {
    await VideoNoteModel.create({
      userId: ctx.user.id,
      fileId: videoConversationData.fileId,
      fileUniqueId: videoConversationData.fileUniqueId,
      title,
      description,
    });
  });

  // eslint-disable-next-line no-param-reassign
  conversation.session.videoConversationData = undefined;

  return ctx.reply('Saved');
}

async function cropVideo(path: string) {
  const metadata: FfprobeData = await new Promise((resolve, reject) => {
    ffmpeg.ffprobe(path, (error, data) => {
      if (error) {
        reject(error);
      }

      resolve(data);
    });
  });

  const str = metadata.streams.filter(stream => Object.hasOwn(stream, 'width'))[0];
  const { width, height } = str;

  if (width === undefined || height === undefined) {
    throw new Error('Unable to measure video dimensions');
  }

  const maxCircleSize = 640;
  const cropCircleSize = Math.min(width, height, maxCircleSize);

  let cropWidth = width;
  let cropHeight = height;

  if (width > height) {
    cropWidth = height;
    cropHeight = height;
  } else {
    cropWidth = width;
    cropHeight = width;
  }

  const croppedPath = `${path}-cropped`;

  await new Promise((resolve, reject) => {
    ffmpeg()
      .input(path)
      .output(croppedPath)
      .format('mp4')
      .audioCodec('aac')
      .videoCodec('libx265')
      .size(`${cropCircleSize}x${cropCircleSize}`)
      .videoFilters([
        {
          filter: 'crop',
          options: `w=${cropWidth}:h=${cropHeight}`,
        },
      ])
      .on('error', reject)
      .on('end', resolve)
      .run();
  });

  return croppedPath;
}

async function isVideoNoteExist(fileUniqueId: string) {
  const videoNote = await VideoNoteModel.findOne({ fileUniqueId });

  if (videoNote) {
    return true;
  }

  return false;
}

const composer = new Composer<AppContext>();

const feature = composer.chatType('private');

feature.command('cancel', async (ctx, next) => {
  const stats = await ctx.conversation.active();
  if (stats?.video > 0) {
    await ctx.conversation.exit('video');
    ctx.session.videoConversationData = undefined;
    return ctx.reply('Video cancelled');
  }

  return next();
});

feature.callbackQuery('cancel', async (ctx, next) => {
  const stats = await ctx.conversation.active();
  if (stats?.video > 0) {
    await ctx.conversation.exit('video');
    ctx.session.videoConversationData = undefined;
    return ctx.answerCallbackQuery('Video cancelled');
  }

  return next();
});

feature.use(createConversation(videoConversation, 'video'));

feature.on(':video_note', logHandle('videoNote'), async ctx => {
  const { file_id: fileId, file_unique_id: fileUniqueId } = ctx.message.video_note;

  const isVideoNoteExistAlready = await isVideoNoteExist(fileUniqueId);
  if (isVideoNoteExistAlready) {
    return ctx.reply('Такое видео уже существует');
  }

  ctx.session.videoConversationData = {
    fileId,
    fileUniqueId,
  };

  const stats = await ctx.conversation.active();
  if (!stats.video || stats.video === 0) {
    return ctx.conversation.enter('video');
  }
});

feature.on(':video', logHandle('video'), async ctx => {
  const file = await ctx.getFile();
  const path = await file.download();

  let croppedPath;
  try {
    croppedPath = await cropVideo(path);
  } catch (error) {
    return await ctx.reply('Ошибка');
  }

  const videoNote = new InputFile(croppedPath);
  const videoNoteMessage = await ctx.replyWithVideoNote(videoNote);
  const { file_id: fileId, file_unique_id: fileUniqueId } = videoNoteMessage.video_note;

  ctx.session.videoConversationData = {
    fileId,
    fileUniqueId,
  };

  const stats = await ctx.conversation.active();
  if (!stats.video || stats.video === 0) {
    return ctx.conversation.enter('video');
  }
});

composer.on('inline_query', logHandle('inline query'), async ctx => {
  const videoNotes = await VideoNoteModel.find({ userId: ctx.user.id });

  const inlineQueryVideoCachedResults = videoNotes.map(videoNote => {
    return InlineQueryResultBuilder.videoCached(
      videoNote.fileId.slice(0, 64),
      videoNote.title,
      videoNote.fileId,
      {
        // caption: 'cap',
        description: videoNote.description,
      },
    );
  });

  return ctx.answerInlineQuery(inlineQueryVideoCachedResults, { cache_time: 0 });
});

export { composer as videoFeature };
