import mongoose, { Schema, Document } from 'mongoose';

export interface ITeam extends Document {
  name: string;
  captain_id: string; // References Profile._id (Supabase UUID)
  code: string; // 6-character invite code
  max_members: number;
  createdAt: Date;
}

const TeamSchema = new Schema<ITeam>(
  {
    name: { type: String, required: true, unique: true },
    captain_id: { type: String, ref: 'Profile', required: true },
    code: { type: String, required: true, unique: true, uppercase: true, minlength: 6, maxlength: 6 },
    max_members: { type: Number, default: 4 },
  },
  { timestamps: { createdAt: 'createdAt', updatedAt: false } }
);

export default mongoose.models.Team || mongoose.model<ITeam>('Team', TeamSchema);
