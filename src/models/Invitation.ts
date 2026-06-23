import mongoose, { Schema, Document } from 'mongoose';

export interface IInvitation extends Document {
  code: string; // Unique invitation code
  invitee_name: string;
  email: string;
  type: 'VIP' | 'press' | 'public';
  max_uses: number;
  times_used: number;
  is_active: boolean;
  createdAt: Date;
}

const InvitationSchema = new Schema<IInvitation>(
  {
    code: { type: String, required: true, unique: true, uppercase: true },
    invitee_name: { type: String, required: true },
    email: { type: String, required: true },
    type: { type: String, enum: ['VIP', 'press', 'public'], required: true },
    max_uses: { type: Number, default: 1 },
    times_used: { type: Number, default: 0 },
    is_active: { type: Boolean, default: true },
  },
  { timestamps: { createdAt: 'createdAt', updatedAt: false } }
);

export default mongoose.models.Invitation || mongoose.model<IInvitation>('Invitation', InvitationSchema);
