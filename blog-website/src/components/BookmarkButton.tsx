import { useState } from "react";
import { Bookmark, BookmarkCheck } from "lucide-react";
import { isBookmarked, toggleBookmark } from "@/lib/bookmarks";

export function BookmarkButton({ slug, title, category }: { slug: string; title: string; category: string }) {
  const [bookmarked, setBookmarked] = useState(() => isBookmarked(slug));

  const handleToggle = () => {
    const result = toggleBookmark(slug, title, category);
    setBookmarked(result);
  };

  return (
    <button
      onClick={handleToggle}
      className={`flex items-center gap-1 px-2 py-1 text-[11px] rounded-md transition-colors ${
        bookmarked
          ? "text-primary bg-primary/[0.06]"
          : "text-muted-foreground hover:text-foreground hover:bg-muted"
      }`}
      title={bookmarked ? "Remove bookmark" : "Bookmark this page"}
    >
      {bookmarked ? <BookmarkCheck className="w-3 h-3" /> : <Bookmark className="w-3 h-3" />}
      {bookmarked ? "Saved" : "Save"}
    </button>
  );
}
