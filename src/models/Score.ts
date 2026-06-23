import mongoose, { Schema, Document } from 'mongoose';

export interface ICriteriaScores {
  innovation: number;
  impact: number;
  technical: number;
  presentation: number;
}

export interface IScore extends Document {
  submission_id: mongoose.Types.ObjectId; // References Submission
  judge_id: string; // References Profile._id (Supabase UUID)
  criteria_scores: ICriteriaScores;
  comment?: string;
  is_final: boolean;
  createdAt: Date;
}

const ScoreSchema = new Schema<IScore>(
  {
    submission_id: { type: Schema.Types.ObjectId, ref: 'Submission', required: true },
    judge_id: { type: String, ref: 'Profile', required: true },
    criteria_scores: {
      innovation: { type: Number, required: true, min: 0, max: 10 },
      impact: { type: Number, required: true, min: 0, max: 10 },
      technical: { type: Number, required: true, min: 0, max: 10 },
      presentation: { type: Number, required: true, min: 0, max: 10 },
    },
    comment: { type: String },
    is_final: { type: Boolean, default: false },
  },
  { timestamps: { createdAt: 'createdAt', updatedAt: false } }
);

// Prevent duplicate judge scores for the same submission
ScoreSchema.index({ submission_id: 1, judge_id: 1 }, { unique: true });

export default mongoose.models.Score || mongoose.model<IScore>('Score', ScoreSchema);
