import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

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

async function fetchPublishedPosts(): Promise<BlogPost[]> {
  const { data: posts, error } = await supabase
    .from("posts")
    .select("*")
    .eq("published", true)
    .order("created_at", { ascending: false });

  if (error) throw error;
  if (!posts || posts.length === 0) return [];

  // Fetch author profiles for all unique user_ids
  const userIds = [...new Set(posts.map((p) => p.user_id))];
  const { data: profiles, error: profilesError } = await supabase
    .from("profiles")
    .select("user_id, display_name, avatar_url, blog_public")
    .in("user_id", userIds);

  if (profilesError) throw profilesError;

  const profileMap = new Map(
    (profiles || []).map((p) => [p.user_id, p])
  );

  const visible = posts.filter((post) => {
    const profile = profileMap.get(post.user_id);
    return profile?.blog_public !== false;
  });

  return visible.map((post) => {
    const profile = profileMap.get(post.user_id);
    return {
      ...post,
      author_name: profile?.display_name || "Anonymous",
      author_avatar: profile?.avatar_url || undefined,
    };
  });
}

async function fetchPostBySlug(slug: string): Promise<BlogPost | null> {
  const { data: post, error } = await supabase
    .from("posts")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();

  if (error || !post) return null;

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("display_name, avatar_url, blog_public")
    .eq("user_id", post.user_id)
    .maybeSingle();

  const { data: authData } = await supabase.auth.getUser();
  const isPostAuthor = authData.user?.id === post.user_id;
  if (post.published !== true && !isPostAuthor) {
    return null;
  }
  if (profileError && !isPostAuthor) {
    return null;
  }
  if (profile?.blog_public === false && !isPostAuthor) {
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
