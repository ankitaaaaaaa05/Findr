import { Request, Response } from 'express';
import mongoose from 'mongoose';
import { Listing } from '../models/Listing';
import { ApiError } from '../utils/ApiError';
import { asyncHandler } from '../utils/asyncHandler';
import { assessMatch } from '../services/groq.service';

// Quick local prefilter so we don't burn AI calls on items that obviously
// can't match (different type, opposite status, too far apart in time).
function prefilter(listing: { type: string; createdAt: Date }) {
  const opposite = listing.type === 'lost' ? 'found' : 'lost';
  return { type: opposite, status: { $in: ['active', 'matched'] } };
}

export const findMatches = asyncHandler(async (req: Request, res: Response) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) throw new ApiError(400, 'Invalid id');

  const listing = await Listing.findById(req.params.id);
  if (!listing) throw new ApiError(404, 'Listing not found');
  if (String(listing.user) !== req.user!.id) throw new ApiError(403, 'Not allowed');

  // Pull a small candidate pool. Same category bumps up priority but isn't required.
  const candidates = await Listing.find(prefilter(listing))
    .sort({ createdAt: -1 })
    .limit(8);

  const slim = (l: typeof listing) => ({
    title: l.title,
    description: l.description,
    category: l.category,
    color: l.color,
    brand: l.brand,
    location: l.location,
    date: l.date,
    tags: l.tags,
  });

  const results = await Promise.all(
    candidates.map(async (c) => {
      const a = listing.type === 'lost' ? listing : c;
      const b = listing.type === 'lost' ? c : listing;
      const verdict = await assessMatch(slim(a), slim(b));
      return {
        listing: c,
        score: verdict.score,
        reason: verdict.reason,
        matchedAttributes: verdict.matchedAttributes,
      };
    })
  );

  // Sort high-confidence first and only return reasonably likely matches.
  const sorted = results.filter((r) => r.score >= 35).sort((a, b) => b.score - a.score);
  res.json({ matches: sorted });
});
