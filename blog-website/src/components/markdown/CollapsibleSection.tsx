import { useState, ReactNode } from "react";
import { ChevronRight } from "lucide-react";

interface CollapsibleSectionProps {
  title: string;
  children: ReactNode;
}

export function CollapsibleSection({ title, children }: CollapsibleSectionProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className="my-4 rounded-md border border-border overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 w-full px-4 py-2.5 text-left text-[13px] font-medium text-foreground bg-muted/30 hover:bg-muted/50 transition-colors"
      >
        <ChevronRight
          className={`w-3.5 h-3.5 text-muted-foreground transition-transform duration-200 ${
            open ? "rotate-90" : ""
          }`}
        />
        {title}
      </button>
      {open && (
        <div className="px-4 py-3 text-[13px] leading-relaxed text-foreground/80 border-t border-border [&>br]:block [&>br]:mb-1">
          {children}
        </div>
      )}
    </div>
  );
}
