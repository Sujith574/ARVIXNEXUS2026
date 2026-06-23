import mongoose, { Schema, Document } from 'mongoose';

export interface ITeamMember extends Document {
  team_id: mongoose.Types.ObjectId; // References Team
  profile_id: string; // References Profile._id (Supabase UUID), unique
  joinedAt: Date;
}

const TeamMemberSchema = new Schema<ITeamMember>(
  {
    team_id: { type: Schema.Types.ObjectId, ref: 'Team', required: true },
    profile_id: { type: String, ref: 'Profile', required: true, unique: true }, // Ensure user can only belong to one team
  },
  { timestamps: { createdAt: 'joinedAt', updatedAt: false } }
);

export default mongoose.models.TeamMember || mongoose.model<ITeamMember>('TeamMember', TeamMemberSchema);
