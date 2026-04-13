import { getPost, getPosts } from "@/lib/content";
import type { Post } from "@/types/blog";

/** Stable pseudo user_id for seeded / localStorage docs when Supabase has no public posts */
export const LOCAL_DOCS_USER_ID = "00000000-0000-4000-8000-000000000001";

export interface PublicBlogPostShape {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string | null;
  category: string | null;
  tags: string[] | null;
  published: boolean | null;
  cover_image_url: string | null;
  created_at: string;
  updated_at: string;
  user_id: string;
  author_name?: string;
  author_avatar?: string;
}

export function localPostToPublicRow(p: Post): PublicBlogPostShape {
  return {
    id: p.id,
    title: p.title,
    slug: p.slug,
    excerpt: p.excerpt,
    content: p.content,
    category: p.category,
    tags: p.tags,
    published: p.published,
    cover_image_url: null,
    created_at: p.createdAt,
    updated_at: p.updatedAt,
    user_id: LOCAL_DOCS_USER_ID,
    author_name: p.author,
  };
}

/** Published docs from local seed (localStorage-backed) when the API has no public posts */
export function getLocalFallbackBlogPosts(): PublicBlogPostShape[] {
  return getPosts()
    .filter((p) => p.published)
    .map(localPostToPublicRow)
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
}

export function getLocalFallbackPostBySlug(slug: string): PublicBlogPostShape | null {
  const p = getPost(slug);
  if (!p?.published) return null;
  return localPostToPublicRow(p);
}
