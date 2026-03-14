import { Post } from "@/types/blog";

/**
 * Export a single post as a Markdown file download
 */
export function exportAsMarkdown(post: Post) {
  const frontmatter = [
    "---",
    `title: "${post.title}"`,
    `slug: "${post.slug}"`,
    `category: "${post.category}"`,
    `tags: [${post.tags.map((t) => `"${t}"`).join(", ")}]`,
    `author: "${post.author}"`,
    `createdAt: "${post.createdAt}"`,
    `updatedAt: "${post.updatedAt}"`,
    `published: ${post.published}`,
    post.protected ? `protected: true` : null,
    "---",
    "",
  ]
    .filter(Boolean)
    .join("\n");

  const content = frontmatter + post.content;
  downloadFile(`${post.slug}.md`, content, "text/markdown");
}

/**
 * Export all posts as a single JSON file
 */
export function exportAllAsJSON(posts: Post[]) {
  const content = JSON.stringify(posts, null, 2);
  downloadFile("quirex-docs-export.json", content, "application/json");
}

/**
 * Export all posts as individual markdown files in a zip-like combined file
 */
export function exportAllAsMarkdown(posts: Post[]) {
  let combined = "";
  posts.forEach((post, i) => {
    if (i > 0) combined += "\n\n" + "=".repeat(80) + "\n\n";
    combined += `# ${post.title}\n`;
    combined += `<!-- category: ${post.category} | tags: ${post.tags.join(", ")} | updated: ${post.updatedAt} -->\n\n`;
    combined += post.content;
  });
  downloadFile("quirex-all-docs.md", combined, "text/markdown");
}

/**
 * Trigger a browser print dialog optimized for PDF export
 */
export function exportAsPDF() {
  window.print();
}

function downloadFile(filename: string, content: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
