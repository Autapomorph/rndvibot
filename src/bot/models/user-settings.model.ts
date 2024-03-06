import { Prop } from '@typegoose/typegoose';

export class Settings {
  @Prop({
    required: true,
    trim: true,
    type: () => String,
  })
  locale!: string;
}
