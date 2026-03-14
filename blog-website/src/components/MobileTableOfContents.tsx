import { useMemo, useState, useRef, useEffect } from "react";
import { ChevronDown, List } from "lucide-react";
import gsap from "gsap";
import { useI18n, t } from "@/lib/i18n";

interface TocItem {
  id: string;
  text: string;
  level: number;
}

export function MobileTableOfContents({ content }: { content: string }) {
  const [open, setOpen] = useState(false);
  const listRef = useRef<HTMLElement>(null);
  const { language } = useI18n();

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

  // Animate list items on open
  useEffect(() => {
    if (open && listRef.current) {
      const items = listRef.current.querySelectorAll("a");
      gsap.fromTo(
        items,
        { opacity: 0, x: -8 },
        { opacity: 1, x: 0, duration: 0.3, stagger: 0.03, ease: "power3.out" }
      );
    }
  }, [open]);

  if (headings.length < 2) return null;

  return (
    <div className="xl:hidden mb-6">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between gap-2 px-3 py-2.5 text-[13px] font-medium text-muted-foreground rounded-lg border border-border bg-muted/30 hover:bg-muted/50 transition-all duration-200 active:bg-muted/70"
      >
        <span className="flex items-center gap-2">
          <List className="w-3.5 h-3.5" />
          {t("onThisPage", language)}
        </span>
        <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <nav ref={listRef} className="mt-1 px-1 py-2 rounded-lg border border-border bg-card animate-scale-in">
          {headings.map((h) => (
            <a
              key={h.id}
              href={`#${h.id}`}
              onClick={(e) => {
                e.preventDefault();
                setOpen(false);
                document.getElementById(h.id)?.scrollIntoView({ behavior: "smooth", block: "start" });
              }}
              className={`block text-[13px] leading-snug py-2 px-3 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all duration-200 active:bg-muted ${
                h.level === 2 ? "pl-3" : h.level === 3 ? "pl-6" : "pl-9"
              }`}
            >
              {h.text}
            </a>
          ))}
        </nav>
      )}
    </div>
  );
}
