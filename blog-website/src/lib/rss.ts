import { changelog } from "./changelog";

/**
 * Generate RSS 2.0 XML from changelog entries
 */
export function generateRSS(baseUrl: string, siteName: string): string {
  const items = changelog
    .map(
      (entry) => `    <item>
      <title>${escapeXml(`${siteName} ${entry.version} — ${entry.title}`)}</title>
      <link>${baseUrl}/changelog</link>
      <pubDate>${new Date(entry.date).toUTCString()}</pubDate>
      <guid isPermaLink="false">${siteName}-${entry.version}</guid>
      <description>${escapeXml(
        entry.changes.map((c) => `[${c.type.toUpperCase()}] ${c.text}`).join("\n")
      )}</description>
    </item>`
    )
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeXml(siteName)} Changelog</title>
    <link>${baseUrl}/changelog</link>
    <description>Latest updates and releases</description>
    <language>en</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${baseUrl}/rss.xml" rel="self" type="application/rss+xml"/>
${items}
  </channel>
</rss>`;
}

/**
 * Generate a basic sitemap XML from published posts
 */
export function generateSitemap(
  baseUrl: string,
  slugs: { slug: string; updatedAt: string }[]
): string {
  const staticPages = [
    { loc: "/", priority: "1.0" },
    { loc: "/changelog", priority: "0.7" },
    { loc: "/api-reference", priority: "0.7" },
    { loc: "/doc-health", priority: "0.5" },
    { loc: "/setup", priority: "0.6" },
  ];

  const urls = [
    ...staticPages.map(
      (p) => `  <url>
    <loc>${baseUrl}${p.loc}</loc>
    <priority>${p.priority}</priority>
  </url>`
    ),
    ...slugs.map(
      (s) => `  <url>
    <loc>${baseUrl}/docs/${s.slug}</loc>
    <lastmod>${s.updatedAt.split("T")[0]}</lastmod>
    <priority>0.8</priority>
  </url>`
    ),
  ].join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>`;
}

function escapeXml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

/**
 * Download RSS or sitemap as a file
 */
export function downloadXml(filename: string, content: string) {
  const blob = new Blob([content], { type: "application/xml" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
