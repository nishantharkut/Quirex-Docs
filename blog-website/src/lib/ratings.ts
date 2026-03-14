const RATINGS_KEY = "quirex_ratings";

export interface DocRating {
  slug: string;
  rating: number; // 1-5
  timestamp: string;
}

function getRatings(): Record<string, DocRating> {
  try { return JSON.parse(localStorage.getItem(RATINGS_KEY) || "{}"); } catch { return {}; }
}

function saveRatings(ratings: Record<string, DocRating>) {
  localStorage.setItem(RATINGS_KEY, JSON.stringify(ratings));
}

export function getRating(slug: string): number | null {
  const r = getRatings()[slug];
  return r ? r.rating : null;
}

export function setRating(slug: string, rating: number) {
  const all = getRatings();
  all[slug] = { slug, rating, timestamp: new Date().toISOString() };
  saveRatings(all);
}

export function getAverageRating(): { avg: number; count: number } {
  const all = Object.values(getRatings());
  if (all.length === 0) return { avg: 0, count: 0 };
  const sum = all.reduce((s, r) => s + r.rating, 0);
  return { avg: Math.round((sum / all.length) * 10) / 10, count: all.length };
}

export function getAllRatings(): DocRating[] {
  return Object.values(getRatings()).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
}
