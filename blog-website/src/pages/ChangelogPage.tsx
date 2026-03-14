import { Header } from "@/components/Header";
import { changelog, ChangeType } from "@/lib/changelog";
import { Rss } from "lucide-react";

const typeBadge: Record<ChangeType, { label: string; className: string }> = {
  new: { label: "New", className: "bg-primary/10 text-primary" },
  fix: { label: "Fix", className: "bg-destructive/10 text-destructive" },
  improvement: { label: "Improved", className: "bg-accent text-accent-foreground" },
  breaking: { label: "Breaking", className: "bg-destructive/20 text-destructive" },
};

export default function ChangelogPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="max-w-2xl mx-auto px-4 sm:px-6 py-10 sm:py-16">
        <div className="flex items-start justify-between mb-10">
          <div>
            <h1 className="text-[1.75rem] sm:text-[2rem] font-bold tracking-[-0.03em] text-foreground mb-1">
              Changelog
            </h1>
            <p className="text-[14px] text-muted-foreground">
              New features, improvements, and fixes.
            </p>
          </div>
          <button
            className="flex items-center gap-1.5 px-2.5 py-1.5 text-[12px] rounded-md border border-border text-muted-foreground hover:text-foreground transition-colors shrink-0 mt-1"
            title="RSS feed (coming soon)"
          >
            <Rss className="w-3 h-3" /> RSS
          </button>
        </div>

        <div className="relative">
          {/* Timeline line */}
          <div className="absolute left-[7px] top-2 bottom-0 w-px bg-border hidden sm:block" />

          <div className="space-y-12">
            {changelog.map((entry, idx) => (
              <div key={entry.version} className="relative sm:pl-8">
                {/* Timeline dot */}
                <div className="absolute left-0 top-[6px] w-[15px] h-[15px] rounded-full border-2 border-primary bg-background hidden sm:block" />

                <div className="flex flex-wrap items-baseline gap-2 mb-3">
                  <span className="text-[13px] font-mono font-semibold text-primary">
                    {entry.version}
                  </span>
                  <span className="text-[12px] text-muted-foreground font-mono">
                    {new Date(entry.date).toLocaleDateString("en-US", {
                      month: "long",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </span>
                  {idx === 0 && (
                    <span className="text-[10px] font-semibold uppercase tracking-wider bg-primary text-primary-foreground px-1.5 py-0.5 rounded">
                      Latest
                    </span>
                  )}
                </div>

                <h2 className="text-[1.125rem] font-semibold text-foreground mb-4 tracking-[-0.01em]">
                  {entry.title}
                </h2>

                <ul className="space-y-2">
                  {entry.changes.map((change, ci) => {
                    const badge = typeBadge[change.type];
                    return (
                      <li key={ci} className="flex items-start gap-2.5 text-[13px]">
                        <span
                          className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wide shrink-0 mt-[2px] ${badge.className}`}
                        >
                          {badge.label}
                        </span>
                        <span className="text-foreground/80 leading-relaxed">{change.text}</span>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
