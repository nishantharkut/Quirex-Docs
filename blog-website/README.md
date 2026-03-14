# Inkwell — Open Source Documentation Platform

A beautiful, self-hostable documentation platform built with React, Vite, and TypeScript. No backend required by default — everything runs client-side with localStorage.

## Quick Start

```bash
git clone https://github.com/your-repo/inkwell.git
cd inkwell
npm install
npm run dev
```

## Features

- ✍️ **Full Markdown** — GFM tables, task lists, syntax highlighting for 100+ languages
- 📦 **Custom components** — Callouts (`:::info`, `:::warning`, `:::tip`), collapsible sections (`:::details`)
- 🔍 **Instant search** — ⌘K fuzzy search across all docs
- 🌙 **Dark mode** — System-aware with hand-tuned palettes
- ✏️ **Rich editor** — Toolbar, keyboard shortcuts, undo/redo, auto-list continuation
- 📁 **Bulk import** — Drag-and-drop `.md` files with frontmatter parsing
- 📱 **PWA** — Installable, offline-capable
- 👍 **Feedback** — "Was this helpful?" widget per page
- 🕐 **Revision history** — Auto-saved revisions with diff view
- ⌨️ **Keyboard-first** — Navigate, search, and edit without leaving the keyboard

## Configuration

Edit `src/lib/siteConfig.ts` to customize:

```typescript
export const siteConfig = {
  name: "your-project",       // Header brand name
  badge: "docs",              // Badge next to name
  heading: "Documentation",   // Homepage heading
  tagline: "Your tagline",    // Homepage subtitle
  footer: "Your footer text",
  defaultAuthor: "Admin",
  navLinks: [...],            // Header navigation
  externalLinks: [...],       // GitHub, Twitter, etc.
};
```

## Custom Markdown Components

### Callouts

```markdown
:::info
This is an info callout.
:::

:::warning Important notice
Be careful with this operation.
:::

:::tip Pro tip
You can also use `:::danger` and `:::note`.
:::
```

### Collapsible Sections

```markdown
:::details Click to expand
Hidden content goes here.
:::
```

## Project Structure

```
src/
├── components/
│   ├── markdown/          # Custom MD components (Callout, Tabs, Collapsible)
│   ├── CodeBlock.tsx       # Syntax highlighting
│   ├── FeedbackWidget.tsx  # Thumbs up/down
│   ├── Header.tsx          # Site header
│   ├── MarkdownEditor.tsx  # Rich editor with toolbar
│   ├── MarkdownRenderer.tsx # MD → React renderer
│   ├── Sidebar.tsx         # Doc navigation
│   └── SearchDialog.tsx    # ⌘K search
├── lib/
│   ├── content.ts          # Post/category CRUD (localStorage)
│   ├── revisions.ts        # Revision history & diffing
│   ├── siteConfig.ts       # Site configuration
│   └── utils.ts
├── pages/
│   ├── Index.tsx           # Landing page
│   ├── PostPage.tsx        # Doc viewer
│   └── AdminPage.tsx       # Content management
└── types/
    └── blog.ts
```

## Self-Hosting

### Option 1: Static hosting (default)

Build and deploy to any static host (Vercel, Netlify, GitHub Pages, Cloudflare Pages):

```bash
npm run build
# Deploy the `dist/` folder
```

Data is stored in the browser's localStorage. Great for personal docs.

### Option 2: With your own backend

To share data across users, replace the localStorage functions in `src/lib/content.ts` with API calls to your backend. The interface is simple:

```typescript
// These are the functions to replace:
getPosts(): Post[]
getPost(slug: string): Post | undefined
savePost(post: Post): void
deletePost(id: string): void
getCategories(): Category[]
saveCategory(category: Category): void
deleteCategory(id: string): void
```

Example with a REST API:

```typescript
// src/lib/content.ts — replace localStorage calls
const API_URL = import.meta.env.VITE_API_URL || "/api";

export async function getPosts(): Promise<Post[]> {
  const res = await fetch(`${API_URL}/posts`);
  return res.json();
}

export async function savePost(post: Post): Promise<void> {
  await fetch(`${API_URL}/posts/${post.id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(post),
  });
}
```

### Option 3: File-based backend (Node.js)

Create a simple Express server that reads/writes `.md` files from disk:

```bash
mkdir server && cd server
npm init -y
npm install express cors
```

```javascript
// server/index.js
const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");

const app = express();
app.use(cors());
app.use(express.json());

const DOCS_DIR = path.join(__dirname, "../docs");

app.get("/api/posts", (req, res) => {
  const files = fs.readdirSync(DOCS_DIR).filter(f => f.endsWith(".md"));
  const posts = files.map(file => {
    const raw = fs.readFileSync(path.join(DOCS_DIR, file), "utf-8");
    // Parse frontmatter and return post object
    return parseFrontmatter(raw, file);
  });
  res.json(posts);
});

app.listen(3001, () => console.log("API running on :3001"));
```

Then set `VITE_API_URL=http://localhost:3001/api` in your `.env`.

### Docker

```dockerfile
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
```

```nginx
# nginx.conf
server {
    listen 80;
    root /usr/share/nginx/html;
    index index.html;
    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

```bash
docker build -t inkwell .
docker run -p 8080:80 inkwell
```

## Contributing

1. Fork the repo
2. Create a branch (`git checkout -b feature/my-feature`)
3. Commit changes (`git commit -am 'Add feature'`)
4. Push (`git push origin feature/my-feature`)
5. Open a Pull Request

## License

MIT
