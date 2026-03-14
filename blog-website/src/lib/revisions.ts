import { Post } from "@/types/blog";

const REVISIONS_KEY = "quirex_revisions";

export interface Revision {
  id: string;
  postId: string;
  content: string;
  title: string;
  timestamp: string;
  summary?: string;
}

function getAll(): Record<string, Revision[]> {
  try {
    return JSON.parse(localStorage.getItem(REVISIONS_KEY) || "{}");
  } catch {
    return {};
  }
}

function saveAll(data: Record<string, Revision[]>) {
  localStorage.setItem(REVISIONS_KEY, JSON.stringify(data));
}

/** Save a new revision for a post. Keeps last 50 revisions per post. */
export function saveRevision(post: Post, summary?: string): Revision {
  const all = getAll();
  const revisions = all[post.id] || [];
  const revision: Revision = {
    id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
    postId: post.id,
    content: post.content,
    title: post.title,
    timestamp: new Date().toISOString(),
    summary,
  };
  revisions.push(revision);
  // Keep last 50
  if (revisions.length > 50) revisions.splice(0, revisions.length - 50);
  all[post.id] = revisions;
  saveAll(all);
  return revision;
}

/** Get all revisions for a post, newest first. */
export function getRevisions(postId: string): Revision[] {
  return (getAll()[postId] || []).slice().reverse();
}

/** Get a specific revision. */
export function getRevision(postId: string, revisionId: string): Revision | undefined {
  return (getAll()[postId] || []).find((r) => r.id === revisionId);
}

/** Simple line-by-line diff. Returns lines with +/- markers. */
export function diffRevisions(oldContent: string, newContent: string): { type: "add" | "remove" | "same"; text: string }[] {
  const oldLines = oldContent.split("\n");
  const newLines = newContent.split("\n");
  const result: { type: "add" | "remove" | "same"; text: string }[] = [];

  const maxLen = Math.max(oldLines.length, newLines.length);
  let oi = 0;
  let ni = 0;

  while (oi < oldLines.length || ni < newLines.length) {
    if (oi >= oldLines.length) {
      result.push({ type: "add", text: newLines[ni] });
      ni++;
    } else if (ni >= newLines.length) {
      result.push({ type: "remove", text: oldLines[oi] });
      oi++;
    } else if (oldLines[oi] === newLines[ni]) {
      result.push({ type: "same", text: oldLines[oi] });
      oi++;
      ni++;
    } else {
      // Look ahead to find a match
      let foundInNew = newLines.indexOf(oldLines[oi], ni);
      let foundInOld = oldLines.indexOf(newLines[ni], oi);

      if (foundInNew !== -1 && (foundInOld === -1 || foundInNew - ni <= foundInOld - oi)) {
        // Lines were added
        while (ni < foundInNew) {
          result.push({ type: "add", text: newLines[ni] });
          ni++;
        }
      } else if (foundInOld !== -1) {
        // Lines were removed
        while (oi < foundInOld) {
          result.push({ type: "remove", text: oldLines[oi] });
          oi++;
        }
      } else {
        result.push({ type: "remove", text: oldLines[oi] });
        result.push({ type: "add", text: newLines[ni] });
        oi++;
        ni++;
      }
    }
  }

  return result;
}
