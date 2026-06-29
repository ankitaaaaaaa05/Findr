export const CATEGORIES = [
  'Electronics',
  'Bags',
  'Wallet',
  'Keys',
  'ID/Cards',
  'Jewelry',
  'Clothing',
  'Eyewear',
  'Headphones',
  'Watch',
  'Phone',
  'Laptop',
  'Book',
  'Umbrella',
  'Pet',
  'Other',
];

export const STATUSES = ['active', 'matched', 'returned', 'closed'] as const;

export function formatDate(iso: string) {
  if (!iso) return '';
  const d = new Date(iso);
  return d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
}

export function timeAgo(iso: string) {
  if (!iso) return '';
  const diff = Date.now() - new Date(iso).getTime();
  const s = Math.floor(diff / 1000);
  if (s < 60) return 'just now';
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const days = Math.floor(h / 24);
  if (days < 30) return `${days}d ago`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months}mo ago`;
  return `${Math.floor(months / 12)}y ago`;
}
