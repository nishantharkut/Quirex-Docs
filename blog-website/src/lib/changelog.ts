export type ChangeType = "new" | "fix" | "improvement" | "breaking";

export interface ChangelogEntry {
  version: string;
  date: string;
  title: string;
  changes: { type: ChangeType; text: string }[];
}

export const changelog: ChangelogEntry[] = [
  {
    version: "1.7.0",
    date: "2026-03-08",
    title: "Tier 4: Doc Health, Multi-tab Sync & Setup Guide",
    changes: [
      { type: "new", text: "Automated Doc Health scoring — flags stale, incomplete, or low-quality documentation" },
      { type: "new", text: "Multi-tab sync via BroadcastChannel — edits in admin reflect in reader tabs instantly" },
      { type: "new", text: "Interactive setup guide with project structure, features grid, and copy-paste commands" },
      { type: "improvement", text: "Admin saves now broadcast sync events to all open tabs" },
    ],
  },
  {
    version: "1.6.0",
    date: "2026-03-08",
    title: "Tier 3: Export, Webhooks & Print Styles",
    changes: [
      { type: "new", text: "PDF export via browser print with optimized @media print styles" },
      { type: "new", text: "Download individual docs as Markdown with frontmatter" },
      { type: "new", text: "Bulk export all docs as JSON or combined Markdown" },
      { type: "new", text: "Slack/Discord/custom webhook notifications for publish/update events" },
      { type: "new", text: "Webhook test button to verify configuration" },
      { type: "improvement", text: "Admin panel now includes export buttons and webhook settings" },
    ],
  },
  {
    version: "1.5.0",
    date: "2026-03-07",
    title: "Tier 2: API Playground, Auth, i18n & Comments",
    changes: [
      { type: "new", text: "OpenAPI spec import with interactive API playground and BYOK key storage" },
      { type: "new", text: "Password-protected documentation pages with admin-configurable auth gate" },
      { type: "new", text: "Multi-language support (8 languages) with global language switcher" },
      { type: "new", text: "Per-post inline comments system stored locally" },
      { type: "new", text: "BYOK AI chatbot — bring your own OpenAI or Anthropic key for AI-powered answers" },
      { type: "improvement", text: "Version switcher now filters sidebar and navigation by doc version" },
      { type: "improvement", text: "All reader-facing UI strings are now translatable" },
      { type: "improvement", text: "Search query analytics now debounced to reduce noise" },
    ],
  },
  {
    version: "1.4.0",
    date: "2026-03-05",
    title: "AI Docs Assistant & Analytics",
    changes: [
      { type: "new", text: "AI-powered docs chatbot for instant answers from your documentation" },
      { type: "new", text: "Analytics dashboard with page views, popular docs, and search query tracking" },
      { type: "new", text: "Changelog page with release timeline and RSS feed support" },
      { type: "new", text: "Versioned documentation — switch between API versions seamlessly" },
      { type: "improvement", text: "Redesigned landing page with bold editorial aesthetic" },
    ],
  },
  {
    version: "1.3.0",
    date: "2026-02-18",
    title: "Interactive Landing Page",
    changes: [
      { type: "new", text: "Live Markdown playground on the landing page" },
      { type: "new", text: "Developer testimonials and social proof section" },
      { type: "new", text: "Feature comparison matrix vs Docusaurus, GitBook, Notion" },
      { type: "improvement", text: "Horizontal scroll testimonials for compact layout" },
    ],
  },
  {
    version: "1.2.0",
    date: "2026-02-01",
    title: "Revision History & GitHub Sync",
    changes: [
      { type: "new", text: "Revision history with line-by-line diff view" },
      { type: "new", text: "GitHub sync — import/export docs from repositories" },
      { type: "new", text: "File upload support for batch markdown import" },
      { type: "improvement", text: "Split-pane editor with live preview" },
      { type: "fix", text: "Fixed code block overflow on mobile devices" },
    ],
  },
  {
    version: "1.1.0",
    date: "2026-01-15",
    title: "Search & Custom Components",
    changes: [
      { type: "new", text: "Global search with ⌘K shortcut" },
      { type: "new", text: "Custom callout blocks: info, warning, tip, danger, note" },
      { type: "new", text: "Collapsible sections with :::details syntax" },
      { type: "new", text: "Reading progress bar" },
      { type: "improvement", text: "Table of contents with scroll-spy highlighting" },
      { type: "fix", text: "Syntax highlighting for 20+ additional languages" },
    ],
  },
  {
    version: "1.0.0",
    date: "2026-01-01",
    title: "Initial Release",
    changes: [
      { type: "new", text: "Full Markdown rendering with GFM support" },
      { type: "new", text: "Syntax highlighting for 100+ languages" },
      { type: "new", text: "Light and dark mode with system preference detection" },
      { type: "new", text: "Admin panel for content management" },
      { type: "new", text: "Category-based navigation with collapsible sidebar" },
      { type: "new", text: "PWA support with offline capability" },
    ],
  },
];
