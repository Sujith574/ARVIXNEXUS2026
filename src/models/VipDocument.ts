import mongoose, { Schema, Document } from 'mongoose';

export interface IVipDocument extends Document {
  title: string;
  file_url: string; // Storage path reference
  visible_to_profile_id: string; // References Profile._id (Supabase UUID)
  uploaded_by?: string; // References Profile._id (Supabase UUID)
  createdAt: Date;
}

const VipDocumentSchema = new Schema<IVipDocument>(
  {
    title: { type: String, required: true },
    file_url: { type: String, required: true },
    visible_to_profile_id: { type: String, ref: 'Profile', required: true },
    uploaded_by: { type: String, ref: 'Profile' },
  },
  { timestamps: { createdAt: 'createdAt', updatedAt: false } }
);

export default mongoose.models.VipDocument || mongoose.model<IVipDocument>('VipDocument', VipDocumentSchema);
