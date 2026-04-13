import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { fetchPublicProfile, fetchPublicProfiles, isProfilePublic } from "@/lib/blogVisibility";
import { getLocalFallbackBlogPosts, getLocalFallbackPostBySlug } from "@/lib/docsFallback";

export interface BlogPost {
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
  /** Joined from profiles */
  author_name?: string;
  author_avatar?: string;
}

/** Reading order for seeded docs when the API has no public posts */
function sortDocsByCreatedAsc(posts: BlogPost[]): BlogPost[] {
  return [...posts].sort(
    (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
  );
}

function localFallbackList(): BlogPost[] {
  return sortDocsByCreatedAsc(getLocalFallbackBlogPosts());
}

async function fetchPublishedPosts(): Promise<BlogPost[]> {
  try {
    const { data: posts, error } = await supabase
      .from("posts")
      .select("*")
      .eq("published", true)
      .order("created_at", { ascending: false });

    if (error) throw error;
    if (!posts || posts.length === 0) return localFallbackList();

    const userIds = [...new Set(posts.map((p) => p.user_id))];
    const profiles = await fetchPublicProfiles(userIds);

    const profileMap = new Map((profiles || []).map((p) => [p.user_id, p]));

    const visible = posts.filter((post) => {
      const profile = profileMap.get(post.user_id);
      return isProfilePublic(profile);
    });

    if (visible.length === 0) return localFallbackList();

    return visible.map((post) => {
      const profile = profileMap.get(post.user_id);
      return {
        ...post,
        author_name: profile?.display_name || "Anonymous",
        author_avatar: profile?.avatar_url || undefined,
      };
    });
  } catch {
    return localFallbackList();
  }
}

async function fetchPostBySlug(slug: string): Promise<BlogPost | null> {
  const { data: post, error } = await supabase
    .from("posts")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();

  if (error || !post) {
    return getLocalFallbackPostBySlug(slug);
  }

  let profile = null;
  let profileError = null;
  try {
    profile = await fetchPublicProfile(post.user_id);
  } catch (error) {
    profileError = error;
  }

  const { data: authData } = await supabase.auth.getUser();
  const isPostAuthor = authData.user?.id === post.user_id;
  if (post.published !== true && !isPostAuthor) {
    return null;
  }
  if (profileError && !isPostAuthor) {
    return null;
  }
  if (!isProfilePublic(profile) && !isPostAuthor) {
    return null;
  }

  return {
    ...post,
    author_name: profile?.display_name || "Anonymous",
    author_avatar: profile?.avatar_url || undefined,
  };
}

export function useBlogPosts() {
  return useQuery({
    queryKey: ["blog-posts"],
    queryFn: fetchPublishedPosts,
    staleTime: 1000 * 60 * 2,
  });
}

export function useBlogPost(slug: string) {
  return useQuery({
    queryKey: ["blog-post", slug],
    queryFn: () => fetchPostBySlug(slug),
    enabled: !!slug,
    staleTime: 1000 * 60 * 2,
  });
}
