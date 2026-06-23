import mongoose, { Schema, Document } from 'mongoose';

export interface IRsvp extends Document {
  invitation_id: mongoose.Types.ObjectId; // References Invitation
  name: string;
  email: string;
  phone?: string;
  confirmed: boolean;
  qr_code_data: string; // Unique ticket code
  checkin_time?: Date; // Logging arrival time
  createdAt: Date;
}

const RsvpSchema = new Schema<IRsvp>(
  {
    invitation_id: { type: Schema.Types.ObjectId, ref: 'Invitation', required: true },
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String },
    confirmed: { type: Boolean, default: true },
    qr_code_data: { type: String, required: true, unique: true },
    checkin_time: { type: Date },
  },
  { timestamps: { createdAt: 'createdAt', updatedAt: false } }
);

export default mongoose.models.Rsvp || mongoose.model<IRsvp>('Rsvp', RsvpSchema);
