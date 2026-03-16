import { useState, useEffect, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { siteConfig } from "@/lib/siteConfig";

import { Skeleton } from "@/components/ui/skeleton";

interface DashboardPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  published: boolean | null;
  created_at: string;
  updated_at: string;
  category: string | null;
}


import { Clock, ArrowRight, PenLine, Eye, ShieldAlert, Key } from "lucide-react";

function DashboardPostCard({ post }: { post: any }) {
  const readTime = Math.max(1, Math.ceil((post.content || "").split(/\s+/).length / 200));

  return (
    <Link
      to={`/blog/${post.slug}`}
      className="group block rounded-xl border border-border bg-card hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300 overflow-hidden flex flex-col h-full"
    >
      {post.cover_image_url && (
        <div className="overflow-hidden h-40">
          <img
            src={post.cover_image_url}
            alt={post.title}
            className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-500"
            loading="lazy"
          />
        </div>
      )}

      <div className="p-5 flex flex-col flex-1">
        <div className="flex items-center gap-2 text-[11px] text-muted-foreground mb-2.5">
          <span
            className={`px-2 py-0.5 rounded-md font-medium text-[10px] uppercase tracking-wider ${
              post.published
                ? "bg-green-500/10 text-green-600"
                : "bg-orange-500/10 text-orange-600"
            }`}
          >
            {post.published ? (
              <span className="flex items-center gap-1"><Eye className="w-3 h-3" /> Public</span>
            ) : (
              <span className="flex items-center gap-1"><ShieldAlert className="w-3 h-3" /> Draft</span>
            )}
          </span>
          {post.category && (
            <span className="capitalize">{post.category.replace(/-/g, " ")}</span>
          )}
          <span>·</span>
          <span>{readTime} min read</span>
        </div>

        <h2 className="font-bold text-[16px] text-foreground group-hover:text-primary transition-colors leading-tight mb-2">
          {post.title}
        </h2>

        {post.excerpt && (
          <p className="text-[13px] text-muted-foreground leading-relaxed line-clamp-2 mb-4">
            {post.excerpt}
          </p>
        )}

        <div className="mt-auto pt-4 border-t border-border/50 flex items-center justify-between text-[11px] text-muted-foreground">
          <div className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            Last updated {new Date(post.updated_at).toLocaleDateString()}
          </div>
          <div className="flex items-center gap-1 text-primary group-hover:underline">
            Read / Edit <ArrowRight className="w-3 h-3" />
          </div>
        </div>
      </div>
    </Link>
  );
}


export default function DashboardPage() {
  const { user, profile, isAdmin, isEditor } = useAuth();
  const navigate = useNavigate();
  const [posts, setPosts] = useState<DashboardPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "published" | "drafts">("all");

  const fetchPosts = useCallback(async () => {
    if (!user) return;
    const { data, error } = await supabase
      .from("posts")
      .select("id, title, slug, excerpt, published, created_at, updated_at, category")
      .eq("user_id", user.id)
      .order("updated_at", { ascending: false });

    if (!error && data) setPosts(data);
    setLoading(false);
  }, [user]);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  useEffect(() => {
    document.title = `Dashboard — ${siteConfig.name}`;
    return () => { document.title = siteConfig.metaTitle; };
  }, []);

  const published = posts.filter((p) => p.published);
  const drafts = posts.filter((p) => !p.published);

  const filteredPosts =
    filter === "published" ? published :
    filter === "drafts" ? drafts :
    posts;

  const handleNewPost = async () => {
    if (!user) return;
    const slug = "untitled-" + Date.now();
    const { data, error } = await supabase
      .from("posts")
      .insert({
        title: "Untitled",
        slug,
        content: "# Untitled\n\nStart writing...",
        excerpt: "",
        category: "general",
        tags: [],
        published: false,
        user_id: user.id,
      })
      .select("id")
      .single();

    if (error || !data) return;
    navigate(`/blog/${slug}`);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-14">
        {/* Greeting */}
        <div className="flex items-start justify-between gap-4 mb-10">
          <div>
            <h1 className="text-[1.5rem] sm:text-[2rem] font-bold tracking-[-0.03em] text-foreground leading-tight">
              Welcome back{profile?.display_name ? `, ${profile.display_name}` : ""}
            </h1>
            <p className="mt-1.5 text-[14px] sm:text-[15px] text-muted-foreground">
              Here's what's happening with your writing.
            </p>
          </div>

          <button
            onClick={handleNewPost}
            className="flex items-center gap-2 px-4 py-2.5 text-[13px] font-medium rounded-lg bg-primary text-primary-foreground hover:opacity-90 transition-opacity shrink-0"
          >
            <PenLine className="w-4 h-4" /> Write
          </button>
        </div>

        {/* Stats cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-8">
          <div className="rounded-xl border border-border bg-card p-4 sm:p-5">
            <div className="flex items-center gap-2 text-muted-foreground mb-2">
              <FileText className="w-4 h-4" />
              <span className="text-[12px] font-medium">Total Posts</span>
            </div>
            <p className="text-[1.5rem] font-bold text-foreground tabular-nums">{posts.length}</p>
          </div>
          <div className="rounded-xl border border-border bg-card p-4 sm:p-5">
            <div className="flex items-center gap-2 text-muted-foreground mb-2">
              <Eye className="w-4 h-4" />
              <span className="text-[12px] font-medium">Published</span>
            </div>
            <p className="text-[1.5rem] font-bold text-primary tabular-nums">{published.length}</p>
          </div>
          <div className="rounded-xl border border-border bg-card p-4 sm:p-5 col-span-2 sm:col-span-1">
            <div className="flex items-center gap-2 text-muted-foreground mb-2">
              <EyeOff className="w-4 h-4" />
              <span className="text-[12px] font-medium">Drafts</span>
            </div>
            <p className="text-[1.5rem] font-bold text-foreground tabular-nums">{drafts.length}</p>
          </div>
        </div>

        {/* Quick links for users */}
        <div className="flex flex-wrap gap-2 mb-8">
          <Link
            to="/admin"
            className="flex items-center gap-1.5 px-3 py-1.5 text-[12px] font-medium rounded-md border border-border text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          >
            <Settings className="w-3.5 h-3.5" /> Workspace
          </Link>
          {isAdmin && (
            <Link
              to="/analytics"
              className="flex items-center gap-1.5 px-3 py-1.5 text-[12px] font-medium rounded-md border border-border text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            >
              <BarChart3 className="w-3.5 h-3.5" /> Analytics
            </Link>
          )}
        </div>

        {/* Filter tabs */}
        <div className="flex gap-0.5 mb-5 border-b border-border">
          {(["all", "published", "drafts"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-2 text-[13px] font-medium capitalize border-b-2 -mb-px transition-colors ${
                filter === f
                  ? "border-primary text-foreground"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              {f} {f === "all" ? `(${posts.length})` : f === "published" ? `(${published.length})` : `(${drafts.length})`}
            </button>
          ))}
        </div>

        {/* Posts list */}
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-20 rounded-lg" />
            ))}
          </div>
        ) : filteredPosts.length === 0 ? (
          <div className="text-center py-16 border border-dashed border-border rounded-xl">
            <PenLine className="w-8 h-8 text-muted-foreground/40 mx-auto mb-3" />
            <p className="text-muted-foreground text-[15px] mb-1">
              {filter === "all" ? "No posts yet." : `No ${filter} posts.`}
            </p>
            <p className="text-muted-foreground/60 text-[13px] mb-4">
              Start writing your first blog post.
            </p>
            <button
              onClick={handleNewPost}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-[13px] font-medium rounded-lg bg-primary text-primary-foreground hover:opacity-90 transition-opacity"
            >
              <PenLine className="w-3.5 h-3.5" /> Write a post
            </button>
          </div>
        ) : (
          <div className="border border-border rounded-xl divide-y divide-border overflow-hidden">
            {filteredPosts.map((post) => (
              <Link
                key={post.id}
                to={`/blog/${post.slug}`}
                className="flex items-center justify-between px-4 sm:px-5 py-4 hover:bg-muted/30 transition-colors group"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-[14px] font-medium text-foreground truncate group-hover:text-primary transition-colors">
                      {post.title}
                    </h3>
                    <span
                      className={`shrink-0 px-1.5 py-0.5 text-[10px] font-medium rounded ${
                        post.published
                          ? "bg-primary/10 text-primary"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {post.published ? "Published" : "Draft"}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
                    {post.category && (
                      <span className="capitalize">{post.category.replace(/-/g, " ")}</span>
                    )}
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {new Date(post.updated_at).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </span>
                  </div>
                  {post.excerpt && (
                    <p className="text-[12px] text-muted-foreground/70 mt-1 truncate max-w-lg">
                      {post.excerpt}
                    </p>
                  )}
                </div>
                <ArrowRight className="w-4 h-4 text-muted-foreground/40 group-hover:text-primary shrink-0 ml-3 transition-colors" />
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      {siteConfig.footer && (
        <footer className="max-w-4xl mx-auto px-4 sm:px-6 py-6 border-t border-border text-[12px] text-muted-foreground">
          {siteConfig.footer}
        </footer>
      )}
    </div>
  );
}
