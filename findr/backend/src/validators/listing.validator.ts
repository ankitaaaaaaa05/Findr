import { z } from 'zod';

const isoOrDate = z.union([z.string().datetime(), z.string().min(4)]).transform((v) => new Date(v));

export const listingSchema = z.object({
  type: z.enum(['lost', 'found']),
  title: z.string().min(2).max(120),
  description: z.string().min(5).max(2000),
  category: z.string().min(2).max(40),
  color: z.string().max(30).optional(),
  brand: z.string().max(40).optional(),
  location: z.string().min(2).max(120),
  date: isoOrDate,
  reward: z.string().max(80).optional(),
  contactName: z.string().max(60).optional(),
  contactPhone: z.string().max(20).optional(),
  contactEmail: z.string().email().optional().or(z.literal('')),
  images: z.array(z.string()).max(6).default([]),
  tags: z.array(z.string()).max(20).default([]),
  status: z.enum(['active', 'matched', 'returned', 'closed']).optional(),
});

export const listingUpdateSchema = listingSchema.partial();

export type ListingInput = z.infer<typeof listingSchema>;
