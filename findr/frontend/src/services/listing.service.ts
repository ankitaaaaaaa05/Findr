import { Listing, MatchResult, AISuggestion } from '../types';
import { api } from './api';

export interface BrowseParams {
  q?: string;
  category?: string;
  location?: string;
  status?: string;
  type?: string;
  semantic?: boolean;
  page?: number;
  limit?: number;
}

export const listingService = {
  browse(params: BrowseParams = {}) {
    const q = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== '' && v !== false) q.set(k, String(v));
    });
    const qs = q.toString();
    return api.get<{ listings: Listing[]; page: number; total: number; hasMore: boolean }>(
      `/listings${qs ? `?${qs}` : ''}`
    );
  },

  get(id: string) {
    return api.get<{ listing: Listing }>(`/listings/${id}`);
  },

  create(payload: Partial<Listing>) {
    return api.post<{ listing: Listing }>('/listings', payload);
  },

  update(id: string, payload: Partial<Listing>) {
    return api.put<{ listing: Listing }>(`/listings/${id}`, payload);
  },

  remove(id: string) {
    return api.del<{ message: string }>(`/listings/${id}`);
  },

  mine() {
    return api.get<{ listings: Listing[] }>('/listings/mine/list');
  },

  matches(id: string) {
    return api.get<{ matches: MatchResult[] }>(`/matches/${id}`);
  },

  aiFromText(text: string) {
    return api.post<{ suggestion: AISuggestion }>('/ai/from-text', { text });
  },

  aiFromImage(image: string, mimeType = 'image/jpeg') {
    return api.post<{ suggestion: AISuggestion }>('/ai/from-image', { image, mimeType });
  },
};
