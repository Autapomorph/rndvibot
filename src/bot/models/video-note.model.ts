import {
  ModelOptions,
  Prop,
  getModelForClass,
  type Ref,
  type DocumentType,
} from '@typegoose/typegoose';
import { Base, TimeStamps } from '@typegoose/typegoose/lib/defaultClasses.js';

import { User } from 'bot/models/user.model.js';

// eslint-disable-next-line @typescript-eslint/no-empty-interface, @typescript-eslint/no-unsafe-declaration-merging
export interface VideoNote extends Base {}

@ModelOptions({
  schemaOptions: {
    collection: 'video-notes',
    toObject: {
      virtuals: true,
    },
    toJSON: {
      virtuals: true,
    },
  },
})
// eslint-disable-next-line @typescript-eslint/no-unsafe-declaration-merging
export class VideoNote extends TimeStamps {
  @Prop({
    ref: () => User,
    required: true,
    index: true,
    type: () => String,
  })
  userId!: Ref<User>;

  @Prop({
    required: true,
    trim: true,
    index: true,
    type: () => String,
  })
  fileId!: string;

  @Prop({
    required: true,
    trim: true,
    index: true,
    type: () => String,
  })
  fileUniqueId!: string;

  @Prop({
    required: true,
    trim: true,
    index: true,
    type: () => String,
  })
  title!: string;

  @Prop({
    trim: true,
    index: true,
    type: () => String,
  })
  description?: string;
}

export type VideoNoteDocument = DocumentType<VideoNote>;

export const VideoNoteModel = getModelForClass(VideoNote);
