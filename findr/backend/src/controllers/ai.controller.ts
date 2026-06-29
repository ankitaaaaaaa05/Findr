import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { ApiError } from '../utils/ApiError';
import { suggestFromImage, suggestFromText } from '../services/groq.service';

export const fromImage = asyncHandler(async (req: Request, res: Response) => {
  const { image, mimeType } = req.body as { image?: string; mimeType?: string };
  if (!image || typeof image !== 'string') throw new ApiError(400, 'image (base64) is required');
  const suggestion = await suggestFromImage(image, mimeType || 'image/jpeg');
  res.json({ suggestion });
});

export const fromText = asyncHandler(async (req: Request, res: Response) => {
  const { text } = req.body as { text?: string };
  if (!text || typeof text !== 'string' || text.trim().length < 3) {
    throw new ApiError(400, 'text is required');
  }
  const suggestion = await suggestFromText(text.trim());
  res.json({ suggestion });
});
