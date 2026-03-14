import { useCallback, useState, useRef } from "react";
import { Upload, FileText, X, Check } from "lucide-react";
import { generateId, generateSlug, savePost } from "@/lib/content";
import { Post } from "@/types/blog";

interface FileUploadProps {
  defaultCategory: string;
  onComplete: () => void;
  /** When provided, called instead of the localStorage savePost fallback */
  onImport?: (posts: Post[]) => Promise<void>;
}

interface ParsedFile {
  filename: string;
  title: string;
  content: string;
  category: string;
  tags: string[];
  status: "pending" | "done";
}

function parseFrontmatter(raw: string): { meta: Record<string, any>; content: string } {
  const match = raw.match(/^---\s*\n([\s\S]*?)\n---\s*\n([\s\S]*)$/);
  if (!match) return { meta: {}, content: raw };

  const meta: Record<string, any> = {};
  match[1].split("\n").forEach((line) => {
    const idx = line.indexOf(":");
    if (idx === -1) return;
    const key = line.slice(0, idx).trim();
    let val = line.slice(idx + 1).trim();
    // Remove quotes
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1);
    }
    // Parse arrays like [a, b]
    if (val.startsWith("[") && val.endsWith("]")) {
      meta[key] = val
        .slice(1, -1)
        .split(",")
        .map((s) => s.trim().replace(/^["']|["']$/g, ""))
        .filter(Boolean);
    } else if (val === "true") {
      meta[key] = true;
    } else if (val === "false") {
      meta[key] = false;
    } else {
      meta[key] = val;
    }
  });

  return { meta, content: match[2] };
}

export function FileUpload({ defaultCategory, onComplete, onImport }: FileUploadProps) {
  const [files, setFiles] = useState<ParsedFile[]>([]);
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const processFiles = useCallback(
    (fileList: FileList) => {
      const newFiles: ParsedFile[] = [];
      Array.from(fileList).forEach((file) => {
        if (!file.name.endsWith(".md") && !file.name.endsWith(".mdx") && !file.name.endsWith(".markdown")) return;
        const reader = new FileReader();
        reader.onload = () => {
          const raw = reader.result as string;
          const { meta, content } = parseFrontmatter(raw);
          const titleFromH1 = content.match(/^#\s+(.+)$/m)?.[1];
          const title = meta.title || titleFromH1 || file.name.replace(/\.(md|mdx|markdown)$/, "");

          newFiles.push({
            filename: file.name,
            title,
            content,
            category: meta.category || defaultCategory,
            tags: Array.isArray(meta.tags) ? meta.tags : [],
            status: "pending",
          });

          if (newFiles.length === fileList.length || newFiles.length === Array.from(fileList).filter((f) => f.name.match(/\.(md|mdx|markdown)$/)).length) {
            setFiles((prev) => [...prev, ...newFiles]);
          }
        };
        reader.readAsText(file);
      });
    },
    [defaultCategory]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragging(false);
      if (e.dataTransfer.files.length) processFiles(e.dataTransfer.files);
    },
    [processFiles]
  );

  const handleImportAll = async () => {
    const pending = files.filter((f) => f.status === "pending");
    const posts: Post[] = pending.map((f) => ({
      id: generateId(),
      title: f.title,
      slug: generateSlug(f.title) + "-" + Date.now().toString(36),
      excerpt: f.content.substring(0, 120).replace(/[#*\n]/g, "").trim(),
      content: f.content,
      category: f.category,
      tags: f.tags,
      published: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      author: "Admin",
    }));

    if (onImport) {
      await onImport(posts);
    } else {
      posts.forEach((post) => savePost(post));
    }

    setFiles((prev) => prev.map((f) => ({ ...f, status: "done" as const })));
    onComplete();
  };

  const removeFile = (idx: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== idx));
  };

  return (
    <div className="mb-6">
      <input
        ref={inputRef}
        type="file"
        accept=".md,.mdx,.markdown"
        multiple
        className="hidden"
        onChange={(e) => e.target.files && processFiles(e.target.files)}
      />

      <div
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
          dragging
            ? "border-primary bg-primary/5"
            : "border-border hover:border-muted-foreground/40"
        }`}
      >
        <Upload className="w-5 h-5 mx-auto mb-2 text-muted-foreground" />
        <p className="text-[13px] text-muted-foreground">
          Drop <span className="font-mono text-foreground">.md</span> files here or{" "}
          <span className="text-primary font-medium">browse</span>
        </p>
        <p className="text-[11px] text-muted-foreground/60 mt-1">Supports frontmatter (title, category, tags)</p>
      </div>

      {files.length > 0 && (
        <div className="mt-3">
          <div className="border border-border rounded-md divide-y divide-border">
            {files.map((f, i) => (
              <div key={i} className="flex items-center justify-between px-3 py-2">
                <div className="flex items-center gap-2 min-w-0">
                  {f.status === "done" ? (
                    <Check className="w-3.5 h-3.5 text-primary shrink-0" />
                  ) : (
                    <FileText className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                  )}
                  <div className="min-w-0">
                    <div className="text-[13px] font-medium text-foreground truncate">{f.title}</div>
                    <div className="text-[11px] text-muted-foreground font-mono">{f.filename}</div>
                  </div>
                </div>
                {f.status === "pending" && (
                  <button onClick={() => removeFile(i)} className="p-1 text-muted-foreground hover:text-destructive transition-colors">
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>
            ))}
          </div>
          {files.some((f) => f.status === "pending") && (
            <button
              onClick={handleImportAll}
              className="mt-2 flex items-center gap-1.5 px-3 py-1.5 text-[12px] rounded-md bg-primary text-primary-foreground hover:opacity-90 transition-opacity font-medium"
            >
              Import {files.filter((f) => f.status === "pending").length} file{files.filter((f) => f.status === "pending").length > 1 ? "s" : ""}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
