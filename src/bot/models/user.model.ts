import { ModelOptions, Prop, getModelForClass, type DocumentType } from '@typegoose/typegoose';
import { Base, TimeStamps } from '@typegoose/typegoose/lib/defaultClasses.js';

import { Settings } from 'bot/models/user-settings.model.js';

// eslint-disable-next-line @typescript-eslint/no-empty-interface, @typescript-eslint/no-unsafe-declaration-merging
export interface User extends Base {}

@ModelOptions({
  schemaOptions: {
    collection: 'users',
    toObject: {
      virtuals: true,
    },
    toJSON: {
      virtuals: true,
    },
  },
})
// eslint-disable-next-line @typescript-eslint/no-unsafe-declaration-merging
export class User extends TimeStamps {
  @Prop({
    required: true,
    index: true,
    unique: true,
    type: () => BigInt,
  })
  tgId!: bigint;

  @Prop({
    required: true,
    trim: true,
    type: () => String,
  })
  firstName!: string;

  @Prop({
    trim: true,
    type: () => String,
  })
  lastName?: string;

  @Prop({
    trim: true,
    index: true,
    type: () => String,
  })
  username?: string;

  @Prop({
    type: () => Settings,
  })
  settings!: Settings;
}

export type UserDocument = DocumentType<User>;

export const UserModel = getModelForClass(User);
