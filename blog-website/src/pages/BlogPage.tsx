import { Link } from "react-router-dom";
import { useBlogPosts, BlogPost } from "@/hooks/useBlogPosts";
import { Header } from "@/components/Header";
import { siteConfig } from "@/lib/siteConfig";
import { Calendar, Clock, User, ArrowRight, PenLine } from "lucide-react";
import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Skeleton } from "@/components/ui/skeleton";

function PostCard({ post, featured = false }: { post: BlogPost; featured?: boolean }) {
  const readTime = Math.max(1, Math.ceil((post.content || "").split(/\s+/).length / 200));

  return (
    <Link
      to={`/blog/${post.slug}`}
      className={`group block rounded-xl border border-border bg-card hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300 overflow-hidden ${
        featured ? "" : ""
      }`}
    >
      {/* Cover image */}
      {post.cover_image_url && (
        <div className={`overflow-hidden ${featured ? "h-48 sm:h-64" : "h-40"}`}>
          <img
            src={post.cover_image_url}
            alt={post.title}
            className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-500"
            loading="lazy"
          />
        </div>
      )}

      <div className={`${featured ? "p-6 sm:p-8" : "p-5"}`}>
        {/* Category + badge */}
        <div className="flex items-center gap-2 text-[11px] text-muted-foreground mb-2.5">
          {featured && (
            <span className="px-2 py-0.5 rounded-md bg-primary/10 text-primary font-medium text-[10px] uppercase tracking-wider">
              Featured
            </span>
          )}
          {post.category && (
            <span className="capitalize">{post.category.replace(/-/g, " ")}</span>
          )}
          <span>·</span>
          <span>{readTime} min read</span>
        </div>

        {/* Title */}
        <h2
          className={`font-bold text-foreground group-hover:text-primary transition-colors leading-tight ${
            featured ? "text-[1.25rem] sm:text-[1.5rem]" : "text-[15px]"
          }`}
        >
          {post.title}
        </h2>

        {/* Excerpt */}
        {post.excerpt && (
          <p
            className={`mt-2 text-muted-foreground leading-relaxed line-clamp-2 ${
              featured ? "text-[14px] sm:text-[15px]" : "text-[13px]"
            }`}
          >
            {post.excerpt}
          </p>
        )}

        {/* Author + date */}
        <div className="mt-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {post.author_avatar ? (
              <img
                src={post.author_avatar}
                alt={post.author_name}
                className="w-6 h-6 rounded-full object-cover border border-border"
              />
            ) : (
              <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center">
                <User className="w-3 h-3 text-primary" />
              </div>
            )}
            <div className="flex items-center gap-2.5 text-[11px] text-muted-foreground">
              <span className="font-medium text-foreground/80">{post.author_name}</span>
              <span>·</span>
              <span className="flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                {new Date(post.created_at).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </span>
            </div>
          </div>

          {featured && (
            <span className="hidden sm:flex items-center gap-1 text-[13px] text-primary font-medium opacity-0 group-hover:opacity-100 transition-opacity">
              Read <ArrowRight className="w-3.5 h-3.5" />
            </span>
          )}
        </div>

        {/* Tags */}
        {post.tags && post.tags.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1">
            {post.tags.slice(0, featured ? 4 : 3).map((tag) => (
              <span
                key={tag}
                className="px-1.5 py-0.5 text-[10px] rounded bg-muted text-muted-foreground font-mono"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </Link>
  );
}

export default function BlogPage() {
  const { data: posts, isLoading } = useBlogPosts();
  const { user, isEditor } = useAuth();

  useEffect(() => {
    document.title = `Blog — ${siteConfig.name}`;
    return () => {
      document.title = siteConfig.metaTitle;
    };
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 sm:py-20">
        {/* Page header */}
        <div className="flex items-start justify-between mb-10 sm:mb-14">
          <div>
            <h1 className="text-[2rem] sm:text-[2.75rem] font-bold tracking-[-0.03em] text-foreground leading-tight">
              Blog
            </h1>
            <p className="mt-3 text-[15px] sm:text-[17px] text-muted-foreground leading-relaxed max-w-2xl">
              Guides, tutorials, and updates from the {siteConfig.name} community.
            </p>
          </div>

          {/* Write button for users */}
          {user && (
            <Link
              to="/admin"
              className="flex items-center gap-2 px-4 py-2 text-[13px] font-medium rounded-lg bg-primary text-primary-foreground hover:opacity-90 transition-opacity shrink-0"
            >
              <PenLine className="w-4 h-4" /> Write
            </Link>
          )}
        </div>

        {/* Loading state */}
        {isLoading && (
          <div className="space-y-6">
            <Skeleton className="h-64 w-full rounded-xl" />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Skeleton className="h-48 rounded-xl" />
              <Skeleton className="h-48 rounded-xl" />
            </div>
          </div>
        )}

        {/* Empty state */}
        {!isLoading && (!posts || posts.length === 0) && (
          <div className="text-center py-20 border border-dashed border-border rounded-xl">
            <PenLine className="w-8 h-8 text-muted-foreground/40 mx-auto mb-3" />
            <p className="text-muted-foreground text-[15px] mb-1">No published posts yet.</p>
            <p className="text-muted-foreground/60 text-[13px]">
              {user
                ? "Head to the admin panel to write your first post."
                : "Check back soon for new content."}
            </p>
            {user && (
              <Link
                to="/admin"
                className="inline-flex items-center gap-1.5 mt-4 px-4 py-2 text-[13px] font-medium rounded-lg bg-primary text-primary-foreground hover:opacity-90 transition-opacity"
              >
                <PenLine className="w-3.5 h-3.5" /> Write a post
              </Link>
            )}
          </div>
        )}

        {/* Posts */}
        {!isLoading && posts && posts.length > 0 && (
          <div className="space-y-6">
            {/* Featured (first post) */}
            <PostCard post={posts[0]} featured />

            {/* Grid */}
            {posts.length > 1 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {posts.slice(1).map((post) => (
                  <PostCard key={post.id} post={post} />
                ))}
              </div>
            )}
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
