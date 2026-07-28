import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const scriptDir = dirname(fileURLToPath(import.meta.url));
const root = resolve(scriptDir, "..");
const publicationsPath = resolve(root, "data/publications.json");
const outputPath = resolve(root, "data/milestones.json");

const DEFINITIONS = [
  {
    key: "career",
    label: "DBLP 语料起点",
    short: "Career record",
    kind: "career",
    match: () => true
  },
  {
    key: "tnn",
    label: "IEEE TNN / TNNLS 首篇",
    short: "TNN · TNNLS",
    kind: "journal",
    match: (paper) => /^IEEE Trans\. Neural Network/i.test(paper.venue)
  },
  {
    key: "pattern-recognition",
    label: "Pattern Recognition 首篇",
    short: "Pattern Recognition",
    kind: "journal",
    match: (paper) => paper.venue === "Pattern Recognit."
  },
  {
    key: "neurips",
    label: "NeurIPS / NIPS 首篇",
    short: "NeurIPS",
    kind: "conference",
    match: (paper) => /^(?:NeurIPS|NIPS)$/.test(paper.venue)
  },
  {
    key: "tevc",
    label: "IEEE TEVC 首篇",
    short: "IEEE TEVC",
    kind: "journal",
    match: (paper) => paper.venue === "IEEE Trans. Evol. Comput."
  },
  {
    key: "tip",
    label: "IEEE TIP 首篇",
    short: "IEEE TIP",
    kind: "journal",
    match: (paper) => paper.venue === "IEEE Trans. Image Process."
  },
  {
    key: "tgrs",
    label: "IEEE TGRS 首篇",
    short: "IEEE TGRS",
    kind: "journal",
    match: (paper) => paper.venue === "IEEE Trans. Geosci. Remote. Sens."
  },
  {
    key: "aaai",
    label: "AAAI 首篇",
    short: "AAAI",
    kind: "conference",
    featured: true,
    match: (paper) => paper.venue === "AAAI"
  },
  {
    key: "ijcai",
    label: "IJCAI 首篇",
    short: "IJCAI",
    kind: "conference",
    match: (paper) => paper.venue === "IJCAI"
  },
  {
    key: "iccv",
    label: "ICCV 主会首篇",
    short: "ICCV",
    kind: "conference",
    featured: true,
    match: (paper) => paper.venue === "ICCV"
  },
  {
    key: "acm-mm",
    label: "ACM MM 首篇",
    short: "ACM MM",
    kind: "conference",
    featured: true,
    match: (paper) => paper.venue === "ACM Multimedia"
  },
  {
    key: "eccv",
    label: "ECCV 首篇",
    short: "ECCV",
    kind: "conference",
    featured: true,
    match: (paper) => /^ECCV(?: \(\d+\))?$/.test(paper.venue)
  },
  {
    key: "tpami",
    label: "IEEE TPAMI 首篇",
    short: "IEEE TPAMI",
    kind: "journal",
    featured: true,
    match: (paper) => paper.venue === "IEEE Trans. Pattern Anal. Mach. Intell."
  },
  {
    key: "iclr",
    label: "ICLR 首篇",
    short: "ICLR",
    kind: "conference",
    match: (paper) => paper.venue === "ICLR"
  },
  {
    key: "cvpr",
    label: "CVPR 主会首年",
    short: "CVPR",
    kind: "conference",
    featured: true,
    match: (paper) => paper.venue === "CVPR"
  }
];

function publicRecord(paper) {
  return {
    id: paper.id,
    title: paper.title,
    authors: paper.authors,
    year: paper.year,
    venue: paper.venue,
    doi: paper.doi,
    landing_url: paper.landing_url,
    dblp_url: paper.dblp_url
  };
}

const publications = JSON.parse(await readFile(publicationsPath, "utf8"));
const milestones = DEFINITIONS.map((definition) => {
  const matches = publications
    .filter(definition.match)
    .sort((a, b) => a.year - b.year || a.title.localeCompare(b.title));
  if (!matches.length) return null;
  const year = matches[0].year;
  const firstYearRecords = matches
    .filter((paper) => paper.year === year)
    .map(publicRecord);
  return {
    key: definition.key,
    label: definition.label,
    short: definition.short,
    kind: definition.kind,
    featured: Boolean(definition.featured),
    year,
    firstYearCount: firstYearRecords.length,
    records: firstYearRecords
  };
})
  .filter(Boolean)
  .sort((a, b) => a.year - b.year || a.label.localeCompare(b.label));

await mkdir(dirname(outputPath), { recursive: true });
await writeFile(outputPath, `${JSON.stringify({
  generatedAt: new Date().toISOString().slice(0, 10),
  scope: "First appearance in the DBLP-anchored public corpus; not a claim about records outside this dataset.",
  milestones
}, null, 2)}\n`);

console.log(`Built ${milestones.length} corpus-scoped venue milestones.`);
