import { Post, Category } from "@/types/blog";
import { importedCategories, importedPosts, importedSeedVersion } from "@/lib/repoContent.generated";

const POSTS_KEY = "quirex_posts";
const CATEGORIES_KEY = "quirex_categories";
const SEED_VERSION_KEY = "quirex_seed_version";

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
    excerpt: "Get started with Quirex — a modern documentation platform with powerful editing, versioning, and multi-language support.",
    content: `# Welcome to Quirex

Quirex is a **modern documentation platform** designed to make your content shine. Write in Markdown, publish beautiful docs, and manage everything from a powerful admin panel.

## What Makes Quirex Different?

- 🚀 **Zero Configuration** — Start writing immediately, no build steps required
- 📝 **Rich Markdown Editor** — Formatting toolbar, keyboard shortcuts, auto-save
- 🔍 **Instant Search** — Press \`⌘K\` to find anything across all your docs
- 🌍 **Multi-Language** — Built-in i18n with 8 languages supported
- 📱 **Mobile-First** — Swipe gestures, responsive design, PWA support
- 🔐 **Role-Based Access** — Admin, editor, and viewer roles with secure auth

## Quick Start

1. **Explore the docs** — Browse through the sidebar to learn about features
2. **Try the search** — Press \`⌘K\` (or \`Ctrl+K\`) to open instant search
3. **Switch themes** — Click the moon/sun icon in the header
4. **Change language** — Use the language switcher to see translations

:::tip First-time users
Sign in to access the Admin Panel where you can create and manage your own documentation.
:::

## Platform Features

| Feature | Description |
|---------|-------------|
| Markdown Editor | Rich formatting with live preview |
| Version Control | Track changes with revision history |
| Doc Versioning | Manage v1.0, v1.1, etc. separately |
| Authentication | Email, Google OAuth, magic links |
| Comments | Per-page discussion threads |
| Analytics | Track page views and engagement |

## Code Highlighting

Quirex supports syntax highlighting for **100+ languages**:

\`\`\`typescript
// TypeScript example
interface DocConfig {
  title: string;
  theme: 'light' | 'dark' | 'auto';
  version: string;
  i18n: {
    defaultLocale: string;
    locales: string[];
  };
}

const config: DocConfig = {
  title: "My Documentation",
  theme: "auto",
  version: "2.0",
  i18n: {
    defaultLocale: "en",
    locales: ["en", "es", "fr", "de", "ja", "zh", "pt", "ko"]
  }
};
\`\`\`

## Custom Components

Use callout blocks to highlight important information:

:::info About Callouts
Callouts help readers quickly identify important content. Use \`:::info\`, \`:::warning\`, \`:::tip\`, \`:::danger\`, or \`:::note\`.
:::

:::warning Authentication Required
Some features like the Admin Panel require signing in. Create an account to get started.
:::

:::details What's in the Admin Panel?
The Admin Panel includes:
- Post editor with formatting toolbar
- Category and tag management
- User role management (admin only)
- Import/export tools
- Theme customization
:::

---

Ready to dive deeper? Check out the **Markdown Guide** next, or head to the **Admin Panel** to create your first post!
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
    excerpt: "Master Markdown syntax with Quirex's extended features including callouts, collapsible sections, and syntax highlighting.",
    content: `# Markdown Guide

Quirex uses **GitHub Flavored Markdown (GFM)** with additional custom components for documentation.

## Text Formatting

| Syntax | Output |
|--------|--------|
| \`**bold**\` | **bold** |
| \`*italic*\` | *italic* |
| \`***both***\` | ***both*** |
| \`~~strikethrough~~\` | ~~strikethrough~~ |
| \`\\\`inline code\\\`\` | \`inline code\` |

## Headings

Use \`#\` symbols to create headings. Each heading automatically gets an ID for deep linking:

\`\`\`markdown
# H1 Heading
## H2 Heading  
### H3 Heading
#### H4 Heading
\`\`\`

:::tip Hover to Copy
Hover over any heading to see a link icon. Click it to copy the direct URL to that section.
:::

## Links & Images

\`\`\`markdown
[Link text](https://example.com)
![Alt text](https://example.com/image.jpg)
\`\`\`

## Lists

### Unordered Lists
- First item
- Second item
  - Nested item
  - Another nested

### Ordered Lists
1. First step
2. Second step
3. Third step

### Task Lists
- [x] Write documentation
- [x] Add syntax highlighting
- [ ] Ship to production

## Code Blocks

Specify a language after the opening backticks for syntax highlighting:

\`\`\`python
from typing import List, Optional

class DocumentProcessor:
    def __init__(self, config: dict):
        self.config = config
        self.cache = {}
    
    def process(self, content: str) -> dict:
        """Process markdown content and return metadata."""
        word_count = len(content.split())
        return {
            "word_count": word_count,
            "read_time": max(1, word_count // 200),
            "has_code": "\`\`\`" in content
        }
\`\`\`

\`\`\`javascript
// JavaScript with modern syntax
const fetchDocs = async (category) => {
  const response = await fetch(\`/api/docs/\${category}\`);
  const { data, meta } = await response.json();
  
  return data.map(doc => ({
    ...doc,
    url: \`/docs/\${doc.slug}\`,
    readTime: Math.ceil(doc.wordCount / 200)
  }));
};
\`\`\`

## Tables

\`\`\`markdown
| Column 1 | Column 2 | Column 3 |
|----------|----------|----------|
| Cell 1   | Cell 2   | Cell 3   |
\`\`\`

Result:

| Feature | Status | Notes |
|---------|--------|-------|
| Markdown | ✅ | Full GFM support |
| Callouts | ✅ | 5 types available |
| Code highlighting | ✅ | 100+ languages |
| Tables | ✅ | With alignment |

## Blockquotes

> "Documentation is a love letter that you write to your future self."
> — Damian Conway

## Horizontal Rules

Use \`---\` or \`***\` to create a horizontal rule:

---

## Callout Blocks

Quirex extends Markdown with custom callout blocks:

\`\`\`markdown
:::info Title here
Your content goes here.
:::
\`\`\`

### Available Types

:::info Information
Use for general information and context.
:::

:::tip Pro Tip
Use for helpful suggestions and best practices.
:::

:::warning Caution
Use to warn about potential issues.
:::

:::danger Critical
Use for critical warnings and breaking changes.
:::

:::note Side Note
Use for additional context that's not essential.
:::

## Collapsible Sections

\`\`\`markdown
:::details Click to expand
Hidden content goes here.
:::
\`\`\`

:::details Advanced Markdown Features
Quirex also supports:
- Automatic table of contents generation
- Heading anchor links with copy-on-click
- Reading progress indicator
- Estimated read time calculation
:::

---

Now you know everything about writing Markdown in Quirex! Check out the **Editor Features** guide to learn about the admin panel.
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
    excerpt: "Learn about Quirex's powerful Markdown editor with formatting toolbar, keyboard shortcuts, and auto-save.",
    content: `# Editor Features

The Quirex editor is designed for speed and productivity. It's not just a textarea — it's a full-featured writing environment.

## Formatting Toolbar

The editor includes a formatting toolbar with 18+ actions:

| Button | Action | Shortcut |
|--------|--------|----------|
| **B** | Bold | \`⌘B\` |
| *I* | Italic | \`⌘I\` |
| S̶ | Strikethrough | \`⌘⇧S\` |
| H₁ | Heading 1 | — |
| H₂ | Heading 2 | — |
| • | Bullet list | — |
| 1. | Numbered list | — |
| ☐ | Task list | — |
| ❝ | Blockquote | — |
| \`</>\` | Code block | — |
| 🔗 | Insert link | \`⌘K\` |

## Keyboard Shortcuts

Power users can format text without leaving the keyboard:

\`\`\`
⌘B          Bold
⌘I          Italic
⌘K          Insert link
⌘Z          Undo
⌘⇧Z         Redo
Tab         Indent list
⇧Tab        Outdent list
Enter       Continue list (auto)
\`\`\`

:::tip List Continuation
When you press Enter at the end of a list item, the editor automatically adds the next bullet or number. Press Enter twice to exit the list.
:::

## Auto-Save

Your work is automatically saved every **30 seconds**. You'll see a "Saved" indicator in the editor when changes are persisted.

The auto-save system:
- Saves to browser localStorage
- Works completely offline
- Preserves unsaved changes across browser refreshes

## Revision History

Every time you save a post, Quirex creates a snapshot:

1. Click the **History** button in the editor
2. Browse previous versions with timestamps
3. View line-by-line diffs between versions
4. **One-click restore** to any previous version

:::warning Revision Limits
Each post can store up to **50 revisions**. Older revisions are automatically pruned to save storage.
:::

## Live Preview

The editor shows a split view:
- **Left pane**: Raw Markdown source
- **Right pane**: Rendered preview (updates as you type)

## Word Count & Read Time

The editor displays:
- Total word count
- Estimated reading time (based on 200 WPM)

## Templates

Start new posts from pre-built templates:

| Template | Use Case |
|----------|----------|
| Blank | Start from scratch |
| Tutorial | Step-by-step guide |
| API Reference | Endpoint documentation |
| Changelog | Release notes |
| FAQ | Questions and answers |

## Bulk Import

Import existing documentation:

1. Drag-and-drop \`.md\` or \`.mdx\` files
2. Quirex parses frontmatter automatically
3. Supports importing entire folders

\`\`\`yaml
---
title: My Document
category: guides
tags: [tutorial, beginner]
published: true
---

Your markdown content here...
\`\`\`

---

Ready to start writing? Head to the **Admin Panel** and create your first post!
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
    excerpt: "Learn about instant search, keyboard navigation, mobile gestures, and reading features.",
    content: `# Search & Navigation

Quirex is designed for fast, keyboard-first navigation with full mobile support.

## Instant Search

Press \`⌘K\` (Mac) or \`Ctrl+K\` (Windows/Linux) to open the search dialog.

Features:
- **Fuzzy matching** — finds results even with typos
- **Full-text search** — searches titles, content, and tags
- **Keyboard navigation** — use ↑↓ to select, Enter to open
- **Recent searches** — quickly access previous queries

:::tip Search Syntax
Search for specific content types:
- \`tag:api\` — find posts tagged "api"
- \`category:guides\` — find posts in guides category
:::

## Sidebar Navigation

The sidebar shows all documentation organized by category:
- **Collapsible sections** — click category names to expand/collapse
- **Active highlighting** — current page is highlighted
- **Version filtering** — only shows docs for selected version

## Table of Contents

Each documentation page shows a table of contents:
- **Desktop**: Fixed on the right side
- **Mobile**: Collapsible dropdown at the top
- **Auto-highlighting** — current section is highlighted as you scroll

## Keyboard Navigation

Navigate between documents without a mouse:

| Shortcut | Action |
|----------|--------|
| \`⌘K\` | Open search |
| \`Alt+←\` | Previous document |
| \`Alt+→\` | Next document |
| \`Esc\` | Close dialogs |

## Mobile Gestures

On touch devices:
- **Swipe left** → Navigate to next document
- **Swipe right** → Navigate to previous document (or open sidebar)
- **Swipe left on sidebar** → Close sidebar

:::info Gesture Hints
On mobile, you'll see a hint at the bottom of doc pages: "Swipe ← → to navigate between docs"
:::

## Reading Features

### Reading Progress
A progress bar at the top of the page shows how far you've scrolled through the document.

### Text-to-Speech
Click the speaker icon to have the document read aloud. Supports play, pause, and speed controls.

### Bookmarks
Click the bookmark icon to save any document for later. Access your bookmarks from the header.

### Reading History
Quirex tracks your reading progress. Resume where you left off, or review your reading history.

## Breadcrumbs

Every doc page shows breadcrumbs for context:

\`Home > Category > Document Title\`

Click any breadcrumb to navigate up the hierarchy.

---

Next, learn about **Version Control** to manage documentation for different product versions.
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
    excerpt: "Manage documentation for multiple product versions with revision history and doc versioning.",
    content: `# Version Control

Quirex provides two types of version control: **Revision History** (for individual posts) and **Doc Versioning** (for product releases).

## Revision History

Every time you save a document, Quirex creates a snapshot.

### Viewing History
1. Open a document in the editor
2. Click the **History** button
3. Browse revisions by date/time
4. View line-by-line diffs

### Restoring Versions
Click **Restore** on any revision to revert the document. The current version becomes a new revision, so you never lose data.

\`\`\`
┌─────────────────────────────────────┐
│  Revision History                   │
├─────────────────────────────────────┤
│  ● Mar 8, 2024 - 2:30 PM  (current) │
│  ○ Mar 8, 2024 - 11:15 AM           │
│  ○ Mar 7, 2024 - 4:45 PM            │
│  ○ Mar 7, 2024 - 10:30 AM           │
│  ○ Mar 6, 2024 - 3:20 PM            │
└─────────────────────────────────────┘
\`\`\`

:::warning Storage Limits
Each document stores up to 50 revisions. Older revisions are automatically pruned.
:::

## Doc Versioning

For products with multiple releases, you can tag documentation by version.

### Version Switcher
The header includes a version dropdown:
- Select which version to view
- Persists across sessions
- Filters sidebar and search results

### Version Tags
When creating/editing a post, assign it to versions:

\`\`\`yaml
versions: ["v1.0", "v1.1", "v2.0"]
\`\`\`

### Use Cases

| Scenario | Solution |
|----------|----------|
| New feature in v2.0 | Create doc, tag with "v2.0" only |
| Deprecated in v2.0 | Remove "v2.0" from version tags |
| Changed behavior | Create separate docs per version |
| Universal docs | Tag with all versions |

## Changelog

Track changes across releases with the built-in changelog:

1. Navigate to \`/changelog\` 
2. View updates in a timeline format
3. Filter by type: New, Fix, Improvement, Breaking

### Status Badges

| Badge | Use For |
|-------|---------|
| 🟢 New | New features |
| 🔵 Improvement | Enhancements |
| 🟡 Fix | Bug fixes |
| 🔴 Breaking | Breaking changes |

---

Next, explore **Internationalization** to make your docs available in multiple languages.
`,
    category: "features",
    tags: ["versions", "history", "changelog"],
    published: true,
    createdAt: new Date("2024-01-05").toISOString(),
    updatedAt: new Date("2024-03-08").toISOString(),
    author: "Quirex Team",
  },
  {
    id: "internationalization",
    title: "Internationalization",
    slug: "internationalization",
    excerpt: "Make your documentation accessible worldwide with built-in multi-language support.",
    content: `# Internationalization (i18n)

Quirex includes built-in support for **8 languages**, making your documentation accessible to a global audience.

## Supported Languages

| Code | Language | Flag |
|------|----------|------|
| en | English | 🇺🇸 |
| es | Español | 🇪🇸 |
| fr | Français | 🇫🇷 |
| de | Deutsch | 🇩🇪 |
| ja | 日本語 | 🇯🇵 |
| zh | 中文 | 🇨🇳 |
| pt | Português | 🇧🇷 |
| ko | 한국어 | 🇰🇷 |

## Language Switcher

Find the language switcher in the header:
1. Click the globe icon dropdown
2. Select your preferred language
3. UI text updates immediately
4. Preference is saved for future visits

## What Gets Translated?

### Automatically Translated
- Navigation labels
- Button text
- Error messages
- Search placeholders
- Form labels
- Footer content
- Feature descriptions

### Content (Your Docs)
Documentation content is **not automatically translated**. You have two options:

1. **Write in one language** — Most users read in their browser's language
2. **Create translated versions** — Duplicate docs with translated content

:::tip Translation Workflow
For translated content, use a naming convention:
- \`getting-started\` (English)
- \`getting-started-es\` (Spanish)
- \`getting-started-fr\` (French)

Then link between versions in the content.
:::

## RTL Support

For right-to-left languages (Arabic, Hebrew), Quirex automatically adjusts layout direction.

## Date & Time Formatting

Dates are automatically formatted according to the selected language:

| Language | Format |
|----------|--------|
| English | Mar 8, 2024 |
| German | 8. März 2024 |
| Japanese | 2024年3月8日 |
| Chinese | 2024年3月8日 |

---

Learn more about **Authentication & Roles** to control who can access and edit your docs.
`,
    category: "features",
    tags: ["i18n", "languages", "localization"],
    published: true,
    createdAt: new Date("2024-01-06").toISOString(),
    updatedAt: new Date("2024-03-08").toISOString(),
    author: "Quirex Team",
  },
  {
    id: "authentication",
    title: "Authentication & Roles",
    slug: "authentication",
    excerpt: "Secure your documentation with user authentication, role-based access control, and multiple sign-in methods.",
    content: `# Authentication & Roles

Quirex includes a complete authentication system with role-based access control.

## Sign-In Methods

Users can sign in using:

| Method | Description |
|--------|-------------|
| Email/Password | Traditional account creation |
| Google OAuth | One-click Google sign-in |
| Magic Link | Passwordless email link |

### Password Requirements
- Minimum 6 characters
- Email verification required (unless disabled)

## User Roles

Quirex uses three permission levels:

### 👑 Admin
Full access to everything:
- Create, edit, delete any content
- Manage user roles
- Access analytics
- Configure settings
- Theme customization
- Import/export data

### ✏️ Editor
Content management access:
- Create and edit posts
- Manage categories and tags
- Access revision history
- Import content

### 👁️ Viewer
Read-only access:
- View all published content
- Use bookmarks and comments
- Access reading history

:::info First User
The first user to sign up automatically becomes an Admin. Subsequent users are assigned the Viewer role by default.
:::

## Protected Routes

Certain pages require authentication:

| Route | Required Role |
|-------|---------------|
| \`/admin\` | Editor or Admin |
| \`/analytics\` | Admin |
| \`/users\` | Admin |
| \`/theme\` | Admin |
| \`/import/notion\` | Editor or Admin |

## Managing Users

Admins can manage users at \`/users\`:

1. View all registered users
2. See current roles
3. Promote/demote users
4. Remove users

## Password Reset

Users can reset their password:

1. Click "Forgot password?" on login
2. Enter email address
3. Receive reset link via email
4. Set new password

---

That covers the core features! Explore **Customization** to learn about theming and configuration.
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
    excerpt: "Customize Quirex's appearance with themes, colors, and branding options.",
    content: `# Theming & Customization

Make Quirex yours with powerful theming options.

## Light & Dark Mode

Quirex includes system-aware theming:

- **Auto** — Follows system preference
- **Light** — Bright, warm color palette
- **Dark** — Easy on the eyes, OLED-friendly

Toggle themes using the sun/moon icon in the header.

:::tip Zero Flash
Quirex loads the correct theme before rendering, so there's no flash of the wrong theme on page load.
:::

## Theme Editor

Admins can customize colors at \`/theme\`:

### Customizable Properties

| Property | Description |
|----------|-------------|
| Primary Color | Accent color for links, buttons |
| Background | Page background |
| Foreground | Text color |
| Muted | Secondary text, borders |
| Card | Card backgrounds |

### CSS Variables

Themes use CSS custom properties:

\`\`\`css
:root {
  --background: 0 0% 100%;
  --foreground: 240 10% 3.9%;
  --primary: 240 5.9% 10%;
  --primary-foreground: 0 0% 98%;
  --muted: 240 4.8% 95.9%;
  --muted-foreground: 240 3.8% 46.1%;
  /* ... more variables */
}
\`\`\`

## Site Configuration

Customize site identity in the config:

\`\`\`typescript
const siteConfig = {
  name: "Quirex",
  heading: "Documentation",
  tagline: "Beautiful docs, zero config",
  badge: "Beta", // Optional badge next to name
  footer: "© 2024 Your Company",
  // ... more options
};
\`\`\`

## PWA Support

Quirex is a Progressive Web App:

- **Installable** — Add to home screen
- **Offline** — Works without internet
- **Fast** — Service worker caching

### Installing on Mobile
1. Visit your docs site in Safari/Chrome
2. Tap "Add to Home Screen"
3. Access docs like a native app

### Installing on Desktop
1. Look for the install icon in the address bar
2. Click "Install"
3. Access from your applications

## SEO

Quirex generates proper meta tags:

\`\`\`html
<title>Page Title — Site Name</title>
<meta name="description" content="Page excerpt...">
<meta property="og:title" content="Page Title">
<meta property="og:description" content="Page excerpt...">
\`\`\`

---

You're now a Quirex expert! 🎉 Start creating amazing documentation.
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
  const stored = localStorage.getItem(POSTS_KEY);
  if (!stored || !seedSynced) {
    // Merge defaultPosts + importedPosts, deduped by slug
    const base: Post[] = stored ? JSON.parse(stored) : defaultPosts;
    const merged = [...base];
    for (const ip of importedPosts) {
      if (!merged.some((p) => p.slug === ip.slug)) merged.push(ip);
    }
    localStorage.setItem(POSTS_KEY, JSON.stringify(merged));
    localStorage.setItem(SEED_VERSION_KEY, importedSeedVersion);
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
