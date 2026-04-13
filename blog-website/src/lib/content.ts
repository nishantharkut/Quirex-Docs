import { Post, Category } from "@/types/blog";
import { importedCategories, importedPosts, importedSeedVersion } from "@/lib/repoContent.generated";

const POSTS_KEY = "quirex_posts";
const CATEGORIES_KEY = "quirex_categories";
const SEED_VERSION_KEY = "quirex_seed_version";
/** Bump when defaultPosts bodies change so localStorage re-merges from seed */
const DEFAULT_POSTS_VERSION_KEY = "quirex_default_posts_version";
const DEFAULT_POSTS_VERSION = "nova-docs-2026-04";

const defaultCategories: Category[] = [
  { id: "getting-started", name: "Getting Started", slug: "getting-started", order: 0 },
  { id: "guides", name: "Guides", slug: "guides", order: 1 },
  { id: "features", name: "Features", slug: "features", order: 2 },
  { id: "customization", name: "Customization", slug: "customization", order: 3 },
];

const defaultPosts: Post[] = [
  {
    id: "welcome",
    title: "Welcome to Quirex",
    slug: "welcome",
    excerpt: "Get started with Quirex — an open-source documentation and publishing platform.",
    content: `# Welcome to Quirex

Quirex is an open-source documentation and publishing platform. Write in Markdown, publish to the web, manage content from a built-in admin panel.

## Overview

- **No build step required** — start writing, hit publish
- **Markdown-native editor** — formatting toolbar, keyboard shortcuts, 30-second auto-save
- **Command palette search** — press \`Cmd+K\` to find anything
- **Light and dark themes** — system-aware, zero flash on load
- **Mobile-ready** — swipe navigation, responsive layout, installable as a PWA
- **Role-based access** — admin, editor, and viewer permissions

## Getting started

1. Browse the sidebar to explore the documentation
2. Press \`Cmd+K\` (or \`Ctrl+K\`) to open search
3. Toggle the theme with the icon in the header
4. Sign in to access the admin panel and start writing

:::tip
The admin panel is where you create, edit, and manage all content. Sign in to get started.
:::

## Feature summary

| Feature | Description |
|---------|-------------|
| Markdown editor | Toolbar, shortcuts, live preview |
| Revision history | Up to 50 snapshots per document |
| Authentication | Email, Google OAuth, magic links |
| Comments | Threaded discussions on each page |
| Analytics | Page views and reading engagement |
| Export | Download as \`.md\` or print to PDF |

## Syntax highlighting

The renderer supports 100+ languages out of the box:

\`\`\`typescript
interface DocConfig {
  title: string;
  theme: 'light' | 'dark' | 'auto';
  i18n: {
    defaultLocale: string;
    locales: string[];
  };
}

const config: DocConfig = {
  title: "My Documentation",
  theme: "auto",
  i18n: {
    defaultLocale: "en",
    locales: ["en", "es", "fr", "de"]
  }
};
\`\`\`

## Callouts

Use directive syntax to create callout blocks:

:::info About callouts
Supported types: \`info\`, \`warning\`, \`tip\`, \`danger\`, \`note\`. They render as styled blocks inside your content.
:::

:::warning Authentication required
The admin panel requires a signed-in account. Create one from the login page.
:::

:::details What does the admin panel include?
- Post editor with formatting toolbar
- Category and tag management
- User role management (admin only)
- Import/export tools
- Theme customization
:::

---

Continue to the **Markdown Guide** for a full syntax reference, or go to the admin panel to create your first post.
`,
    category: "getting-started",
    tags: ["introduction", "setup", "overview"],
    published: true,
    createdAt: new Date("2024-01-01").toISOString(),
    updatedAt: new Date("2024-03-08").toISOString(),
    author: "Quirex Team",
  },
  {
    id: "markdown-guide",
    title: "Markdown Guide",
    slug: "markdown-guide",
    excerpt: "Full Markdown syntax reference — GFM, code blocks, tables, callouts, and collapsible sections.",
    content: `# Markdown Guide

Quirex uses GitHub Flavored Markdown (GFM) with custom extensions for documentation.

## Text formatting

| Syntax | Output |
|--------|--------|
| \`**bold**\` | **bold** |
| \`*italic*\` | *italic* |
| \`***both***\` | ***both*** |
| \`~~strikethrough~~\` | ~~strikethrough~~ |
| \`\\\`inline code\\\`\` | \`inline code\` |

## Headings

Use \`#\` symbols. Each heading gets an anchor ID for deep linking.

\`\`\`markdown
# H1 Heading
## H2 Heading
### H3 Heading
#### H4 Heading
\`\`\`

:::tip
Hover any heading to reveal a link icon. Click it to copy a direct URL to that section.
:::

## Links and images

\`\`\`markdown
[Link text](https://example.com)
![Alt text](https://example.com/image.jpg)
\`\`\`

## Lists

### Unordered
- First item
- Second item
  - Nested item
  - Another nested

### Ordered
1. First step
2. Second step
3. Third step

### Task lists
- [x] Write documentation
- [x] Add syntax highlighting
- [ ] Ship to production

## Code blocks

Specify a language after the opening backticks:

\`\`\`python
class DocumentProcessor:
    def __init__(self, config: dict):
        self.config = config
        self.cache = {}

    def process(self, content: str) -> dict:
        word_count = len(content.split())
        return {
            "word_count": word_count,
            "read_time": max(1, word_count // 200),
        }
\`\`\`

\`\`\`javascript
const fetchDocs = async (category) => {
  const response = await fetch(\`/api/docs/\${category}\`);
  const { data } = await response.json();

  return data.map(doc => ({
    ...doc,
    url: \`/docs/\${doc.slug}\`,
    readTime: Math.ceil(doc.wordCount / 200)
  }));
};
\`\`\`

## Tables

| Feature | Status | Notes |
|---------|--------|-------|
| Markdown | Supported | Full GFM |
| Callouts | Supported | 5 types |
| Code highlighting | Supported | 100+ languages |
| Tables | Supported | With alignment |

## Blockquotes

> Documentation is a love letter that you write to your future self.
> — Damian Conway

## Horizontal rules

Use \`---\` or \`***\` on its own line:

---

## Callout blocks

\`\`\`markdown
:::info Title here
Content goes here.
:::
\`\`\`

### Available types

:::info Information
General context and background.
:::

:::tip Pro tip
Helpful suggestions and best practices.
:::

:::warning Caution
Potential issues to watch for.
:::

:::danger Critical
Breaking changes or destructive actions.
:::

:::note Side note
Additional context that is not essential.
:::

## Collapsible sections

\`\`\`markdown
:::details Click to expand
Hidden content goes here.
:::
\`\`\`

:::details Advanced features
- Automatic table of contents generation
- Heading anchor links with copy-on-click
- Reading progress indicator
- Estimated read time
:::

---

Next: **Editor Features** — learn about the admin panel and writing workflow.
`,
    category: "guides",
    tags: ["markdown", "writing", "syntax"],
    published: true,
    createdAt: new Date("2024-01-02").toISOString(),
    updatedAt: new Date("2024-03-08").toISOString(),
    author: "Quirex Team",
  },
  {
    id: "editor-features",
    title: "Editor Features",
    slug: "editor-features",
    excerpt: "Formatting toolbar, keyboard shortcuts, auto-save, revision history, and bulk import.",
    content: `# Editor Features

The editor is built for speed. Formatting toolbar, keyboard shortcuts, auto-save, and revision history are all built in.

## Formatting toolbar

| Button | Action | Shortcut |
|--------|--------|----------|
| **B** | Bold | \`Cmd+B\` |
| *I* | Italic | \`Cmd+I\` |
| S | Strikethrough | \`Cmd+Shift+S\` |
| H1 | Heading 1 | — |
| H2 | Heading 2 | — |
| List | Bullet list | — |
| 1. | Numbered list | — |
| Task | Task list | — |
| Quote | Blockquote | — |
| Code | Code block | — |
| Link | Insert link | \`Cmd+K\` |

## Keyboard shortcuts

\`\`\`
Cmd+B        Bold
Cmd+I        Italic
Cmd+K        Insert link
Cmd+Z        Undo
Cmd+Shift+Z  Redo
Tab          Indent list
Shift+Tab    Outdent list
Enter        Continue list
\`\`\`

:::tip
Pressing Enter at the end of a list item automatically continues the list. Press Enter twice to exit.
:::

## Auto-save

Content saves every 30 seconds to browser storage. It works offline and survives browser refreshes.

## Revision history

Every save creates a snapshot.

1. Click **History** in the editor
2. Browse previous versions with timestamps
3. View line-by-line diffs
4. Restore any version with one click

:::warning
Each document stores up to 50 revisions. Older ones are pruned automatically.
:::

## Live preview

The editor uses a split view — raw Markdown on the left, rendered output on the right, updating as you type.

## Word count

The editor shows total word count and estimated reading time (200 words per minute).

## Templates

| Template | Use case |
|----------|----------|
| Blank | Start from scratch |
| Tutorial | Step-by-step guide |
| API Reference | Endpoint documentation |
| Changelog | Release notes |
| FAQ | Questions and answers |

## Bulk import

Drag and drop \`.md\` or \`.mdx\` files. Quirex parses frontmatter automatically:

\`\`\`yaml
---
title: My Document
category: guides
tags: [tutorial, beginner]
published: true
---

Content here...
\`\`\`

---

Next: **Search and Navigation** — command palette, keyboard nav, mobile gestures.
`,
    category: "features",
    tags: ["editor", "admin", "shortcuts"],
    published: true,
    createdAt: new Date("2024-01-03").toISOString(),
    updatedAt: new Date("2024-03-08").toISOString(),
    author: "Quirex Team",
  },
  {
    id: "search-navigation",
    title: "Search & Navigation",
    slug: "search-navigation",
    excerpt: "Command palette search, keyboard navigation, mobile gestures, and reading tools.",
    content: `# Search and Navigation

Keyboard-first navigation with full mobile support.

## Command palette

Press \`Cmd+K\` (Mac) or \`Ctrl+K\` (Windows/Linux) to open search.

- **Fuzzy matching** — finds results even with typos
- **Full-text search** — searches titles, content, and tags
- **Keyboard navigation** — arrow keys to select, Enter to open
- **Recent searches** — quickly access previous queries

:::tip
Filter by type: \`tag:api\` finds posts tagged "api", \`category:guides\` filters by category.
:::

## Sidebar

Documentation is organized by category in the sidebar:
- Collapsible sections
- Active page highlighting
- Keyboard accessible

## Table of contents

Each page generates a table of contents from its headings:
- **Desktop** — fixed on the right side
- **Mobile** — collapsible dropdown at the top
- Highlights the current section as you scroll

## Keyboard shortcuts

| Shortcut | Action |
|----------|--------|
| \`Cmd+K\` | Open search |
| \`Alt+Left\` | Previous document |
| \`Alt+Right\` | Next document |
| \`Esc\` | Close dialogs |

## Mobile gestures

On touch devices:
- **Swipe left** — next document
- **Swipe right** — previous document or open sidebar
- **Swipe left on sidebar** — close it

:::info
A hint appears at the bottom of doc pages on mobile.
:::

## Reading tools

### Progress bar
A thin bar at the top shows scroll position.

### Text-to-speech
Click the speaker icon to listen. Supports play, pause, and speed controls.

### Bookmarks
Save any page for later. Access bookmarks from the header.

### Reading history
Tracks your progress. Resume where you left off.

## Breadcrumbs

Every page shows its position in the hierarchy:

\`Home > Category > Page Title\`

Click any segment to navigate up.

---

Next: **Authentication and Roles** — sign-in methods and permissions.
`,
    category: "features",
    tags: ["search", "navigation", "mobile", "keyboard"],
    published: true,
    createdAt: new Date("2024-01-04").toISOString(),
    updatedAt: new Date("2024-03-08").toISOString(),
    author: "Quirex Team",
  },
  {
    id: "versioning",
    title: "Version Control",
    slug: "versioning",
    excerpt: "Revision history for individual documents and changelog tracking.",
    content: `# Version Control

Quirex tracks changes at the document level with a built-in revision system.

## Revision history

Every save creates a snapshot of the document.

### Viewing history
1. Open a document in the editor
2. Click **History**
3. Browse revisions by date and time
4. View line-by-line diffs between versions

### Restoring versions
Click **Restore** on any revision. The current version is preserved as a new snapshot, so nothing is lost.

:::warning
Each document stores up to 50 revisions. Older ones are pruned automatically.
:::

## Changelog

Track changes across releases at \`/changelog\`:

1. View updates in timeline format
2. Filter by type: New, Fix, Improvement, Breaking

| Badge | Use for |
|-------|---------|
| New | New features |
| Improvement | Enhancements |
| Fix | Bug fixes |
| Breaking | Breaking changes |

---

Next: **Authentication and Roles** — sign-in methods and access control.
`,
    category: "features",
    tags: ["versions", "history", "changelog"],
    published: true,
    createdAt: new Date("2024-01-05").toISOString(),
    updatedAt: new Date("2024-03-08").toISOString(),
    author: "Quirex Team",
  },
  {
    id: "authentication",
    title: "Authentication & Roles",
    slug: "authentication",
    excerpt: "Sign-in methods, role-based access control, and user management.",
    content: `# Authentication and Roles

Quirex includes authentication with role-based permissions.

## Sign-in methods

| Method | Description |
|--------|-------------|
| Email and password | Standard account creation |
| Google OAuth | One-click sign-in |
| Magic link | Passwordless email link |

Password minimum: 6 characters. Email verification is required by default.

## Roles

Three permission levels:

### Admin
Full access — create, edit, delete content. Manage users, analytics, settings, themes, imports.

### Editor
Content access — create and edit posts, manage categories and tags, view revision history, import content.

### Viewer
Read-only — view published content, use bookmarks and comments, access reading history.

:::info
The first user to sign up is automatically assigned the Admin role. All subsequent users start as Viewers.
:::

## Protected routes

| Route | Required role |
|-------|---------------|
| \`/admin\` | Editor or Admin |
| \`/analytics\` | Admin |
| \`/users\` | Admin |
| \`/theme\` | Admin |
| \`/import/notion\` | Editor or Admin |

## User management

Admins can manage users at \`/users\`:

1. View all registered users
2. See current roles
3. Promote or demote users
4. Remove users

## Password reset

1. Click "Forgot password?" on the login page
2. Enter your email
3. Follow the reset link
4. Set a new password

---

Next: **Theming and Customization** — colors, dark mode, PWA, and configuration.
`,
    category: "features",
    tags: ["auth", "roles", "security", "users"],
    published: true,
    createdAt: new Date("2024-01-07").toISOString(),
    updatedAt: new Date("2024-03-08").toISOString(),
    author: "Quirex Team",
  },
  {
    id: "theming",
    title: "Theming & Customization",
    slug: "theming",
    excerpt: "Light and dark themes, CSS variables, site configuration, and PWA support.",
    content: `# Theming and Customization

## Light and dark mode

System-aware theming with three options:
- **Auto** — follows OS preference
- **Light** — bright color palette
- **Dark** — reduced brightness, OLED-friendly

Toggle with the icon in the header.

:::tip
The theme loads before first paint — no flash of the wrong mode.
:::

## Theme editor

Admins can customize colors at \`/theme\`:

| Property | Description |
|----------|-------------|
| Primary | Accent color for links and buttons |
| Background | Page background |
| Foreground | Text color |
| Muted | Secondary text and borders |
| Card | Card backgrounds |

### CSS variables

Themes are driven by CSS custom properties:

\`\`\`css
:root {
  --background: 0 0% 100%;
  --foreground: 240 10% 3.9%;
  --primary: 240 5.9% 10%;
  --primary-foreground: 0 0% 98%;
  --muted: 240 4.8% 95.9%;
  --muted-foreground: 240 3.8% 46.1%;
}
\`\`\`

## Site configuration

\`\`\`typescript
const siteConfig = {
  name: "Quirex",
  heading: "Documentation",
  tagline: "Beautiful docs, zero config",
  badge: "Beta",
  footer: "Your Company",
};
\`\`\`

## PWA support

Quirex is a Progressive Web App:
- **Installable** — add to home screen on mobile or desktop
- **Offline capable** — service worker caches pages
- **Fast** — cached assets load instantly

## SEO

Meta tags are generated per page:

\`\`\`html
<title>Page Title — Site Name</title>
<meta name="description" content="Page excerpt">
<meta property="og:title" content="Page Title">
<meta property="og:description" content="Page excerpt">
\`\`\`

---

That covers the platform. Open the admin panel and start writing.
`,
    category: "customization",
    tags: ["theme", "design", "pwa", "branding"],
    published: true,
    createdAt: new Date("2024-01-08").toISOString(),
    updatedAt: new Date("2024-03-08").toISOString(),
    author: "Quirex Team",
  },
];

export function getPosts(): Post[] {
  const seedSynced = localStorage.getItem(SEED_VERSION_KEY) === importedSeedVersion;
  const postsBodySynced = localStorage.getItem(DEFAULT_POSTS_VERSION_KEY) === DEFAULT_POSTS_VERSION;
  const stored = localStorage.getItem(POSTS_KEY);
  if (!stored || !seedSynced || !postsBodySynced) {
    // Merge defaultPosts + importedPosts, deduped by slug (refresh base when seed or default doc set changes)
    const base: Post[] = !postsBodySynced ? defaultPosts : stored ? JSON.parse(stored) : defaultPosts;
    const merged = [...base];
    for (const ip of importedPosts) {
      if (!merged.some((p) => p.slug === ip.slug)) merged.push(ip);
    }
    localStorage.setItem(POSTS_KEY, JSON.stringify(merged));
    localStorage.setItem(SEED_VERSION_KEY, importedSeedVersion);
    localStorage.setItem(DEFAULT_POSTS_VERSION_KEY, DEFAULT_POSTS_VERSION);
    return merged;
  }
  return JSON.parse(stored);
}

export function getPost(slug: string): Post | undefined {
  return getPosts().find((p) => p.slug === slug);
}

export function savePost(post: Post): void {
  const posts = getPosts();
  const idx = posts.findIndex((p) => p.id === post.id);
  if (idx >= 0) {
    posts[idx] = { ...post, updatedAt: new Date().toISOString() };
  } else {
    posts.push(post);
  }
  localStorage.setItem(POSTS_KEY, JSON.stringify(posts));
}

export function deletePost(id: string): void {
  const posts = getPosts().filter((p) => p.id !== id);
  localStorage.setItem(POSTS_KEY, JSON.stringify(posts));
}

export function getCategories(): Category[] {
  const stored = localStorage.getItem(CATEGORIES_KEY);
  const base: Category[] = stored ? JSON.parse(stored) : defaultCategories;
  const merged = [...base];
  for (const ic of importedCategories) {
    if (!merged.some((c) => c.slug === ic.slug)) merged.push(ic);
  }
  if (!stored) localStorage.setItem(CATEGORIES_KEY, JSON.stringify(merged));
  return merged;
}

export function saveCategory(category: Category): void {
  const cats = getCategories();
  const idx = cats.findIndex((c) => c.id === category.id);
  if (idx >= 0) {
    cats[idx] = category;
  } else {
    cats.push(category);
  }
  localStorage.setItem(CATEGORIES_KEY, JSON.stringify(cats));
}

export function deleteCategory(id: string): void {
  const cats = getCategories().filter((c) => c.id !== id);
  localStorage.setItem(CATEGORIES_KEY, JSON.stringify(cats));
}

export function getPostsByCategory(categorySlug: string): Post[] {
  return getPosts().filter((p) => p.category === categorySlug && p.published);
}

export function searchPosts(query: string): Post[] {
  const q = query.toLowerCase();
  return getPosts().filter(
    (p) =>
      p.published &&
      (p.title.toLowerCase().includes(q) ||
        p.content.toLowerCase().includes(q) ||
        p.tags.some((t) => t.toLowerCase().includes(q)))
  );
}

export function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export function generateId(): string {
  return Math.random().toString(36).substring(2, 10) + Date.now().toString(36);
}
