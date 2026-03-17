import { Link } from "react-router-dom";
import { Header } from "@/components/Header";
import { siteConfig } from "@/lib/siteConfig";
import { useBlogPosts } from "@/hooks/useBlogPosts";
import { useEffect, useRef, useState, useCallback } from "react";
import { useI18n, t } from "@/lib/i18n";
import {
  FileText,
  Search,
  Moon,
  Terminal,
  Upload,
  FolderOpen,
  ArrowRight,
  ArrowUpRight,
  Command,
  Keyboard,
  Zap,
  Shield,
  GitBranch,
  Check,
  X,
  Minus,
  Star,
  Quote,
} from "lucide-react";
import { MarkdownRenderer } from "@/components/MarkdownRenderer";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGsapReveal, useGsapScaleReveal, useMagneticHover } from "@/lib/gsapAnimations";

gsap.registerPlugin(ScrollTrigger);

// ── Typing effect ──
function useTypingEffect(lines: string[], speed = 30) {
  const [displayed, setDisplayed] = useState<string[]>([]);
  const [currentLine, setCurrentLine] = useState(0);
  const [currentChar, setCurrentChar] = useState(0);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (currentLine >= lines.length) {
      setDone(true);
      return;
    }
    const line = lines[currentLine];
    if (currentChar >= line.length) {
      const timeout = setTimeout(() => {
        setDisplayed((prev) => [...prev, line]);
        setCurrentLine((l) => l + 1);
        setCurrentChar(0);
      }, 100);
      return () => clearTimeout(timeout);
    }
    const timeout = setTimeout(() => setCurrentChar((c) => c + 1), speed);
    return () => clearTimeout(timeout);
  }, [currentLine, currentChar, lines, speed]);

  const partial =
    currentLine < lines.length ? lines[currentLine].slice(0, currentChar) : "";
  return { displayed, partial, done };
}

const codeLines = [
  "$ npx create-quirex my-docs",
  "",
  "✓ Scaffolded project",
  "✓ Installed dependencies",
  "✓ Markdown engine ready",
  "",
  "$ cd my-docs && npm run dev",
  "",
  "  ▸ http://localhost:5173",
];

// Features and stats are now functions that take language
function getFeatures(lang: ReturnType<typeof useI18n>["language"]) {
  return [
    { icon: <FileText className="w-[18px] h-[18px]" />, title: t("fMarkdownNative", lang), desc: t("fMarkdownDesc", lang) },
    { icon: <Search className="w-[18px] h-[18px]" />, title: t("fSearch", lang), desc: t("fSearchDesc", lang) },
    { icon: <Moon className="w-[18px] h-[18px]" />, title: t("fDarkMode", lang), desc: t("fDarkModeDesc", lang) },
    { icon: <Terminal className="w-[18px] h-[18px]" />, title: t("fEditor", lang), desc: t("fEditorDesc", lang) },
    { icon: <Upload className="w-[18px] h-[18px]" />, title: t("fImport", lang), desc: t("fImportDesc", lang) },
    { icon: <FolderOpen className="w-[18px] h-[18px]" />, title: t("fStructure", lang), desc: t("fStructureDesc", lang) },
    { icon: <GitBranch className="w-[18px] h-[18px]" />, title: t("fRevisions", lang), desc: t("fRevisionsDesc", lang) },
    { icon: <Shield className="w-[18px] h-[18px]" />, title: t("fPWA", lang), desc: t("fPWADesc", lang) },
    { icon: <Zap className="w-[18px] h-[18px]" />, title: t("fNoBackend", lang), desc: t("fNoBackendDesc", lang) },
  ];
}

function getStats(lang: ReturnType<typeof useI18n>["language"]) {
  return [
    { value: 100, suffix: "+", label: t("statsLangs", lang) },
    { value: 0, suffix: "ms", label: t("statsBuild", lang), display: "0" },
    { value: 50, suffix: "", label: t("statsRevisions", lang) },
    { value: 9, suffix: "", label: t("statsComponents", lang), display: "9" },
  ];
}

const shortcuts = [
  { keys: ["⌘", "K"], label: "Search" },
  { keys: ["⌘", "B"], label: "Bold" },
  { keys: ["⌘", "I"], label: "Italic" },
  { keys: ["⌘", "K"], label: "Link" },
  { keys: ["Tab"], label: "Indent" },
  { keys: ["Alt", "←"], label: "Prev" },
  { keys: ["Alt", "→"], label: "Next" },
];

const CATEGORY_ORDER = ["getting-started", "guides", "features", "customization", "general"];
const CATEGORY_NAMES: Record<string, string> = {
  "getting-started": "Getting Started",
  guides: "Guides",
  features: "Features",
  customization: "Customization",
  general: "General",
};

const Index = () => {
  const { language } = useI18n();
  const { data: blogPosts } = useBlogPosts();
  const allPublished = (blogPosts || []).filter((p) => p.published);
  const firstPost = allPublished[0];
  const features = getFeatures(language);
  const stats = getStats(language);

  // Derive categories from published posts
  const derivedCategories = (() => {
    const catSlugs = [...new Set(allPublished.map((p) => p.category || "general"))];
    return catSlugs
      .sort((a, b) => {
        const ai = CATEGORY_ORDER.indexOf(a);
        const bi = CATEGORY_ORDER.indexOf(b);
        return (ai === -1 ? 999 : ai) - (bi === -1 ? 999 : bi);
      })
      .map((slug) => ({
        slug,
        name: CATEGORY_NAMES[slug] || slug.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
      }));
  })();

  // GSAP section refs
   const heroRef = useRef<HTMLDivElement>(null);
  const heroGridRef = useRef<HTMLDivElement>(null);
  const statsRef = useRef<HTMLDivElement>(null);
  const featuresRef = useRef<HTMLDivElement>(null);
  const editorRef = useRef<HTMLDivElement>(null);
  const shortcutsRef = useRef<HTMLDivElement>(null);
  const docsRef = useRef<HTMLDivElement>(null);
  const demoRef = useRef<HTMLDivElement>(null);
  const testimonialsRef = useRef<HTMLDivElement>(null);
  const blogRef = useRef<HTMLDivElement>(null);
  const comparisonRef = useRef<HTMLDivElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);
  const ctaBtnRef = useRef<HTMLAnchorElement>(null);

  // Magnetic hover on CTA
  useMagneticHover(ctaBtnRef, 0.2);

  // Hero entrance animation
  useEffect(() => {
    const el = heroRef.current;
    if (!el) return;

    const tl = gsap.timeline({ delay: 0.2 });
    const badge = el.querySelector("[data-hero-badge]");
    const headline = el.querySelector("[data-hero-headline]");
    const sub = el.querySelector("[data-hero-sub]");
    const ctas = el.querySelector("[data-hero-ctas]");
    const terminal = el.querySelector("[data-hero-terminal]");

    tl.fromTo(badge, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.6, ease: "power3.out" })
      .fromTo(headline, { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.8, ease: "power3.out" }, "-=0.3")
      .fromTo(sub, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.6, ease: "power3.out" }, "-=0.4")
      .fromTo(ctas, { opacity: 0, y: 15 }, { opacity: 1, y: 0, duration: 0.5, ease: "power3.out" }, "-=0.3")
      .fromTo(terminal, { opacity: 0, y: 30, scale: 0.96 }, { opacity: 1, y: 0, scale: 1, duration: 0.8, ease: "power3.out" }, "-=0.3");

    return () => { tl.kill(); };
  }, []);

  // Grid parallax
  useEffect(() => {
    const grid = heroGridRef.current;
    if (!grid) return;
    const st = gsap.to(grid, {
      yPercent: 25,
      ease: "none",
      scrollTrigger: {
        trigger: grid.parentElement,
        start: "top top",
        end: "bottom top",
        scrub: true,
      },
    });
    return () => { st.scrollTrigger?.kill(); };
  }, []);

  // GSAP section reveals
  useGsapReveal(statsRef, "[data-gsap]", { y: 20, stagger: 0.1 });
  useGsapReveal(featuresRef, "[data-gsap]", { y: 25, stagger: 0.06 });
  useGsapReveal(editorRef, "[data-gsap]", { y: 25, stagger: 0.08 });
  useGsapReveal(shortcutsRef, "[data-gsap]", { y: 15, stagger: 0.04 });
  useGsapReveal(docsRef, "[data-gsap]", { y: 20, stagger: 0.08 });
  useGsapReveal(demoRef, "[data-gsap]", { y: 25, stagger: 0.1 });
  useGsapReveal(testimonialsRef, "[data-gsap]", { y: 20, stagger: 0.06 });
  useGsapReveal(blogRef, "[data-gsap]", { y: 25, stagger: 0.08 });
  useGsapReveal(comparisonRef, "[data-gsap]", { y: 30, stagger: 0.1 });
  useGsapReveal(ctaRef, "[data-gsap]", { y: 30, stagger: 0.12 });

  // Stats counter animation
  useEffect(() => {
    const el = statsRef.current;
    if (!el) return;

    const counters = el.querySelectorAll("[data-counter]");
    counters.forEach((counter) => {
      const target = parseInt(counter.getAttribute("data-counter") || "0");
      if (target === 0) return;

      const obj = { val: 0 };
      gsap.to(obj, {
        val: target,
        duration: 1.5,
        ease: "power2.out",
        scrollTrigger: { trigger: el, start: "top 85%", once: true },
        onUpdate: () => { counter.textContent = Math.floor(obj.val).toString(); },
      });
    });
  }, []);

  const [demoMarkdown, setDemoMarkdown] = useState(`# Hello, Quirex ✨

Write **bold**, *italic*, and \`inline code\` effortlessly.

:::tip Pro tip
You can use custom callout blocks like this one to highlight important information.
:::

## Code Blocks

\`\`\`javascript
const greet = (name) => {
  console.log(\`Hello, \${name}!\`);
};
greet("World");
\`\`\`

## Task List

- [x] Set up documentation
- [x] Write first article
- [ ] Add custom theme
- [ ] Deploy to production
`);

  const typing = useTypingEffect(codeLines, 25);

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* ════════════════════════════════════════════
          HERO
      ════════════════════════════════════════════ */}
      <section className="relative overflow-hidden">
        {/* Grid background */}
        {/* Mesh background */}
        <div
          ref={heroGridRef}
          className="absolute inset-0 z-0 pointer-events-none"
          style={{
            backgroundImage: `
              linear-gradient(to right, hsl(var(--foreground) / 0.05) 1px, transparent 1px),
              linear-gradient(to bottom, hsl(var(--foreground) / 0.05) 1px, transparent 1px)
            `,
            backgroundSize: "40px 40px",
            maskImage: "radial-gradient(ellipse 80% 80% at 50% 20%, black 20%, transparent 100%)",
            WebkitMaskImage: "radial-gradient(ellipse 80% 80% at 50% 20%, black 20%, transparent 100%)"
          }}
        />

        <div
          ref={heroRef}
          className="relative max-w-6xl mx-auto px-4 sm:px-8 pt-20 sm:pt-32 pb-16 sm:pb-28"
          style={{ zIndex: 1 }}
        >
          {/* Two-column layout: text left, terminal right on lg+ */}
          <div className="grid lg:grid-cols-[1fr_1fr] gap-10 lg:gap-16 items-center">
            {/* Left: text content */}
            <div>
              {/* Badge */}
              <div data-hero-badge style={{ opacity: 0 }}>
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-border bg-card/50 backdrop-blur-sm text-[12px] font-medium text-muted-foreground mb-8">
                  <span className="flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-2 w-2 rounded-full bg-primary opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-primary" />
                  </span>
                  {t("heroBadge", language)}
                </div>
              </div>

              {/* Headline */}
              <h1
                data-hero-headline
                style={{ opacity: 0 }}
                className="text-[2rem] sm:text-[3.5rem] lg:text-[4rem] font-bold tracking-[-0.04em] text-foreground leading-[1.05]"
              >
                {t("heroTitle1", language)}
                <br />
                <span className="relative">
                  {t("heroTitle2", language)}
                  <svg
                    className="absolute -bottom-1 left-0 w-full h-[6px] text-primary"
                    viewBox="0 0 300 6"
                    preserveAspectRatio="none"
                  >
                    <path
                      d="M0 3 Q75 0 150 3 Q225 6 300 3"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      className="hero-underline"
                      style={{ strokeDasharray: 310, strokeDashoffset: 310 }}
                    />
                  </svg>
                </span>
                <span className="text-primary">.</span>
              </h1>

              {/* Subheadline */}
              <p
                data-hero-sub
                style={{ opacity: 0 }}
                className="mt-6 sm:mt-8 text-[16px] sm:text-[18px] lg:text-[20px] text-muted-foreground leading-relaxed max-w-xl font-normal"
              >
                {t("heroSub", language)}
              </p>

              {/* CTAs */}
              <div
                data-hero-ctas
                style={{ opacity: 0 }}
                className="flex flex-wrap items-center gap-3 sm:gap-4 mt-8 sm:mt-10"
              >
                {firstPost && (
                  <Link
                    to={`/docs/${firstPost.slug}`}
                    className="group inline-flex items-center gap-2.5 px-5 sm:px-6 py-2.5 sm:py-3 text-[14px] font-semibold rounded-lg bg-foreground text-background hover:opacity-90 transition-all duration-200 hover:shadow-lg hover:shadow-foreground/10"
                  >
                    {t("getStarted", language)}
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
                  </Link>
                )}
                <Link
                  to="/admin"
                  className="group inline-flex items-center gap-2 px-5 sm:px-6 py-2.5 sm:py-3 text-[14px] font-semibold rounded-lg border border-border text-foreground hover:bg-muted hover:border-muted-foreground/20 transition-all duration-300"
                >
                  {t("tryEditor", language)}
                  <ArrowUpRight className="w-4 h-4 opacity-50 group-hover:opacity-100 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all duration-300" />
                </Link>
              </div>
            </div>

            {/* Right: Terminal */}
            <div
              data-hero-terminal
              style={{ opacity: 0 }}
              className="hidden sm:block"
            >
              <div className="rounded-xl border border-border bg-card shadow-xl shadow-foreground/[0.03] dark:shadow-none overflow-hidden hover:shadow-2xl hover:shadow-primary/[0.04] transition-shadow duration-500">
                <div className="flex items-center gap-2 px-4 py-2.5 border-b border-border bg-muted/30">
                  <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-destructive/20 border border-destructive/30" />
                    <div className="w-3 h-3 rounded-full bg-[hsl(38,92%,50%)]/20 border border-[hsl(38,92%,50%)]/30" />
                    <div className="w-3 h-3 rounded-full bg-[hsl(142,60%,45%)]/20 border border-[hsl(142,60%,45%)]/30" />
                  </div>
                  <span className="ml-3 text-[11px] text-muted-foreground/60 font-mono">~/my-docs</span>
                </div>
                <div className="p-5 sm:p-6 font-mono text-[12px] sm:text-[13px] leading-[1.8] min-h-[220px] sm:min-h-[260px]">
                  {typing.displayed.map((line, i) => (
                    <div key={i} className={line === "" ? "h-5" : ""}>{renderTerminalLine(line)}</div>
                  ))}
                  {!typing.done && (
                    <div>
                      {renderTerminalLine(typing.partial)}
                      <span className="inline-block w-[8px] h-[15px] bg-primary animate-cursor-blink ml-px translate-y-[3px]" />
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════
          STATS BAR
      ════════════════════════════════════════════ */}
      <section ref={statsRef} className="border-y border-border bg-background">
          <div className="max-w-6xl mx-auto px-4 sm:px-8">
            <div className="grid grid-cols-2 lg:grid-cols-4 divide-x divide-y lg:divide-y-0 divide-border">
            {stats.map((s, i) => (
              <div
                key={s.label}
                data-gsap
                className="bg-background py-8 sm:py-10 px-4 sm:px-6 text-center"
              >
                <div className="text-[1.5rem] sm:text-[2.5rem] font-bold tracking-[-0.03em] text-foreground tabular-nums">
                  <span data-counter={s.value}>{s.display !== undefined ? s.display : "0"}</span>
                  <span className="text-primary">{s.suffix}</span>
                </div>
                <div className="text-[12px] sm:text-[13px] text-muted-foreground mt-1 font-medium">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════
          FEATURES — 3×3 editorial grid
      ════════════════════════════════════════════ */}
      <section ref={featuresRef} className="max-w-6xl mx-auto px-4 sm:px-8 py-20 sm:py-32">
        <div className="grid lg:grid-cols-[1fr_2fr] gap-12 lg:gap-16">
          <div data-gsap className="lg:sticky lg:top-24 lg:self-start">
            <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-primary mb-3">{t("platformLabel", language)}</p>
            <h2 className="text-[1.75rem] sm:text-[2.25rem] font-bold tracking-[-0.03em] text-foreground leading-[1.15]">
              {t("featuresTitle1", language)}<br /><span className="text-muted-foreground">{t("featuresTitle2", language)}</span>
            </h2>
            <p className="mt-4 text-[14px] sm:text-[15px] text-muted-foreground leading-relaxed">
              {t("featuresSub", language)}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-px bg-border rounded-xl overflow-hidden">
            {features.map((f) => (
              <div
                key={f.title}
                data-gsap
                className="group bg-background p-5 sm:p-6 hover:bg-muted/30 transition-all duration-300 cursor-default"
              >
                <div className="w-9 h-9 rounded-lg bg-muted flex items-center justify-center text-muted-foreground mb-4 group-hover:bg-primary/10 group-hover:text-primary group-hover:scale-110 transition-all duration-300">
                  {f.icon}
                </div>
                <h3 className="text-[14px] font-semibold text-foreground mb-1.5 tracking-[-0.01em]">{f.title}</h3>
                <p className="text-[13px] text-muted-foreground leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════
          EDITOR PREVIEW
      ════════════════════════════════════════════ */}
      <section className="border-y border-border bg-muted/10">
        <div ref={editorRef} className="max-w-6xl mx-auto px-4 sm:px-8 py-20 sm:py-28">
          <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">
            <div>
              <p data-gsap className="text-[11px] font-semibold uppercase tracking-[0.1em] text-primary mb-3">{t("editorLabel", language)}</p>
              <h2 data-gsap className="text-[1.75rem] sm:text-[2rem] font-bold tracking-[-0.03em] text-foreground leading-[1.15] mb-4">
                {t("editorTitle", language)}
              </h2>
              <p data-gsap className="text-[14px] sm:text-[15px] text-muted-foreground leading-relaxed mb-6">
                {t("editorDesc", language)}
              </p>
              <div className="space-y-3">
                {["Formatting toolbar with 18+ actions", "⌘B, ⌘I, ⌘K keyboard shortcuts", "Auto-continue bullet & numbered lists", "Undo/redo with full history stack", "Drag-and-drop .md file import"].map((item) => (
                  <div key={item} data-gsap className="flex items-start gap-2.5">
                    <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                      <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                        <path d="M1 4L3.5 6.5L9 1" stroke="hsl(var(--primary))" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </div>
                    <span className="text-[13px] text-foreground/80">{item}</span>
                  </div>
                ))}
              </div>
              <Link
                to="/admin"
                data-gsap
                className="inline-flex items-center gap-2 mt-8 px-5 py-2.5 text-[13px] font-semibold rounded-lg bg-foreground text-background hover:opacity-90 hover:shadow-lg hover:shadow-foreground/10 transition-all duration-300"
              >
                {t("tryItNow", language)} <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* Editor mockup */}
            <div data-gsap>
              <div className="rounded-xl border border-border bg-card shadow-xl shadow-foreground/[0.03] dark:shadow-none overflow-hidden hover:shadow-2xl hover:shadow-primary/[0.05] transition-shadow duration-500">
                <div className="flex items-center gap-2 px-4 py-2.5 border-b border-border bg-muted/30">
                  <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-border" />
                    <div className="w-3 h-3 rounded-full bg-border" />
                    <div className="w-3 h-3 rounded-full bg-border" />
                  </div>
                  <span className="ml-2 text-[11px] text-muted-foreground/60 font-mono">getting-started.md</span>
                </div>
                <div className="flex items-center gap-0.5 px-3 py-1.5 border-b border-border bg-muted/20">
                  {["B", "I", "S", "|", "H₁", "H₂", "|", "•", "1.", "☐", "|", "❝", "</>", "⎯"].map((b, i) =>
                    b === "|" ? (
                      <div key={i} className="w-px h-4 bg-border mx-0.5" />
                    ) : (
                      <div key={i} className="w-6 h-6 rounded flex items-center justify-center text-[10px] font-mono text-muted-foreground/60">{b}</div>
                    )
                  )}
                </div>
                <div className="p-5 font-mono text-[12px] leading-[1.8] text-muted-foreground min-h-[200px]">
                  <div><span className="text-primary font-semibold"># </span><span className="text-foreground font-semibold">Getting Started</span></div>
                  <div className="h-4" />
                  <div><span className="text-foreground">Welcome to </span><span className="text-primary">**Quirex**</span><span className="text-foreground">. Start writing</span></div>
                  <div><span className="text-foreground">your documentation in markdown.</span></div>
                  <div className="h-4" />
                  <div><span className="text-primary font-semibold">## </span><span className="text-foreground font-semibold">Installation</span></div>
                  <div className="h-4" />
                  <div className="text-muted-foreground/40">```bash</div>
                  <div><span className="text-primary">npm</span><span className="text-foreground"> install quirex</span></div>
                  <div className="text-muted-foreground/40">```</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════
          KEYBOARD SHORTCUTS
      ════════════════════════════════════════════ */}
      <section ref={shortcutsRef} className="hidden sm:block max-w-6xl mx-auto px-4 sm:px-8 py-16 sm:py-20">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
          <div data-gsap className="max-w-md">
            <div className="flex items-center gap-2.5 mb-2">
              <Keyboard className="w-4 h-4 text-primary" />
              <h3 className="text-[15px] font-semibold text-foreground tracking-[-0.01em]">{t("keyboardTitle", language)}</h3>
            </div>
            <p className="text-[13px] text-muted-foreground leading-relaxed">
              {t("keyboardDesc", language)}
            </p>
          </div>
          <div className="flex flex-wrap gap-2.5 sm:gap-3">
            {shortcuts.map((s, i) => (
              <div key={`${s.label}-${i}`} data-gsap className="flex items-center gap-2 px-3 py-2 rounded-lg border border-border bg-card hover:border-primary/30 hover:shadow-sm transition-all duration-300">
                <div className="flex items-center gap-0.5">
                  {s.keys.map((k, ki) => (
                    <kbd key={ki} className="inline-flex items-center justify-center min-w-[26px] h-[26px] px-1.5 text-[11px] font-mono font-semibold rounded-md border border-border bg-muted text-foreground shadow-[0_1px_0_1px_hsl(var(--border))]">
                      {k === "⌘" ? <Command className="w-3 h-3" /> : k}
                    </kbd>
                  ))}
                </div>
                <span className="text-[12px] text-muted-foreground font-medium">{s.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════
          DOCS LISTING
      ════════════════════════════════════════════ */}
      <div className="max-w-6xl mx-auto px-4 sm:px-8"><div className="h-px bg-border" /></div>
      <section ref={docsRef} className="max-w-6xl mx-auto px-4 sm:px-8 py-20 sm:py-28">
        <div data-gsap>
          <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-primary mb-3">{t("docs", language)}</p>
          <h2 className="text-[1.5rem] sm:text-[2rem] font-bold tracking-[-0.03em] text-foreground">{siteConfig.heading}</h2>
          <p className="mt-2 text-[14px] sm:text-[15px] text-muted-foreground max-w-lg">{siteConfig.tagline}</p>
        </div>

        <div className="space-y-8 sm:space-y-10 mt-10 sm:mt-14">
          {allPublished.length === 0 ? (
            <div data-gsap className="text-center py-12 border border-dashed border-border rounded-xl">
              <FileText className="w-8 h-8 text-muted-foreground/40 mx-auto mb-3" />
              <p className="text-muted-foreground text-[14px]">No published docs yet.</p>
              <p className="text-muted-foreground/60 text-[13px] mt-1">Sign in and publish your first post to see it here.</p>
            </div>
          ) : (
            derivedCategories.map((cat) => {
              const catPosts = allPublished.filter((p) => (p.category || "general") === cat.slug);
              if (catPosts.length === 0) return null;
              return (
                <section key={cat.slug} data-gsap>
                  <h3 className="text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground mb-3">{cat.name}</h3>
                  <div className="rounded-xl border border-border divide-y divide-border overflow-hidden">
                    {catPosts.map((post) => (
                      <Link
                        key={post.id}
                        to={`/docs/${post.slug}`}
                        className="flex items-center justify-between px-4 sm:px-5 py-3.5 sm:py-4 hover:bg-muted/40 transition-all duration-300 group"
                      >
                        <div className="min-w-0 flex-1">
                          <div className="text-[14px] font-medium text-foreground group-hover:text-primary transition-colors duration-300 truncate">{post.title}</div>
                          <div className="text-[12px] text-muted-foreground mt-0.5 line-clamp-1">{post.excerpt}</div>
                        </div>
                        <ArrowRight className="w-4 h-4 text-muted-foreground/40 shrink-0 ml-4 group-hover:text-primary group-hover:translate-x-1 transition-all duration-300" />
                      </Link>
                    ))}
                  </div>
                </section>
              );
            })
          )}
        </div>
      </section>

      {/* ════════════════════════════════════════════
          INTERACTIVE DEMO
      ════════════════════════════════════════════ */}
      <section className="border-y border-border bg-muted/10">
        <div ref={demoRef} className="max-w-6xl mx-auto px-4 sm:px-8 py-20 sm:py-28">
          <div data-gsap className="mb-10 sm:mb-14">
            <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-primary mb-3">{t("demoLabel", language)}</p>
            <h2 className="text-[1.75rem] sm:text-[2.25rem] font-bold tracking-[-0.03em] text-foreground leading-[1.15]">
              {t("demoTitle1", language)}<br /><span className="text-muted-foreground">{t("demoTitle2", language)}</span>
            </h2>
            <p className="mt-3 text-[14px] sm:text-[15px] text-muted-foreground max-w-lg">
              {t("demoDesc", language)}
            </p>
          </div>

          <div data-gsap className="grid lg:grid-cols-2 gap-0 rounded-xl border border-border overflow-hidden shadow-xl shadow-foreground/[0.03] dark:shadow-none hover:shadow-2xl hover:shadow-primary/[0.04] transition-shadow duration-500">
            <div className="bg-card border-b lg:border-b-0 lg:border-r border-border">
              <div className="flex items-center justify-between px-4 py-2.5 border-b border-border bg-muted/30">
                <div className="flex items-center gap-2">
                  <div className="flex gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-destructive/30" />
                    <div className="w-2.5 h-2.5 rounded-full bg-[hsl(38,92%,50%)]/30" />
                    <div className="w-2.5 h-2.5 rounded-full bg-[hsl(142,60%,45%)]/30" />
                  </div>
                  <span className="text-[11px] text-muted-foreground/60 font-mono ml-1">editor.md</span>
                </div>
                <span className="text-[10px] text-muted-foreground/40 font-mono uppercase tracking-wider">Markdown</span>
              </div>
              <textarea
                value={demoMarkdown}
                onChange={(e) => setDemoMarkdown(e.target.value)}
                className="w-full h-[400px] sm:h-[480px] p-5 bg-transparent text-[13px] font-mono leading-[1.7] text-foreground resize-none focus:outline-none scrollbar-thin placeholder:text-muted-foreground/40"
                spellCheck={false}
              />
            </div>
            <div className="bg-background">
              <div className="flex items-center justify-between px-4 py-2.5 border-b border-border bg-muted/30">
                <span className="text-[11px] text-muted-foreground/60 font-mono">Preview</span>
                <span className="text-[10px] text-muted-foreground/40 font-mono uppercase tracking-wider">Live</span>
              </div>
              <div className="p-5 h-[400px] sm:h-[480px] overflow-y-auto scrollbar-thin">
                <MarkdownRenderer content={demoMarkdown} />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════
          TESTIMONIALS
      ════════════════════════════════════════════ */}
      <section ref={testimonialsRef} className="max-w-6xl mx-auto px-4 sm:px-8 py-12 sm:py-16">
        <div data-gsap className="flex flex-col sm:flex-row sm:items-end sm:justify-between mb-6 gap-3">
          <h2 className="text-[1.5rem] sm:text-[1.75rem] font-bold tracking-[-0.03em] text-foreground leading-[1.15]">
            {t("lovedByDevs", language)}<span className="text-muted-foreground"> {t("whoShip", language)}</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {[
            { name: "Sarah Chen", role: "Staff Eng, Vercel", text: "Migrated from Notion in an afternoon. Engineers actually write docs now." },
            { name: "Marcus Rodriguez", role: "CTO, Raycast", text: "Zero-config is real — API docs running in under 5 minutes. Code highlighting is perfect." },
            { name: "Anika Patel", role: "Lead Dev, Linear", text: "No YAML, no build steps, no vendor lock-in. Just markdown and beautiful output on a $5 VPS." },
            { name: "James Liu", role: "OSS Maintainer", text: "Tried Docusaurus, GitBook, Notion — Quirex is the first where I don't fight the tool." },
            { name: "Elena Kosova", role: "DevRel, Supabase", text: "⌘K search, ⌘B bold — feels like a proper IDE. Team productivity increased measurably." },
            { name: "David Park", role: "Founder, Resend", text: "Dark mode, typography, clean design — our docs look premium without hiring a designer." },
          ].slice(0, typeof window !== 'undefined' && window.innerWidth < 640 ? 3 : 6).map((t) => (
            <div
              key={t.name}
              data-gsap
              className="flex items-start gap-2.5 p-4 rounded-lg border border-border bg-card hover:border-primary/20 hover:shadow-sm transition-all duration-300"
            >
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-[11px] font-semibold text-primary shrink-0 mt-0.5">
                {t.name.split(" ").map(n => n[0]).join("")}
              </div>
              <div className="min-w-0">
                <span className="text-[13px] font-semibold text-foreground">{t.name}</span>
                <span className="text-[11px] text-muted-foreground ml-1.5">{t.role}</span>
                <p className="text-[12px] text-foreground/70 leading-snug mt-1">"{t.text}"</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ════════════════════════════════════════════
          BLOG — From the community
      ════════════════════════════════════════════ */}
        <section ref={blogRef} className="max-w-6xl mx-auto px-4 sm:px-8 py-16 sm:py-24">
          <div data-gsap className="flex flex-col sm:flex-row sm:items-end sm:justify-between mb-8 gap-3">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-primary mb-3">Blog</p>
              <h2 className="text-[1.5rem] sm:text-[2rem] font-bold tracking-[-0.03em] text-foreground leading-[1.15]">
                Latest from the community
              </h2>
              <p className="mt-2 text-[14px] text-muted-foreground max-w-md">
                Insights, tutorials, and stories from writers on {siteConfig.name}.
              </p>
            </div>
            <Link
              to="/blog"
              className="inline-flex items-center gap-1.5 text-[13px] font-medium text-primary hover:underline shrink-0"
            >
              View all posts <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {blogPosts && blogPosts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {blogPosts.slice(0, 3).map((post) => {
                const readTime = Math.max(1, Math.ceil((post.content || "").split(/\s+/).length / 200));
                return (
                  <Link
                    key={post.id}
                    to={`/blog/${post.slug}`}
                    data-gsap
                    className="group block rounded-xl border border-border bg-card hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300 overflow-hidden"
                  >
                    {post.cover_image_url && (
                      <div className="h-36 overflow-hidden">
                        <img
                          src={post.cover_image_url}
                          alt={post.title}
                          className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-500"
                          loading="lazy"
                        />
                      </div>
                    )}
                    <div className="p-5">
                      <div className="flex items-center gap-2 text-[11px] text-muted-foreground mb-2">
                        {post.category && (
                          <span className="capitalize">{post.category.replace(/-/g, " ")}</span>
                        )}
                        <span>·</span>
                        <span>{readTime} min read</span>
                      </div>
                      <h3 className="text-[15px] font-semibold text-foreground group-hover:text-primary transition-colors leading-snug">
                        {post.title}
                      </h3>
                      {post.excerpt && (
                        <p className="mt-1.5 text-[13px] text-muted-foreground leading-relaxed line-clamp-2">
                          {post.excerpt}
                        </p>
                      )}
                      <div className="mt-3 flex items-center gap-2 text-[11px] text-muted-foreground">
                        {post.author_avatar ? (
                          <img src={post.author_avatar} alt="" className="w-5 h-5 rounded-full object-cover border border-border" />
                        ) : (
                          <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center">
                            <span className="text-[8px] font-bold text-primary">{(post.author_name || "A")[0]}</span>
                          </div>
                        )}
                        <span className="font-medium text-foreground/80">{post.author_name}</span>
                        <span>·</span>
                        <span>{new Date(post.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</span>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          ) : (
            <div data-gsap className="rounded-xl border border-dashed border-border bg-card/50 p-10 sm:p-14 text-center">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <FileText className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-[16px] font-semibold text-foreground mb-2">
                Be the first to publish
              </h3>
              <p className="text-[14px] text-muted-foreground max-w-md mx-auto mb-6">
                {siteConfig.name} is a platform for sharing ideas, tutorials, and stories. Sign in to start writing.
              </p>
              <div className="flex flex-wrap justify-center gap-3">
                <Link
                  to="/login"
                  className="inline-flex items-center gap-2 px-5 py-2.5 text-[13px] font-semibold rounded-lg bg-foreground text-background hover:opacity-90 transition-opacity"
                >
                  Start writing <ArrowRight className="w-3.5 h-3.5" />
                </Link>
                <Link
                  to="/blog"
                  className="inline-flex items-center gap-2 px-5 py-2.5 text-[13px] font-semibold rounded-lg border border-border text-foreground hover:bg-muted transition-colors"
                >
                  Browse blog
                </Link>
              </div>
            </div>
          )}
        </section>

      <section className="border-y border-border bg-muted/10">
        <div ref={comparisonRef} className="max-w-6xl mx-auto px-4 sm:px-8 py-20 sm:py-28">
          <div data-gsap className="mb-10 sm:mb-14">
            <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-primary mb-3">{t("comparisonLabel", language)}</p>
            <h2 className="text-[1.75rem] sm:text-[2.25rem] font-bold tracking-[-0.03em] text-foreground leading-[1.15]">{t("comparisonTitle", language)}</h2>
            <p className="mt-3 text-[14px] sm:text-[15px] text-muted-foreground max-w-lg">{t("comparisonDesc", language)}</p>
          </div>

          <div data-gsap className="rounded-xl border border-border overflow-hidden shadow-lg shadow-foreground/[0.02] dark:shadow-none">
            <div className="overflow-x-auto">
              <table className="w-full text-[13px]">
                <thead>
                  <tr className="border-b border-border bg-muted/40">
                    <th className="text-left py-4 px-5 font-semibold text-foreground text-[12px] uppercase tracking-[0.06em] w-[200px]">{t("featureCol", language)}</th>
                    {["Quirex", "Docusaurus", "GitBook", "Notion"].map((name, i) => (
                      <th key={name} className={`text-center py-4 px-4 font-semibold text-[12px] uppercase tracking-[0.06em] min-w-[120px] ${i === 0 ? "text-primary bg-primary/[0.04]" : "text-foreground"}`}>{name}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {[
                    { feature: t("cfZeroConfig", language), values: [true, false, true, true] },
                    { feature: t("cfMarkdownNative", language), values: [true, true, false, false] },
                    { feature: t("cfSelfHostable", language), values: [true, true, false, false] },
                    { feature: t("cfNoLockIn", language), values: [true, true, false, false] },
                    { feature: t("cfBuiltInSearch", language), values: [true, "plugin", true, true] },
                    { feature: t("cfDarkMode", language), values: [true, true, true, true] },
                    { feature: t("cfRevisionHistory", language), values: [true, false, true, true] },
                    { feature: t("cfOffline", language), values: [true, false, false, false] },
                    { feature: t("cfCallouts", language), values: [true, true, false, false] },
                    { feature: t("cfShortcuts", language), values: [true, false, "partial", true] },
                    { feature: t("cfFree", language), values: [true, true, false, false] },
                    { feature: t("cfNoBuild", language), values: [true, false, true, true] },
                    { feature: t("cfOpenSource", language), values: [true, true, false, false] },
                  ].map((row) => (
                    <tr key={row.feature} className="border-b border-border last:border-b-0 hover:bg-muted/20 transition-colors">
                      <td className="py-3.5 px-5 text-foreground font-medium text-[13px]">{row.feature}</td>
                      {row.values.map((val, vi) => (
                        <td key={vi} className={`text-center py-3.5 px-4 ${vi === 0 ? "bg-primary/[0.02]" : ""}`}>
                          {val === true ? <Check className="w-4 h-4 text-[hsl(142,60%,45%)] mx-auto" /> : val === false ? <X className="w-4 h-4 text-muted-foreground/30 mx-auto" /> : <span className="text-[11px] text-muted-foreground font-medium">{val}</span>}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════
          CTA
      ════════════════════════════════════════════ */}
      <section className="border-t border-border">
        <div ref={ctaRef} className="max-w-6xl mx-auto px-4 sm:px-8 py-20 sm:py-28 text-center">
          <h2 data-gsap className="text-[1.75rem] sm:text-[2.5rem] lg:text-[3rem] font-bold tracking-[-0.04em] text-foreground leading-[1.1] mb-5">
            {t("ctaTitle", language)}
          </h2>
          <p data-gsap className="text-[15px] sm:text-[17px] text-muted-foreground max-w-md mx-auto mb-8">
            {t("ctaSub", language)}
          </p>
          <div data-gsap className="flex flex-wrap justify-center gap-3">
            {firstPost && (
              <Link
                ref={ctaBtnRef as any}
                to={`/docs/${firstPost.slug}`}
                className="group inline-flex items-center gap-2.5 px-6 py-3 text-[14px] font-semibold rounded-lg bg-foreground text-background hover:opacity-90 hover:shadow-lg hover:shadow-foreground/10 transition-all duration-300"
              >
                {t("readTheDocs", language)}
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
              </Link>
            )}
            <a
              href={siteConfig.externalLinks[0]?.href || "#"}
              target="_blank"
              rel="noopener noreferrer"
              className="group inline-flex items-center gap-2 px-6 py-3 text-[14px] font-semibold rounded-lg border border-border text-foreground hover:bg-muted hover:border-muted-foreground/20 transition-all duration-300"
            >
              {t("viewOnGithub", language)}
              <ArrowUpRight className="w-4 h-4 opacity-50 group-hover:opacity-100 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all duration-300" />
            </a>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════
          FOOTER
      ════════════════════════════════════════════ */}
      <footer className="border-t border-border">
        <div className="max-w-6xl mx-auto px-4 sm:px-8 py-8 sm:py-10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="text-[14px] font-semibold text-foreground tracking-[-0.01em]">{siteConfig.name}</span>
            {siteConfig.badge && (
              <span className="text-[10px] font-medium text-muted-foreground bg-muted px-1.5 py-0.5 rounded">{siteConfig.badge}</span>
            )}
          </div>
          <p className="text-[12px] text-muted-foreground">{siteConfig.footer}</p>
        </div>
      </footer>
    </div>
  );
};

// ── Terminal line renderer ──
function renderTerminalLine(line: string) {
  if (!line) return null;
  if (line.startsWith("$")) {
    return (<><span className="text-primary font-semibold">$</span><span className="text-foreground">{line.slice(1)}</span></>);
  }
  if (line.startsWith("✓")) {
    return <span className="text-[hsl(142,60%,45%)]">{line}</span>;
  }
  if (line.includes("localhost")) {
    return (<><span className="text-muted-foreground">  ▸ </span><span className="text-primary underline underline-offset-2 decoration-primary/40">http://localhost:5173</span></>);
  }
  return <span className="text-muted-foreground">{line}</span>;
}

export default Index;
