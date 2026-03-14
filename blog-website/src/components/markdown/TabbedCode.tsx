import { useState, ReactNode } from "react";

interface Tab {
  label: string;
  content: ReactNode;
}

interface TabbedCodeProps {
  tabs: Tab[];
}

export function TabbedCode({ tabs }: TabbedCodeProps) {
  const [active, setActive] = useState(0);

  return (
    <div className="my-5 rounded-md border border-border overflow-hidden">
      <div className="flex border-b border-border bg-muted/30">
        {tabs.map((tab, i) => (
          <button
            key={i}
            onClick={() => setActive(i)}
            className={`px-3 py-1.5 text-[12px] font-medium transition-colors border-b-2 -mb-px ${
              active === i
                ? "border-primary text-foreground"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div>{tabs[active]?.content}</div>
    </div>
  );
}
