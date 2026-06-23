import mongoose, { Schema, Document } from 'mongoose';

export interface IEventAgenda extends Document {
  title: string;
  description?: string;
  start_time: Date;
  end_time: Date;
  speaker_id?: string; // References Profile._id (Supabase UUID)
  type: 'session' | 'break' | 'keynote';
}

const EventAgendaSchema = new Schema<IEventAgenda>(
  {
    title: { type: String, required: true },
    description: { type: String },
    start_time: { type: Date, required: true },
    end_time: { type: Date, required: true },
    speaker_id: { type: String, ref: 'Profile' },
    type: { type: String, enum: ['session', 'break', 'keynote'], required: true },
  }
);

export default mongoose.models.EventAgenda || mongoose.model<IEventAgenda>('EventAgenda', EventAgendaSchema);
