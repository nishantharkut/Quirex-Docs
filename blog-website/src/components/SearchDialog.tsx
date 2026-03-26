import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Search, X, Clock, Trash2 } from "lucide-react";
import { trackSearch } from "@/lib/analytics";
import { useI18n, t } from "@/lib/i18n";
import { supabase } from "@/integrations/supabase/client";
import { fetchPublicProfiles, isProfilePublic } from "@/lib/blogVisibility";

interface SearchResult {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  category: string | null;
}

const RECENT_KEY = "quirex_recent_searches";

function getRecentSearches(): string[] {
  try { return JSON.parse(localStorage.getItem(RECENT_KEY) || "[]"); } catch { return []; }
}
function addRecentSearch(q: string) {
  const recent = getRecentSearches().filter((s) => s !== q);
  recent.unshift(q);
  localStorage.setItem(RECENT_KEY, JSON.stringify(recent.slice(0, 8)));
}
function clearRecentSearches() {
  localStorage.removeItem(RECENT_KEY);
}

function HighlightText({ text, query }: { text: string; query: string }) {
  if (!query || query.length < 2) return <>{text}</>;
  const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`, "gi");
  const parts = text.split(regex);
  return (
    <>
      {parts.map((part, i) =>
        regex.test(part) ? (
          <mark key={i} className="bg-primary/20 text-foreground rounded-sm px-0.5">{part}</mark>
        ) : (
          <span key={i}>{part}</span>
        )
      )}
    </>
  );
}

export function SearchDialog() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [allPosts, setAllPosts] = useState<SearchResult[]>([]);
  const [selected, setSelected] = useState(0);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const navigate = useNavigate();
  const { language } = useI18n();
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if ((e.metaKey || e.ctrlKey) && e.key === "k") {
      e.preventDefault();
      setOpen((o) => !o);
    }
    if (e.key === "Escape") setOpen(false);
  }, []);

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  // Fetch all published posts when dialog opens
  useEffect(() => {
    if (open) {
      setRecentSearches(getRecentSearches());
      document.body.style.overflow = "hidden";
      supabase
        .from("posts")
        .select("id, title, slug, excerpt, category, user_id")
        .eq("published", true)
        .order("created_at", { ascending: false })
        .then(async ({ data: raw, error: postsError }) => {
          if (postsError) {
            setAllPosts([]);
            return;
          }
          if (!raw?.length) {
            setAllPosts([]);
            return;
          }
          const userIds = [...new Set(raw.map((p) => p.user_id))];
          let profiles;
          try {
            profiles = await fetchPublicProfiles(userIds);
          } catch {
            setAllPosts([]);
            return;
          }
          const hiddenAuthors = new Set(
            (profiles || []).filter((pr) => !isProfilePublic(pr)).map((pr) => pr.user_id)
          );
          const visible = raw
            .filter((p) => !hiddenAuthors.has(p.user_id))
            .map(({ id, title, slug, excerpt, category }) => ({ id, title, slug, excerpt, category }));
          setAllPosts(visible);
        })
        .catch(() => {
          setAllPosts([]);
        });
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  // Client-side search through cached posts
  useEffect(() => {
    if (query.length > 1) {
      const q = query.toLowerCase();
      const filtered = allPosts.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          (p.excerpt || "").toLowerCase().includes(q) ||
          (p.category || "").toLowerCase().includes(q)
      );
      setResults(filtered.slice(0, 8));
      setSelected(0);
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => { trackSearch(query); }, 800);
    } else {
      setResults([]);
    }
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [query, allPosts]);

  const handleSelect = (slug: string) => {
    if (query.length > 1) addRecentSearch(query);
    navigate(`/blog/${slug}`);
    setOpen(false);
    setQuery("");
  };

  const handleRecentClick = (q: string) => {
    setQuery(q);
  };

  const handleClearRecent = () => {
    clearRecentSearches();
    setRecentSearches([]);
  };

  const handleInternalKey = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelected((s) => Math.min(s + 1, results.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelected((s) => Math.max(s - 1, 0));
    } else if (e.key === "Enter" && results[selected]) {
      handleSelect(results[selected].slug);
    }
  };

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 min-h-[44px] sm:min-h-0 px-3 py-2.5 sm:px-2.5 sm:py-1.5 text-[14px] sm:text-[13px] rounded-lg sm:rounded-md border border-border hover:bg-muted transition-colors"
      >
        <Search className="w-4 h-4 sm:w-3.5 sm:h-3.5 text-muted-foreground" />
        <span className="text-muted-foreground hidden sm:inline">{t("search", language)}</span>
        <kbd className="hidden sm:inline text-[10px] font-mono px-1 py-px rounded bg-muted text-muted-foreground border border-border ml-2">
          ⌘K
        </kbd>
      </button>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[12vh]">
      <div className="fixed inset-0 bg-background/80 backdrop-blur-sm" onClick={() => setOpen(false)} />
      <div className="relative w-full max-w-lg mx-4 rounded-lg border border-border bg-background shadow-lg overflow-hidden">
        <div className="flex items-center gap-2 px-3 border-b border-border">
          <Search className="w-4 h-4 text-muted-foreground shrink-0" />
          <input
            type="text"
            autoFocus
            placeholder={t("searchDocs", language)}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleInternalKey}
            className="flex-1 py-2.5 bg-transparent text-[14px] text-foreground placeholder:text-muted-foreground outline-none"
          />
          <button onClick={() => setOpen(false)} className="text-muted-foreground hover:text-foreground">
            <X className="w-4 h-4" />
          </button>
        </div>

        {results.length > 0 && (
          <div className="max-h-72 overflow-y-auto p-2 scrollbar-thin">
            {results.map((post, i) => (
              <button
                key={post.id}
                onClick={() => handleSelect(post.slug)}
                className={`w-full text-left px-4 py-3 min-h-[48px] rounded-lg text-[14px] transition-colors ${
                  i === selected ? "bg-muted text-foreground" : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                <div className="font-medium">
                  <HighlightText text={post.title} query={query} />
                </div>
                {post.excerpt && (
                  <div className="text-[13px] text-muted-foreground mt-0.5 line-clamp-1">
                    <HighlightText text={post.excerpt} query={query} />
                  </div>
                )}
              </button>
            ))}
          </div>
        )}

        {query.length > 1 && results.length === 0 && (
          <div className="p-6 text-center text-[13px] text-muted-foreground">
            {t("noResults", language)} "{query}"
          </div>
        )}

        {query.length <= 1 && (
          <div className="p-3">
            {recentSearches.length > 0 ? (
              <div>
                <div className="flex items-center justify-between px-3 mb-2">
                  <span className="text-[12px] font-medium text-muted-foreground uppercase tracking-wide">Recent</span>
                  <button onClick={handleClearRecent} className="text-[11px] text-muted-foreground hover:text-destructive flex items-center gap-1.5 min-h-[44px] px-2 transition-colors">
                    <Trash2 className="w-3 h-3" /> Clear
                  </button>
                </div>
                {recentSearches.map((q) => (
                  <button
                    key={q}
                    onClick={() => handleRecentClick(q)}
                    className="w-full text-left px-4 py-3 min-h-[48px] rounded-lg text-[14px] text-muted-foreground hover:bg-muted hover:text-foreground transition-colors flex items-center gap-3"
                  >
                    <Clock className="w-4 h-4 shrink-0" />
                    {q}
                  </button>
                ))}
              </div>
            ) : (
              <div className="py-6 text-center text-[14px] text-muted-foreground">
                {t("typeToSearch", language)}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
