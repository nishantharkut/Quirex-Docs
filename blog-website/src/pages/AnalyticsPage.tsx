import { Header } from "@/components/Header";
import { getPopularPages, getViewsOverTime, getTopSearchQueries, getAnalytics, getZeroResultSearches, getFeedbackSummary } from "@/lib/analytics";
import { BarChart3, Search, FileText, TrendingUp, Eye, AlertTriangle, ThumbsUp, ThumbsDown } from "lucide-react";
import { Link } from "react-router-dom";
import { ScrollToTop } from "@/components/ScrollToTop";

export default function AnalyticsPage() {
  const analytics = getAnalytics();
  const popularPages = getPopularPages(30);
  const viewsOverTime = getViewsOverTime(14);
  const topQueries = getTopSearchQueries(30);
  const zeroResultQueries = getZeroResultSearches(30);
  const feedback = getFeedbackSummary();
  const totalViews = analytics.pageViews.length;
  const totalSearches = analytics.searchQueries.length;
  const uniquePages = new Set(analytics.pageViews.map((v) => v.slug)).size;

  const maxDailyViews = Math.max(...viewsOverTime.map((d) => d.views), 1);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main id="main-content" className="max-w-4xl mx-auto px-4 sm:px-6 py-10 sm:py-16">
        <h1 className="text-[1.75rem] sm:text-[2rem] font-bold tracking-[-0.03em] text-foreground mb-1">
          Analytics
        </h1>
        <p className="text-[14px] text-muted-foreground mb-8">
          Documentation usage insights. Data is stored locally in your browser.
        </p>

        {/* Stats cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-10">
          {[
            { label: "Total Views", value: totalViews, icon: Eye },
            { label: "Unique Pages", value: uniquePages, icon: FileText },
            { label: "Search Queries", value: totalSearches, icon: Search },
            { label: "Avg/Day", value: totalViews > 0 ? Math.round(totalViews / 30) : 0, icon: TrendingUp },
          ].map((stat) => (
            <div key={stat.label} className="p-4 rounded-lg border border-border bg-card">
              <div className="flex items-center gap-2 mb-2">
                <stat.icon className="w-3.5 h-3.5 text-muted-foreground" />
                <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide">
                  {stat.label}
                </span>
              </div>
              <div className="text-[1.5rem] font-bold text-foreground tracking-tight">
                {stat.value}
              </div>
            </div>
          ))}
        </div>

        {/* Feedback sentiment */}
        {feedback.total > 0 && (
          <div className="mb-10 p-4 rounded-lg border border-border bg-card">
            <h2 className="text-[15px] font-semibold text-foreground mb-3 flex items-center gap-2">
              <ThumbsUp className="w-4 h-4 text-muted-foreground" /> Feedback Sentiment
            </h2>
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <ThumbsUp className="w-4 h-4 text-[hsl(142,60%,45%)]" />
                <span className="text-[14px] font-semibold text-foreground">{feedback.positive}</span>
                <span className="text-[12px] text-muted-foreground">helpful</span>
              </div>
              <div className="flex items-center gap-2">
                <ThumbsDown className="w-4 h-4 text-destructive" />
                <span className="text-[14px] font-semibold text-foreground">{feedback.negative}</span>
                <span className="text-[12px] text-muted-foreground">not helpful</span>
              </div>
              <div className="ml-auto">
                <span className="text-[20px] font-bold text-foreground">{feedback.ratio}%</span>
                <span className="text-[12px] text-muted-foreground ml-1">positive</span>
              </div>
            </div>
            <div className="mt-3 h-2 rounded-full bg-muted overflow-hidden">
              <div
                className="h-full rounded-full bg-[hsl(142,60%,45%)] transition-all"
                style={{ width: `${feedback.ratio}%` }}
              />
            </div>
          </div>
        )}

        {/* Views chart */}
        <div className="mb-10">
          <h2 className="text-[15px] font-semibold text-foreground mb-4 flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-muted-foreground" /> Views — Last 14 Days
          </h2>
          <div className="p-4 rounded-lg border border-border bg-card">
            <div className="flex items-end gap-1 h-32">
              {viewsOverTime.map((day) => (
                <div key={day.date} className="flex-1 flex flex-col items-center gap-1 group">
                  <span className="text-[10px] text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity font-mono">
                    {day.views}
                  </span>
                  <div
                    className="w-full rounded-sm bg-primary/20 hover:bg-primary/40 transition-colors min-h-[2px]"
                    style={{ height: `${Math.max(2, (day.views / maxDailyViews) * 100)}%` }}
                  />
                  <span className="text-[9px] text-muted-foreground/60 font-mono">
                    {new Date(day.date).getDate()}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-6 mb-10">
          {/* Popular pages */}
          <div>
            <h2 className="text-[15px] font-semibold text-foreground mb-4 flex items-center gap-2">
              <FileText className="w-4 h-4 text-muted-foreground" /> Most Viewed Pages
            </h2>
            <div className="rounded-lg border border-border bg-card divide-y divide-border">
              {popularPages.length === 0 ? (
                <div className="px-4 py-6 text-center text-[13px] text-muted-foreground">
                  No page views recorded yet.
                </div>
              ) : (
                popularPages.slice(0, 10).map((page, i) => (
                  <Link
                    key={page.slug}
                    to={`/docs/${page.slug}`}
                    className="flex items-center justify-between px-4 py-2.5 hover:bg-muted/30 transition-colors"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className="text-[11px] text-muted-foreground/50 font-mono w-4 shrink-0">{i + 1}</span>
                      <span className="text-[13px] text-foreground truncate">{page.title}</span>
                    </div>
                    <span className="text-[12px] text-muted-foreground font-mono shrink-0 ml-3">
                      {page.views}
                    </span>
                  </Link>
                ))
              )}
            </div>
          </div>

          {/* Top searches */}
          <div>
            <h2 className="text-[15px] font-semibold text-foreground mb-4 flex items-center gap-2">
              <Search className="w-4 h-4 text-muted-foreground" /> Top Searches
            </h2>
            <div className="rounded-lg border border-border bg-card divide-y divide-border">
              {topQueries.length === 0 ? (
                <div className="px-4 py-6 text-center text-[13px] text-muted-foreground">
                  No searches recorded yet.
                </div>
              ) : (
                topQueries.slice(0, 10).map((q) => (
                  <div key={q.query} className="flex items-center justify-between px-4 py-2.5">
                    <span className="text-[13px] text-foreground font-mono truncate">"{q.query}"</span>
                    <span className="text-[12px] text-muted-foreground font-mono shrink-0 ml-3">
                      {q.count}×
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Zero-result searches */}
        {zeroResultQueries.length > 0 && (
          <div>
            <h2 className="text-[15px] font-semibold text-foreground mb-4 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-[hsl(38,92%,50%)]" /> Searches With No Results
            </h2>
            <p className="text-[12px] text-muted-foreground mb-3">
              Users searched for these terms but found nothing. Consider adding content for these topics.
            </p>
            <div className="rounded-lg border border-border bg-card divide-y divide-border">
              {zeroResultQueries.map((q) => (
                <div key={q.query} className="flex items-center justify-between px-4 py-2.5">
                  <span className="text-[13px] text-foreground font-mono">"{q.query}"</span>
                  <span className="text-[12px] text-muted-foreground font-mono shrink-0 ml-3">
                    {q.count}×
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
      <ScrollToTop />
    </div>
  );
}
