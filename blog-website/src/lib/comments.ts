import { Comment } from "@/types/blog";

const COMMENTS_KEY = "quirex_comments";

function getAll(): Comment[] {
  const stored = localStorage.getItem(COMMENTS_KEY);
  return stored ? JSON.parse(stored) : [];
}

function saveAll(comments: Comment[]) {
  localStorage.setItem(COMMENTS_KEY, JSON.stringify(comments));
}

export function getComments(postSlug: string): Comment[] {
  return getAll().filter((c) => c.postSlug === postSlug);
}

export function addComment(comment: Comment): void {
  const all = getAll();
  all.push(comment);
  saveAll(all);
}

export function deleteComment(id: string): void {
  saveAll(getAll().filter((c) => c.id !== id));
}

export function getCommentCounts(postSlug: string): Record<string, number> {
  const comments = getComments(postSlug);
  const counts: Record<string, number> = {};
  comments.forEach((c) => {
    counts[c.anchor] = (counts[c.anchor] || 0) + 1;
  });
  return counts;
}
