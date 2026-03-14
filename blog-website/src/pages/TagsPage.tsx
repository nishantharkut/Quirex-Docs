import { Header } from "@/components/Header";
import { getPosts } from "@/lib/content";
import { Link, useSearchParams } from "react-router-dom";
import { Tag, FileText } from "lucide-react";
import { ScrollToTop } from "@/components/ScrollToTop";

export default function TagsPage() {
  const posts = getPosts().filter((p) => p.published);
  const [searchParams] = useSearchParams();
  const activeTag = searchParams.get("tag");

  // Build tag → posts map
  const tagMap: Record<string, typeof posts> = {};
  posts.forEach((p) => {
    p.tags.forEach((tag) => {
      if (!tagMap[tag]) tagMap[tag] = [];
      tagMap[tag].push(p);
    });
  });

  const sortedTags = Object.keys(tagMap).sort((a, b) => tagMap[b].length - tagMap[a].length);
  const filteredPosts = activeTag ? tagMap[activeTag] || [] : [];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main id="main-content" className="max-w-4xl mx-auto px-4 sm:px-6 py-10 sm:py-16">
        <h1 className="text-[1.75rem] sm:text-[2rem] font-bold tracking-[-0.03em] text-foreground mb-1">
          Browse by Tag
        </h1>
        <p className="text-[14px] text-muted-foreground mb-8">
          {sortedTags.length} tags across {posts.length} documents.
        </p>

        {/* Tag cloud */}
        <div className="flex flex-wrap gap-2 mb-10">
          {activeTag && (
            <Link
              to="/tags"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[12px] rounded-full border border-border text-muted-foreground hover:text-foreground transition-colors"
            >
              All tags
            </Link>
          )}
          {sortedTags.map((tag) => (
            <Link
              key={tag}
              to={`/tags?tag=${encodeURIComponent(tag)}`}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-[12px] rounded-full border transition-colors ${
                activeTag === tag
                  ? "border-primary/30 bg-primary/5 text-primary font-medium"
                  : "border-border text-muted-foreground hover:text-foreground hover:border-primary/20"
              }`}
            >
              <Tag className="w-3 h-3" />
              {tag}
              <span className="text-[10px] text-muted-foreground/60 font-mono ml-0.5">
                {tagMap[tag].length}
              </span>
            </Link>
          ))}
        </div>

        {/* Filtered results */}
        {activeTag && (
          <div>
            <h2 className="text-[15px] font-semibold text-foreground mb-4 flex items-center gap-2">
              <FileText className="w-4 h-4 text-muted-foreground" />
              {filteredPosts.length} docs tagged "{activeTag}"
            </h2>
            <div className="rounded-lg border border-border divide-y divide-border">
              {filteredPosts.map((post) => (
                <Link
                  key={post.id}
                  to={`/docs/${post.slug}`}
                  className="flex items-center justify-between px-4 py-3 hover:bg-muted/30 transition-colors group"
                >
                  <div className="min-w-0 flex-1">
                    <div className="text-[14px] font-medium text-foreground group-hover:text-primary transition-colors truncate">
                      {post.title}
                    </div>
                    <div className="text-[12px] text-muted-foreground mt-0.5 line-clamp-1">
                      {post.excerpt}
                    </div>
                  </div>
                  <span className="text-[11px] text-muted-foreground font-mono shrink-0 ml-4">
                    {post.category}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        )}

        {!activeTag && (
          <p className="text-[13px] text-muted-foreground text-center py-8">
            Click a tag above to filter documents.
          </p>
        )}
      </main>
      <ScrollToTop />
    </div>
  );
}
