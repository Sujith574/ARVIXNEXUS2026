import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ISystemSetting extends Document {
  key: string;
  value: any;
  description?: string;
}

const SystemSettingSchema: Schema = new Schema(
  {
    key: { type: String, required: true, unique: true, index: true },
    value: { type: Schema.Types.Mixed, required: true },
    description: { type: String },
  },
  { timestamps: true }
);

const SystemSetting: Model<ISystemSetting> =
  mongoose.models.SystemSetting || mongoose.model<ISystemSetting>('SystemSetting', SystemSettingSchema);

export default SystemSetting;
