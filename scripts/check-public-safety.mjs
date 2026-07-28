import { readFile } from "node:fs/promises";
import { resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const textFiles = [
  "README.md",
  "index.html",
  "en/index.html",
  "app.js",
  "styles.css",
  "data/atlas.json",
  "data/publications.json",
  "data/citations.json",
  "data/coverage.json",
  "data/milestones.json",
  "review/README.md",
  "review/index.html",
  "review/zh/index.html",
  "review/review.css",
  "review/main.tex",
  "review/references.bib",
  "review/figures/manifest.json",
  "review/figures/research-program-framework.svg",
  "review/figures/research-evolution-timeline.svg",
  "review/figures/hierarchical-task-taxonomy.svg",
  "review/figures/citation-impact-landscape.svg",
  "review/figures/collaboration-constellation.svg",
  "review/qr/research-program-framework.svg",
  "review/qr/research-evolution-timeline.svg",
  "review/qr/hierarchical-task-taxonomy.svg",
  "review/qr/citation-impact-landscape.svg",
  "review/qr/collaboration-constellation.svg",
  "scripts/build-milestones.mjs",
  "scripts/build-coverage.mjs",
  "scripts/generate-review-assets.mjs",
  "scripts/check-i18n.mjs",
  "scripts/check-qr.mjs"
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
  "task",
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
const atlas = JSON.parse(await readFile(resolve(root, "data/atlas.json"), "utf8"));
const citations = JSON.parse(await readFile(resolve(root, "data/citations.json"), "utf8"));
const coverage = JSON.parse(await readFile(resolve(root, "data/coverage.json"), "utf8"));
const milestoneData = JSON.parse(await readFile(resolve(root, "data/milestones.json"), "utf8"));
const figureManifest = JSON.parse(await readFile(resolve(root, "review/figures/manifest.json"), "utf8"));
const taskKeys = new Set((atlas.tasks || []).map((task) => task.key));
const paperIds = new Set(papers.map((paper) => paper.id));
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
  if (!taskKeys.has(paper.task)) failures.push(`paper ${index + 1}: unknown task "${paper.task}"`);
}

const citationEntries = Object.entries(citations.counts || {});
for (const [doi, count] of citationEntries) {
  if (!/^10\.\d{4,9}\/\S+$/i.test(doi)) failures.push(`citation: invalid DOI "${doi}"`);
  if (!Number.isInteger(count) || count < 0) failures.push(`citation: invalid count for "${doi}"`);
}
if (citations.coverage?.matched !== citationEntries.length) {
  failures.push("citation: coverage count does not match cached DOI entries");
}

const conferenceRecords = papers.filter((paper) => paper.pub_type === "inproceedings");
const conferenceVenues = new Set(conferenceRecords.map((paper) => paper.venue).filter(Boolean));
const hasCjk = (value = "") => /[\u3400-\u9fff]/u.test(String(value));
const nativeCjkConferenceRecords = conferenceRecords.filter(
  (paper) => hasCjk(paper.title) || hasCjk(paper.venue)
);
if (coverage.primaryCorpus?.records !== papers.length) {
  failures.push("coverage: primary corpus count does not match publication data");
}
if (coverage.conferenceAudit?.conferenceRecords !== conferenceRecords.length) {
  failures.push("coverage: conference record count does not match publication data");
}
if (coverage.conferenceAudit?.conferenceVenues !== conferenceVenues.size) {
  failures.push("coverage: conference venue count does not match publication data");
}
if (coverage.conferenceAudit?.nativeCjkConferenceRecords !== nativeCjkConferenceRecords.length) {
  failures.push("coverage: native CJK conference count does not match publication data");
}
for (const signal of coverage.externalSignals || []) {
  if (!signal.source || !signal.display || !signal.verification || !signal.caveat) {
    failures.push("coverage: incomplete external discovery signal");
  }
}
for (const [name, url] of Object.entries(coverage.methodologyLinks || {})) {
  if (!url.startsWith("https://")) failures.push(`coverage: non-public methodology link "${name}"`);
}

for (const milestone of milestoneData.milestones || []) {
  if (!Number.isInteger(milestone.year)) failures.push(`milestone: invalid year for "${milestone.key}"`);
  if (milestone.firstYearCount !== milestone.records?.length) {
    failures.push(`milestone: first-year count mismatch for "${milestone.key}"`);
  }
  for (const record of milestone.records || []) {
    if (!paperIds.has(record.id)) failures.push(`milestone: unknown paper "${record.id}"`);
    for (const key of ["landing_url", "dblp_url"]) {
      if (record[key] && !record[key].startsWith("https://")) {
        failures.push(`milestone: non-public ${key} for "${record.id}"`);
      }
    }
  }
}

for (const figure of figureManifest.figures || []) {
  if (!figure.publicUrl?.startsWith("https://harzva.github.io/")) {
    failures.push(`figure: non-public URL for "${figure.slug}"`);
  }
  if (!figure.description) failures.push(`figure: missing description for "${figure.slug}"`);
}

if (failures.length) {
  console.error("Public safety check failed:");
  failures.slice(0, 50).forEach((failure) => console.error(`- ${failure}`));
  if (failures.length > 50) console.error(`- …and ${failures.length - 50} more`);
  process.exit(1);
}

console.log(`Public safety check passed for ${papers.length} publication records.`);
