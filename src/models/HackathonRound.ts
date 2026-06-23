import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IHackathonRound extends Document {
  round_number: number;
  title: string;
  date: string;
  timeline: string;
  description: string;
}

const HackathonRoundSchema: Schema = new Schema(
  {
    round_number: { type: Number, required: true, unique: true },
    title: { type: String, required: true },
    date: { type: String, required: true },
    timeline: { type: String, required: true },
    description: { type: String, required: true },
  },
  { timestamps: true }
);

const HackathonRound: Model<IHackathonRound> =
  mongoose.models.HackathonRound || mongoose.model<IHackathonRound>('HackathonRound', HackathonRoundSchema);

export default HackathonRound;
