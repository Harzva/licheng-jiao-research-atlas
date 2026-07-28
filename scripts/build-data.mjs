import { access, readFile, writeFile, mkdir } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const scriptDir = dirname(fileURLToPath(import.meta.url));
const projectDir = resolve(scriptDir, "..");
const sourcePath = resolve(process.cwd(), process.argv[2] || "source/publications.json");
const outputDir = resolve(projectDir, "data");

const TOPIC_RULES = [
  ["frontier", /\b(transformer|vision[- ]language|large language|foundation model|prompt|mamba|state space|diffusion|multimodal|multi-modal|caption|generative)\b/i],
  ["remote", /\b(remote sensing|sar\b|polsar|synthetic aperture|hyperspectral|multispectral|satellite|aerial|geoscience|land cover|change detection)\b/i],
  ["vision", /\b(object detection|tracking|segmentation|recognition|computer vision|image classification|scene classification|visual|image understanding|salient object)\b/i],
  ["evolution", /\b(evolutionary|optimization|genetic algorithm|particle swarm|multiobjective|multi-objective|many-objective|swarm intelligence|ant colony|memetic)\b/i],
  ["learning", /\b(neural network|deep learning|convolution|graph neural|machine learning|transfer learning|few-shot|zero-shot|semi-supervised|unsupervised|representation learning|incremental learning)\b/i],
  ["imaging", /\b(wavelet|contourlet|curvelet|image fusion|image restoration|super-resolution|reconstruction|sparse representation|compressed sensing|denoising|deblurring)\b/i]
];

function inferTopic(paper) {
  const text = `${paper.title || ""} ${paper.venue || ""}`;
  for (const [topic, pattern] of TOPIC_RULES) {
    if (pattern.test(text)) return topic;
  }
  return "general";
}

function cleanText(value = "") {
  return String(value)
    .replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/g, "")
    .trim();
}

function cleanAuthorName(value = "") {
  return cleanText(value).replace(/\s+\d{4}$/, "").trim();
}

function normalizedAuthors(value = "") {
  return String(value)
    .split(/\s*;\s*|\s+and\s+/i)
    .map(cleanAuthorName)
    .filter(Boolean);
}

function publicUrl(value = "") {
  const text = cleanText(value);
  if (!text) return "";
  try {
    const parsed = new URL(text);
    return parsed.protocol === "https:" ? parsed.href : "";
  } catch {
    return "";
  }
}

function bibtexValue(value = "") {
  return cleanText(value)
    .replaceAll("\\", "\\\\")
    .replaceAll("{", "\\{")
    .replaceAll("}", "\\}");
}

function buildBibtex(paper) {
  const type = paper.pub_type === "article"
    ? "article"
    : paper.pub_type === "inproceedings"
      ? "inproceedings"
      : paper.pub_type === "proceedings"
        ? "proceedings"
        : "misc";
  const fallbackKey = cleanText(paper.id || `Jiao${paper.year}`);
  const rawKey = cleanText(paper.bib_key || paper.dblp_key?.split("/").at(-1) || fallbackKey);
  const key = rawKey.replace(/[^A-Za-z0-9:_-]/g, "") || fallbackKey;
  const authors = normalizedAuthors(paper.authors).join(" and ");
  const landingUrl = publicUrl(paper.landing_url) || publicUrl(paper.dblp_url);
  const fields = [
    ["title", paper.title],
    ["author", authors],
    ["year", paper.year]
  ];
  if (paper.venue) fields.push([type === "article" ? "journal" : type === "inproceedings" ? "booktitle" : "howpublished", paper.venue]);
  if (paper.volume_pages) fields.push(["note", paper.volume_pages]);
  if (paper.doi) fields.push(["doi", paper.doi]);
  if (landingUrl) fields.push(["url", landingUrl]);
  const body = fields
    .filter(([, value]) => value !== "" && value != null)
    .map(([name, value]) => `  ${name} = {${bibtexValue(value)}}`)
    .join(",\n");
  return `@${type}{${key},\n${body}\n}`;
}

function isTargetAuthor(name) {
  const normalized = name.toLowerCase().replace(/[.\s-]/g, "");
  return normalized === "lichengjiao" || normalized === "ljiao" || normalized.includes("焦李成");
}

try {
  await access(sourcePath);
} catch {
  throw new Error(`Source catalog not found. Pass it explicitly: node scripts/build-data.mjs ./source/publications.json`);
}

const source = JSON.parse(await readFile(sourcePath, "utf8"));
const papers = source.map((paper) => {
  const openAccess = paper.oa_confirmed === "是";
  const authors = normalizedAuthors(paper.authors).join("; ");
  const sanitized = {
    id: cleanText(paper.id),
    title: cleanText(paper.title),
    authors,
    year: Number(paper.year),
    pub_type: cleanText(paper.pub_type),
    venue: cleanText(paper.venue),
    volume_pages: cleanText(paper.volume_pages),
    doi: cleanText(paper.doi),
    dblp_key: cleanText(paper.dblp_key),
    dblp_url: publicUrl(paper.dblp_url),
    landing_url: publicUrl(paper.landing_url) || publicUrl(paper.dblp_url),
    direct_pdf_url: openAccess ? publicUrl(paper.direct_pdf_url) : "",
    publisher_group: cleanText(paper.publisher_group),
    access: openAccess ? "open" : "landing",
    oa_confirmed: openAccess ? "是" : "否",
    topic: inferTopic(paper)
  };
  if (cleanText(paper.abstract)) sanitized.abstract = cleanText(paper.abstract);
  sanitized.bibtex = buildBibtex({ ...paper, ...sanitized });
  return sanitized;
});

const years = papers.map((paper) => paper.year).filter(Number.isFinite);
const yearMap = new Map();
const topicCounts = {};
const coauthorCounts = new Map();
const venues = new Set();

for (const paper of papers) {
  venues.add(paper.venue || "Unknown");
  topicCounts[paper.topic] = (topicCounts[paper.topic] || 0) + 1;
  const yearItem = yearMap.get(paper.year) || { year: paper.year, count: 0, topics: {} };
  yearItem.count += 1;
  yearItem.topics[paper.topic] = (yearItem.topics[paper.topic] || 0) + 1;
  yearMap.set(paper.year, yearItem);
  for (const author of normalizedAuthors(paper.authors)) {
    if (!isTargetAuthor(author)) {
      coauthorCounts.set(author, (coauthorCounts.get(author) || 0) + 1);
    }
  }
}

const yearCounts = [...yearMap.values()]
  .sort((a, b) => a.year - b.year)
  .map((item) => ({
    year: item.year,
    count: item.count,
    dominantTopic: Object.entries(item.topics).sort((a, b) => b[1] - a[1])[0]?.[0] || "general"
  }));
const peak = [...yearCounts].sort((a, b) => b.count - a.count)[0];
const coauthors = [...coauthorCounts.entries()]
  .map(([name, count]) => ({ name, count }))
  .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));
const topCoauthors = coauthors.slice(0, 80);

const atlas = {
  generatedAt: new Date().toISOString(),
  source: "DBLP author profile 40/3714 and DOI-linked public metadata",
  total: papers.length,
  minYear: Math.min(...years),
  maxYear: Math.max(...years),
  peakYear: peak.year,
  peakCount: peak.count,
  coauthorCount: coauthorCounts.size,
  venueCount: venues.size,
  topicCounts,
  yearCounts,
  coauthors,
  topCoauthors
};

await mkdir(outputDir, { recursive: true });
await Promise.all([
  writeFile(resolve(outputDir, "publications.json"), JSON.stringify(papers)),
  writeFile(resolve(outputDir, "atlas.json"), JSON.stringify(atlas, null, 2))
]);

console.log(`Built ${papers.length} publications, ${coauthorCounts.size} coauthors, ${venues.size} venues.`);
