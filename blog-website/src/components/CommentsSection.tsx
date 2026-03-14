import { useState } from "react";
import { getComments, addComment, deleteComment } from "@/lib/comments";
import { Comment } from "@/types/blog";
import { generateId } from "@/lib/content";
import { MessageSquare, Trash2, Send, X } from "lucide-react";
import { useI18n, t } from "@/lib/i18n";

interface CommentsSectionProps {
  postSlug: string;
}

export function CommentsSection({ postSlug }: CommentsSectionProps) {
  const [comments, setComments] = useState<Comment[]>(() => getComments(postSlug));
  const [showForm, setShowForm] = useState(false);
  const [author, setAuthor] = useState(() => localStorage.getItem("quirex_comment_author") || "");
  const [text, setText] = useState("");
  const { language } = useI18n();

  const refresh = () => setComments(getComments(postSlug));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim() || !author.trim()) return;

    localStorage.setItem("quirex_comment_author", author.trim());
    addComment({
      id: generateId(),
      postSlug,
      anchor: "general",
      author: author.trim(),
      text: text.trim(),
      createdAt: new Date().toISOString(),
    });
    setText("");
    setShowForm(false);
    refresh();
  };

  const handleDelete = (id: string) => {
    deleteComment(id);
    refresh();
  };

  return (
    <div className="mt-10 pt-6 border-t border-border">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-[15px] font-semibold text-foreground flex items-center gap-2">
          <MessageSquare className="w-4 h-4 text-muted-foreground" />
          {t("comments", language)} {comments.length > 0 && <span className="text-[12px] text-muted-foreground font-normal">({comments.length})</span>}
        </h3>
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="px-3 py-1 text-[12px] rounded-md border border-border text-muted-foreground hover:text-foreground hover:bg-muted/30 transition-colors"
          >
            {t("addComment", language)}
          </button>
        )}
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="mb-6 p-4 rounded-lg border border-border bg-card">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[12px] font-medium text-muted-foreground">{t("newComment", language)}</span>
            <button type="button" onClick={() => setShowForm(false)} className="text-muted-foreground hover:text-foreground">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
          <input
            value={author}
            onChange={(e) => setAuthor(e.target.value)}
            placeholder={t("yourName", language)}
            className="w-full px-3 py-1.5 text-[13px] rounded-md border border-border bg-background text-foreground outline-none focus:ring-1 focus:ring-ring mb-2"
            required
          />
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={t("writeComment", language)}
            rows={3}
            className="w-full px-3 py-2 text-[13px] rounded-md border border-border bg-background text-foreground outline-none focus:ring-1 focus:ring-ring resize-none mb-2"
            required
          />
          <div className="flex justify-end">
            <button
              type="submit"
              className="flex items-center gap-1.5 px-3 py-1.5 text-[12px] rounded-md bg-primary text-primary-foreground hover:opacity-90 transition-opacity font-medium"
            >
              <Send className="w-3 h-3" /> {t("post", language)}
            </button>
          </div>
        </form>
      )}

      {comments.length === 0 && !showForm && (
        <p className="text-[13px] text-muted-foreground/60 py-4">{t("noComments", language)}</p>
      )}

      <div className="space-y-3">
        {comments.map((c) => (
          <div key={c.id} className="group p-3 rounded-lg border border-border bg-card">
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-[10px] font-semibold text-primary">
                  {c.author.charAt(0).toUpperCase()}
                </div>
                <span className="text-[13px] font-medium text-foreground">{c.author}</span>
                <span className="text-[11px] text-muted-foreground font-mono">
                  {new Date(c.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                </span>
              </div>
              <button
                onClick={() => handleDelete(c.id)}
                className="opacity-0 group-hover:opacity-100 p-1 rounded text-muted-foreground hover:text-destructive transition-all"
                title="Delete"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            </div>
            <p className="text-[13px] text-foreground/80 leading-relaxed pl-8">{c.text}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
