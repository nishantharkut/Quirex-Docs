import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";

const projectRoot = path.resolve(process.cwd());
const repoRoot = path.resolve(projectRoot, "..");
const outputFile = path.join(projectRoot, "src", "lib", "repoContent.generated.ts");

const contentSources = [
  { type: "file", relativePath: "README.md" },
  { type: "directory", relativePath: "Final Orgs GSOC" },
  { type: "directory", relativePath: "Learning unlimited" },
];

function walkMarkdownFiles(directoryPath) {
  const entries = fs.readdirSync(directoryPath, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const absolutePath = path.join(directoryPath, entry.name);
    if (entry.isDirectory()) {
      files.push(...walkMarkdownFiles(absolutePath));
      continue;
    }

    if (entry.isFile() && entry.name.toLowerCase().endsWith(".md")) {
      files.push(absolutePath);
    }
  }

  return files;
}

function toPosix(value) {
  return value.split(path.sep).join("/");
}

function slugify(value) {
  return value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .replace(/-+/g, "-");
}

function titleFromFilename(filename) {
  return filename
    .replace(/\.md$/i, "")
    .replace(/[-_]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function parseFrontMatter(rawMarkdown) {
  const match = rawMarkdown.match(/^---\s*\r?\n([\s\S]*?)\r?\n---\s*(?:\r?\n)?/);
  if (!match) {
    return { metadata: {}, content: rawMarkdown };
  }

  const metadata = {};
  for (const line of match[1].split(/\r?\n/)) {
    const separatorIndex = line.indexOf(":");
    if (separatorIndex <= 0) {
      continue;
    }

    const key = line.slice(0, separatorIndex).trim();
    const rawValue = line.slice(separatorIndex + 1).trim();
    metadata[key] = rawValue.replace(/^['\"]|['\"]$/g, "");
  }

  return {
    metadata,
    content: rawMarkdown.slice(match[0].length),
  };
}

function parseTags(rawTags) {
  if (!rawTags) {
    return [];
  }

  const normalized = rawTags.trim();
  if (!normalized) {
    return [];
  }

  if (normalized.startsWith("[") && normalized.endsWith("]")) {
    return normalized
      .slice(1, -1)
      .split(",")
      .map((tag) => tag.trim().replace(/^['\"]|['\"]$/g, ""))
      .filter(Boolean);
  }

  return normalized
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean);
}

function extractTitle(markdownContent, fallbackTitle) {
  const headingMatch = markdownContent.match(/^#\s+(.+)$/m);
  if (headingMatch) {
    return headingMatch[1].trim();
  }

  return fallbackTitle;
}

function stripMarkdown(markdownContent) {
  return markdownContent
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/!\[([^\]]*)\]\([^)]+\)/g, "$1")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/^#{1,6}\s+/gm, "")
    .replace(/^>\s?/gm, "")
    .replace(/[*_~]/g, "")
    .replace(/\r?\n+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function extractExcerpt(markdownContent, fallbackTitle) {
  const plainText = stripMarkdown(markdownContent);
  const sourceText = plainText || fallbackTitle;
  if (sourceText.length <= 180) {
    return sourceText;
  }

  return `${sourceText.slice(0, 177).trimEnd()}...`;
}

function resolveCategory(relativePath) {
  const segments = relativePath.split("/");

  if (relativePath === "README.md") {
    return { name: "General", slug: "general" };
  }

  if (segments[0] === "Final Orgs GSOC" && segments[1]) {
    return { name: segments[1], slug: slugify(segments[1]) };
  }

  return {
    name: segments[0],
    slug: slugify(segments[0]),
  };
}

function collectMarkdownFiles() {
  const files = [];

  for (const source of contentSources) {
    const absolutePath = path.join(repoRoot, source.relativePath);
    if (!fs.existsSync(absolutePath)) {
      continue;
    }

    if (source.type === "file") {
      files.push(absolutePath);
      continue;
    }

    files.push(...walkMarkdownFiles(absolutePath));
  }

  return files.sort((left, right) => left.localeCompare(right));
}

const markdownFiles = collectMarkdownFiles();
const categories = [];
const seenCategorySlugs = new Set();
const posts = [];
const seedHash = crypto.createHash("sha1");

for (const absolutePath of markdownFiles) {
  const relativePath = toPosix(path.relative(repoRoot, absolutePath));
  const source = fs.readFileSync(absolutePath, "utf8");
  const stats = fs.statSync(absolutePath);
  const { metadata, content } = parseFrontMatter(source);
  const category = resolveCategory(relativePath);
  const filename = path.basename(relativePath);
  const fallbackTitle = titleFromFilename(filename);
  const title = metadata.title || extractTitle(content, fallbackTitle);
  const slugPath = relativePath.replace(/\.md$/i, "").split("/").filter(Boolean);
  const slug = slugify(slugPath.join("-"));
  const createdAt = metadata.date && !Number.isNaN(Date.parse(metadata.date))
    ? new Date(metadata.date).toISOString()
    : new Date(stats.mtimeMs).toISOString();
  const updatedAt = new Date(stats.mtimeMs).toISOString();
  const tags = Array.from(
    new Set([
      ...parseTags(metadata.tags),
      ...relativePath.split("/").slice(0, -1),
    ].filter(Boolean))
  );

  if (!seenCategorySlugs.has(category.slug)) {
    seenCategorySlugs.add(category.slug);
    categories.push({
      id: category.slug,
      name: category.name,
      slug: category.slug,
    });
  }

  posts.push({
    id: `repo-${slug}`,
    title,
    slug,
    excerpt: metadata.excerpt || extractExcerpt(content, title),
    content: content.trim(),
    category: category.slug,
    tags,
    published: metadata.published ? metadata.published !== "false" : true,
    createdAt,
    updatedAt,
    author: metadata.author || "Admin",
  });

  seedHash.update(`${relativePath}:${stats.size}:${stats.mtimeMs}`);
}

const generatedContent = `// This file is auto-generated by scripts/buildRepoContent.mjs\n// Do not edit by hand.\n\nimport type { Category, Post } from "../types/blog";\n\nexport const importedSeedVersion = ${JSON.stringify(seedHash.digest("hex"))};\n\nexport const importedCategories: Category[] = ${JSON.stringify(
  categories.map((category, index) => ({ ...category, order: index })),
  null,
  2
)};\n\nexport const importedPosts: Post[] = ${JSON.stringify(posts, null, 2)};\n`;

fs.mkdirSync(path.dirname(outputFile), { recursive: true });
fs.writeFileSync(outputFile, generatedContent, "utf8");

console.log(`Generated ${posts.length} imported docs in ${path.relative(projectRoot, outputFile)}`);