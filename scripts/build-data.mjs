import { readFile, writeFile, mkdir } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const scriptDir = dirname(fileURLToPath(import.meta.url));
const projectDir = resolve(scriptDir, "..");
const sourcePath = resolve(projectDir, "..", "output", "jiao_full_catalog_20260717", "data", "publications_full.json");
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

function normalizedAuthors(value = "") {
  return String(value)
    .split(/\s*;\s*|\s+and\s+/i)
    .map((author) => author.trim().replace(/\s+\d{4}$/, ""))
    .filter(Boolean);
}

function isTargetAuthor(name) {
  const normalized = name.toLowerCase().replace(/[.\s-]/g, "");
  return normalized === "lichengjiao" || normalized === "ljiao" || normalized.includes("焦李成");
}

const source = JSON.parse(await readFile(sourcePath, "utf8"));
const papers = source.map((paper) => ({
  id: paper.id,
  title: paper.title,
  authors: paper.authors,
  year: Number(paper.year),
  pub_type: paper.pub_type,
  venue: paper.venue,
  volume_pages: paper.volume_pages,
  doi: paper.doi,
  dblp_key: paper.dblp_key,
  dblp_url: paper.dblp_url,
  landing_url: paper.landing_url,
  direct_pdf_url: paper.direct_pdf_url,
  local_pdf: paper.local_pdf,
  publisher_group: paper.publisher_group,
  access_status: paper.access_status,
  oa_confirmed: paper.oa_confirmed,
  source_url: paper.source_url,
  bibtex: paper.bibtex,
  topic: inferTopic(paper)
}));

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
const topCoauthors = [...coauthorCounts.entries()]
  .map(([name, count]) => ({ name, count }))
  .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name))
  .slice(0, 80);

const atlas = {
  generatedAt: new Date().toISOString(),
  source: "DBLP fixed PID 40/3714 via local canonical catalog",
  total: papers.length,
  minYear: Math.min(...years),
  maxYear: Math.max(...years),
  peakYear: peak.year,
  peakCount: peak.count,
  coauthorCount: coauthorCounts.size,
  venueCount: venues.size,
  topicCounts,
  yearCounts,
  topCoauthors
};

await mkdir(outputDir, { recursive: true });
await Promise.all([
  writeFile(resolve(outputDir, "publications.json"), JSON.stringify(papers)),
  writeFile(resolve(outputDir, "atlas.json"), JSON.stringify(atlas, null, 2))
]);

console.log(`Built ${papers.length} publications, ${coauthorCounts.size} coauthors, ${venues.size} venues.`);
