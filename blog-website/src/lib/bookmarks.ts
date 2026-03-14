const BOOKMARKS_KEY = "quirex_bookmarks";
const HISTORY_KEY = "quirex_reading_history";

export interface Bookmark {
  slug: string;
  title: string;
  category: string;
  addedAt: string;
}

export interface ReadingHistoryEntry {
  slug: string;
  title: string;
  lastRead: string;
  readCount: number;
  progress: number; // 0-100 scroll percentage
}

function getBookmarks(): Bookmark[] {
  try { return JSON.parse(localStorage.getItem(BOOKMARKS_KEY) || "[]"); } catch { return []; }
}

function saveBookmarks(bookmarks: Bookmark[]) {
  localStorage.setItem(BOOKMARKS_KEY, JSON.stringify(bookmarks));
}

export function getAllBookmarks(): Bookmark[] {
  return getBookmarks().sort((a, b) => new Date(b.addedAt).getTime() - new Date(a.addedAt).getTime());
}

export function isBookmarked(slug: string): boolean {
  return getBookmarks().some((b) => b.slug === slug);
}

export function toggleBookmark(slug: string, title: string, category: string): boolean {
  const all = getBookmarks();
  const idx = all.findIndex((b) => b.slug === slug);
  if (idx >= 0) {
    all.splice(idx, 1);
    saveBookmarks(all);
    return false;
  } else {
    all.push({ slug, title, category, addedAt: new Date().toISOString() });
    saveBookmarks(all);
    return true;
  }
}

// Reading history
function getHistory(): ReadingHistoryEntry[] {
  try { return JSON.parse(localStorage.getItem(HISTORY_KEY) || "[]"); } catch { return []; }
}

function saveHistory(history: ReadingHistoryEntry[]) {
  localStorage.setItem(HISTORY_KEY, JSON.stringify(history.slice(-50))); // Keep last 50
}

export function getReadingHistory(): ReadingHistoryEntry[] {
  return getHistory().sort((a, b) => new Date(b.lastRead).getTime() - new Date(a.lastRead).getTime());
}

export function trackReading(slug: string, title: string, progress: number) {
  const all = getHistory();
  const existing = all.find((h) => h.slug === slug);
  if (existing) {
    existing.lastRead = new Date().toISOString();
    existing.readCount++;
    existing.progress = Math.max(existing.progress, progress);
  } else {
    all.push({ slug, title, lastRead: new Date().toISOString(), readCount: 1, progress });
  }
  saveHistory(all);
}

export function clearHistory() {
  localStorage.removeItem(HISTORY_KEY);
}
