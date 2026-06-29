import { Request, Response } from 'express';
import { User } from '../models/User';
import { ApiError } from '../utils/ApiError';
import { asyncHandler } from '../utils/asyncHandler';

export const getMyProfile = asyncHandler(async (req: Request, res: Response) => {
  const user = await User.findById(req.user!.id);
  if (!user) throw new ApiError(404, 'User not found');
  res.json({
    user: {
      id: String(user._id),
      name: user.name,
      email: user.email,
      phone: user.phone || '',
      avatar: user.avatar || '',
      bio: user.bio || '',
    },
  });
});

export const updateMyProfile = asyncHandler(async (req: Request, res: Response) => {
  const user = await User.findByIdAndUpdate(req.user!.id, req.body, { new: true });
  if (!user) throw new ApiError(404, 'User not found');
  res.json({
    user: {
      id: String(user._id),
      name: user.name,
      email: user.email,
      phone: user.phone || '',
      avatar: user.avatar || '',
      bio: user.bio || '',
    },
  });
});
