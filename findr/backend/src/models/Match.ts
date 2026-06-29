import { Schema, model, Document, Types } from 'mongoose';

export interface IMatch extends Document {
  lostListing: Types.ObjectId;
  foundListing: Types.ObjectId;
  score: number;
  reason: string;
  matchedAttributes: string[];
  createdAt: Date;
}

const matchSchema = new Schema<IMatch>(
  {
    lostListing: { type: Schema.Types.ObjectId, ref: 'Listing', required: true },
    foundListing: { type: Schema.Types.ObjectId, ref: 'Listing', required: true },
    score: { type: Number, required: true },
    reason: { type: String, default: '' },
    matchedAttributes: { type: [String], default: [] },
  },
  { timestamps: true }
);

matchSchema.index({ lostListing: 1, foundListing: 1 }, { unique: true });

export const Match = model<IMatch>('Match', matchSchema);
