import bcrypt from 'bcryptjs';
import { Request, Response } from 'express';
import { User } from '../models/User';
import { signToken } from '../utils/token';
import { ApiError } from '../utils/ApiError';
import { asyncHandler } from '../utils/asyncHandler';

function publicUser(u: { _id: unknown; name: string; email: string; phone?: string; avatar?: string; bio?: string }) {
  return {
    id: String(u._id),
    name: u.name,
    email: u.email,
    phone: u.phone || '',
    avatar: u.avatar || '',
    bio: u.bio || '',
  };
}

export const register = asyncHandler(async (req: Request, res: Response) => {
  const { name, email, password, phone } = req.body;

  const existing = await User.findOne({ email });
  if (existing) throw new ApiError(409, 'An account with this email already exists');

  const hash = await bcrypt.hash(password, 10);
  const user = await User.create({ name, email, password: hash, phone });
  const token = signToken({ id: String(user._id), email: user.email });

  res.status(201).json({ token, user: publicUser(user) });
});

export const login = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email }).select('+password');
  if (!user) throw new ApiError(401, 'Invalid email or password');

  const ok = await bcrypt.compare(password, user.password);
  if (!ok) throw new ApiError(401, 'Invalid email or password');

  const token = signToken({ id: String(user._id), email: user.email });
  res.json({ token, user: publicUser(user) });
});

export const me = asyncHandler(async (req: Request, res: Response) => {
  const user = await User.findById(req.user!.id);
  if (!user) throw new ApiError(404, 'User not found');
  res.json({ user: publicUser(user) });
});

// Stateless JWT — logout is handled client-side by dropping the token.
// This endpoint exists so the mobile app can confirm the call succeeded.
export const logout = asyncHandler(async (_req: Request, res: Response) => {
  res.json({ message: 'Logged out' });
});
