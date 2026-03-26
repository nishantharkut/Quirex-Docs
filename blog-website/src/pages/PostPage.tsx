import { useParams, Link, useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { useBlogPost, useBlogPosts, BlogPost } from "@/hooks/useBlogPosts";
import { Header } from "@/components/Header";
import { Sidebar, MobileSidebar } from "@/components/Sidebar";
import { TableOfContents } from "@/components/TableOfContents";
import { MarkdownRenderer } from "@/components/MarkdownRenderer";
import { ReadingProgress } from "@/components/ReadingProgress";
import { Breadcrumb } from "@/components/Breadcrumb";
import { FeedbackWidget } from "@/components/FeedbackWidget";
import { CommentsSection } from "@/components/CommentsSection";
import { BookmarkButton } from "@/components/BookmarkButton";
import { StarRating } from "@/components/StarRating";
import { TextToSpeech } from "@/components/TextToSpeech";
import { ShareButtons } from "@/components/ShareButtons";
import { ScrollToTop } from "@/components/ScrollToTop";
import { ContentSkeleton } from "@/components/ContentSkeleton";
import { MobileTableOfContents } from "@/components/MobileTableOfContents";
import { siteConfig } from "@/lib/siteConfig";
import { trackPageView } from "@/lib/analytics";
import { useI18n, t } from "@/lib/i18n";
import { trackReading } from "@/lib/bookmarks";
import { onSync } from "@/lib/syncChannel";
import { useSwipeGesture } from "@/hooks/useSwipeGesture";
import { usePageMeta } from "@/hooks/usePageMeta";
import { useState, useEffect, useCallback, useRef } from "react";
import { ChevronLeft, ChevronRight, Menu, Download, Printer, Bug, MoreHorizontal } from "lucide-react";
import { toast } from "sonner";
import { exportAsMarkdown, exportAsPDF } from "@/lib/exportDocs";
import gsap from "gsap";

export default function PostPage() {
  const { slug } = useParams<{ slug: string }>();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [mobileActions, setMobileActions] = useState(false);
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { language } = useI18n();

  const { data: post, isLoading } = useBlogPost(slug || "");
  const { data: allPostsRaw } = useBlogPosts();
  const allPosts = (allPostsRaw || []).filter((p) => p.published);

  const idx = allPosts.findIndex((p) => p.slug === slug);
  const prev = idx > 0 ? allPosts[idx - 1] : null;
  const next = idx < allPosts.length - 1 ? allPosts[idx + 1] : null;

  const articleRef = useRef<HTMLDivElement>(null);
  const mainRef = useRef<HTMLDivElement>(null);

  // Swipe gestures
  useSwipeGesture(mainRef, {
    onSwipeLeft: () => { if (next) navigate(`/docs/${next.slug}`); },
    onSwipeRight: () => {
      if (prev) navigate(`/docs/${prev.slug}`);
      else setSidebarOpen(true);
    },
    threshold: 60,
  });

  // GSAP entrance
  useEffect(() => {
    if (isLoading || !articleRef.current) return;
    const el = articleRef.current;
    const tl = gsap.timeline({ delay: 0.05 });
    const elements = [
      el.querySelector("[data-anim-breadcrumb]"),
      el.querySelector("[data-anim-meta]"),
      el.querySelector("[data-anim-mobile-toc]"),
      el.querySelector("[data-anim-content]"),
      el.querySelector("[data-anim-tags]"),
      el.querySelector("[data-anim-actions]"),
      el.querySelector("[data-anim-nav]"),
    ].filter(Boolean);
    tl.fromTo(elements, { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.5, stagger: 0.06, ease: "power3.out" });
    return () => { tl.kill(); };
  }, [isLoading, slug]);

  // Sync listener
  useEffect(() => {
    const unsub = onSync((event) => {
      if ((event.type === "post_updated" && event.slug === slug) || event.type === "content_refresh") {
        void Promise.all([
          queryClient.invalidateQueries({ queryKey: ["blog-posts"] }),
          queryClient.invalidateQueries({ queryKey: ["blog-post"] }),
        ]);
      }
    });
    return unsub;
  }, [queryClient, slug]);

  // OG meta
  usePageMeta({
    title: post?.title || "Not Found",
    description: post?.excerpt || siteConfig.metaDescription,
    image: post?.cover_image_url || undefined,
    url: `${window.location.origin}/docs/${slug}`,
  });

  useEffect(() => {
    if (post) document.title = `${post.title} — ${siteConfig.name}`;
    return () => { document.title = siteConfig.metaTitle; };
  }, [post]);

  // Keyboard navigation
  const handleKeyNav = useCallback(
    (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (e.altKey && e.key === "ArrowLeft" && prev) { e.preventDefault(); navigate(`/docs/${prev.slug}`); }
      if (e.altKey && e.key === "ArrowRight" && next) { e.preventDefault(); navigate(`/docs/${next.slug}`); }
    },
    [prev, next, navigate]
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyNav);
    return () => window.removeEventListener("keydown", handleKeyNav);
  }, [handleKeyNav]);

  // Analytics
  useEffect(() => {
    if (post) {
      trackPageView(post.slug, post.title);
      trackReading(post.slug, post.title, 0);
    }
  }, [slug, post]);

  // Reading progress tracking
  useEffect(() => {
    if (!post) return;
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = docHeight > 0 ? Math.min(100, Math.round((scrollTop / docHeight) * 100)) : 100;
      trackReading(post.slug, post.title, progress);
    };
    const throttled = (() => {
      let timeout: ReturnType<typeof setTimeout>;
      return () => { clearTimeout(timeout); timeout = setTimeout(handleScroll, 2000); };
    })();
    window.addEventListener("scroll", throttled);
    return () => window.removeEventListener("scroll", throttled);
  }, [post]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="max-w-[90rem] mx-auto px-3 sm:px-6 flex">
          <Sidebar />
          <main id="main-content" className="flex-1 min-w-0 py-4 sm:py-8 lg:px-10" role="main">
            <ContentSkeleton />
          </main>
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
            <p className="text-[15px] text-muted-foreground mb-2">{t("pageNotFound", language)}</p>
            <Link to="/" className="text-[13px] text-primary hover:underline">{t("backToDocs", language)}</Link>
          </div>
        </div>
      </div>
    );
  }

  const content = post.content || "";
  const postTags = post.tags || [];
  const postCategory = post.category || "general";
  const readTime = Math.max(1, Math.ceil(content.split(/\s+/).length / 200));
  const ghRepoUrl = siteConfig.externalLinks.find((l) => l.icon === "github")?.href;
  const issueUrl = ghRepoUrl ? `${ghRepoUrl}/issues/new?title=${encodeURIComponent(`Docs: ${post.title}`)}&body=${encodeURIComponent(`Page: /docs/${post.slug}\n\n---\nDescribe the issue:`)}` : null;

  // Shim for export functions that expect the old Post type
  const exportPost = {
    id: post.id,
    title: post.title,
    slug: post.slug,
    excerpt: post.excerpt || "",
    content,
    category: postCategory,
    tags: postTags,
    published: post.published ?? false,
    createdAt: post.created_at,
    updatedAt: post.updated_at,
    author: post.author_name || "Anonymous",
  };

  const handleExportMd = () => {
    exportAsMarkdown(exportPost);
    toast.success("Downloaded as Markdown");
    setMobileActions(false);
  };

  const handleExportPdf = () => {
    exportAsPDF();
    toast.success("Opening print dialog for PDF export");
    setMobileActions(false);
  };

  return (
    <div className="min-h-screen bg-background">
      <ReadingProgress />
      <Header />
      <MobileSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="max-w-[90rem] mx-auto px-3 sm:px-6 flex">
        <Sidebar />

        <main
          ref={mainRef}
          id="main-content"
          className="flex-1 min-w-0 py-4 sm:py-8 lg:px-10"
          role="main"
          aria-label="Documentation content"
        >
          {/* Mobile toolbar */}
          <div className="flex items-center justify-between mb-3 sm:mb-6 gap-2">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden flex items-center gap-1.5 text-[13px] text-muted-foreground hover:text-foreground transition-colors py-1.5 px-2 -ml-2 rounded-md active:bg-muted"
              aria-label="Open navigation sidebar"
            >
              <Menu className="w-4 h-4" />
              <span className="sm:inline">{t("navigation", language)}</span>
            </button>

            <div className="flex items-center gap-1 ml-auto print:hidden">
              <TextToSpeech content={content} />
              <BookmarkButton slug={post.slug} title={post.title} category={postCategory} />

              <div className="hidden sm:flex items-center gap-1">
                <button onClick={handleExportMd} className="flex items-center gap-1 px-2 py-1 text-[11px] rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors" title="Download as Markdown">
                  <Download className="w-3 h-3" /> <span className="hidden md:inline">.md</span>
                </button>
                <button onClick={handleExportPdf} className="flex items-center gap-1 px-2 py-1 text-[11px] rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors" title="Export as PDF">
                  <Printer className="w-3 h-3" /> <span className="hidden md:inline">PDF</span>
                </button>
                {issueUrl && (
                  <a href={issueUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 px-2 py-1 text-[11px] rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors" title="Report an issue">
                    <Bug className="w-3 h-3" /> <span className="hidden md:inline">Issue</span>
                  </a>
                )}
              </div>

              <div className="sm:hidden relative">
                <button onClick={() => setMobileActions(!mobileActions)} className="w-8 h-8 flex items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors" aria-label="More actions">
                  <MoreHorizontal className="w-4 h-4" />
                </button>
                {mobileActions && (
                  <>
                    <div className="fixed inset-0 z-30" onClick={() => setMobileActions(false)} />
                    <div className="absolute right-0 top-full mt-1 z-40 w-44 rounded-lg border border-border bg-popover shadow-lg py-1 animate-scale-in">
                      <button onClick={handleExportMd} className="w-full flex items-center gap-2 px-3 py-2.5 text-[13px] text-foreground hover:bg-muted transition-colors">
                        <Download className="w-3.5 h-3.5 text-muted-foreground" /> Download .md
                      </button>
                      <button onClick={handleExportPdf} className="w-full flex items-center gap-2 px-3 py-2.5 text-[13px] text-foreground hover:bg-muted transition-colors">
                        <Printer className="w-3.5 h-3.5 text-muted-foreground" /> Export PDF
                      </button>
                      {issueUrl && (
                        <a href={issueUrl} target="_blank" rel="noopener noreferrer" onClick={() => setMobileActions(false)} className="w-full flex items-center gap-2 px-3 py-2.5 text-[13px] text-foreground hover:bg-muted transition-colors">
                          <Bug className="w-3.5 h-3.5 text-muted-foreground" /> Report issue
                        </a>
                      )}
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          <article ref={articleRef} className="max-w-3xl" aria-label={post.title}>
            <div data-anim-breadcrumb>
              <Breadcrumb category={postCategory} title={post.title} />
            </div>
            <div data-anim-meta className="text-[10px] sm:text-[12px] text-muted-foreground mb-3 sm:mb-6 font-mono flex flex-wrap gap-1.5 sm:gap-3 items-center">
              <time dateTime={post.updated_at}>
                {new Date(post.updated_at).toLocaleDateString(language === "en" ? "en-US" : language, { month: "short", day: "numeric", year: "numeric" })}
              </time>
              <span aria-hidden="true">·</span>
              <span>{readTime} {t("minRead", language)}</span>
              {post.author_name && (
                <>
                  <span aria-hidden="true">·</span>
                  <span>{post.author_name}</span>
                </>
              )}
            </div>

            <div data-anim-mobile-toc>
              <MobileTableOfContents content={content} />
            </div>

            <div data-anim-content>
              <MarkdownRenderer content={content} />
            </div>

            {postTags.length > 0 && (
              <div data-anim-tags className="flex flex-wrap gap-1.5 mt-6 sm:mt-10 pt-5 sm:pt-6 border-t border-border" role="list" aria-label="Tags">
                {postTags.map((tag) => (
                  <Link
                    key={tag}
                    to={`/tags?tag=${encodeURIComponent(tag)}`}
                    className="px-2.5 py-1 text-[11px] rounded-md bg-muted text-muted-foreground font-mono hover:text-foreground hover:bg-muted/80 transition-colors active:bg-muted/60"
                    role="listitem"
                  >
                    {tag}
                  </Link>
                ))}
              </div>
            )}

            <div data-anim-actions className="mt-6 flex flex-col gap-3">
              <StarRating slug={post.slug} />
              <ShareButtons title={post.title} slug={post.slug} />
            </div>

            <FeedbackWidget slug={post.slug} />
            <CommentsSection postSlug={post.slug} />

            <nav data-anim-nav className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-6 sm:mt-10 pt-5 sm:pt-6 border-t border-border" aria-label="Previous and next pages">
              {prev ? (
                <Link to={`/docs/${prev.slug}`} className="group p-3 sm:p-4 rounded-lg border border-border hover:border-primary/30 hover:shadow-md hover:shadow-primary/5 transition-all duration-300 active:bg-muted/30">
                  <div className="text-[11px] text-muted-foreground mb-1 flex items-center gap-1"><ChevronLeft className="w-3 h-3 group-hover:-translate-x-0.5 transition-transform duration-300" /> {t("previous", language)}</div>
                  <div className="text-[13px] sm:text-[14px] font-medium text-foreground group-hover:text-primary transition-colors duration-300 truncate">{prev.title}</div>
                </Link>
              ) : <div className="hidden sm:block" />}
              {next ? (
                <Link to={`/docs/${next.slug}`} className="group p-3 sm:p-4 rounded-lg border border-border hover:border-primary/30 hover:shadow-md hover:shadow-primary/5 transition-all duration-300 sm:text-right active:bg-muted/30">
                  <div className="text-[11px] text-muted-foreground mb-1 flex items-center gap-1 sm:justify-end">{t("next", language)} <ChevronRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform duration-300" /></div>
                  <div className="text-[13px] sm:text-[14px] font-medium text-foreground group-hover:text-primary transition-colors duration-300 truncate">{next.title}</div>
                </Link>
              ) : <div className="hidden sm:block" />}
            </nav>

            <div className="mt-4 text-center text-[11px] text-muted-foreground/50 sm:hidden select-none">
              {t("swipeNav", language)}
            </div>
          </article>

          {siteConfig.footer && (
            <footer className="max-w-3xl mt-10 sm:mt-12 pt-5 sm:pt-6 border-t border-border text-[12px] text-muted-foreground" role="contentinfo">
              {siteConfig.footer}
            </footer>
          )}
        </main>

        <TableOfContents content={content} />
      </div>

      <ScrollToTop />
    </div>
  );
}
