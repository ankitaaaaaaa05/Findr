import { Schema, model, Document, Types } from 'mongoose';

export type ListingType = 'lost' | 'found';
export type ListingStatus = 'active' | 'matched' | 'returned' | 'closed';

export interface IListing extends Document {
  user: Types.ObjectId;
  type: ListingType;
  status: ListingStatus;
  title: string;
  description: string;
  category: string;
  color?: string;
  brand?: string;
  location: string;
  date: Date;
  reward?: string;
  contactName?: string;
  contactPhone?: string;
  contactEmail?: string;
  images: string[];
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

const listingSchema = new Schema<IListing>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    type: { type: String, enum: ['lost', 'found'], required: true, index: true },
    status: {
      type: String,
      enum: ['active', 'matched', 'returned', 'closed'],
      default: 'active',
      index: true,
    },
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    category: { type: String, required: true, index: true },
    color: { type: String, trim: true },
    brand: { type: String, trim: true },
    location: { type: String, required: true, index: true },
    date: { type: Date, required: true },
    reward: { type: String },
    contactName: { type: String },
    contactPhone: { type: String },
    contactEmail: { type: String },
    images: { type: [String], default: [] },
    tags: { type: [String], default: [] },
  },
  { timestamps: true }
);

// Text index for fast keyword search across the descriptive fields.
listingSchema.index({
  title: 'text',
  description: 'text',
  category: 'text',
  brand: 'text',
  color: 'text',
  location: 'text',
  tags: 'text',
});

export const Listing = model<IListing>('Listing', listingSchema);
