import { useState } from "react";
import { Header } from "@/components/Header";
import {
  getThemeCustomization, saveThemeCustomization, getCustomCSS, saveCustomCSS,
  resetTheme, ThemeCustomization, FONT_OPTIONS, MONO_FONT_OPTIONS
} from "@/lib/themeCustomizer";
import { generateRSS, generateSitemap, downloadXml } from "@/lib/rss";
import { getPosts } from "@/lib/content";
import { siteConfig } from "@/lib/siteConfig";
import { Paintbrush, RotateCcw, Save, Code, Rss, Map, ChevronDown } from "lucide-react";

export default function ThemeEditorPage() {
  const [theme, setTheme] = useState<ThemeCustomization>(getThemeCustomization);
  const [customCSS, setCustomCSS] = useState(getCustomCSS);
  const [saved, setSaved] = useState(false);
  const [tab, setTab] = useState<"theme" | "css" | "seo">("theme");

  const handleSave = () => {
    saveThemeCustomization(theme);
    saveCustomCSS(customCSS);
    setSaved(true);
    setTimeout(() => setSaved(false), 1500);
  };

  const handleReset = () => {
    if (!confirm("Reset all customizations to defaults?")) return;
    resetTheme();
    setTheme(getThemeCustomization());
    setCustomCSS("");
  };

  const handleGenerateRSS = () => {
    const rss = generateRSS(siteConfig.baseUrl, siteConfig.name);
    downloadXml("rss.xml", rss);
  };

  const handleGenerateSitemap = () => {
    const posts = getPosts().filter((p) => p.published);
    const sitemap = generateSitemap(
      siteConfig.baseUrl,
      posts.map((p) => ({ slug: p.slug, updatedAt: p.updatedAt }))
    );
    downloadXml("sitemap.xml", sitemap);
  };

  const previewColor = `hsl(${theme.primaryHue}, ${theme.primarySat}%, ${theme.primaryLight}%)`;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-10 sm:py-16">
        <div className="flex items-start justify-between mb-8 gap-4 flex-wrap">
          <div>
            <h1 className="text-[1.75rem] sm:text-[2rem] font-bold tracking-[-0.03em] text-foreground mb-1">
              Branding & Theme
            </h1>
            <p className="text-[14px] text-muted-foreground">
              Customize colors, fonts, and generate SEO assets.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleReset}
              className="flex items-center gap-1 px-3 py-1.5 text-[12px] rounded-md border border-border text-muted-foreground hover:text-foreground transition-colors"
            >
              <RotateCcw className="w-3 h-3" /> Reset
            </button>
            <button
              onClick={handleSave}
              className="flex items-center gap-1 px-3 py-1.5 text-[12px] rounded-md bg-primary text-primary-foreground hover:opacity-90 transition-opacity font-medium"
            >
              <Save className="w-3 h-3" /> {saved ? "Saved!" : "Save"}
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-0.5 mb-6 border-b border-border">
          {([
            { key: "theme", label: "Theme", icon: Paintbrush },
            { key: "css", label: "Custom CSS", icon: Code },
            { key: "seo", label: "SEO & Feeds", icon: Rss },
          ] as const).map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`flex items-center gap-1.5 px-3 py-2 text-[13px] font-medium border-b-2 -mb-px transition-colors ${
                tab === t.key ? "border-primary text-foreground" : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              <t.icon className="w-3.5 h-3.5" /> {t.label}
            </button>
          ))}
        </div>

        {tab === "theme" && (
          <div className="space-y-6">
            {/* Primary Color */}
            <div className="p-4 rounded-lg border border-border bg-card">
              <h3 className="text-[14px] font-semibold text-foreground mb-4">Primary Color</h3>
              <div className="flex items-center gap-4 mb-4">
                <div
                  className="w-12 h-12 rounded-lg border border-border shrink-0"
                  style={{ backgroundColor: previewColor }}
                />
                <div className="text-[12px] font-mono text-muted-foreground">{previewColor}</div>
              </div>
              <div className="space-y-3">
                <div>
                  <label className="text-[11px] font-medium text-muted-foreground mb-1 block">Hue ({theme.primaryHue}°)</label>
                  <input type="range" min="0" max="360" value={theme.primaryHue}
                    onChange={(e) => setTheme({ ...theme, primaryHue: Number(e.target.value) })}
                    className="w-full accent-primary" />
                </div>
                <div>
                  <label className="text-[11px] font-medium text-muted-foreground mb-1 block">Saturation ({theme.primarySat}%)</label>
                  <input type="range" min="0" max="100" value={theme.primarySat}
                    onChange={(e) => setTheme({ ...theme, primarySat: Number(e.target.value) })}
                    className="w-full accent-primary" />
                </div>
                <div>
                  <label className="text-[11px] font-medium text-muted-foreground mb-1 block">Lightness ({theme.primaryLight}%)</label>
                  <input type="range" min="20" max="80" value={theme.primaryLight}
                    onChange={(e) => setTheme({ ...theme, primaryLight: Number(e.target.value) })}
                    className="w-full accent-primary" />
                </div>
              </div>
            </div>

            {/* Typography */}
            <div className="p-4 rounded-lg border border-border bg-card">
              <h3 className="text-[14px] font-semibold text-foreground mb-4">Typography</h3>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-[11px] font-medium text-muted-foreground mb-1 block">Body Font</label>
                  <div className="relative">
                    <select
                      value={theme.fontBody}
                      onChange={(e) => setTheme({ ...theme, fontBody: e.target.value })}
                      className="w-full appearance-none px-3 py-1.5 text-[13px] rounded-md border border-border bg-background text-foreground outline-none focus:ring-1 focus:ring-ring pr-7"
                    >
                      {FONT_OPTIONS.map((f) => <option key={f.value} value={f.value}>{f.label}</option>)}
                    </select>
                    <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-muted-foreground pointer-events-none" />
                  </div>
                </div>
                <div>
                  <label className="text-[11px] font-medium text-muted-foreground mb-1 block">Mono Font</label>
                  <div className="relative">
                    <select
                      value={theme.fontMono}
                      onChange={(e) => setTheme({ ...theme, fontMono: e.target.value })}
                      className="w-full appearance-none px-3 py-1.5 text-[13px] rounded-md border border-border bg-background text-foreground outline-none focus:ring-1 focus:ring-ring pr-7"
                    >
                      {MONO_FONT_OPTIONS.map((f) => <option key={f.value} value={f.value}>{f.label}</option>)}
                    </select>
                    <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-muted-foreground pointer-events-none" />
                  </div>
                </div>
              </div>
            </div>

            {/* Branding */}
            <div className="p-4 rounded-lg border border-border bg-card">
              <h3 className="text-[14px] font-semibold text-foreground mb-4">Branding</h3>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-[11px] font-medium text-muted-foreground mb-1 block">Logo Text</label>
                  <input
                    value={theme.logoText}
                    onChange={(e) => setTheme({ ...theme, logoText: e.target.value })}
                    className="w-full px-3 py-1.5 text-[13px] rounded-md border border-border bg-background text-foreground outline-none focus:ring-1 focus:ring-ring"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-medium text-muted-foreground mb-1 block">Logo Emoji (optional)</label>
                  <input
                    value={theme.logoEmoji}
                    onChange={(e) => setTheme({ ...theme, logoEmoji: e.target.value })}
                    placeholder="📚"
                    className="w-full px-3 py-1.5 text-[13px] rounded-md border border-border bg-background text-foreground outline-none focus:ring-1 focus:ring-ring"
                  />
                </div>
              </div>
              <div className="mt-4">
                <label className="text-[11px] font-medium text-muted-foreground mb-1 block">Border Radius ({theme.borderRadius}rem)</label>
                <input type="range" min="0" max="1.5" step="0.125" value={theme.borderRadius}
                  onChange={(e) => setTheme({ ...theme, borderRadius: Number(e.target.value) })}
                  className="w-full accent-primary" />
              </div>
            </div>

            {/* Preview */}
            <div className="p-4 rounded-lg border border-border bg-card">
              <h3 className="text-[14px] font-semibold text-foreground mb-4">Preview</h3>
              <div className="flex items-center gap-3 flex-wrap">
                <button className="px-4 py-2 text-[13px] rounded-lg font-medium text-white" style={{ backgroundColor: previewColor, borderRadius: `${theme.borderRadius}rem` }}>
                  Primary Button
                </button>
                <button className="px-4 py-2 text-[13px] rounded-lg border border-border text-foreground" style={{ borderRadius: `${theme.borderRadius}rem` }}>
                  Secondary
                </button>
                <span className="px-2 py-0.5 text-[11px] rounded font-medium text-white" style={{ backgroundColor: previewColor, borderRadius: `${theme.borderRadius * 0.6}rem` }}>
                  Badge
                </span>
                <code className="px-1.5 py-0.5 text-[12px] rounded bg-muted text-foreground font-mono" style={{ fontFamily: theme.fontMono }}>
                  code snippet
                </code>
              </div>
            </div>
          </div>
        )}

        {tab === "css" && (
          <div className="space-y-4">
            <div className="p-4 rounded-lg border border-border bg-card">
              <h3 className="text-[14px] font-semibold text-foreground mb-2">Custom CSS</h3>
              <p className="text-[12px] text-muted-foreground mb-3">
                Inject custom CSS to override any styles. Changes are stored in your browser.
              </p>
              <textarea
                value={customCSS}
                onChange={(e) => setCustomCSS(e.target.value)}
                placeholder={`/* Example: */\n.prose-docs h1 {\n  color: red;\n}\n\n.code-block {\n  border-radius: 12px;\n}`}
                rows={16}
                className="w-full px-3 py-2 text-[13px] rounded-md border border-border bg-background text-foreground outline-none focus:ring-1 focus:ring-ring resize-y font-mono"
              />
            </div>
          </div>
        )}

        {tab === "seo" && (
          <div className="space-y-4">
            <div className="p-4 rounded-lg border border-border bg-card">
              <h3 className="text-[14px] font-semibold text-foreground mb-2">Generate SEO Files</h3>
              <p className="text-[12px] text-muted-foreground mb-4">
                Download RSS and sitemap XML files to serve from your static host.
              </p>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={handleGenerateRSS}
                  className="flex items-center gap-1.5 px-4 py-2 text-[13px] rounded-md border border-border text-foreground hover:bg-muted transition-colors font-medium"
                >
                  <Rss className="w-3.5 h-3.5 text-primary" /> Download RSS Feed
                </button>
                <button
                  onClick={handleGenerateSitemap}
                  className="flex items-center gap-1.5 px-4 py-2 text-[13px] rounded-md border border-border text-foreground hover:bg-muted transition-colors font-medium"
                >
                  <Map className="w-3.5 h-3.5 text-primary" /> Download Sitemap
                </button>
              </div>
            </div>

            <div className="p-4 rounded-lg border border-border bg-card">
              <h3 className="text-[14px] font-semibold text-foreground mb-2">Meta Tags</h3>
              <p className="text-[12px] text-muted-foreground mb-3">
                OpenGraph and Twitter Card meta tags are already configured in <code className="text-[11px] px-1 py-0.5 bg-muted rounded font-mono">index.html</code>.
                Dynamic per-page meta will be set via document title updates.
              </p>
              <div className="rounded-md bg-muted p-3 text-[12px] font-mono text-foreground/70 overflow-x-auto">
                {`<meta property="og:title" content="${siteConfig.metaTitle}" />\n<meta property="og:description" content="${siteConfig.metaDescription}" />\n<meta property="og:image" content="${siteConfig.ogImage}" />`}
              </div>
            </div>

            <div className="p-4 rounded-lg border border-border bg-card">
              <h3 className="text-[14px] font-semibold text-foreground mb-2">GitHub Issues Integration</h3>
              <p className="text-[12px] text-muted-foreground mb-3">
                Link doc feedback to GitHub Issues. Readers can report issues directly from any page.
              </p>
              <div className="text-[12px] text-muted-foreground">
                Configure your repo URL in <code className="text-[11px] px-1 py-0.5 bg-muted rounded font-mono">siteConfig.ts</code> under <code className="text-[11px] px-1 py-0.5 bg-muted rounded font-mono">externalLinks</code>.
                A "Report issue" link appears on each doc page linking to GitHub Issues with pre-filled title.
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
