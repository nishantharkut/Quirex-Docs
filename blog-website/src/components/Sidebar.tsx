import { Link, useLocation } from "react-router-dom";
import { useBlogPosts, BlogPost } from "@/hooks/useBlogPosts";
import { ChevronRight, X } from "lucide-react";
import { useState, useEffect, useRef, useCallback } from "react";
import { Skeleton } from "@/components/ui/skeleton";

const CATEGORY_ORDER = ["getting-started", "guides", "features", "customization", "general"];
const CATEGORY_NAMES: Record<string, string> = {
  "getting-started": "Getting Started",
  guides: "Guides",
  features: "Features",
  customization: "Customization",
  general: "General",
};

function deriveCategories(posts: BlogPost[]) {
  const catSlugs = [...new Set(posts.map((p) => p.category || "general"))];
  return catSlugs
    .sort((a, b) => {
      const ai = CATEGORY_ORDER.indexOf(a);
      const bi = CATEGORY_ORDER.indexOf(b);
      return (ai === -1 ? 999 : ai) - (bi === -1 ? 999 : bi);
    })
    .map((slug) => ({
      slug,
      name: CATEGORY_NAMES[slug] || slug.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
      posts: posts.filter((p) => (p.category || "general") === slug),
    }));
}

export function Sidebar() {
  const { data: posts, isLoading } = useBlogPosts();
  const location = useLocation();
  const currentSlug = location.pathname.replace("/docs/", "");
  const categories = deriveCategories(posts || []);

  return (
    <aside className="w-56 shrink-0 hidden lg:block border-r border-border">
      <nav className="sticky top-14 h-[calc(100vh-3.5rem)] overflow-y-auto py-6 pr-4 pl-1 scrollbar-thin">
        {isLoading ? (
          <div className="space-y-4 px-2">
            {[1, 2, 3].map((i) => (
              <div key={i}>
                <Skeleton className="h-4 w-20 mb-2" />
                <Skeleton className="h-8 w-full mb-1" />
                <Skeleton className="h-8 w-full" />
              </div>
            ))}
          </div>
        ) : categories.length === 0 ? (
          <p className="text-[12px] text-muted-foreground px-2 py-4">No published docs yet.</p>
        ) : (
          categories.map((cat) => (
            <SidebarCategory key={cat.slug} category={cat} currentSlug={currentSlug} />
          ))
        )}
      </nav>
    </aside>
  );
}

function SidebarCategory({
  category,
  currentSlug,
}: {
  category: { slug: string; name: string; posts: BlogPost[] };
  currentSlug: string;
}) {
  const [open, setOpen] = useState(true);

  if (category.posts.length === 0) return null;

  return (
    <div className="mb-5">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 w-full text-left px-2 py-2 min-h-[40px] text-[12px] font-semibold uppercase tracking-[0.06em] text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-md transition-colors"
      >
        <ChevronRight className={`w-3.5 h-3.5 transition-transform duration-200 ${open ? "rotate-90" : ""}`} />
        {category.name}
      </button>
      <div
        className="overflow-hidden transition-all duration-200 ease-out"
        style={{ maxHeight: open ? "1000px" : "0px", opacity: open ? 1 : 0 }}
      >
        <div className="mt-1 space-y-0.5">
          {category.posts.map((post) => {
            const active = currentSlug === post.slug;
            return (
              <Link
                key={post.id}
                to={`/docs/${post.slug}`}
                className={`block px-3 py-2.5 ml-3 text-[14px] rounded-lg min-h-[44px] flex items-center transition-all duration-200 ${
                  active
                    ? "text-primary font-medium bg-primary/[0.06] shadow-sm shadow-primary/5"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50 hover:translate-x-0.5"
                }`}
              >
                {post.title}
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export function MobileSidebar({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { data: posts } = useBlogPosts();
  const categories = deriveCategories(posts || []);
  const location = useLocation();
  const currentSlug = location.pathname.replace("/docs/", "");

  const [animating, setAnimating] = useState(false);
  const [visible, setVisible] = useState(false);
  const drawerRef = useRef<HTMLDivElement>(null);

  const touchStartX = useRef(0);
  const touchCurrentX = useRef(0);
  const isDragging = useRef(false);

  const handleTouchStart = useCallback((e: TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchCurrentX.current = e.touches[0].clientX;
    isDragging.current = true;
  }, []);

  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (!isDragging.current || !drawerRef.current) return;
    touchCurrentX.current = e.touches[0].clientX;
    const dx = touchCurrentX.current - touchStartX.current;
    if (dx < 0) {
      drawerRef.current.style.transform = `translateX(${dx}px)`;
      drawerRef.current.style.transition = "none";
    }
  }, []);

  const handleTouchEnd = useCallback(() => {
    if (!isDragging.current || !drawerRef.current) return;
    isDragging.current = false;
    const dx = touchCurrentX.current - touchStartX.current;
    drawerRef.current.style.transition = "";
    if (dx < -80) {
      onClose();
    } else {
      drawerRef.current.style.transform = "";
    }
  }, [onClose]);

  useEffect(() => {
    const el = drawerRef.current;
    if (!el || !open) return;
    el.addEventListener("touchstart", handleTouchStart, { passive: true });
    el.addEventListener("touchmove", handleTouchMove, { passive: true });
    el.addEventListener("touchend", handleTouchEnd, { passive: true });
    return () => {
      el.removeEventListener("touchstart", handleTouchStart);
      el.removeEventListener("touchmove", handleTouchMove);
      el.removeEventListener("touchend", handleTouchEnd);
    };
  }, [open, handleTouchStart, handleTouchMove, handleTouchEnd]);

  useEffect(() => {
    if (open) {
      setAnimating(true);
      requestAnimationFrame(() => setVisible(true));
    } else {
      setVisible(false);
      const t = setTimeout(() => setAnimating(false), 250);
      return () => clearTimeout(t);
    }
  }, [open]);

  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
      return () => { document.body.style.overflow = ""; };
    }
  }, [open]);

  useEffect(() => {
    if (!open && drawerRef.current) {
      drawerRef.current.style.transform = "";
    }
  }, [open]);

  if (!animating && !open) return null;

  return (
    <div className="fixed inset-0 z-30 lg:hidden">
      <div
        className={`fixed inset-0 bg-foreground/20 backdrop-blur-sm transition-opacity duration-250 ${visible ? "opacity-100" : "opacity-0"}`}
        onClick={onClose}
      />
      <div
        ref={drawerRef}
        className={`fixed left-0 top-0 bottom-0 w-[280px] max-w-[85vw] bg-background border-r border-border shadow-xl transition-transform duration-250 ease-out ${
          visible ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between h-16 px-4 border-b border-border">
          <span className="text-[15px] font-semibold text-foreground">Navigation</span>
          <button
            onClick={onClose}
            className="min-w-[44px] min-h-[44px] w-11 h-11 flex items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            aria-label="Close navigation"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="px-4 py-2 text-[10px] text-muted-foreground/50 text-center select-none border-b border-border/50">
          ← Swipe left to close
        </div>
        <nav className="overflow-y-auto h-[calc(100%-3.5rem-2rem)] p-4 scrollbar-thin overscroll-contain">
          {categories.map((cat) => {
            if (cat.posts.length === 0) return null;
            return (
              <div key={cat.slug} className="mb-6">
                <div className="px-2 py-1.5 text-[11px] font-semibold uppercase tracking-[0.06em] text-muted-foreground">
                  {cat.name}
                </div>
                <div className="mt-1 space-y-0.5">
                  {cat.posts.map((post) => {
                    const active = currentSlug === post.slug;
                    return (
                      <Link
                        key={post.id}
                        to={`/docs/${post.slug}`}
                        onClick={onClose}
                        className={`block px-3 py-2.5 text-[14px] rounded-lg transition-all duration-200 active:bg-muted/80 ${
                          active
                            ? "text-primary font-medium bg-primary/[0.08] shadow-sm shadow-primary/5"
                            : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                        }`}
                      >
                        {post.title}
                      </Link>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
