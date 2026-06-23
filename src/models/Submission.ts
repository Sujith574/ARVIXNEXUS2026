import mongoose, { Schema, Document } from 'mongoose';

export interface ISubmission extends Document {
  team_id: mongoose.Types.ObjectId; // References Team, unique
  title: string;
  description: string;
  repo_url: string;
  live_url: string; // Live Link / Deployed Website URL
  demo_video_url?: string;
  screenshots: string[]; // List of storage paths
  document_url?: string; // Pitch deck path
  status: 'draft' | 'submitted';
  submittedAt: Date;
}

const SubmissionSchema = new Schema<ISubmission>(
  {
    team_id: { type: Schema.Types.ObjectId, ref: 'Team', required: true, unique: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    repo_url: { type: String, required: true },
    live_url: { type: String, required: true },
    demo_video_url: { type: String },
    screenshots: { type: [String], default: [] },
    document_url: { type: String },
    status: { type: String, enum: ['draft', 'submitted'], default: 'draft' },
  },
  { timestamps: { createdAt: 'submittedAt', updatedAt: false } }
);

export default mongoose.models.Submission || mongoose.model<ISubmission>('Submission', SubmissionSchema);
