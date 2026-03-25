import { useParams, Link } from "react-router-dom";
import { useBlogPost } from "@/hooks/useBlogPosts";
import { Header } from "@/components/Header";
import { MarkdownRenderer } from "@/components/MarkdownRenderer";
import { ReadingProgress } from "@/components/ReadingProgress";
import { ShareButtons } from "@/components/ShareButtons";
import { ScrollToTop } from "@/components/ScrollToTop";
import { ContentSkeleton } from "@/components/ContentSkeleton";
import { usePageMeta } from "@/hooks/usePageMeta";
import { useAuth } from "@/hooks/useAuth";
import { useState, useCallback, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { MarkdownEditor } from "@/components/MarkdownEditor";
import { toast } from "sonner";
import { siteConfig } from "@/lib/siteConfig";
import { Calendar, Clock, ArrowLeft, User, Edit2, Save, Eye, Check, X, ShieldOff, ShieldAlert, MonitorUp } from "lucide-react";

export default function BlogPostPage() {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isLocalMode, setIsLocalMode] = useState(false);
  const { slug } = useParams<{ slug: string }>();
  const { data: post, isLoading, refetch } = useBlogPost(slug || "");

  useEffect(() => {
    if (post) setEditedContent(post.content || "");
  }, [post]);

  usePageMeta({
    title: post?.title || "Blog",
    description: post?.excerpt || siteConfig.metaDescription,
    image: post?.cover_image_url || undefined,
    url: `${window.location.origin}/blog/${slug}`,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
          <ContentSkeleton />
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="flex items-center justify-center py-32 text-center px-4">
          <div>
            <p className="text-[15px] text-muted-foreground mb-2">Post not found</p>
            <Link to="/blog" className="text-[13px] text-primary hover:underline">
              ← Back to blog
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const isAuthor = user?.id === post.user_id;

  const handleSave = async () => {
    if (!post || !user) return;
    setIsSaving(true);
    const { error } = await supabase
      .from("posts")
      .update({ content: editedContent })
      .eq("id", post.id);

    setIsSaving(false);
    if (error) {
      toast.error("Failed to save changes.");
    } else {
      toast.success("Post updated!");
      refetch();
      setIsEditing(false);
    }
  };

  const togglePublished = async () => {
    if (!post) return;
    const newStatus = !post.published;
    const { error } = await supabase
      .from("posts")
      .update({ published: newStatus })
      .eq("id", post.id);
    if (error) {
      toast.error("Failed to update status.");
    } else {
      toast.success(newStatus ? "Post is now Public" : "Post is now Private");
      refetch();
    }
  };

  const exportToFile = async () => {
    if ((window as any).electronAPI) {
      const success = await (window as any).electronAPI.saveLocalFile(editedContent || post.content || "", post.title || "untitled");
      if (success) {
        toast.success("Saved to local file system!");
        (window as any).electronAPI.showNotification("Success", "Blog post successfully saved to disk.");
      }
    } else {
      toast.info("Native file access requires the desktop app");
    }
  };

  const importFromFile = async () => {
    if ((window as any).electronAPI) {
      const fileContent = await (window as any).electronAPI.openLocalFile();
      if (fileContent) {
        setEditedContent(fileContent);
        toast.success("Loaded from local file!");
      }
    } else {
      toast.info("Native file access requires the desktop app");
    }
  };

  const readTime = Math.max(1, Math.ceil((post.content || "").split(/\s+/).length / 200));

  return (
    <div className="min-h-screen bg-background">
      <ReadingProgress />
      <Header />

      {/* Clean Medium-like article layout */}
      <article className="max-w-3xl mx-auto px-4 sm:px-6 py-8 sm:py-14">
        {/* Back to blog */}
        <Link
          to="/blog"
          className="inline-flex items-center gap-1.5 text-[13px] text-muted-foreground hover:text-foreground transition-colors mb-8"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to blog
        </Link>
        <div className="flex-1" />
        
        {/* Author Toolbar */}
        {isAuthor && (
          <div className="flex flex-wrap items-center gap-2 p-3 mb-6 bg-muted/30 border border-border rounded-lg">
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-md bg-background border border-border hover:bg-muted"
            >
              {isEditing ? <Eye className="w-4 h-4" /> : <Edit2 className="w-4 h-4" />}
              {isEditing ? "View Mode" : "Edit Mode"}
            </button>
            <button
              onClick={togglePublished}
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-md bg-background border border-border hover:bg-muted"
            >
              {post.published ? (
                <><Eye className="w-4 h-4 text-green-500" /> Public</>
              ) : (
                <><ShieldAlert className="w-4 h-4 text-orange-500" /> Private Draft</>
              )}
            </button>
            
            {isEditing && (
              <>
                <button
                  onClick={importFromFile}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-md bg-background border border-border hover:bg-muted ml-auto"
                >
                  <MonitorUp className="w-4 h-4" /> Import Local
                </button>
                <button
                  onClick={exportToFile}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-md bg-background border border-border hover:bg-muted"
                >
                  <Save className="w-4 h-4" /> Export Local
                </button>
                <button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-md bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  <Save className="w-4 h-4" />
                  {isSaving ? "Saving..." : "Save to Cloud"}
                </button>
              </>
            )}

          </div>
        )}

        {/* Cover image */}
        {post.cover_image_url && (
          <div className="rounded-xl overflow-hidden mb-8 border border-border">
            <img
              src={post.cover_image_url}
              alt={post.title}
              className="w-full h-auto max-h-[400px] object-cover"
              loading="lazy"
            />
          </div>
        )}

        {/* Category badge */}
        {post.category && (
          <span className="inline-block px-2.5 py-0.5 rounded-md bg-primary/10 text-primary text-[11px] font-medium capitalize mb-4">
            {post.category.replace(/-/g, " ")}
          </span>
        )}

        {/* Title */}
        <h1 className="text-[1.75rem] sm:text-[2.5rem] font-bold tracking-[-0.03em] text-foreground leading-[1.1] mb-5">
          {post.title}
        </h1>

        {/* Excerpt */}
        {post.excerpt && (
          <p className="text-[16px] sm:text-[18px] text-muted-foreground leading-relaxed mb-6">
            {post.excerpt}
          </p>
        )}

        {/* Author & meta bar */}
        <div className="flex items-center gap-4 pb-6 mb-8 border-b border-border">
          <div className="flex items-center gap-3">
            {post.author_avatar ? (
              <img
                src={post.author_avatar}
                alt={post.author_name}
                className="w-10 h-10 rounded-full object-cover border border-border"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <User className="w-5 h-5 text-primary" />
              </div>
            )}
            <div>
              <p className="text-[14px] font-medium text-foreground">{post.author_name}</p>
              <div className="flex items-center gap-3 text-[12px] text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {new Date(post.created_at).toLocaleDateString("en-US", {
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                  })}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {readTime} min read
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="prose-lg w-full max-w-none">
          {isEditing ? (
            <div className="border border-border rounded-xl mt-4 overflow-hidden h-[600px] sm:h-[800px] mb-8">
              <MarkdownEditor
                value={editedContent}
                onChange={setEditedContent}
              />
            </div>
          ) : (
            <MarkdownRenderer content={post.content || ""} />
          )}
        </div>

        {/* Tags */}
        {post.tags && post.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-10 pt-6 border-t border-border">
            {post.tags.map((tag) => (
              <span
                key={tag}
                className="px-2.5 py-1 text-[11px] rounded-md bg-muted text-muted-foreground font-mono"
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Share */}
        <div className="mt-8 pt-6 border-t border-border">
          <ShareButtons title={post.title} slug={post.slug} />
        </div>
      </article>

      {/* Footer */}
      {siteConfig.footer && (
        <footer className="max-w-3xl mx-auto px-4 sm:px-6 py-6 border-t border-border text-[12px] text-muted-foreground">
          {siteConfig.footer}
        </footer>
      )}

      <ScrollToTop />
    </div>
  );
}
