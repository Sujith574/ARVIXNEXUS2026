import mongoose, { Schema, Document } from 'mongoose';

export interface IAuditLog extends Document {
  admin_id?: string; // References Profile._id (Supabase UUID)
  action: string;
  details: Record<string, any>;
  ip_address?: string;
  createdAt: Date;
}

const AuditLogSchema = new Schema<IAuditLog>(
  {
    admin_id: { type: String, ref: 'Profile' },
    action: { type: String, required: true },
    details: { type: Schema.Types.Mixed, default: {} },
    ip_address: { type: String },
  },
  { timestamps: { createdAt: 'createdAt', updatedAt: false } }
);

export default mongoose.models.AuditLog || mongoose.model<IAuditLog>('AuditLog', AuditLogSchema);
