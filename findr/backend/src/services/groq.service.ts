import axios from 'axios';
import { env } from '../config/env';
import { ApiError } from '../utils/ApiError';

const GROQ_URL = 'https://api.groq.com/openai/v1/chat/completions';

interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string | Array<{ type: string; text?: string; image_url?: { url: string } }>;
}

async function chat(messages: ChatMessage[], model: string, temperature = 0.4): Promise<string> {
  if (!env.groq.apiKey) {
    throw new ApiError(500, 'GROQ_API_KEY is not configured on the server');
  }
  try {
    const { data } = await axios.post(
      GROQ_URL,
      {
        model,
        messages,
        temperature,
        max_tokens: 1024,
        response_format: { type: 'json_object' },
      },
      {
        headers: {
          Authorization: `Bearer ${env.groq.apiKey}`,
          'Content-Type': 'application/json',
        },
        timeout: 30000,
      }
    );
    return data?.choices?.[0]?.message?.content ?? '';
  } catch (e) {
    const msg = axios.isAxiosError(e) ? e.response?.data?.error?.message || e.message : 'Groq request failed';
    throw new ApiError(502, `AI service error: ${msg}`);
  }
}

// Strip <think> reasoning tags that Qwen sometimes emits before the JSON.
function cleanJsonText(raw: string): string {
  let s = raw.trim();
  s = s.replace(/<think>[\s\S]*?<\/think>/gi, '').trim();
  // Strip ```json fences if present
  s = s.replace(/^```(?:json)?\s*/i, '').replace(/```$/i, '').trim();
  // Find the first { and last } so trailing prose doesn't break parsing
  const start = s.indexOf('{');
  const end = s.lastIndexOf('}');
  if (start !== -1 && end !== -1) s = s.slice(start, end + 1);
  return s;
}

function parseJson<T = unknown>(raw: string): T {
  try {
    return JSON.parse(cleanJsonText(raw)) as T;
  } catch {
    throw new ApiError(502, 'AI returned an unparseable response');
  }
}

export interface SuggestedListing {
  title: string;
  description: string;
  category: string;
  brand?: string;
  color?: string;
  tags: string[];
}

const CATEGORIES =
  'Electronics, Bags, Wallet, Keys, ID/Cards, Jewelry, Clothing, Eyewear, Headphones, Watch, Phone, Laptop, Book, Umbrella, Pet, Other';

export async function suggestFromImage(imageBase64: string, mimeType = 'image/jpeg'): Promise<SuggestedListing> {
  const dataUrl = imageBase64.startsWith('data:')
    ? imageBase64
    : `data:${mimeType};base64,${imageBase64}`;

  const system =
    'You help fill out a Lost & Found listing by analysing a photo of the item. ' +
    'Respond with strict JSON only. No markdown, no commentary.';

  const userPrompt = `Look at the item in the image and return JSON with exactly these keys:
title (short, max 8 words),
description (1-2 sentences, factual, no speculation),
category (one of: ${CATEGORIES}),
brand (string, empty if unknown),
color (primary visible color),
tags (array of 3-6 short lowercase keywords).
Do not include any other keys.`;

  const raw = await chat(
    [
      { role: 'system', content: system },
      {
        role: 'user',
        content: [
          { type: 'text', text: userPrompt },
          { type: 'image_url', image_url: { url: dataUrl } },
        ],
      },
    ],
    env.groq.visionModel,
    0.2
  );

  const parsed = parseJson<Partial<SuggestedListing>>(raw);
  return {
    title: parsed.title || 'Unidentified item',
    description: parsed.description || '',
    category: parsed.category || 'Other',
    brand: parsed.brand || '',
    color: parsed.color || '',
    tags: Array.isArray(parsed.tags) ? parsed.tags.slice(0, 6) : [],
  };
}

export async function suggestFromText(text: string): Promise<SuggestedListing> {
  const system =
    'You help fill out a Lost & Found listing from a one-sentence user description. ' +
    'Respond with strict JSON only.';

  const userPrompt = `User said: "${text}"

Return JSON with keys: title, description, category (one of: ${CATEGORIES}), brand, color, tags (array of 3-6 short keywords). ` +
    'Keep title under 8 words. Keep description to 1-2 sentences. Do not invent details not implied by the text.';

  const raw = await chat(
    [
      { role: 'system', content: system },
      { role: 'user', content: userPrompt },
    ],
    env.groq.textModel,
    0.3
  );

  const parsed = parseJson<Partial<SuggestedListing>>(raw);
  return {
    title: parsed.title || text.slice(0, 60),
    description: parsed.description || text,
    category: parsed.category || 'Other',
    brand: parsed.brand || '',
    color: parsed.color || '',
    tags: Array.isArray(parsed.tags) ? parsed.tags.slice(0, 6) : [],
  };
}

export interface MatchAssessment {
  score: number; // 0..100
  reason: string;
  matchedAttributes: string[];
}

export async function assessMatch(a: Record<string, unknown>, b: Record<string, unknown>): Promise<MatchAssessment> {
  const system =
    'You compare a Lost item and a Found item and judge if they could be the same object. ' +
    'Reply with strict JSON only.';

  const userPrompt = `Compare these two items and return JSON:
{
  "score": <integer 0 to 100 confidence they are the same item>,
  "matchedAttributes": [<short list of attributes that matched, e.g. "category", "brand", "color">],
  "reason": "<one sentence explanation>"
}

Item A (lost): ${JSON.stringify(a)}
Item B (found): ${JSON.stringify(b)}`;

  const raw = await chat(
    [
      { role: 'system', content: system },
      { role: 'user', content: userPrompt },
    ],
    env.groq.textModel,
    0.1
  );

  const parsed = parseJson<Partial<MatchAssessment>>(raw);
  const score = Math.max(0, Math.min(100, Math.round(Number(parsed.score) || 0)));
  return {
    score,
    reason: parsed.reason || '',
    matchedAttributes: Array.isArray(parsed.matchedAttributes) ? parsed.matchedAttributes : [],
  };
}

export async function expandQuery(query: string): Promise<string[]> {
  const system = 'You expand short search queries with synonyms for a Lost & Found search. Reply with strict JSON.';
  const userPrompt = `Query: "${query}"
Return JSON of the form { "terms": [<5 to 10 lowercase synonyms or related words, including the original>] }. Keep each term to 1-2 words.`;

  try {
    const raw = await chat(
      [
        { role: 'system', content: system },
        { role: 'user', content: userPrompt },
      ],
      env.groq.textModel,
      0.2
    );
    const parsed = parseJson<{ terms?: string[] }>(raw);
    const terms = Array.isArray(parsed.terms) ? parsed.terms : [];
    return [...new Set([query.toLowerCase(), ...terms.map((t) => String(t).toLowerCase())])];
  } catch {
    // Semantic expansion is a best-effort enhancement; fall back to the raw query.
    return [query.toLowerCase()];
  }
}
