import { Header } from "@/components/Header";
import { useBlogPosts } from "@/hooks/useBlogPosts";
import { getAnalytics } from "@/lib/analytics";
import { scoreDoc, getHealthLabel, getHealthBg, DocHealthScore } from "@/lib/docHealth";
import { Link } from "react-router-dom";
import { Activity, AlertTriangle, CheckCircle2, TrendingUp, ChevronRight, FileText, RefreshCw } from "lucide-react";
import { useState, useMemo } from "react";

type SortBy = "overall" | "freshness" | "completeness" | "quality";

export default function DocHealthPage() {
  const [sortBy, setSortBy] = useState<SortBy>("overall");
  const [showIssuesOnly, setShowIssuesOnly] = useState(false);
  const { data: rawPosts = [] } = useBlogPosts();

  const scores = useMemo(() => {
    const posts = rawPosts.filter((p) => p.published);
    const analytics = getAnalytics();
    const feedback = (() => {
      try {
        return JSON.parse(localStorage.getItem("quirex_feedback") || "{}");
      } catch {
        return {};
      }
    })();

    return posts.map((post) => {
      // Map Supabase BlogPost fields to the shape scoreDoc expects
      const adapted = {
        id: post.id,
        title: post.title,
        slug: post.slug,
        excerpt: post.excerpt || "",
        content: post.content || "",
        category: post.category || "general",
        tags: post.tags || [],
        published: post.published ?? true,
        createdAt: post.created_at,
        updatedAt: post.updated_at,
        author: post.author_name || "",
      };
      const viewCount = analytics.pageViews.filter((v) => v.slug === post.slug).length;
      const hasFeedback = !!feedback[post.slug];
      return scoreDoc(adapted, viewCount, hasFeedback);
    });
  }, [rawPosts]);

  const sorted = useMemo(() => {
    let items = [...scores];
    if (showIssuesOnly) items = items.filter((s) => s.issues.length > 0);
    return items.sort((a, b) => {
      if (sortBy === "overall") return a.overall - b.overall;
      return a.factors[sortBy] - b.factors[sortBy];
    });
  }, [scores, sortBy, showIssuesOnly]);

  const avgScore = scores.length > 0 ? Math.round(scores.reduce((s, d) => s + d.overall, 0) / scores.length) : 0;
  const criticalCount = scores.filter((s) => s.overall < 40).length;
  const healthyCount = scores.filter((s) => s.overall >= 80).length;
  const totalIssues = scores.reduce((s, d) => s + d.issues.length, 0);

  const avgHealth = getHealthLabel(avgScore);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-10 sm:py-16">
        <div className="flex items-start justify-between mb-8 gap-4 flex-wrap">
          <div>
            <h1 className="text-[1.75rem] sm:text-[2rem] font-bold tracking-[-0.03em] text-foreground mb-1">
              Doc Health
            </h1>
            <p className="text-[14px] text-muted-foreground">
              Automated scoring to identify stale, incomplete, or low-quality documentation.
            </p>
          </div>
        </div>

        {/* Summary cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
          {[
            { label: "Avg Score", value: `${avgScore}`, icon: Activity, extra: avgHealth.label, extraClass: avgHealth.color },
            { label: "Healthy", value: `${healthyCount}`, icon: CheckCircle2, extra: "score ≥ 80", extraClass: "text-[hsl(142,60%,45%)]" },
            { label: "Critical", value: `${criticalCount}`, icon: AlertTriangle, extra: "score < 40", extraClass: "text-destructive" },
            { label: "Total Issues", value: `${totalIssues}`, icon: TrendingUp, extra: "across all docs", extraClass: "text-muted-foreground" },
          ].map((stat) => (
            <div key={stat.label} className="p-4 rounded-lg border border-border bg-card">
              <div className="flex items-center gap-2 mb-2">
                <stat.icon className="w-3.5 h-3.5 text-muted-foreground" />
                <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide">
                  {stat.label}
                </span>
              </div>
              <div className="text-[1.5rem] font-bold text-foreground tracking-tight">{stat.value}</div>
              <div className={`text-[11px] mt-0.5 ${stat.extraClass}`}>{stat.extra}</div>
            </div>
          ))}
        </div>

        {/* Controls */}
        <div className="flex flex-wrap items-center gap-2 mb-6">
          <span className="text-[12px] text-muted-foreground font-medium">Sort by:</span>
          {(["overall", "freshness", "completeness", "quality"] as SortBy[]).map((s) => (
            <button
              key={s}
              onClick={() => setSortBy(s)}
              className={`px-2.5 py-1 text-[11px] rounded-md border capitalize transition-colors ${
                sortBy === s ? "border-primary/30 text-primary bg-primary/5" : "border-border text-muted-foreground hover:text-foreground"
              }`}
            >
              {s}
            </button>
          ))}
          <div className="ml-auto">
            <button
              onClick={() => setShowIssuesOnly(!showIssuesOnly)}
              className={`px-2.5 py-1 text-[11px] rounded-md border transition-colors ${
                showIssuesOnly ? "border-destructive/30 text-destructive bg-destructive/5" : "border-border text-muted-foreground"
              }`}
            >
              {showIssuesOnly ? "Showing issues only" : "Show all"}
            </button>
          </div>
        </div>

        {/* Doc list */}
        <div className="space-y-2">
          {sorted.map((doc) => (
            <DocHealthCard key={doc.slug} doc={doc} />
          ))}
          {sorted.length === 0 && (
            <div className="p-8 text-center text-[13px] text-muted-foreground border border-border rounded-lg">
              {showIssuesOnly ? "No documents with issues found. Everything looks healthy! 🎉" : "No published documents found."}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

function DocHealthCard({ doc }: { doc: DocHealthScore }) {
  const [expanded, setExpanded] = useState(false);
  const health = getHealthLabel(doc.overall);
  const bg = getHealthBg(doc.overall);

  return (
    <div className="rounded-lg border border-border overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center gap-3 px-4 py-3 hover:bg-muted/30 transition-colors text-left"
      >
        {/* Score badge */}
        <div className={`w-10 h-10 rounded-lg ${bg} flex items-center justify-center shrink-0`}>
          <span className={`text-[14px] font-bold ${health.color}`}>{doc.overall}</span>
        </div>

        <div className="flex-1 min-w-0">
          <div className="text-[13px] font-medium text-foreground truncate">{doc.title}</div>
          <div className="text-[11px] text-muted-foreground flex items-center gap-2 mt-0.5">
            <span className="font-mono">{doc.category}</span>
            <span>·</span>
            <span className={health.color}>{health.label}</span>
            {doc.issues.length > 0 && (
              <>
                <span>·</span>
                <span className="text-destructive/70">{doc.issues.length} issue{doc.issues.length > 1 ? "s" : ""}</span>
              </>
            )}
          </div>
        </div>

        {/* Factor mini bars */}
        <div className="hidden sm:flex items-center gap-2 shrink-0">
          {(["freshness", "completeness", "quality"] as const).map((f) => (
            <div key={f} className="w-12" title={`${f}: ${doc.factors[f]}`}>
              <div className="text-[9px] text-muted-foreground/60 uppercase tracking-wider mb-0.5 text-center">
                {f.slice(0, 4)}
              </div>
              <div className="h-1.5 rounded-full bg-border overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${
                    doc.factors[f] >= 80 ? "bg-[hsl(142,60%,45%)]" :
                    doc.factors[f] >= 60 ? "bg-primary" :
                    doc.factors[f] >= 40 ? "bg-[hsl(35,90%,55%)]" : "bg-destructive"
                  }`}
                  style={{ width: `${doc.factors[f]}%` }}
                />
              </div>
            </div>
          ))}
        </div>

        <ChevronRight className={`w-3.5 h-3.5 text-muted-foreground shrink-0 transition-transform ${expanded ? "rotate-90" : ""}`} />
      </button>

      {expanded && (
        <div className="border-t border-border px-4 py-4 bg-card space-y-4">
          {/* Factor breakdown */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {(["freshness", "completeness", "quality", "engagement"] as const).map((f) => {
              const val = doc.factors[f];
              const fHealth = getHealthLabel(val);
              return (
                <div key={f} className="p-3 rounded-md border border-border">
                  <div className="text-[11px] font-medium text-muted-foreground capitalize mb-1">{f}</div>
                  <div className={`text-[1.25rem] font-bold ${fHealth.color}`}>{val}</div>
                  <div className="h-1 rounded-full bg-border mt-1.5 overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        val >= 80 ? "bg-[hsl(142,60%,45%)]" : val >= 60 ? "bg-primary" : val >= 40 ? "bg-[hsl(35,90%,55%)]" : "bg-destructive"
                      }`}
                      style={{ width: `${val}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Issues */}
          {doc.issues.length > 0 && (
            <div>
              <h4 className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground mb-2">
                Issues ({doc.issues.length})
              </h4>
              <ul className="space-y-1.5">
                {doc.issues.map((issue, i) => (
                  <li key={i} className="flex items-start gap-2 text-[12px] text-foreground/80">
                    <AlertTriangle className="w-3 h-3 text-destructive/60 shrink-0 mt-0.5" />
                    {issue}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center gap-2 pt-2">
            <Link
              to={`/docs/${doc.slug}`}
              className="flex items-center gap-1.5 px-3 py-1.5 text-[12px] rounded-md border border-border text-muted-foreground hover:text-foreground transition-colors"
            >
              <FileText className="w-3 h-3" /> View doc
            </Link>
            <span className="text-[11px] text-muted-foreground font-mono">
              Updated {new Date(doc.lastUpdated).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
