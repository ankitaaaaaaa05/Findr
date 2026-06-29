import { Request, Response } from 'express';
import mongoose from 'mongoose';
import { Listing } from '../models/Listing';
import { ApiError } from '../utils/ApiError';
import { asyncHandler } from '../utils/asyncHandler';
import { expandQuery } from '../services/groq.service';

function assertObjectId(id: string) {
  if (!mongoose.Types.ObjectId.isValid(id)) throw new ApiError(400, 'Invalid id');
}

export const createListing = asyncHandler(async (req: Request, res: Response) => {
  const listing = await Listing.create({ ...req.body, user: req.user!.id });
  res.status(201).json({ listing });
});

export const getListing = asyncHandler(async (req: Request, res: Response) => {
  assertObjectId(req.params.id);
  const listing = await Listing.findById(req.params.id).populate('user', 'name email phone avatar');
  if (!listing) throw new ApiError(404, 'Listing not found');
  res.json({ listing });
});

export const updateListing = asyncHandler(async (req: Request, res: Response) => {
  assertObjectId(req.params.id);
  const listing = await Listing.findById(req.params.id);
  if (!listing) throw new ApiError(404, 'Listing not found');
  if (String(listing.user) !== req.user!.id) throw new ApiError(403, 'Not allowed');

  Object.assign(listing, req.body);
  await listing.save();
  res.json({ listing });
});

export const deleteListing = asyncHandler(async (req: Request, res: Response) => {
  assertObjectId(req.params.id);
  const listing = await Listing.findById(req.params.id);
  if (!listing) throw new ApiError(404, 'Listing not found');
  if (String(listing.user) !== req.user!.id) throw new ApiError(403, 'Not allowed');

  await listing.deleteOne();
  res.json({ message: 'Deleted' });
});

export const listMine = asyncHandler(async (req: Request, res: Response) => {
  const listings = await Listing.find({ user: req.user!.id }).sort({ createdAt: -1 });
  res.json({ listings });
});

export const browse = asyncHandler(async (req: Request, res: Response) => {
  const {
    q,
    category,
    location,
    status,
    type,
    semantic,
    page = '1',
    limit = '20',
  } = req.query as Record<string, string>;

  const filter: Record<string, unknown> = {};
  if (category) filter.category = category;
  if (status) filter.status = status;
  if (type) filter.type = type;
  if (location) filter.location = new RegExp(escape(location), 'i');

  if (q && q.trim()) {
    const terms = semantic === 'true' ? await expandQuery(q.trim()) : [q.trim().toLowerCase()];
    const regex = new RegExp(terms.map(escape).join('|'), 'i');
    filter.$or = [
      { title: regex },
      { description: regex },
      { category: regex },
      { brand: regex },
      { color: regex },
      { tags: regex },
      { location: regex },
    ];
  }

  const p = Math.max(1, parseInt(page, 10) || 1);
  const l = Math.min(50, Math.max(1, parseInt(limit, 10) || 20));

  const [listings, total] = await Promise.all([
    Listing.find(filter)
      .sort({ createdAt: -1 })
      .skip((p - 1) * l)
      .limit(l)
      .populate('user', 'name'),
    Listing.countDocuments(filter),
  ]);

  res.json({
    listings,
    page: p,
    limit: l,
    total,
    hasMore: p * l < total,
  });
});

function escape(s: string) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
