import { useMemo, useEffect, useState, useCallback } from "react";

interface TocItem {
  id: string;
  text: string;
  level: number;
}

export function TableOfContents({ content }: { content: string }) {
  const [activeId, setActiveId] = useState<string>("");

  const headings = useMemo(() => {
    const items: TocItem[] = [];
    const lines = content.split("\n");
    let inCode = false;
    for (const line of lines) {
      if (line.trim().startsWith("```")) { inCode = !inCode; continue; }
      if (inCode) continue;
      const m = line.match(/^(#{2,4})\s+(.+)/);
      if (m) {
        const text = m[2].replace(/[*_`\[\]]/g, "");
        const id = text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
        items.push({ id, text, level: m[1].length });
      }
    }
    return items;
  }, [content]);

  const handleScroll = useCallback(() => {
    const offsets = headings
      .map((h) => {
        const el = document.getElementById(h.id);
        if (!el) return null;
        return { id: h.id, top: el.getBoundingClientRect().top };
      })
      .filter(Boolean) as { id: string; top: number }[];

    // Find the last heading that has scrolled past the top
    let current = "";
    for (const o of offsets) {
      if (o.top <= 80) current = o.id;
    }
    if (!current && offsets.length > 0) current = offsets[0].id;
    setActiveId(current);
  }, [headings]);

  useEffect(() => {
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

  if (headings.length < 2) return null;

  return (
    <div className="hidden xl:block w-52 shrink-0">
      <div className="sticky top-16 pt-8">
        <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground mb-3">
          On this page
        </p>
        <div className="relative">
          {/* Track line */}
          <div
            className="absolute left-0 top-0 bottom-0 w-[2px] rounded-full"
            style={{ background: 'hsl(var(--toc-bar))' }}
          />
          <nav className="space-y-0.5">
            {headings.map((h) => (
              <a
                key={h.id}
                href={`#${h.id}`}
                onClick={(e) => {
                  e.preventDefault();
                  document.getElementById(h.id)?.scrollIntoView({ behavior: "smooth", block: "start" });
                }}
                className={`relative block text-[13px] leading-snug py-1 transition-colors duration-150 ${
                  h.level === 2 ? "pl-3" : h.level === 3 ? "pl-5" : "pl-7"
                } ${
                  activeId === h.id
                    ? "text-toc-active font-medium"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {/* Active indicator */}
                {activeId === h.id && (
                  <span
                    className="absolute left-0 top-0.5 bottom-0.5 w-[2px] rounded-full bg-toc-active transition-all duration-200"
                  />
                )}
                {h.text}
              </a>
            ))}
          </nav>
        </div>
      </div>
    </div>
  );
}
