import { Header } from "@/components/Header";
import { useState } from "react";
import { Check, Copy, Terminal, FolderOpen, FileText, Zap, ArrowRight, Download, ExternalLink } from "lucide-react";

const steps = [
  {
    title: "Create a new project",
    description: "Scaffold a fresh Quirex docs site with a single command.",
    code: `npx degit quirex/template my-docs\ncd my-docs\nnpm install`,
    note: "Or clone directly from GitHub and customize.",
  },
  {
    title: "Add your content",
    description: "Drop Markdown files into the content directory with optional frontmatter.",
    code: `---\ntitle: "Getting Started"\ncategory: "guides"\ntags: ["setup", "quickstart"]\npublished: true\n---\n\n# Getting Started\n\nWrite your docs here...`,
    note: "Supports GFM, callouts, code blocks, and custom components.",
  },
  {
    title: "Configure your site",
    description: "Customize branding, navigation, and features in siteConfig.ts.",
    code: `export const siteConfig = {\n  name: "My Docs",\n  badge: "v2.0",\n  navLinks: [\n    { label: "Docs", href: "/docs/welcome" },\n    { label: "API", href: "/api-reference" },\n  ],\n};`,
    note: "All configuration is type-safe with TypeScript.",
  },
  {
    title: "Deploy anywhere",
    description: "Build and deploy to any static hosting provider.",
    code: `npm run build\n\n# Deploy to Vercel\nnpx vercel --prod\n\n# Or Netlify\nnpx netlify deploy --prod\n\n# Or any static host\n# Just serve the dist/ folder`,
    note: "Zero backend required. Pure static files.",
  },
];

const projectStructure = [
  { path: "src/", type: "dir", desc: "Application source code" },
  { path: "  components/", type: "dir", desc: "Reusable UI components" },
  { path: "  lib/", type: "dir", desc: "Utilities, content, and config" },
  { path: "    content.ts", type: "file", desc: "Content management & storage" },
  { path: "    siteConfig.ts", type: "file", desc: "Site-wide configuration" },
  { path: "    analytics.ts", type: "file", desc: "Client-side analytics" },
  { path: "    docHealth.ts", type: "file", desc: "Doc health scoring" },
  { path: "  pages/", type: "dir", desc: "Page components (routes)" },
  { path: "  types/", type: "dir", desc: "TypeScript type definitions" },
  { path: "public/", type: "dir", desc: "Static assets & PWA files" },
  { path: "index.html", type: "file", desc: "HTML entry point" },
  { path: "tailwind.config.ts", type: "file", desc: "Tailwind CSS configuration" },
  { path: "vite.config.ts", type: "file", desc: "Vite build configuration" },
];

const features = [
  { icon: "📝", label: "Markdown-native", desc: "GFM, syntax highlighting, callouts" },
  { icon: "🔍", label: "Instant search", desc: "⌘K fuzzy search across all content" },
  { icon: "🤖", label: "AI chatbot", desc: "BYOK OpenAI/Anthropic integration" },
  { icon: "📊", label: "Analytics", desc: "Client-side page view tracking" },
  { icon: "🏥", label: "Doc health", desc: "Automated content quality scoring" },
  { icon: "🔐", label: "Auth gate", desc: "Password-protect sensitive docs" },
  { icon: "🌍", label: "i18n", desc: "8 languages out of the box" },
  { icon: "📡", label: "Webhooks", desc: "Slack/Discord publish notifications" },
  { icon: "📄", label: "Export", desc: "PDF, Markdown, and JSON export" },
  { icon: "🔄", label: "Multi-tab sync", desc: "Real-time cross-tab updates" },
  { icon: "📋", label: "API playground", desc: "OpenAPI spec import & try-it" },
  { icon: "📱", label: "PWA", desc: "Offline-capable installable app" },
];

export default function SetupGuidePage() {
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);

  const handleCopy = (code: string, idx: number) => {
    navigator.clipboard.writeText(code);
    setCopiedIdx(idx);
    setTimeout(() => setCopiedIdx(null), 1500);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-10 sm:py-16">
        <div className="mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-border bg-muted/50 text-[11px] font-medium text-muted-foreground mb-4">
            <Terminal className="w-3 h-3" /> Setup Guide
          </div>
          <h1 className="text-[1.75rem] sm:text-[2rem] font-bold tracking-[-0.03em] text-foreground mb-2">
            Get started with Quirex
          </h1>
          <p className="text-[14px] text-muted-foreground leading-relaxed max-w-xl">
            Set up a beautiful documentation site in minutes. Zero backend, zero vendor lock-in.
            Deploy to any static host.
          </p>
        </div>

        {/* Steps */}
        <div className="relative space-y-8 mb-16">
          <div className="absolute left-[17px] top-8 bottom-8 w-px bg-border hidden sm:block" />

          {steps.map((step, i) => (
            <div key={i} className="relative sm:pl-12">
              <div className="absolute left-0 top-0 w-[35px] h-[35px] rounded-full border-2 border-primary bg-background flex items-center justify-center text-[13px] font-bold text-primary hidden sm:flex">
                {i + 1}
              </div>

              <div className="p-4 sm:p-5 rounded-lg border border-border bg-card">
                <div className="flex items-center gap-2 mb-1">
                  <span className="sm:hidden text-[12px] font-bold text-primary">Step {i + 1}</span>
                  <h3 className="text-[15px] font-semibold text-foreground">{step.title}</h3>
                </div>
                <p className="text-[13px] text-muted-foreground mb-3">{step.description}</p>

                <div className="relative rounded-md bg-muted border border-border overflow-hidden">
                  <div className="flex items-center justify-between px-3 py-1.5 border-b border-border">
                    <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-wide">
                      {i === 1 ? "markdown" : i === 2 ? "typescript" : "terminal"}
                    </span>
                    <button
                      onClick={() => handleCopy(step.code, i)}
                      className="text-[11px] flex items-center gap-1 px-2 py-0.5 rounded text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {copiedIdx === i ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                      {copiedIdx === i ? "Copied" : "Copy"}
                    </button>
                  </div>
                  <pre className="p-3 text-[12px] font-mono text-foreground/80 overflow-x-auto whitespace-pre leading-relaxed">
                    {step.code}
                  </pre>
                </div>

                {step.note && (
                  <p className="text-[11px] text-muted-foreground/70 mt-2 italic">{step.note}</p>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Project structure */}
        <div className="mb-16">
          <h2 className="text-[1.25rem] font-semibold text-foreground mb-4 flex items-center gap-2">
            <FolderOpen className="w-5 h-5 text-muted-foreground" /> Project Structure
          </h2>
          <div className="rounded-lg border border-border bg-card overflow-hidden">
            {projectStructure.map((item, i) => (
              <div key={i} className="flex items-center gap-3 px-4 py-2 border-b border-border last:border-b-0 hover:bg-muted/20 transition-colors">
                <code className="text-[12px] font-mono text-foreground/80 w-40 sm:w-52 shrink-0">
                  {item.path}
                </code>
                <span className="text-[12px] text-muted-foreground">{item.desc}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Feature grid */}
        <div className="mb-16">
          <h2 className="text-[1.25rem] font-semibold text-foreground mb-4 flex items-center gap-2">
            <Zap className="w-5 h-5 text-muted-foreground" /> Built-in Features
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {features.map((f) => (
              <div key={f.label} className="p-3 rounded-lg border border-border bg-card hover:bg-muted/20 transition-colors">
                <div className="text-[16px] mb-1">{f.icon}</div>
                <div className="text-[12px] font-semibold text-foreground">{f.label}</div>
                <div className="text-[11px] text-muted-foreground">{f.desc}</div>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="text-center p-8 rounded-xl border border-border bg-card">
          <h2 className="text-[1.25rem] font-bold text-foreground mb-2">Ready to build?</h2>
          <p className="text-[13px] text-muted-foreground mb-6">
            Start with the admin panel or browse the docs to see Quirex in action.
          </p>
          <div className="flex items-center justify-center gap-3 flex-wrap">
            <a
              href="/admin"
              className="inline-flex items-center gap-2 px-5 py-2.5 text-[13px] font-semibold rounded-lg bg-foreground text-background hover:opacity-90 transition-opacity"
            >
              Open Admin <ArrowRight className="w-3.5 h-3.5" />
            </a>
            <a
              href="/docs/welcome"
              className="inline-flex items-center gap-2 px-5 py-2.5 text-[13px] font-semibold rounded-lg border border-border text-foreground hover:bg-muted transition-colors"
            >
              Browse Docs <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </main>
    </div>
  );
}
