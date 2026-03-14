import { useState } from "react";
import { Header } from "@/components/Header";
import { savePost, generateSlug, generateId, getPosts } from "@/lib/content";
import { Post } from "@/types/blog";
import { siteConfig } from "@/lib/siteConfig";
import { Upload, FileText, Check, AlertTriangle, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

interface ParsedDoc {
  title: string;
  content: string;
  category: string;
  tags: string[];
}

function parseNotionMarkdown(raw: string): ParsedDoc[] {
  // Notion exports use # for titles and basic markdown
  // Split by H1 headings to detect multiple docs
  const sections = raw.split(/(?=^# )/gm).filter((s) => s.trim());

  return sections.map((section) => {
    const lines = section.split("\n");
    const titleMatch = lines[0]?.match(/^# (.+)/);
    const title = titleMatch ? titleMatch[1].trim() : "Untitled Import";
    const content = section.trim();

    // Try to detect category from folder-like structure
    let category = "guides";
    const tags: string[] = ["imported", "notion"];

    return { title, content, category, tags };
  });
}

export default function NotionImportPage() {
  const [input, setInput] = useState("");
  const [parsed, setParsed] = useState<ParsedDoc[]>([]);
  const [imported, setImported] = useState(false);
  const [importCount, setImportCount] = useState(0);

  const handleParse = () => {
    if (!input.trim()) return;
    const docs = parseNotionMarkdown(input);
    setParsed(docs);
  };

  const handleImport = () => {
    const existing = getPosts();
    let count = 0;

    parsed.forEach((doc) => {
      const slug = generateSlug(doc.title);
      // Skip if slug already exists
      if (existing.some((p) => p.slug === slug)) return;

      const post: Post = {
        id: generateId(),
        title: doc.title,
        slug,
        excerpt: doc.content.substring(0, 120).replace(/[#*\n]/g, "").trim(),
        content: doc.content,
        category: doc.category,
        tags: doc.tags,
        published: false, // Import as draft
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        author: siteConfig.defaultAuthor,
      };
      savePost(post);
      count++;
    });

    setImportCount(count);
    setImported(true);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="max-w-2xl mx-auto px-4 sm:px-6 py-10 sm:py-16">
        <h1 className="text-[1.75rem] sm:text-[2rem] font-bold tracking-[-0.03em] text-foreground mb-1">
          Import from Notion
        </h1>
        <p className="text-[14px] text-muted-foreground mb-8">
          Paste exported Notion markdown to import as documentation pages.
        </p>

        {imported ? (
          <div className="p-6 rounded-lg border border-border bg-card text-center">
            <Check className="w-10 h-10 text-[hsl(142,60%,45%)] mx-auto mb-3" />
            <h2 className="text-[1.125rem] font-semibold text-foreground mb-2">
              Imported {importCount} document{importCount !== 1 ? "s" : ""}!
            </h2>
            <p className="text-[13px] text-muted-foreground mb-4">
              Documents were imported as drafts. Review and publish them in the admin panel.
            </p>
            <div className="flex items-center justify-center gap-3">
              <Link
                to="/admin"
                className="inline-flex items-center gap-2 px-4 py-2 text-[13px] font-medium rounded-lg bg-primary text-primary-foreground hover:opacity-90"
              >
                Open Admin <ArrowRight className="w-3.5 h-3.5" />
              </Link>
              <button
                onClick={() => { setImported(false); setParsed([]); setInput(""); }}
                className="px-4 py-2 text-[13px] rounded-lg border border-border text-muted-foreground hover:text-foreground"
              >
                Import more
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* Instructions */}
            <div className="p-4 rounded-lg border border-border bg-card mb-6">
              <h3 className="text-[13px] font-semibold text-foreground mb-2">How to export from Notion:</h3>
              <ol className="text-[12px] text-muted-foreground space-y-1 list-decimal list-inside">
                <li>Open your Notion page or database</li>
                <li>Click <strong>⋯</strong> menu → <strong>Export</strong></li>
                <li>Select <strong>Markdown & CSV</strong> format</li>
                <li>Download and paste the markdown content below</li>
              </ol>
            </div>

            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="# My Page Title\n\nPaste your Notion-exported markdown here...\n\nMultiple pages separated by # headings will be imported as separate documents."
              rows={12}
              className="w-full px-3 py-2 text-[13px] rounded-md border border-border bg-background text-foreground outline-none focus:ring-1 focus:ring-ring resize-y font-mono mb-4"
            />

            <div className="flex items-center gap-3">
              <button
                onClick={handleParse}
                disabled={!input.trim()}
                className="flex items-center gap-1.5 px-4 py-2 text-[13px] rounded-md bg-primary text-primary-foreground hover:opacity-90 transition-opacity font-medium disabled:opacity-40"
              >
                <FileText className="w-3.5 h-3.5" /> Preview ({input.split(/^# /gm).filter((s) => s.trim()).length} docs detected)
              </button>
            </div>

            {parsed.length > 0 && (
              <div className="mt-6">
                <h3 className="text-[14px] font-semibold text-foreground mb-3">Preview ({parsed.length} documents)</h3>
                <div className="border border-border rounded-md divide-y divide-border mb-4">
                  {parsed.map((doc, i) => (
                    <div key={i} className="px-4 py-3">
                      <div className="text-[13px] font-medium text-foreground">{doc.title}</div>
                      <div className="text-[11px] text-muted-foreground font-mono mt-0.5">
                        {doc.content.length} chars · {doc.tags.join(", ")}
                      </div>
                    </div>
                  ))}
                </div>
                <button
                  onClick={handleImport}
                  className="flex items-center gap-1.5 px-4 py-2 text-[13px] rounded-md bg-primary text-primary-foreground hover:opacity-90 transition-opacity font-medium"
                >
                  <Upload className="w-3.5 h-3.5" /> Import as Drafts
                </button>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
