const ANALYTICS_KEY = "quirex_analytics";

export interface PageView {
  slug: string;
  title: string;
  timestamp: string;
}

export interface AnalyticsData {
  pageViews: PageView[];
  searchQueries: { query: string; timestamp: string; resultsCount?: number }[];
}

function getData(): AnalyticsData {
  const stored = localStorage.getItem(ANALYTICS_KEY);
  if (!stored) return { pageViews: [], searchQueries: [] };
  return JSON.parse(stored);
}

function save(data: AnalyticsData) {
  data.pageViews = data.pageViews.slice(-1000);
  data.searchQueries = data.searchQueries.slice(-500);
  localStorage.setItem(ANALYTICS_KEY, JSON.stringify(data));
}

export function trackPageView(slug: string, title: string) {
  const data = getData();
  data.pageViews.push({ slug, title, timestamp: new Date().toISOString() });
  save(data);
}

export function trackSearch(query: string, resultsCount?: number) {
  const data = getData();
  data.searchQueries.push({ query, timestamp: new Date().toISOString(), resultsCount });
  save(data);
}

export function getAnalytics(): AnalyticsData {
  return getData();
}

export function getPopularPages(days = 30): { slug: string; title: string; views: number }[] {
  const data = getData();
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - days);

  const counts: Record<string, { title: string; views: number }> = {};
  data.pageViews
    .filter((v) => new Date(v.timestamp) >= cutoff)
    .forEach((v) => {
      if (!counts[v.slug]) counts[v.slug] = { title: v.title, views: 0 };
      counts[v.slug].views++;
    });

  return Object.entries(counts)
    .map(([slug, d]) => ({ slug, ...d }))
    .sort((a, b) => b.views - a.views);
}

export function getViewsOverTime(days = 30): { date: string; views: number }[] {
  const data = getData();
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - days);

  const byDate: Record<string, number> = {};
  data.pageViews
    .filter((v) => new Date(v.timestamp) >= cutoff)
    .forEach((v) => {
      const date = v.timestamp.split("T")[0];
      byDate[date] = (byDate[date] || 0) + 1;
    });

  const result: { date: string; views: number }[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const key = d.toISOString().split("T")[0];
    result.push({ date: key, views: byDate[key] || 0 });
  }
  return result;
}

export function getTopSearchQueries(days = 30): { query: string; count: number }[] {
  const data = getData();
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - days);

  const counts: Record<string, number> = {};
  data.searchQueries
    .filter((q) => new Date(q.timestamp) >= cutoff)
    .forEach((q) => {
      const key = q.query.toLowerCase().trim();
      counts[key] = (counts[key] || 0) + 1;
    });

  return Object.entries(counts)
    .map(([query, count]) => ({ query, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 20);
}

export function getZeroResultSearches(days = 30): { query: string; count: number }[] {
  const data = getData();
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - days);

  const counts: Record<string, number> = {};
  data.searchQueries
    .filter((q) => new Date(q.timestamp) >= cutoff && q.resultsCount === 0)
    .forEach((q) => {
      const key = q.query.toLowerCase().trim();
      counts[key] = (counts[key] || 0) + 1;
    });

  return Object.entries(counts)
    .map(([query, count]) => ({ query, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);
}

export function getFeedbackSummary(): { total: number; positive: number; negative: number; ratio: number } {
  try {
    const data = JSON.parse(localStorage.getItem("quirex_feedback") || "{}");
    const entries = Object.values(data) as { helpful: boolean }[];
    const total = entries.length;
    const positive = entries.filter((e) => e.helpful).length;
    const negative = total - positive;
    return { total, positive, negative, ratio: total > 0 ? Math.round((positive / total) * 100) : 0 };
  } catch {
    return { total: 0, positive: 0, negative: 0, ratio: 0 };
  }
}
