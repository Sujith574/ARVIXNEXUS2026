import mongoose, { Schema, Document } from 'mongoose';

export interface IProfile {
  _id: string; // Set to the Supabase Auth user ID (UUID string)
  full_name: string;
  email: string;
  role: 'participant' | 'judge' | 'mentor' | 'admin' | 'super_admin';
  phone?: string;
  github?: string;
  linkedin?: string;
  skills: string[];
  avatar_url?: string;
  is_speaker?: boolean;
  organization?: string;
  bio?: string;
  createdAt: Date;
}

const ProfileSchema = new Schema<IProfile>(
  {
    _id: { type: String, required: true }, // Override default ObjectId with Supabase UUID string
    full_name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    role: {
      type: String,
      enum: ['participant', 'judge', 'mentor', 'admin', 'super_admin'],
      default: 'participant',
    },
    phone: { type: String },
    github: { type: String },
    linkedin: { type: String },
    skills: { type: [String], default: [] },
    avatar_url: { type: String },
    is_speaker: { type: Boolean, default: false },
    organization: { type: String },
    bio: { type: String },
  },
  { timestamps: { createdAt: 'createdAt', updatedAt: false } }
);

// Prevent mongoose from compiling model multiple times
export default mongoose.models.Profile || mongoose.model<IProfile>('Profile', ProfileSchema);
