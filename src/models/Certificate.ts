import mongoose, { Schema, Document } from 'mongoose';

export interface ICertificate extends Document {
  profile_id: string; // References Profile._id (Supabase UUID)
  type: 'participation' | 'winner';
  pdf_url: string; // Storage URL
  sentAt: Date;
}

const CertificateSchema = new Schema<ICertificate>(
  {
    profile_id: { type: String, ref: 'Profile', required: true },
    type: { type: String, enum: ['participation', 'winner'], required: true },
    pdf_url: { type: String, required: true },
    sentAt: { type: Date, default: Date.now },
  }
);

export default mongoose.models.Certificate || mongoose.model<ICertificate>('Certificate', CertificateSchema);
