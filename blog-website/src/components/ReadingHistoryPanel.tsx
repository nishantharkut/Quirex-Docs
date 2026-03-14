import { Link } from "react-router-dom";
import { getAllBookmarks, toggleBookmark, getReadingHistory, clearHistory } from "@/lib/bookmarks";
import { BookmarkCheck, Clock, Trash2, X } from "lucide-react";
import { useState } from "react";

interface ReadingHistoryPanelProps {
  open: boolean;
  onClose: () => void;
}

export function ReadingHistoryPanel({ open, onClose }: ReadingHistoryPanelProps) {
  const [tab, setTab] = useState<"bookmarks" | "history">("bookmarks");
  const [bookmarks, setBookmarks] = useState(getAllBookmarks);
  const [history, setHistory] = useState(getReadingHistory);

  if (!open) return null;

  const handleRemoveBookmark = (slug: string) => {
    toggleBookmark(slug, "", "");
    setBookmarks(getAllBookmarks());
  };

  const handleClearHistory = () => {
    clearHistory();
    setHistory([]);
  };

  return (
    <div className="fixed inset-0 z-40">
      <div className="fixed inset-0 bg-foreground/10 backdrop-blur-sm" onClick={onClose} />
      <div className="fixed right-0 top-14 bottom-0 w-[calc(100vw-3rem)] max-w-80 bg-background border-l border-border overflow-y-auto scrollbar-thin shadow-lg">
        <div className="p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-[14px] font-semibold text-foreground">Library</h3>
            <button onClick={onClose} className="p-1 text-muted-foreground hover:text-foreground">
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="flex gap-0.5 mb-4 border-b border-border">
            {(["bookmarks", "history"] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`px-3 py-2 text-[12px] font-medium capitalize border-b-2 -mb-px transition-colors ${
                  tab === t ? "border-primary text-foreground" : "border-transparent text-muted-foreground"
                }`}
              >
                {t === "bookmarks" ? <><BookmarkCheck className="w-3 h-3 inline mr-1" />Saved</> : <><Clock className="w-3 h-3 inline mr-1" />History</>}
              </button>
            ))}
          </div>

          {tab === "bookmarks" && (
            <div className="space-y-1">
              {bookmarks.length === 0 ? (
                <p className="text-[12px] text-muted-foreground/60 py-4 text-center">No bookmarks yet. Click "Save" on any doc page.</p>
              ) : (
                bookmarks.map((b) => (
                  <div key={b.slug} className="group flex items-center gap-2">
                    <Link
                      to={`/docs/${b.slug}`}
                      onClick={onClose}
                      className="flex-1 min-w-0 p-2 rounded-md text-[13px] text-foreground hover:bg-muted/50 transition-colors truncate"
                    >
                      {b.title}
                      <span className="text-[10px] text-muted-foreground ml-2 font-mono">{b.category}</span>
                    </Link>
                    <button
                      onClick={() => handleRemoveBookmark(b.slug)}
                      className="p-1 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-all shrink-0"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))
              )}
            </div>
          )}

          {tab === "history" && (
            <div>
              {history.length > 0 && (
                <div className="flex justify-end mb-2">
                  <button
                    onClick={handleClearHistory}
                    className="text-[11px] text-muted-foreground hover:text-destructive flex items-center gap-1 transition-colors"
                  >
                    <Trash2 className="w-3 h-3" /> Clear
                  </button>
                </div>
              )}
              <div className="space-y-1">
                {history.length === 0 ? (
                  <p className="text-[12px] text-muted-foreground/60 py-4 text-center">No reading history yet.</p>
                ) : (
                  history.slice(0, 20).map((h) => (
                    <Link
                      key={h.slug}
                      to={`/docs/${h.slug}`}
                      onClick={onClose}
                      className="flex items-center justify-between p-2 rounded-md hover:bg-muted/50 transition-colors"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="text-[13px] text-foreground truncate">{h.title}</div>
                        <div className="text-[10px] text-muted-foreground font-mono">
                          {new Date(h.lastRead).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                          {h.readCount > 1 && ` · ${h.readCount} visits`}
                        </div>
                      </div>
                      {/* Progress indicator */}
                      <div className="w-8 h-1 rounded-full bg-border overflow-hidden shrink-0 ml-2">
                        <div
                          className="h-full rounded-full bg-primary/50"
                          style={{ width: `${h.progress}%` }}
                        />
                      </div>
                    </Link>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
