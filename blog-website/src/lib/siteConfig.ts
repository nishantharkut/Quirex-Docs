/**
 * Site configuration for Quirex docs.
 */
export const siteConfig = {
  name: "quirex",
  badge: "docs",
  tagline: "Guides, references, and examples to help you build with Quirex.",
  heading: "Documentation",
  metaTitle: "Quirex — Beautiful Documentation Platform",
  metaDescription: "A modern documentation and blog platform with full Markdown support, syntax highlighting, and beautiful design.",
  author: "Quirex",
  baseUrl: "https://your-domain.com",
  ogImage: "/og-image.png",
  navLinks: [
    { label: "Blog", href: "/blog", match: (path: string) => path.startsWith("/blog") },
    { label: "Docs", href: "/docs/welcome", match: (path: string) => path.startsWith("/docs") },
    { label: "Changelog", href: "/changelog", match: (path: string) => path.startsWith("/changelog") },
    { label: "Admin", href: "/admin", match: (path: string) => path.startsWith("/admin") },
    { label: "Users", href: "/users", match: (path: string) => path.startsWith("/users") },
    { label: "Analytics", href: "/analytics", match: (path: string) => path.startsWith("/analytics") },
  ],
  externalLinks: [
    { label: "GitHub", href: "https://github.com/your-repo", icon: "github" as const },
  ],
  footer: "Built with Quirex — Open source documentation platform.",
  defaultAuthor: "Admin",
};

export type SiteConfig = typeof siteConfig;
