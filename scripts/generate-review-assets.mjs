import { execFileSync } from "node:child_process";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import QRCode from "qrcode";

const scriptDir = dirname(fileURLToPath(import.meta.url));
const root = resolve(scriptDir, "..");
const figureDir = resolve(root, "review/figures");
const qrDir = resolve(root, "review/qr");
const publicBase = "https://harzva.github.io/licheng-jiao-research-atlas/review/figures";
const magickFont = (() => {
  if (process.env.MAGICK_FONT) return process.env.MAGICK_FONT;
  try {
    return execFileSync("fc-match", ["-f", "%{file}", "Verdana"], { encoding: "utf8" }).trim();
  } catch {
    return "";
  }
})();

const [atlas, papers, citationData, milestoneData] = await Promise.all([
  readFile(resolve(root, "data/atlas.json"), "utf8").then(JSON.parse),
  readFile(resolve(root, "data/publications.json"), "utf8").then(JSON.parse),
  readFile(resolve(root, "data/citations.json"), "utf8").then(JSON.parse),
  readFile(resolve(root, "data/milestones.json"), "utf8").then(JSON.parse)
]);

await Promise.all([
  mkdir(figureDir, { recursive: true }),
  mkdir(qrDir, { recursive: true })
]);

const TOPICS = {
  remote: { label: "Remote sensing intelligence", color: "#e1b75d" },
  general: { label: "Interdisciplinary methods", color: "#9fb5b3" },
  evolution: { label: "Evolutionary optimization", color: "#a7d48b" },
  vision: { label: "Visual perception", color: "#ee8e78" },
  frontier: { label: "Frontier & multimodal models", color: "#55dce0" },
  learning: { label: "Neural & machine learning", color: "#a998e4" },
  imaging: { label: "Computational imaging", color: "#8ebad8" }
};

const FIGURES = [
  {
    slug: "research-program-framework",
    title: "A unified view of the research program",
    description: "Four interacting layers connect structure-aware representation, adaptive search, intelligent perception, and domain-grounded interpretation, with multimodal and foundation models as a contemporary convergence frontier.",
    svg: researchFrameworkSvg
  },
  {
    slug: "research-evolution-timeline",
    title: "Research evolution and first-venue milestones",
    description: "A four-phase timeline from 1998 to 2026 combines annual publication volume with the first appearance of selected journals and conferences in the DBLP-anchored corpus.",
    svg: evolutionSvg
  },
  {
    slug: "hierarchical-task-taxonomy",
    title: "Seven-domain, fine-task taxonomy",
    description: "The 1,827-record corpus is organized into seven broad domains and 48 observed fine-grained tasks using transparent title-level rules.",
    svg: taxonomySvg
  },
  {
    slug: "collaboration-constellation",
    title: "Collaboration constellation",
    description: "The twenty most frequent coauthor names in the corpus are ranked by record-level co-occurrence with Licheng Jiao.",
    svg: collaborationSvg
  },
  {
    slug: "citation-impact-landscape",
    title: "Crossref citation landscape",
    description: "Publication year is plotted against logarithmic Crossref Cited-by count. Cohort-relative high-impact papers and the most cited records are emphasized.",
    svg: impactSvg
  }
];

function escapeXml(value = "") {
  return String(value).replace(/[<>&"']/g, (char) => ({
    "<": "&lt;",
    ">": "&gt;",
    "&": "&amp;",
    '"': "&quot;",
    "'": "&apos;"
  })[char]);
}

function wrapText(text, width) {
  const words = String(text).split(/\s+/);
  const lines = [];
  let line = "";
  for (const word of words) {
    if (!line || `${line} ${word}`.length <= width) line = line ? `${line} ${word}` : word;
    else {
      lines.push(line);
      line = word;
    }
  }
  if (line) lines.push(line);
  return lines;
}

function textLines(lines, x, y, lineHeight, attrs = "") {
  return `<text x="${x}" y="${y}" ${attrs}>${lines.map((line, index) =>
    `<tspan x="${x}" dy="${index ? lineHeight : 0}">${escapeXml(line)}</tspan>`
  ).join("")}</text>`;
}

function svgShell({ width, height, title, description, body, dark = true }) {
  const background = dark ? "#071923" : "#f4f7f4";
  const foreground = dark ? "#eef5f2" : "#071923";
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" role="img" aria-labelledby="title desc">
  <title id="title">${escapeXml(title)}</title>
  <desc id="desc">${escapeXml(description)}</desc>
  <rect width="${width}" height="${height}" fill="${background}"/>
  <style>
    .sans{font-family:Verdana,sans-serif}
    .serif{font-family:Georgia,serif}
    .mono{font-family:Courier,monospace}
    .fg{fill:${foreground}}
    .muted{fill:${dark ? "#8da9a8" : "#607779"}}
  </style>
  <g fill="${foreground}">
    ${body}
  </g>
</svg>
`;
}

function researchFrameworkSvg(meta) {
  const layers = [
    {
      index: "01",
      title: "STRUCTURE-AWARE REPRESENTATION",
      color: "#8ebad8",
      text: "Wavelets · sparse coding · spectral–spatial structure · geometry · attention"
    },
    {
      index: "02",
      title: "ADAPTIVE SEARCH & OPTIMIZATION",
      color: "#a7d48b",
      text: "Evolutionary search · multiobjective optimization · transfer · architecture search"
    },
    {
      index: "03",
      title: "INTELLIGENT PERCEPTION",
      color: "#ee8e78",
      text: "Classification · detection · segmentation · tracking · registration · restoration"
    },
    {
      index: "04",
      title: "DOMAIN-GROUNDED INTERPRETATION",
      color: "#e1b75d",
      text: "SAR/PolSAR · hyperspectral imagery · change detection · aerial and satellite vision"
    }
  ];
  const cards = layers.map((layer, index) => {
    const y = 246 + index * 138;
    return `
      <g>
        <rect x="108" y="${y}" width="1010" height="108" rx="20" fill="${layer.color}" fill-opacity=".13" stroke="${layer.color}" stroke-opacity=".65"/>
        <rect x="108" y="${y}" width="12" height="108" rx="6" fill="${layer.color}"/>
        <text x="154" y="${y + 38}" class="mono" fill="${layer.color}" font-size="17" font-weight="700">${layer.index}</text>
        <text x="224" y="${y + 39}" class="sans fg" font-size="25" font-weight="700" letter-spacing="1.2">${escapeXml(layer.title)}</text>
        <text x="224" y="${y + 75}" class="sans muted" font-size="18">${escapeXml(layer.text)}</text>
      </g>`;
  }).join("");
  const arrows = [354, 492, 630].map((y) =>
    `<path d="M613 ${y}v28" stroke="#55dce0" stroke-width="2" stroke-dasharray="4 8"/><path d="M605 ${y + 22}l8 10 8-10" fill="none" stroke="#55dce0" stroke-width="2"/>`
  ).join("");
  const body = `
    <text x="108" y="92" class="mono" fill="#55dce0" font-size="17" font-weight="700" letter-spacing="3">FIGURE 01 · SYNTHESIS FRAMEWORK</text>
    ${textLines(wrapText(meta.title, 48), 108, 148, 58, 'class="serif fg" font-size="50" font-weight="500"')}
    <text x="108" y="216" class="sans muted" font-size="18">A recurring logic inferred from the 1998–2026 bibliographic landscape</text>
    ${cards}
    ${arrows}
    <g transform="translate(1192 246)">
      <circle cx="154" cy="218" r="152" fill="none" stroke="#55dce0" stroke-width="2"/>
      <circle cx="154" cy="218" r="124" fill="#55dce0" fill-opacity=".08" stroke="#55dce0" stroke-opacity=".36"/>
      <circle cx="154" cy="218" r="88" fill="#55dce0" fill-opacity=".12"/>
      <text x="154" y="184" text-anchor="middle" class="mono" fill="#55dce0" font-size="14" font-weight="700">CONVERGENCE FRONTIER</text>
      <text x="154" y="224" text-anchor="middle" class="serif fg" font-size="31">Multimodal &amp;</text>
      <text x="154" y="261" text-anchor="middle" class="serif fg" font-size="31">foundation models</text>
      <text x="154" y="302" text-anchor="middle" class="sans muted" font-size="15">Transformer · prompt · diffusion</text>
      <text x="154" y="327" text-anchor="middle" class="sans muted" font-size="15">state space · vision–language</text>
      <path d="M-68 218H-18" stroke="#55dce0" stroke-width="2"/>
      <path d="M-30 208l14 10-14 10" fill="none" stroke="#55dce0" stroke-width="2"/>
    </g>
    <text x="108" y="842" class="mono muted" font-size="14">Interpretation: methods and domains co-evolve; the frontier recombines rather than replaces earlier layers.</text>`;
  return svgShell({ width: 1600, height: 900, title: meta.title, description: meta.description, body });
}

function evolutionSvg(meta) {
  const years = atlas.yearCounts;
  const chartX = 112;
  const chartY = 520;
  const chartW = 1375;
  const chartH = 250;
  const max = Math.max(...years.map((item) => item.count));
  const xForYear = (year) => chartX + ((year - atlas.minYear) / (atlas.maxYear - atlas.minYear)) * chartW;
  const points = years.map((item) => {
    const x = xForYear(item.year);
    const y = chartY + chartH - (item.count / max) * chartH;
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  }).join(" ");
  const area = `${chartX},${chartY + chartH} ${points} ${chartX + chartW},${chartY + chartH}`;
  const phases = [
    { start: 1998, end: 2007, count: 179, label: "Neural & natural computation", color: "#8ebad8" },
    { start: 2008, end: 2014, count: 293, label: "Optimization meets imaging", color: "#a7d48b" },
    { start: 2015, end: 2020, count: 530, label: "Deep remote-sensing interpretation", color: "#e1b75d" },
    { start: 2021, end: 2026, count: 825, label: "Multimodal & foundation convergence", color: "#55dce0" }
  ];
  const phaseBlocks = phases.map((phase) => {
    const x = xForYear(phase.start);
    const endX = xForYear(phase.end + .82);
    const width = endX - x;
    return `
      <rect x="${x}" y="240" width="${width}" height="166" rx="18" fill="${phase.color}" fill-opacity=".12" stroke="${phase.color}" stroke-opacity=".5"/>
      <text x="${x + 22}" y="280" class="mono" fill="${phase.color}" font-size="16" font-weight="700">${phase.start}—${phase.end}</text>
      ${textLines(wrapText(phase.label, 27), x + 22, 319, 26, 'class="sans fg" font-size="20" font-weight="650"')}
      <text x="${x + 22}" y="380" class="serif" fill="${phase.color}" font-size="28">${phase.count} records</text>`;
  }).join("");
  const selected = new Set(["career", "tnn", "tevc", "tip", "tgrs", "aaai", "iccv", "acm-mm", "eccv", "tpami", "cvpr"]);
  const milestones = milestoneData.milestones.filter((item) => selected.has(item.key));
  const lanes = new Map();
  const milestoneMarks = milestones.map((item) => {
    const lane = lanes.get(item.year) || 0;
    lanes.set(item.year, lane + 1);
    const x = xForYear(item.year);
    const y = 454 - lane * 42;
    return `
      <line x1="${x}" y1="${y + 9}" x2="${x}" y2="${chartY + chartH}" stroke="#eef5f2" stroke-opacity=".2" stroke-dasharray="3 8"/>
      <circle cx="${x}" cy="${y}" r="7" fill="${item.kind === "journal" ? "#55dce0" : "#e1b75d"}"/>
      <text x="${x + 12}" y="${y + 5}" class="mono fg" font-size="13" font-weight="700">${escapeXml(item.short)}</text>`;
  }).join("");
  const body = `
    <text x="112" y="82" class="mono" fill="#55dce0" font-size="17" font-weight="700" letter-spacing="3">FIGURE 02 · LONGITUDINAL MAP</text>
    <text x="112" y="148" class="serif fg" font-size="50">${escapeXml(meta.title)}</text>
    <text x="112" y="188" class="sans muted" font-size="18">Annual output, four research phases, and corpus-scoped first appearances at selected venues</text>
    ${phaseBlocks}
    ${milestoneMarks}
    <polygon points="${area}" fill="#55dce0" fill-opacity=".12"/>
    <polyline points="${points}" fill="none" stroke="#55dce0" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
    ${years.filter((item) => item.year % 5 === 0 || item.year === atlas.minYear || item.year === atlas.maxYear).map((item) => {
      const x = xForYear(item.year);
      return `<line x1="${x}" y1="${chartY + chartH}" x2="${x}" y2="${chartY + chartH + 10}" stroke="#8da9a8"/><text x="${x}" y="${chartY + chartH + 34}" text-anchor="middle" class="mono muted" font-size="13">${item.year}</text>`;
    }).join("")}
    <text x="112" y="852" class="mono muted" font-size="13">Venue markers indicate first appearance in this DBLP-anchored corpus; same-year records are grouped.</text>`;
  return svgShell({ width: 1600, height: 900, title: meta.title, description: meta.description, body });
}

function taxonomySvg(meta) {
  const topicOrder = Object.entries(atlas.topicCounts).sort((a, b) => b[1] - a[1]).map(([key]) => key);
  const positions = [
    [85, 210, 390, 430], [475, 210, 390, 430], [865, 210, 390, 430], [1255, 210, 390, 430],
    [280, 675, 390, 430], [670, 675, 390, 430], [1060, 675, 390, 430]
  ];
  const cards = topicOrder.map((topicKey, index) => {
    const [x, y, width, height] = positions[index];
    const topic = TOPICS[topicKey];
    const tasks = atlas.tasks
      .filter((task) => task.topic === topicKey && (atlas.taskCounts[task.key] || 0) > 0)
      .sort((a, b) => (atlas.taskCounts[b.key] || 0) - (atlas.taskCounts[a.key] || 0));
    const taskRows = tasks.map((task, taskIndex) => {
      const rowY = y + 116 + taskIndex * 33;
      return `
        <circle cx="${x + 28}" cy="${rowY - 5}" r="6" fill="${task.color}"/>
        <text x="${x + 45}" y="${rowY}" class="sans fg" font-size="14">${escapeXml(task.short)}</text>
        <text x="${x + width - 24}" y="${rowY}" text-anchor="end" class="mono" fill="${task.color}" font-size="13" font-weight="700">${atlas.taskCounts[task.key] || 0}</text>`;
    }).join("");
    return `
      <g>
        <rect x="${x}" y="${y}" width="${width}" height="${height}" rx="18" fill="${topic.color}" fill-opacity=".07" stroke="${topic.color}" stroke-opacity=".5"/>
        <rect x="${x}" y="${y}" width="${width}" height="76" rx="18" fill="${topic.color}" fill-opacity=".16"/>
        <text x="${x + 24}" y="${y + 34}" class="mono" fill="${topic.color}" font-size="13" font-weight="700">${String(index + 1).padStart(2, "0")} · ${escapeXml(topicKey.toUpperCase())}</text>
        <text x="${x + 24}" y="${y + 63}" class="serif fg" font-size="23">${escapeXml(topic.label)}</text>
        <text x="${x + width - 24}" y="${y + 50}" text-anchor="end" class="serif" fill="${topic.color}" font-size="32">${atlas.topicCounts[topicKey]}</text>
        ${taskRows}
      </g>`;
  }).join("");
  const body = `
    <text x="85" y="80" class="mono" fill="#55dce0" font-size="17" font-weight="700" letter-spacing="3">FIGURE 03 · HIERARCHICAL TAXONOMY</text>
    <text x="85" y="146" class="serif fg" font-size="50">${escapeXml(meta.title)}</text>
    <text x="85" y="184" class="sans muted" font-size="18">Broad domains preserve the field structure; task colors encode finer research problems within each domain.</text>
    ${cards}
    <text x="85" y="1166" class="mono muted" font-size="13">Counts are single-label coordinates inferred from titles and venues; hybrid work may span multiple conceptual areas.</text>`;
  return svgShell({ width: 1800, height: 1200, title: meta.title, description: meta.description, body });
}

function percentile(values, ratio) {
  if (!values.length) return Number.POSITIVE_INFINITY;
  const sorted = [...values].sort((a, b) => a - b);
  return sorted[Math.min(sorted.length - 1, Math.floor((sorted.length - 1) * ratio))];
}

function impactSvg(meta) {
  const normalizedCounts = Object.fromEntries(Object.entries(citationData.counts || {}).map(([doi, count]) => [doi.toLowerCase(), count]));
  const cited = papers.map((paper) => ({
    ...paper,
    citations: normalizedCounts[String(paper.doi).toLowerCase()]
  })).filter((paper) => Number.isInteger(paper.citations));
  const byYear = new Map();
  for (const paper of cited) {
    const values = byYear.get(paper.year) || [];
    values.push(paper.citations);
    byYear.set(paper.year, values);
  }
  const thresholds = new Map([...byYear].map(([year, values]) => [year, {
    high: Math.max(5, percentile(values, .9)),
    landmark: Math.max(100, percentile(values, .99))
  }]));
  const chart = { x: 112, y: 220, w: 1040, h: 560 };
  const maxLog = Math.log10(Math.max(...cited.map((paper) => paper.citations)) + 1);
  const pointFor = (paper) => ({
    x: chart.x + ((paper.year - atlas.minYear) / (atlas.maxYear - atlas.minYear)) * chart.w,
    y: chart.y + chart.h - (Math.log10(paper.citations + 1) / maxLog) * chart.h
  });
  const dots = cited.map((paper) => {
    const point = pointFor(paper);
    const threshold = thresholds.get(paper.year);
    const landmark = paper.citations >= threshold.landmark;
    const high = landmark || paper.citations >= threshold.high || paper.citations >= 100;
    const color = TOPICS[paper.topic]?.color || TOPICS.general.color;
    return `<circle cx="${point.x.toFixed(2)}" cy="${point.y.toFixed(2)}" r="${landmark ? 7 : high ? 4.5 : 2.1}" fill="${high ? "#dfff70" : color}" fill-opacity="${high ? .9 : .25}"${landmark ? ' stroke="#ffffff" stroke-width="1.4"' : ""}/>`;
  }).join("");
  const top = [...cited].sort((a, b) => b.citations - a.citations).slice(0, 8);
  const labels = top.map((paper, index) => {
    const point = pointFor(paper);
    const labelY = 274 + index * 62;
    return `
      <path d="M${point.x.toFixed(1)} ${point.y.toFixed(1)} C1180 ${point.y.toFixed(1)}, 1180 ${labelY}, 1220 ${labelY}" fill="none" stroke="#dfff70" stroke-opacity=".35"/>
      <circle cx="1234" cy="${labelY}" r="5" fill="#dfff70"/>
      <text x="1252" y="${labelY - 6}" class="mono" fill="#dfff70" font-size="14" font-weight="700">${paper.citations.toLocaleString("en-US")} · ${paper.year}</text>
      ${textLines(wrapText(paper.title, 36).slice(0, 2), 1252, labelY + 17, 18, 'class="sans fg" font-size="13"')}`;
  }).join("");
  const yTicks = [0, 1, 10, 100, 1000].map((value) => {
    const y = chart.y + chart.h - (Math.log10(value + 1) / maxLog) * chart.h;
    return `<line x1="${chart.x}" y1="${y}" x2="${chart.x + chart.w}" y2="${y}" stroke="#8da9a8" stroke-opacity=".13"/><text x="${chart.x - 16}" y="${y + 5}" text-anchor="end" class="mono muted" font-size="12">${value}</text>`;
  }).join("");
  const body = `
    <text x="112" y="82" class="mono" fill="#55dce0" font-size="17" font-weight="700" letter-spacing="3">FIGURE 05 · IMPACT LANDSCAPE</text>
    <text x="112" y="148" class="serif fg" font-size="50">${escapeXml(meta.title)}</text>
    <text x="112" y="188" class="sans muted" font-size="18">${citationData.coverage.matched.toLocaleString("en-US")} DOI records matched · logarithmic y-axis · Crossref Cited-by snapshot ${citationData.updatedAt || citationData.generatedAt || atlas.generatedAt}</text>
    ${yTicks}
    ${[2000, 2005, 2010, 2015, 2020, 2025].map((year) => {
      const x = chart.x + ((year - atlas.minYear) / (atlas.maxYear - atlas.minYear)) * chart.w;
      return `<line x1="${x}" y1="${chart.y}" x2="${x}" y2="${chart.y + chart.h}" stroke="#8da9a8" stroke-opacity=".08"/><text x="${x}" y="${chart.y + chart.h + 30}" text-anchor="middle" class="mono muted" font-size="13">${year}</text>`;
    }).join("")}
    ${dots}
    ${labels}
    <circle cx="112" cy="842" r="6" fill="#dfff70"/><text x="128" y="847" class="sans muted" font-size="14">Cohort-relative high-impact layer</text>
    <circle cx="390" cy="842" r="3" fill="#55dce0" fill-opacity=".5"/><text x="406" y="847" class="sans muted" font-size="14">Other DOI-matched records</text>
    <text x="112" y="874" class="mono muted" font-size="12">Citation counts are dynamic and source-specific; fluorescence is not a claim of scientific quality.</text>`;
  return svgShell({ width: 1600, height: 900, title: meta.title, description: meta.description, body });
}

function collaborationSvg(meta) {
  const top = atlas.coauthors.slice(0, 20);
  const max = top[0].count;
  const rows = top.map((author, index) => {
    const column = index < 10 ? 0 : 1;
    const row = index % 10;
    const x = 112 + column * 742;
    const y = 246 + row * 57;
    const barWidth = (author.count / max) * 430;
    const color = column ? "#e1b75d" : "#55dce0";
    return `
      <text x="${x}" y="${y}" class="mono muted" font-size="12">${String(index + 1).padStart(2, "0")}</text>
      <text x="${x + 40}" y="${y}" class="sans fg" font-size="17">${escapeXml(author.name)}</text>
      <rect x="${x + 242}" y="${y - 15}" width="430" height="17" rx="8" fill="#ffffff" fill-opacity=".06"/>
      <rect x="${x + 242}" y="${y - 15}" width="${barWidth}" height="17" rx="8" fill="${color}" fill-opacity=".75"/>
      <text x="${x + 692}" y="${y}" text-anchor="end" class="serif" fill="${color}" font-size="21">${author.count}</text>`;
  }).join("");
  const body = `
    <text x="112" y="82" class="mono" fill="#55dce0" font-size="17" font-weight="700" letter-spacing="3">FIGURE 04 · COLLABORATION STRUCTURE</text>
    <text x="112" y="148" class="serif fg" font-size="50">${escapeXml(meta.title)}</text>
    <text x="112" y="188" class="sans muted" font-size="18">${atlas.coauthorCount.toLocaleString("en-US")} normalized coauthor names · bars show record-level co-occurrence, not contribution rank</text>
    ${rows}
    <line x1="796" y1="222" x2="796" y2="812" stroke="#8da9a8" stroke-opacity=".2"/>
    <text x="112" y="860" class="mono muted" font-size="13">Frequent collaboration reveals durable research groups spanning optimization, remote sensing, imaging, and visual learning.</text>`;
  return svgShell({ width: 1600, height: 900, title: meta.title, description: meta.description, body });
}

for (const figure of FIGURES) {
  const svgPath = resolve(figureDir, `${figure.slug}.svg`);
  const pngPath = resolve(figureDir, `${figure.slug}.png`);
  await writeFile(svgPath, figure.svg(figure));
  try {
    const args = magickFont ? ["-font", magickFont] : [];
    execFileSync("magick", [...args, "-density", "144", svgPath, pngPath], { stdio: "pipe" });
  } catch {
    console.warn(`ImageMagick conversion skipped for ${figure.slug}.svg`);
  }
  const publicUrl = `${publicBase}/${figure.slug}.svg`;
  await Promise.all([
    QRCode.toFile(resolve(qrDir, `${figure.slug}.svg`), publicUrl, {
      type: "svg",
      errorCorrectionLevel: "H",
      margin: 3,
      color: { dark: "#071923", light: "#f4f7f4" }
    }),
    QRCode.toFile(resolve(qrDir, `${figure.slug}.png`), publicUrl, {
      type: "png",
      errorCorrectionLevel: "H",
      margin: 3,
      width: 512,
      color: { dark: "#071923", light: "#f4f7f4" }
    })
  ]);
}

await writeFile(resolve(root, "review/figures/manifest.json"), `${JSON.stringify({
  generatedAt: new Date().toISOString().slice(0, 10),
  publicBase,
  figures: FIGURES.map(({ slug, title, description }) => ({
    slug,
    title,
    description,
    svg: `./${slug}.svg`,
    png: `./${slug}.png`,
    qrSvg: `../qr/${slug}.svg`,
    qrPng: `../qr/${slug}.png`,
    publicUrl: `${publicBase}/${slug}.svg`
  }))
}, null, 2)}\n`);

console.log(`Generated ${FIGURES.length} review figures with scannable QR assets.`);
