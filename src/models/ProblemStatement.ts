import mongoose, { Schema, Document } from 'mongoose';

export interface IApiLink {
  name: string;
  url: string;
}

export interface IProblemStatement extends Document {
  title: string;
  description: string;
  pdf_url?: string;
  api_links: IApiLink[];
  track: string;
  is_active: boolean;
}

const ProblemStatementSchema = new Schema<IProblemStatement>(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    pdf_url: { type: String },
    api_links: [
      {
        name: { type: String, required: true },
        url: { type: String, required: true },
      },
    ],
    track: { type: String, required: true },
    is_active: { type: Boolean, default: true },
  }
);

export default mongoose.models.ProblemStatement || mongoose.model<IProblemStatement>('ProblemStatement', ProblemStatementSchema);
