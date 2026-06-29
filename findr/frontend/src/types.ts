export type ListingType = 'lost' | 'found';
export type ListingStatus = 'active' | 'matched' | 'returned' | 'closed';

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatar?: string;
  bio?: string;
}

export interface Listing {
  _id: string;
  user: string | { _id: string; name: string; email?: string; phone?: string };
  type: ListingType;
  status: ListingStatus;
  title: string;
  description: string;
  category: string;
  color?: string;
  brand?: string;
  location: string;
  date: string;
  reward?: string;
  contactName?: string;
  contactPhone?: string;
  contactEmail?: string;
  images: string[];
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface MatchResult {
  listing: Listing;
  score: number;
  reason: string;
  matchedAttributes: string[];
}

export interface AISuggestion {
  title: string;
  description: string;
  category: string;
  brand?: string;
  color?: string;
  tags: string[];
}
