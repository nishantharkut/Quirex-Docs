import { Post } from "@/types/blog";

export interface DocHealthScore {
  slug: string;
  title: string;
  category: string;
  overall: number; // 0-100
  factors: {
    freshness: number; // 0-100, based on days since last update
    completeness: number; // 0-100, based on content length, sections, etc.
    quality: number; // 0-100, based on tags, formatting, etc.
    engagement: number; // 0-100, based on views/feedback
  };
  issues: string[];
  lastUpdated: string;
}

const STALE_DAYS_WARNING = 30;
const STALE_DAYS_CRITICAL = 90;
const MIN_CONTENT_LENGTH = 200;
const MIN_SECTIONS = 2;

export function scoreDoc(post: Post, viewCount = 0, hasFeedback = false): DocHealthScore {
  const issues: string[] = [];

  // --- Freshness (0-100) ---
  const daysSinceUpdate = Math.floor(
    (Date.now() - new Date(post.updatedAt).getTime()) / (1000 * 60 * 60 * 24)
  );
  let freshness = 100;
  if (daysSinceUpdate > STALE_DAYS_CRITICAL) {
    freshness = 10;
    issues.push(`Not updated in ${daysSinceUpdate} days — critically stale`);
  } else if (daysSinceUpdate > STALE_DAYS_WARNING) {
    freshness = Math.max(20, 100 - (daysSinceUpdate - STALE_DAYS_WARNING) * 1.5);
    issues.push(`Not updated in ${daysSinceUpdate} days — may be stale`);
  }

  // --- Completeness (0-100) ---
  let completeness = 0;
  const contentLength = post.content.length;
  const wordCount = post.content.split(/\s+/).length;
  const headingCount = (post.content.match(/^#{1,4}\s/gm) || []).length;
  const codeBlockCount = (post.content.match(/```/g) || []).length / 2;
  const hasExcerpt = post.excerpt.length > 10;
  const linkCount = (post.content.match(/\[.*?\]\(.*?\)/g) || []).length;

  if (contentLength < MIN_CONTENT_LENGTH) {
    issues.push("Content is too short (< 200 characters)");
    completeness += 10;
  } else if (contentLength < 500) {
    completeness += 30;
  } else if (contentLength < 1500) {
    completeness += 60;
  } else {
    completeness += 80;
  }

  if (headingCount >= MIN_SECTIONS) completeness += 10;
  else issues.push(`Only ${headingCount} section(s) — consider adding more structure`);

  if (hasExcerpt) completeness += 5;
  else issues.push("Missing excerpt/description");

  if (codeBlockCount > 0) completeness += 5;
  completeness = Math.min(100, completeness);

  // --- Quality (0-100) ---
  let quality = 40; // baseline

  if (post.tags.length > 0) quality += 15;
  else issues.push("No tags assigned");

  if (post.tags.length >= 3) quality += 10;

  if (linkCount > 0) quality += 10;
  else issues.push("No internal or external links");

  if (codeBlockCount > 0) quality += 10;

  // Check for proper H1
  if (post.content.match(/^# /m)) quality += 5;
  else issues.push("Missing top-level heading (H1)");

  // Check for images
  if (post.content.match(/!\[.*?\]\(.*?\)/)) quality += 10;

  quality = Math.min(100, quality);

  // --- Engagement (0-100) ---
  let engagement = 20; // baseline
  if (viewCount > 0) engagement += Math.min(40, viewCount * 5);
  if (viewCount > 10) engagement += 20;
  if (hasFeedback) engagement += 20;
  engagement = Math.min(100, engagement);

  // --- Overall ---
  const overall = Math.round(
    freshness * 0.3 + completeness * 0.3 + quality * 0.25 + engagement * 0.15
  );

  return {
    slug: post.slug,
    title: post.title,
    category: post.category,
    overall,
    factors: {
      freshness: Math.round(freshness),
      completeness: Math.round(completeness),
      quality: Math.round(quality),
      engagement: Math.round(engagement),
    },
    issues,
    lastUpdated: post.updatedAt,
  };
}

export function getHealthLabel(score: number): { label: string; color: string } {
  if (score >= 80) return { label: "Excellent", color: "text-[hsl(142,60%,45%)]" };
  if (score >= 60) return { label: "Good", color: "text-primary" };
  if (score >= 40) return { label: "Needs work", color: "text-[hsl(35,90%,55%)]" };
  return { label: "Critical", color: "text-destructive" };
}

export function getHealthBg(score: number): string {
  if (score >= 80) return "bg-[hsl(142,60%,45%)]/10";
  if (score >= 60) return "bg-primary/10";
  if (score >= 40) return "bg-[hsl(35,90%,55%)]/10";
  return "bg-destructive/10";
}
