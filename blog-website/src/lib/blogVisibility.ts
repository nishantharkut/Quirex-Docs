import { supabase } from "@/integrations/supabase/client";

export interface PublicProfile {
  user_id: string;
  display_name?: string | null;
  avatar_url?: string | null;
  blog_public?: boolean;
}

function isMissingBlogPublicColumn(error: { message?: string | null; details?: string | null } | null) {
  if (!error) return false;
  const combined = `${error.message || ""} ${error.details || ""}`.toLowerCase();
  return combined.includes("blog_public");
}

export async function fetchPublicProfiles(userIds: string[]): Promise<PublicProfile[]> {
  if (userIds.length === 0) return [];

  const { data, error } = await supabase
    .from("profiles")
    .select("user_id, display_name, avatar_url, blog_public")
    .in("user_id", userIds);

  if (!error) {
    return (data || []) as PublicProfile[];
  }

  if (!isMissingBlogPublicColumn(error)) {
    throw error;
  }

  const fallback = await supabase
    .from("profiles")
    .select("user_id, display_name, avatar_url")
    .in("user_id", userIds);

  if (fallback.error) {
    throw fallback.error;
  }

  return (fallback.data || []).map((profile) => ({
    ...profile,
    blog_public: true,
  }));
}

export async function fetchPublicProfile(userId: string): Promise<PublicProfile | null> {
  const { data, error } = await supabase
    .from("profiles")
    .select("display_name, avatar_url, blog_public")
    .eq("user_id", userId)
    .maybeSingle();

  if (!error) {
    return data ? ({ user_id: userId, ...data } as PublicProfile) : null;
  }

  if (!isMissingBlogPublicColumn(error)) {
    throw error;
  }

  const fallback = await supabase
    .from("profiles")
    .select("display_name, avatar_url")
    .eq("user_id", userId)
    .maybeSingle();

  if (fallback.error) {
    throw fallback.error;
  }

  return fallback.data
    ? {
        user_id: userId,
        ...fallback.data,
        blog_public: true,
      }
    : null;
}

export function isProfilePublic(profile: Pick<PublicProfile, "blog_public"> | null | undefined) {
  return profile?.blog_public !== false;
}
