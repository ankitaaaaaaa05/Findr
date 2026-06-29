import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(__dirname, '../../.env') });

function required(name: string, fallback?: string) {
  const v = process.env[name] ?? fallback;
  if (!v) {
    throw new Error(
      `Missing env var: ${name}. ` +
        `Copy backend/.env.example to backend/.env and fill it in ` +
        `(on Windows: "copy .env.example .env").`
    );
  }
  return v;
}

export const env = {
  port: Number(process.env.PORT || 8001),
  mongoUri: required('MONGODB_URI', 'mongodb://localhost:27017/lost_and_found'),
  jwtSecret: required('JWT_SECRET'),
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  groq: {
    apiKey: process.env.GROQ_API_KEY || '',
    textModel: process.env.GROQ_TEXT_MODEL || 'qwen/qwen3-32b',
    visionModel: process.env.GROQ_VISION_MODEL || 'meta-llama/llama-4-scout-17b-16e-instruct',
  },
};
