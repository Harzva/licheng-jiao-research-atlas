import { readFile } from "node:fs/promises";
import { resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const textFiles = [
  "index.html",
  "app.js",
  "styles.css",
  "data/atlas.json",
  "data/publications.json"
];
const forbiddenPatterns = [
  { label: "macOS user path", pattern: /\/Users\//i },
  { label: "external volume path", pattern: /\/Volumes\//i },
  { label: "Windows user path", pattern: /[A-Z]:\\Users\\/i },
  { label: "local URL", pattern: /\b(?:localhost|127\.0\.0\.1|file:\/\/)/i },
  { label: "secret-like token", pattern: /\b(?:gh[pousr]_|sk-|xox[baprs]-)[A-Za-z0-9_-]{16,}/ },
  { label: "credential assignment", pattern: /\b(?:password|secret|api[_-]?key|token)\s*[:=]\s*["'][^"']+/i },
  { label: "developer-only copy", pattern: /\bPreview\s+V\d+\b|下一版|内部流水线|待开发|TODO|FIXME/i }
];
const allowedPaperKeys = new Set([
  "id",
  "title",
  "authors",
  "year",
  "pub_type",
  "venue",
  "volume_pages",
  "doi",
  "dblp_key",
  "dblp_url",
  "landing_url",
  "direct_pdf_url",
  "publisher_group",
  "access",
  "oa_confirmed",
  "topic",
  "abstract"
]);
const blockedPaperKeys = new Set([
  "local_pdf",
  "access_status",
  "source_url",
  "metadata_status",
  "notes",
  "download_status",
  "queue_status"
]);
const urlKeys = ["dblp_url", "landing_url", "direct_pdf_url"];
const failures = [];

for (const relativePath of textFiles) {
  const content = await readFile(resolve(root, relativePath), "utf8");
  for (const check of forbiddenPatterns) {
    if (check.pattern.test(content)) failures.push(`${relativePath}: ${check.label}`);
  }
}

const papers = JSON.parse(await readFile(resolve(root, "data/publications.json"), "utf8"));
for (const [index, paper] of papers.entries()) {
  for (const key of Object.keys(paper)) {
    if (!allowedPaperKeys.has(key)) failures.push(`paper ${index + 1}: unexpected key "${key}"`);
    if (blockedPaperKeys.has(key)) failures.push(`paper ${index + 1}: blocked key "${key}"`);
  }
  for (const key of urlKeys) {
    if (paper[key] && !paper[key].startsWith("https://")) {
      failures.push(`paper ${index + 1}: non-public ${key}`);
    }
  }
}

if (failures.length) {
  console.error("Public safety check failed:");
  failures.slice(0, 50).forEach((failure) => console.error(`- ${failure}`));
  if (failures.length > 50) console.error(`- …and ${failures.length - 50} more`);
  process.exit(1);
}

console.log(`Public safety check passed for ${papers.length} publication records.`);
