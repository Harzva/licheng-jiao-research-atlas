const LANG = document.documentElement.lang.toLocaleLowerCase().startsWith("en") ? "en" : "zh";
const LOCALE = LANG === "en" ? "en-US" : "zh-CN";
const APP_ROOT = new URL(".", document.querySelector('script[src*="app.js"]')?.src || window.location.href);
const COPY = {
  zh: {
    moreAuthors: "+{count} 位作者",
    unclassifiedTask: "待细分任务",
    citations: "Crossref 引用 {count}",
    missingVenue: "来源待补",
    dataVersion: "{date} · DBLP {count} 条",
    peakCount: "{count} 篇论文",
    citationCoverage: "高被引荧光 · Crossref 已匹配 {count}",
    citationLoading: "高被引荧光 · 引文数据更新中",
    timelineTitle: "{year} · {count} 篇",
    timelineAria: "筛选 {year} 年的 {count} 篇论文",
    firstYearCount: "首年收录 {count} 篇",
    firstRecord: "首篇记录",
    paperCount: "{count} 篇",
    view: "查看 ↗",
    milestoneFirst: "{venue} 首篇",
    allDomains: "全部领域",
    chooseDomain: "选择一个大领域，查看该领域下的研究任务。",
    allTasks: "全部任务 {count}",
    topicTasks: "{topic}研究任务",
    results: "找到 {count} 篇论文 · 当前显示 {visible} 篇",
    noPapers: "没有匹配论文。尝试缩短关键词或清除筛选。",
    jiaoName: "焦李成",
    noAuthors: "没有匹配作者",
    authorsFound: "找到 {count} 位作者",
    authorsSummary: "共 {count} 位合作作者 · 当前显示 {visible} 位",
    showTop: "仅看前12位",
    showAll: "显示全部 {count}",
    coauthored: "共同署名 {count} 篇",
    journalArticle: "期刊论文",
    conferencePaper: "会议论文",
    academicRecord: "学术记录",
    factVenue: "Venue / 来源",
    factPages: "Pages / 卷页",
    factPublisher: "Publisher / 出版方",
    factCitations: "Crossref citations / 引用",
    factAccess: "Access / 访问状态",
    unmatched: "未匹配",
    openAccess: "开放获取",
    publicationAvailable: "出版信息可用",
    missingAbstract: "暂未收录来源明确的摘要，请访问论文原始页面查看完整信息。",
    visitPaper: "访问论文页面 ↗",
    openPdf: "开放 PDF ↗",
    copyBib: "复制 BibTeX",
    copied: "已复制",
    copyFailed: "复制失败",
    loadFailed: "论文数据载入失败。请通过 Web 服务器访问本页面。",
    dataLoadFailed: "数据载入失败",
    sourceSnapshot: "外部发现规模，不可直接相加",
    primaryCorpus: "可复现主语料",
    primaryCorpusNote: "DBLP 身份锚定、字段白名单、版本化发布",
    scopusLabel: "用户提供的档案文献数",
    scopusNote: "用户提供的档案快照；待导出后进行身份与版本去重",
    baiduLabel: "约计检索成果",
    baiduNote: "用户提供的检索快照；可能混有重名、重复版本、书籍与学位成果",
    scholarLabel: "暂无可靠总数",
    scholarNote: "访问验证阻止稳定复现，不使用估算值",
    conferenceAudit: "会议覆盖审计",
    conferenceAuditSummary: "{records} 条会议记录 · {venues} 个会议来源",
    chineseConferenceGap: "中文会议缺口",
    chineseConferenceGapSummary: "当前原生中文会议元数据 {count} 条；中文题名记录 {titles} 条",
    coverageBoundary: "这些数字描述不同数据库的发现规模。只有完成作者身份消歧、文献类型统一和版本聚合后，才能形成唯一成果总数。"
  },
  en: {
    moreAuthors: "+{count} authors",
    unclassifiedTask: "Unclassified task",
    citations: "{count} Crossref citations",
    missingVenue: "Venue pending",
    dataVersion: "{date} · {count} DBLP records",
    peakCount: "{count} papers",
    citationCoverage: "High-impact glow · {count} Crossref matches",
    citationLoading: "High-impact glow · citation data updating",
    timelineTitle: "{year} · {count} papers",
    timelineAria: "Filter the {count} papers published in {year}",
    firstYearCount: "{count} records in first year",
    firstRecord: "First corpus record",
    paperCount: "{count} papers",
    view: "View ↗",
    milestoneFirst: "First {venue} appearance",
    allDomains: "All domains",
    chooseDomain: "Choose a broad domain to inspect its research tasks.",
    allTasks: "All tasks {count}",
    topicTasks: "{topic} research tasks",
    results: "{count} papers found · showing {visible}",
    noPapers: "No matching papers. Shorten the query or clear the filters.",
    jiaoName: "Licheng Jiao",
    noAuthors: "No matching coauthors",
    authorsFound: "{count} coauthors found",
    authorsSummary: "{count} coauthors · showing {visible}",
    showTop: "Show top 12",
    showAll: "Show all {count}",
    coauthored: "{count} coauthored papers",
    journalArticle: "Journal article",
    conferencePaper: "Conference paper",
    academicRecord: "Academic record",
    factVenue: "Venue",
    factPages: "Volume / pages",
    factPublisher: "Publisher",
    factCitations: "Crossref citations",
    factAccess: "Access status",
    unmatched: "Not matched",
    openAccess: "Open access",
    publicationAvailable: "Publication page available",
    missingAbstract: "No source-verified abstract is available yet. Open the publication page for the complete record.",
    visitPaper: "Open publication page ↗",
    openPdf: "Open PDF ↗",
    copyBib: "Copy BibTeX",
    copied: "Copied",
    copyFailed: "Copy failed",
    loadFailed: "Publication data could not be loaded. Access this page through a web server.",
    dataLoadFailed: "Data load failed",
    sourceSnapshot: "Discovery-scale signals — not additive",
    primaryCorpus: "Reproducible core corpus",
    primaryCorpusNote: "DBLP identity anchor, public field allowlist, and versioned release",
    scopusLabel: "Documents in supplied profile",
    scopusNote: "User-supplied profile snapshot; identity and version reconciliation remains pending",
    baiduLabel: "Approximate discovery results",
    baiduNote: "User-supplied search snapshot; may mix homonyms, duplicate versions, books, and theses",
    scholarLabel: "No stable total",
    scholarNote: "Access verification prevents a stable, reproducible total",
    conferenceAudit: "Conference audit",
    conferenceAuditSummary: "{records} conference records · {venues} venue labels",
    chineseConferenceGap: "Chinese-language gap",
    chineseConferenceGapSummary: "{count} native Chinese-language conference records; {titles} Chinese-title records",
    coverageBoundary: "These values describe discovery scale in different databases. A unique-work total requires author disambiguation, document-type normalization, and version aggregation."
  }
};

function t(key, values = {}) {
  const template = COPY[LANG][key] || key;
  return Object.entries(values).reduce(
    (text, [name, value]) => text.replaceAll(`{${name}}`, String(value)),
    template
  );
}

const TOPICS = {
  frontier: {
    label: LANG === "en" ? "Foundation models and multimodality" : "基础模型与多模态",
    short: "Frontier AI",
    color: "#55dce0",
    description: LANG === "en"
      ? "Transformers, vision-language models, prompting, Mamba, diffusion, and generative learning."
      : "Transformer、视觉语言、提示学习、Mamba、扩散模型与生成式学习。"
  },
  remote: {
    label: LANG === "en" ? "Remote-sensing intelligence" : "遥感智能解译",
    short: "Remote sensing",
    color: "#e1b75d",
    description: LANG === "en"
      ? "Classification, detection, and change analysis for SAR, PolSAR, hyperspectral, satellite, and aerial imagery."
      : "SAR、极化遥感、高光谱、卫星与航空影像的分类、检测及变化分析。"
  },
  vision: {
    label: LANG === "en" ? "Visual perception and understanding" : "视觉感知与理解",
    short: "Visual perception",
    color: "#ee8e78",
    description: LANG === "en"
      ? "Object detection, tracking, segmentation, recognition, image classification, and scene understanding."
      : "目标检测、跟踪、分割、识别、图像分类与场景理解。"
  },
  evolution: {
    label: LANG === "en" ? "Evolutionary and intelligent optimization" : "进化与智能优化",
    short: "Evolutionary optimization",
    color: "#a7d48b",
    description: LANG === "en"
      ? "Evolutionary computation, multiobjective optimization, swarm intelligence, and complex search."
      : "进化计算、多目标优化、群体智能与复杂优化方法。"
  },
  learning: {
    label: LANG === "en" ? "Neural and machine learning" : "神经与机器学习",
    short: "Neural learning",
    color: "#a998e4",
    description: LANG === "en"
      ? "Neural networks, deep learning, transfer learning, graph learning, and few-shot learning."
      : "神经网络、深度学习、迁移学习、图学习与小样本学习。"
  },
  imaging: {
    label: LANG === "en" ? "Signal and computational imaging" : "信号与计算成像",
    short: "Computational imaging",
    color: "#8ebad8",
    description: LANG === "en"
      ? "Wavelets, sparse representation, image fusion, reconstruction, restoration, and super-resolution."
      : "小波、稀疏表示、图像融合、重建、恢复与超分辨率。"
  },
  general: {
    label: LANG === "en" ? "Interdisciplinary methods and applications" : "交叉方法与应用",
    short: "Interdisciplinary",
    color: "#9fb5b3",
    description: LANG === "en"
      ? "Cross-domain methods, system applications, and records awaiting finer semantic clustering."
      : "跨方向方法、系统应用与尚待进一步语义聚类的研究工作。"
  }
};

let TASKS = {};

const state = {
  papers: [],
  atlas: null,
  milestones: null,
  citations: null,
  coverage: null,
  filtered: [],
  topic: "",
  task: "",
  year: "",
  type: "",
  query: "",
  visible: 24,
  coauthorQuery: "",
  coauthorShowAll: false,
  graph: { scale: 1, x: 0, y: 0, dragging: false, startX: 0, startY: 0 },
  heroPoints: [],
  paperPoints: [],
  coauthorPoints: []
};

const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => [...document.querySelectorAll(selector)];
const escapeHtml = (value = "") => String(value).replace(/[&<>"']/g, (char) => ({
  "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;"
}[char]));

function splitAuthors(value = "") {
  return String(value).split(/\s*;\s*/).map((name) => name.trim()).filter(Boolean);
}

function isJiaoName(value = "") {
  const normalized = String(value).toLocaleLowerCase().replace(/[.\s-]/g, "");
  return normalized === "lichengjiao"
    || normalized === "ljiao"
    || normalized === "jiaolicheng"
    || normalized.includes("焦李成");
}

function formatAuthorsHtml(value = "", limit = Infinity) {
  const authors = splitAuthors(value);
  const shown = authors.slice(0, limit);
  const content = shown.map((name, index) => {
    const classes = ["author-name"];
    if (index === 0) classes.push("first-author");
    if (isJiaoName(name)) classes.push("jiao-author");
    const role = index === 0 ? '<b class="author-role">1st</b>' : "";
    return `<span class="${classes.join(" ")}">${role}${escapeHtml(name)}</span>`;
  }).join('<span class="author-separator" aria-hidden="true">·</span>');
  const remainder = authors.length - shown.length;
  return remainder > 0
    ? `${content}<span class="author-remainder">${t("moreAuthors", { count: formatNumber(remainder) })}</span>`
    : content;
}

function taskMeta(paperOrKey) {
  const key = typeof paperOrKey === "string" ? paperOrKey : paperOrKey?.task;
  const topicKey = typeof paperOrKey === "string"
    ? TASKS[key]?.topic
    : paperOrKey?.topic;
  return TASKS[key] || {
    key: key || "unclassified",
    topic: topicKey || "general",
    label: t("unclassifiedTask"),
    short: "Unclassified task",
    color: TOPICS[topicKey]?.color || TOPICS.general.color
  };
}

function tasksForTopic(topicKey, includeEmpty = false) {
  return Object.values(TASKS)
    .filter((task) => task.topic === topicKey && (includeEmpty || (state.atlas.taskCounts[task.key] || 0) > 0))
    .sort((a, b) => (state.atlas.taskCounts[b.key] || 0) - (state.atlas.taskCounts[a.key] || 0));
}

const NODE_SHAPES = ["circle", "diamond", "triangle", "square", "hexagon", "cross", "ring"];

function taskVisual(taskKey) {
  const task = taskMeta(taskKey);
  const siblings = Object.values(TASKS).filter((item) => item.topic === task.topic);
  const index = Math.max(0, siblings.findIndex((item) => item.key === task.key));
  return {
    shape: NODE_SHAPES[index % NODE_SHAPES.length],
    opacity: .68 + (index % 4) * .09
  };
}

function normalizeDoi(value = "") {
  return String(value)
    .trim()
    .toLocaleLowerCase()
    .replace(/^https?:\/\/(?:dx\.)?doi\.org\//, "");
}

function percentile(values, ratio) {
  if (!values.length) return Infinity;
  const sorted = [...values].sort((a, b) => a - b);
  return sorted[Math.min(sorted.length - 1, Math.floor((sorted.length - 1) * ratio))];
}

function attachCitationData(citations) {
  state.citations = citations;
  const counts = citations?.counts || {};
  const byYear = new Map();
  state.papers.forEach((paper) => {
    const doi = normalizeDoi(paper.doi);
    const count = doi && Object.hasOwn(counts, doi) ? Number(counts[doi]) : null;
    paper.citation_count = Number.isFinite(count) ? count : null;
    if (paper.citation_count != null) {
      const values = byYear.get(paper.year) || [];
      values.push(paper.citation_count);
      byYear.set(paper.year, values);
    }
  });
  const thresholds = new Map([...byYear].map(([year, values]) => [year, {
    high: Math.max(5, percentile(values, .9)),
    landmark: Math.max(100, percentile(values, .99))
  }]));
  state.papers.forEach((paper) => {
    if (paper.citation_count == null) {
      paper.citation_level = "";
      return;
    }
    const threshold = thresholds.get(paper.year);
    paper.citation_level = paper.citation_count >= threshold.landmark
      ? "landmark"
      : paper.citation_count >= threshold.high || paper.citation_count >= 100
        ? "high"
        : "";
  });
}

function citationMarkup(paper) {
  if (paper.citation_count == null) return "";
  const level = paper.citation_level ? ` ${paper.citation_level}` : "";
  return `<span class="citation-badge${level}">${t("citations", { count: formatNumber(paper.citation_count) })}</span>`;
}

function drawCitationHalo(ctx, point, radius, graphScale) {
  if (!point.paper.citation_level) return;
  const landmark = point.paper.citation_level === "landmark";
  ctx.save();
  ctx.globalAlpha = landmark ? .95 : .72;
  ctx.strokeStyle = landmark ? "#f2ff78" : "#c7ff69";
  ctx.lineWidth = (landmark ? 1.35 : .9) / graphScale;
  ctx.shadowColor = "#c7ff69";
  ctx.shadowBlur = (landmark ? 18 : 11) / Math.sqrt(graphScale);
  ctx.beginPath();
  ctx.arc(point.x, point.y, radius * (landmark ? 3.15 : 2.45), 0, Math.PI * 2);
  ctx.stroke();
  if (landmark) {
    ctx.globalAlpha = .38;
    ctx.beginPath();
    ctx.arc(point.x, point.y, radius * 4.5, 0, Math.PI * 2);
    ctx.stroke();
  }
  ctx.restore();
}

function drawNodeShape(ctx, x, y, radius, shape) {
  ctx.beginPath();
  if (shape === "square") {
    ctx.rect(x - radius, y - radius, radius * 2, radius * 2);
  } else if (shape === "diamond") {
    ctx.moveTo(x, y - radius * 1.35);
    ctx.lineTo(x + radius * 1.35, y);
    ctx.lineTo(x, y + radius * 1.35);
    ctx.lineTo(x - radius * 1.35, y);
    ctx.closePath();
  } else if (shape === "triangle") {
    ctx.moveTo(x, y - radius * 1.45);
    ctx.lineTo(x + radius * 1.28, y + radius * .9);
    ctx.lineTo(x - radius * 1.28, y + radius * .9);
    ctx.closePath();
  } else if (shape === "hexagon") {
    for (let index = 0; index < 6; index += 1) {
      const angle = Math.PI / 3 * index - Math.PI / 2;
      const pointX = x + Math.cos(angle) * radius * 1.2;
      const pointY = y + Math.sin(angle) * radius * 1.2;
      if (!index) ctx.moveTo(pointX, pointY);
      else ctx.lineTo(pointX, pointY);
    }
    ctx.closePath();
  } else if (shape === "cross") {
    const arm = radius * .45;
    ctx.moveTo(x - arm, y - radius * 1.25);
    ctx.lineTo(x + arm, y - radius * 1.25);
    ctx.lineTo(x + arm, y - arm);
    ctx.lineTo(x + radius * 1.25, y - arm);
    ctx.lineTo(x + radius * 1.25, y + arm);
    ctx.lineTo(x + arm, y + arm);
    ctx.lineTo(x + arm, y + radius * 1.25);
    ctx.lineTo(x - arm, y + radius * 1.25);
    ctx.lineTo(x - arm, y + arm);
    ctx.lineTo(x - radius * 1.25, y + arm);
    ctx.lineTo(x - radius * 1.25, y - arm);
    ctx.lineTo(x - arm, y - arm);
    ctx.closePath();
  } else {
    ctx.arc(x, y, shape === "ring" ? radius * 1.18 : radius, 0, Math.PI * 2);
  }
  if (shape === "ring") {
    ctx.lineWidth = Math.max(.8, radius * .52);
    ctx.strokeStyle = ctx.fillStyle;
    ctx.stroke();
  } else {
    ctx.fill();
  }
}

function paperTooltipMarkup(paper) {
  const task = taskMeta(paper);
  return `
    <strong>${escapeHtml(paper.title)}</strong>
    <div class="tooltip-authors">${formatAuthorsHtml(paper.authors, 6)}</div>
    <div class="tooltip-meta">
      <span>${paper.year}</span>
      <span>${escapeHtml(paper.venue || t("missingVenue"))}</span>
    </div>
    <div class="tooltip-classification">
      <span class="tooltip-task" style="--task-color:${task.color}">${escapeHtml(task.label)}</span>
      ${citationMarkup(paper)}
    </div>
  `;
}

function formatNumber(value) {
  return new Intl.NumberFormat(LOCALE).format(value || 0);
}

function hash(value) {
  let h = 2166136261;
  const text = String(value);
  for (let i = 0; i < text.length; i += 1) {
    h ^= text.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return (h >>> 0) / 4294967295;
}

function withCanvasSize(canvas) {
  const rect = canvas.getBoundingClientRect();
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const width = Math.max(1, Math.round(rect.width));
  const height = Math.max(1, Math.round(rect.height));
  if (canvas.width !== Math.round(width * dpr) || canvas.height !== Math.round(height * dpr)) {
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
  }
  const context = canvas.getContext("2d");
  context.setTransform(dpr, 0, 0, dpr, 0, 0);
  return { context, width, height };
}

function buildHeroLegend() {
  $("#heroLegend").innerHTML = Object.entries(TOPICS)
    .filter(([key]) => key !== "general")
    .map(([, topic]) => `<span style="--swatch:${topic.color}">${topic.label}</span>`)
    .join("");
}

function drawHero() {
  const canvas = $("#heroAtlas");
  const { context: ctx, width, height } = withCanvasSize(canvas);
  const centerX = width * 0.5;
  const centerY = height * 0.5;
  const maxRadius = Math.min(width, height) * 0.43;
  const minYear = state.atlas.minYear;
  const yearSpan = Math.max(1, state.atlas.maxYear - minYear);
  const topicKeys = Object.keys(TOPICS);
  ctx.clearRect(0, 0, width, height);
  state.heroPoints = [];

  ctx.save();
  ctx.strokeStyle = "rgba(142, 198, 197, .09)";
  ctx.lineWidth = 1;
  [0.28, 0.49, 0.7, 0.91].forEach((ratio) => {
    ctx.beginPath();
    ctx.arc(centerX, centerY, maxRadius * ratio, 0, Math.PI * 2);
    ctx.stroke();
  });
  ctx.restore();

  const stride = state.papers.length > 1150 ? 2 : 1;
  for (let index = 0; index < state.papers.length; index += 1) {
    const paper = state.papers[index];
    if (index % stride && !paper.citation_level) continue;
    const topicIndex = Math.max(0, topicKeys.indexOf(paper.topic));
    const sector = (Math.PI * 2) / topicKeys.length;
    const angle = -Math.PI / 2 + topicIndex * sector + (hash(paper.id) - 0.5) * sector * 0.78;
    const normalizedYear = (paper.year - minYear) / yearSpan;
    const radius = maxRadius * (0.16 + normalizedYear * 0.78 + (hash(paper.title) - 0.5) * 0.05);
    const x = centerX + Math.cos(angle) * radius;
    const y = centerY + Math.sin(angle) * radius;
    const task = taskMeta(paper);
    const pointSize = paper.oa_confirmed === "是" ? 2.2 : 1.35;
    drawCitationHalo(ctx, { x, y, paper }, pointSize, 1);
    ctx.fillStyle = task.color;
    ctx.globalAlpha = paper.year >= 2020 ? 0.82 : 0.48;
    ctx.beginPath();
    ctx.arc(x, y, pointSize, 0, Math.PI * 2);
    ctx.fill();
    state.heroPoints.push({ x, y, paper, radius: 8 });
  }
  ctx.globalAlpha = 1;
}

function nearestPoint(points, x, y, threshold = 12) {
  let best = null;
  let distance = threshold;
  for (const point of points) {
    const d = Math.hypot(point.x - x, point.y - y);
    if (d < distance) {
      best = point;
      distance = d;
    }
  }
  return best;
}

function showTooltip(element, point, x, y, container, content) {
  if (!point) {
    element.classList.remove("visible");
    return;
  }
  element.innerHTML = content;
  element.classList.add("visible");
  const containerRect = container.getBoundingClientRect();
  const tooltipWidth = element.offsetWidth || 360;
  const tooltipHeight = element.offsetHeight || 180;
  const left = Math.min(x + 14, containerRect.width - tooltipWidth - 8);
  const top = Math.min(y + 14, containerRect.height - tooltipHeight - 8);
  element.style.left = `${Math.max(8, left)}px`;
  element.style.top = `${Math.max(8, top)}px`;
}

function bindHeroInteraction() {
  const canvas = $("#heroAtlas");
  const tooltip = $("#heroTooltip");
  const stage = canvas.parentElement;
  canvas.addEventListener("pointermove", (event) => {
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    const point = nearestPoint(state.heroPoints, x, y, 10);
    showTooltip(
      tooltip,
      point,
      x,
      y,
      stage,
      point ? paperTooltipMarkup(point.paper) : ""
    );
  });
  canvas.addEventListener("pointerleave", () => tooltip.classList.remove("visible"));
  canvas.addEventListener("click", (event) => {
    const rect = canvas.getBoundingClientRect();
    const point = nearestPoint(state.heroPoints, event.clientX - rect.left, event.clientY - rect.top, 11);
    if (point) openPaper(point.paper);
  });
}

function renderStats() {
  $("#totalPapers").textContent = formatNumber(state.atlas.total);
  $("#yearRange").textContent = `${state.atlas.minYear}—${state.atlas.maxYear}`;
  $("#coauthorCount").textContent = formatNumber(state.atlas.coauthorCount);
  $("#venueCount").textContent = formatNumber(state.atlas.venueCount);
  $("#dataVersion").textContent = t("dataVersion", {
    date: state.atlas.generatedAt.slice(0, 10),
    count: formatNumber(state.atlas.total)
  });
  $("#peakYear").textContent = state.atlas.peakYear;
  $("#peakCount").textContent = t("peakCount", { count: formatNumber(state.atlas.peakCount) });
  const matched = state.citations?.coverage?.matched;
  $("#citationCoverage").textContent = matched
    ? t("citationCoverage", { count: formatNumber(matched) })
    : t("citationLoading");
}

function renderCoverage() {
  const coverage = state.coverage;
  const container = $("#coverageCards");
  const conference = $("#conferenceAudit");
  if (!coverage || !container || !conference) return;
  const [scopus, baidu, scholar] = coverage.externalSignals;
  const cards = [
    {
      source: "DBLP",
      value: formatNumber(coverage.primaryCorpus.records),
      label: t("primaryCorpus"),
      note: t("primaryCorpusNote"),
      tone: "verified"
    },
    {
      source: "Scopus",
      value: formatNumber(scopus.count),
      label: t("scopusLabel"),
      note: t("scopusNote"),
      tone: "external"
    },
    {
      source: LANG === "en" ? "Baidu Scholar" : "百度学术",
      value: `≈${formatNumber(baidu.count)}`,
      label: t("baiduLabel"),
      note: t("baiduNote"),
      tone: "external"
    },
    {
      source: "Google Scholar",
      value: "—",
      label: t("scholarLabel"),
      note: t("scholarNote"),
      tone: "pending"
    }
  ];
  container.innerHTML = cards.map((card, index) => `
    <article class="coverage-card ${card.tone}">
      <span>${String(index + 1).padStart(2, "0")} / ${escapeHtml(card.source)}</span>
      <strong>${escapeHtml(card.value)}</strong>
      <h3>${escapeHtml(card.label)}</h3>
      <p>${escapeHtml(card.note)}</p>
    </article>
  `).join("");
  const audit = coverage.conferenceAudit;
  conference.innerHTML = `
    <article>
      <span>${t("conferenceAudit")}</span>
      <strong>${formatNumber(audit.conferenceRecords)}</strong>
      <p>${t("conferenceAuditSummary", {
        records: formatNumber(audit.conferenceRecords),
        venues: formatNumber(audit.conferenceVenues)
      })}</p>
    </article>
    <article class="coverage-gap">
      <span>${t("chineseConferenceGap")}</span>
      <strong>${formatNumber(audit.nativeCjkConferenceRecords)}</strong>
      <p>${t("chineseConferenceGapSummary", {
        count: formatNumber(audit.nativeCjkConferenceRecords),
        titles: formatNumber(audit.cjkTitleRecords)
      })}</p>
    </article>
    <p>${t("coverageBoundary")}</p>
  `;
}

function renderTimeline() {
  const max = Math.max(...state.atlas.yearCounts.map((item) => item.count));
  $("#timelineChart").innerHTML = state.atlas.yearCounts.map((item) => {
    const dominant = item.dominantTopic || "general";
    const color = TOPICS[dominant]?.color || TOPICS.general.color;
    const height = Math.max(4, (item.count / max) * 100);
    return `<button
      class="year-bar${String(item.year) === state.year ? " active" : ""}"
      style="--height:${height};--bar-color:${color}"
      data-year="${item.year}"
      title="${t("timelineTitle", { year: item.year, count: formatNumber(item.count) })}"
      aria-label="${t("timelineAria", { year: item.year, count: formatNumber(item.count) })}"
    ></button>`;
  }).join("");

  $$(".year-bar").forEach((bar) => bar.addEventListener("click", () => {
    const year = bar.dataset.year;
    state.year = state.year === year ? "" : year;
    $("#yearFilter").value = state.year;
    applyFilters();
    renderTimeline();
    document.querySelector("#publications").scrollIntoView({ behavior: "smooth" });
  }));
}

function renderMilestones() {
  const milestones = state.milestones?.milestones || [];
  const featured = milestones.filter((milestone) => milestone.featured);
  const featuredContainer = $("#milestoneFeatured");
  const ledgerContainer = $("#milestoneLedger");
  if (!featuredContainer || !ledgerContainer || !milestones.length) return;

  featuredContainer.innerHTML = featured.map((milestone) => {
    const primary = milestone.records[0];
    const countLabel = milestone.firstYearCount > 1
      ? t("firstYearCount", { count: formatNumber(milestone.firstYearCount) })
      : t("firstRecord");
    return `
      <button class="milestone-card" type="button" data-paper-id="${escapeHtml(primary.id)}">
        <span class="milestone-year">${milestone.year}</span>
        <span class="milestone-venue">${escapeHtml(milestone.short)}</span>
        <strong>${escapeHtml(primary.title)}</strong>
        <span class="milestone-authors">${formatAuthorsHtml(primary.authors, 4)}</span>
        <small>${countLabel} · ${escapeHtml(primary.venue)}</small>
      </button>
    `;
  }).join("");

  ledgerContainer.innerHTML = milestones.map((milestone, index) => {
    const primary = milestone.records[0];
    const label = LANG === "en"
      ? t("milestoneFirst", { venue: milestone.short })
      : milestone.label;
    return `
      <button type="button" data-paper-id="${escapeHtml(primary.id)}">
        <span class="milestone-index">${String(index + 1).padStart(2, "0")}</span>
        <time datetime="${milestone.year}">${milestone.year}</time>
        <span>
          <strong>${escapeHtml(label)}</strong>
          <small>${escapeHtml(primary.title)}</small>
        </span>
        <b>${milestone.firstYearCount > 1
          ? t("paperCount", { count: formatNumber(milestone.firstYearCount) })
          : t("view")}</b>
      </button>
    `;
  }).join("");

  $$("[data-paper-id]").forEach((button) => button.addEventListener("click", () => {
    const paper = state.papers.find((item) => item.id === button.dataset.paperId);
    if (paper) openPaper(paper);
  }));
}

function renderTopicFilters() {
  const allButton = `<button type="button" class="${state.topic ? "" : "active"}" data-topic="" style="--topic-color:#55dce0"><i></i>${t("allDomains")}</button>`;
  const topicButtons = Object.entries(TOPICS).map(([key, topic]) => {
    const count = state.atlas.topicCounts[key] || 0;
    return `<button type="button" class="${state.topic === key ? "active" : ""}" data-topic="${key}" style="--topic-color:${topic.color}">
      <i></i>${topic.label} ${formatNumber(count)}
    </button>`;
  }).join("");
  $("#topicFilter").innerHTML = allButton + topicButtons;
  $$("#topicFilter button").forEach((button) => button.addEventListener("click", () => {
    state.topic = button.dataset.topic;
    state.task = "";
    state.visible = 24;
    renderTopicFilters();
    applyFilters();
  }));
  renderTaskFilters();
}

function renderTaskFilters() {
  const container = $("#taskFilter");
  if (!state.topic) {
    container.innerHTML = `<p class="task-filter-prompt">${t("chooseDomain")}</p>`;
    return;
  }
  const topic = TOPICS[state.topic] || TOPICS.general;
  const tasks = tasksForTopic(state.topic);
  const allButton = `
    <button type="button" class="${state.task ? "" : "active"}" data-task="" style="--task-color:${topic.color}">
      <i class="task-shape shape-circle"></i>${t("allTasks", { count: formatNumber(state.atlas.topicCounts[state.topic] || 0) })}
    </button>
  `;
  container.innerHTML = allButton + tasks.map((task) => {
    const visual = taskVisual(task.key);
    return `
    <button type="button" class="${state.task === task.key ? "active" : ""}" data-task="${task.key}" style="--task-color:${task.color}">
      <i class="task-shape shape-${visual.shape}"></i>${escapeHtml(task.label)} ${formatNumber(state.atlas.taskCounts[task.key] || 0)}
    </button>
  `;
  }).join("");
  $$("#taskFilter button").forEach((button) => button.addEventListener("click", () => {
    state.task = button.dataset.task;
    state.visible = 24;
    renderTaskFilters();
    applyFilters();
  }));
}

function renderTopicCards() {
  const entries = Object.entries(TOPICS)
    .map(([key, topic]) => ({ key, ...topic, count: state.atlas.topicCounts[key] || 0 }))
    .sort((a, b) => b.count - a.count);
  $("#topicCards").innerHTML = entries.map((topic, index) => `
    <article class="topic-card" style="--topic-color:${topic.color}">
      <span class="topic-number">T${String(index + 1).padStart(2, "0")} / ${topic.short}</span>
      <strong>${formatNumber(topic.count)}</strong>
      <h3>${topic.label}</h3>
      <p>${topic.description}</p>
      <div class="topic-spectrum" aria-hidden="true">
        ${tasksForTopic(topic.key).map((task) => `<i style="--task-color:${task.color}"></i>`).join("")}
      </div>
      <ul class="topic-task-list" aria-label="${escapeHtml(t("topicTasks", { topic: topic.label }))}">
        ${tasksForTopic(topic.key).map((task) => `
          <li style="--task-color:${task.color}">
            <span>${escapeHtml(task.label)}</span>
            <b>${formatNumber(state.atlas.taskCounts[task.key] || 0)}</b>
          </li>
        `).join("")}
      </ul>
    </article>
  `).join("");
}

function populateFilters() {
  const years = [...new Set(state.papers.map((paper) => paper.year))].sort((a, b) => b - a);
  $("#yearFilter").insertAdjacentHTML("beforeend", years.map((year) => `<option value="${year}">${year}</option>`).join(""));
}

function applyFilters() {
  const query = state.query.trim().toLocaleLowerCase();
  state.filtered = state.papers.filter((paper) => {
    if (state.topic && paper.topic !== state.topic) return false;
    if (state.task && paper.task !== state.task) return false;
    if (state.year && String(paper.year) !== state.year) return false;
    if (state.type && paper.pub_type !== state.type) return false;
    if (!query) return true;
    return [paper.title, paper.authors, paper.venue, paper.doi, paper.dblp_key]
      .join(" ")
      .toLocaleLowerCase()
      .includes(query);
  });
  state.filtered.sort((a, b) => b.year - a.year || a.title.localeCompare(b.title));
  renderPaperList();
  drawPaperGraph();
  $("#resultCount").textContent = t("results", {
    count: formatNumber(state.filtered.length),
    visible: formatNumber(Math.min(state.visible, state.filtered.length))
  });
}

function paperItem(paper) {
  const task = taskMeta(paper);
  const citationClass = paper.citation_level ? ` is-${paper.citation_level}` : "";
  return `<article class="paper-item${citationClass}" role="button" tabindex="0" data-id="${paper.id}" style="--topic-color:${task.color}">
    <time>${paper.year}<small>${escapeHtml(task.short)}</small></time>
    <div>
      <h3>${escapeHtml(paper.title)}</h3>
      <p class="paper-item-authors">${formatAuthorsHtml(paper.authors, 5)}</p>
      <p class="paper-item-venue">${escapeHtml(paper.venue || t("missingVenue"))} ${citationMarkup(paper)}</p>
    </div>
  </article>`;
}

function renderPaperList() {
  const visible = state.filtered.slice(0, state.visible);
  $("#paperList").innerHTML = visible.length
    ? visible.map(paperItem).join("")
    : `<p style="padding:48px 0;color:#789798">${t("noPapers")}</p>`;
  $("#loadMore").hidden = state.visible >= state.filtered.length;
  $$(".paper-item").forEach((item) => {
    const open = () => openPaper(state.papers.find((paper) => paper.id === item.dataset.id));
    item.addEventListener("click", open);
    item.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        open();
      }
    });
  });
}

function topicCell(topicKey, width, height) {
  const topicKeys = Object.keys(TOPICS);
  if (state.topic) {
    return {
      x: width * .05,
      y: height * .08,
      width: width * .9,
      height: height * .84,
      centerX: width * .5,
      centerY: height * .51
    };
  }
  const topicIndex = Math.max(0, topicKeys.indexOf(topicKey));
  const columns = 4;
  const rows = Math.ceil(topicKeys.length / columns);
  const cellWidth = width / columns;
  const cellHeight = height / rows;
  const x = cellWidth * (topicIndex % columns);
  const y = cellHeight * Math.floor(topicIndex / columns);
  return {
    x: x + cellWidth * .04,
    y: y + cellHeight * .06,
    width: cellWidth * .92,
    height: cellHeight * .88,
    centerX: x + cellWidth * .5,
    centerY: y + cellHeight * .52
  };
}

function taskClusterCenter(topicKey, taskKey, width, height) {
  const cell = topicCell(topicKey, width, height);
  const tasks = state.task
    ? tasksForTopic(topicKey).filter((task) => task.key === state.task)
    : tasksForTopic(topicKey);
  const taskIndex = Math.max(0, tasks.findIndex((task) => task.key === taskKey));
  if (tasks.length <= 1) return { x: cell.centerX, y: cell.centerY, cell };
  const angle = -Math.PI / 2 + (taskIndex / tasks.length) * Math.PI * 2;
  const orbitX = cell.width * (state.topic ? .31 : .28);
  const orbitY = cell.height * (state.topic ? .29 : .27);
  return {
    x: cell.centerX + Math.cos(angle) * orbitX,
    y: cell.centerY + Math.sin(angle) * orbitY,
    cell
  };
}

function graphCoordinates(paper, width, height) {
  const center = taskClusterCenter(paper.topic, paper.task, width, height);
  const yearPosition = (paper.year - state.atlas.minYear) / Math.max(1, state.atlas.maxYear - state.atlas.minYear);
  const maxRadius = Math.min(center.cell.width, center.cell.height) * (state.topic ? .105 : .073);
  const radius = 4 + yearPosition * maxRadius * (.66 + hash(paper.title) * .34);
  const angle = hash(paper.id) * Math.PI * 2;
  return {
    x: center.x + Math.cos(angle) * radius + (hash(paper.title) - .5) * maxRadius * .28,
    y: center.y + Math.sin(angle) * radius + (hash(paper.authors) - .5) * maxRadius * .28
  };
}

function drawPaperGraph() {
  const canvas = $("#paperGraph");
  const { context: ctx, width, height } = withCanvasSize(canvas);
  const graph = state.graph;
  ctx.clearRect(0, 0, width, height);
  ctx.save();
  ctx.translate(width / 2 + graph.x, height / 2 + graph.y);
  ctx.scale(graph.scale, graph.scale);
  ctx.translate(-width / 2, -height / 2);
  state.paperPoints = [];

  const papers = state.filtered.length > 1250
    ? state.filtered.filter((paper, index) => index % 2 === 0 || paper.citation_level)
    : state.filtered;
  const taskGroups = {};

  const visibleTopics = state.topic ? [[state.topic, TOPICS[state.topic]]] : Object.entries(TOPICS);
  ctx.lineWidth = .7 / graph.scale;
  visibleTopics.forEach(([topicKey, topic]) => {
    const cell = topicCell(topicKey, width, height);
    ctx.strokeStyle = `${topic.color}20`;
    ctx.strokeRect(cell.x, cell.y, cell.width, cell.height);
    ctx.beginPath();
    ctx.ellipse(cell.centerX, cell.centerY, cell.width * .36, cell.height * .31, 0, 0, Math.PI * 2);
    ctx.stroke();
  });

  papers.forEach((paper) => {
    const position = graphCoordinates(paper, width, height);
    const screenX = (position.x - width / 2) * graph.scale + width / 2 + graph.x;
    const screenY = (position.y - height / 2) * graph.scale + height / 2 + graph.y;
    const point = { ...position, screenX, screenY, paper };
    state.paperPoints.push(point);
    (taskGroups[paper.task] ||= []).push(point);
  });

  ctx.lineWidth = .6 / graph.scale;
  Object.entries(taskGroups).forEach(([taskKey, points]) => {
    const color = taskMeta(taskKey).color;
    ctx.strokeStyle = `${color}22`;
    points
      .sort((a, b) => a.paper.year - b.paper.year || a.paper.title.localeCompare(b.paper.title))
      .forEach((point, index) => {
        if (!index || index % 3) return;
        const previous = points[index - 1];
        ctx.beginPath();
        ctx.moveTo(previous.x, previous.y);
        ctx.lineTo(point.x, point.y);
        ctx.stroke();
      });
  });

  state.paperPoints.forEach((point) => {
    const task = taskMeta(point.paper);
    const visual = taskVisual(point.paper.task);
    const radius = (point.paper.oa_confirmed === "是" ? 2.7 : 1.8) / Math.sqrt(graph.scale);
    drawCitationHalo(ctx, point, radius, graph.scale);
    ctx.fillStyle = task.color;
    ctx.globalAlpha = visual.opacity * (point.paper.year >= 2020 ? 1 : .78);
    drawNodeShape(ctx, point.x, point.y, radius, visual.shape);
  });
  ctx.globalAlpha = 1;

  visibleTopics.forEach(([key, topic]) => {
    const cell = topicCell(key, width, height);
    ctx.fillStyle = `${topic.color}bb`;
    ctx.font = `600 ${10 / graph.scale}px SFMono-Regular, monospace`;
    ctx.textAlign = "left";
    ctx.fillText(topic.short.toUpperCase(), cell.x + 10 / graph.scale, cell.y + 18 / graph.scale);

    const taskLabels = tasksForTopic(key)
      .filter((task) => !state.task || task.key === state.task)
      .slice(0, state.topic ? Infinity : 4);
    taskLabels.forEach((task) => {
      const center = taskClusterCenter(key, task.key, width, height);
      const count = state.atlas.taskCounts[task.key] || 0;
      const label = `${task.label} · ${formatNumber(count)}`;
      const labelY = center.y - Math.min(cell.width, cell.height) * (state.topic ? .12 : .082);
      ctx.textAlign = "center";
      ctx.font = `500 ${8 / graph.scale}px SFMono-Regular, monospace`;
      ctx.lineWidth = 3 / graph.scale;
      ctx.strokeStyle = "rgba(6, 22, 31, .88)";
      ctx.strokeText(label, center.x, labelY);
      ctx.fillStyle = `${task.color}dd`;
      ctx.fillText(label, center.x, labelY);
    });
  });
  ctx.restore();
}

function bindPaperGraph() {
  const canvas = $("#paperGraph");
  const tooltip = $("#graphTooltip");
  const wrapper = canvas.parentElement;
  canvas.addEventListener("wheel", (event) => {
    event.preventDefault();
    const next = Math.min(3, Math.max(.65, state.graph.scale * (event.deltaY > 0 ? .9 : 1.1)));
    state.graph.scale = next;
    drawPaperGraph();
  }, { passive: false });
  canvas.addEventListener("pointerdown", (event) => {
    state.graph.dragging = true;
    state.graph.startX = event.clientX - state.graph.x;
    state.graph.startY = event.clientY - state.graph.y;
    canvas.setPointerCapture(event.pointerId);
  });
  canvas.addEventListener("pointermove", (event) => {
    const rect = canvas.getBoundingClientRect();
    if (state.graph.dragging) {
      state.graph.x = event.clientX - state.graph.startX;
      state.graph.y = event.clientY - state.graph.startY;
      drawPaperGraph();
      return;
    }
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    const point = nearestPoint(state.paperPoints.map((item) => ({ ...item, x: item.screenX, y: item.screenY })), x, y, 10);
    showTooltip(
      tooltip,
      point,
      x,
      y,
      wrapper,
      point ? paperTooltipMarkup(point.paper) : ""
    );
  });
  const stopDrag = () => { state.graph.dragging = false; };
  canvas.addEventListener("pointerup", stopDrag);
  canvas.addEventListener("pointercancel", stopDrag);
  canvas.addEventListener("pointerleave", () => {
    stopDrag();
    tooltip.classList.remove("visible");
  });
  canvas.addEventListener("click", (event) => {
    if (Math.abs(event.clientX - (state.graph.startX + state.graph.x)) > 5) return;
    const rect = canvas.getBoundingClientRect();
    const points = state.paperPoints.map((item) => ({ ...item, x: item.screenX, y: item.screenY }));
    const point = nearestPoint(points, event.clientX - rect.left, event.clientY - rect.top, 10);
    if (point) openPaper(point.paper);
  });
}

function drawCoauthors() {
  const canvas = $("#coauthorGraph");
  const { context: ctx, width, height } = withCanvasSize(canvas);
  const authors = state.atlas.topCoauthors.slice(0, width < 620 ? 22 : 36);
  const max = authors[0]?.count || 1;
  const centerX = width / 2;
  const centerY = height / 2;
  const maxRadius = Math.min(width, height) * .4;
  ctx.clearRect(0, 0, width, height);
  state.coauthorPoints = [];

  authors.forEach((author, index) => {
    const ring = index < 9 ? .46 : index < 22 ? .72 : .97;
    const offset = index < 9 ? 0 : index < 22 ? 9 : 22;
    const countInRing = index < 9 ? 9 : index < 22 ? 13 : Math.max(1, authors.length - 22);
    const angle = -Math.PI / 2 + ((index - offset) / countInRing) * Math.PI * 2;
    const radius = maxRadius * ring;
    const x = centerX + Math.cos(angle) * radius;
    const y = centerY + Math.sin(angle) * radius;
    const nodeRadius = 4 + Math.sqrt(author.count / max) * 15;
    ctx.strokeStyle = `rgba(22, 143, 157, ${.08 + .35 * author.count / max})`;
    ctx.lineWidth = .5 + 2.5 * author.count / max;
    ctx.beginPath();
    ctx.moveTo(centerX, centerY);
    ctx.lineTo(x, y);
    ctx.stroke();
    state.coauthorPoints.push({ x, y, radius: nodeRadius + 5, author });
  });

  state.coauthorPoints.forEach((point, index) => {
    ctx.fillStyle = index < 9 ? "#168f9d" : "#7ba8aa";
    ctx.beginPath();
    ctx.arc(point.x, point.y, point.radius - 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#213e43";
    ctx.font = `${index < 9 ? 10 : 8}px SFMono-Regular, monospace`;
    ctx.textAlign = "center";
    const name = point.author.name.length > 18 ? `${point.author.name.slice(0, 16)}…` : point.author.name;
    ctx.fillText(name, point.x, point.y + point.radius + 8);
  });

  ctx.fillStyle = "#071923";
  ctx.beginPath();
  ctx.arc(centerX, centerY, 48, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "#55dce0";
  ctx.lineWidth = 1.5;
  ctx.stroke();
  ctx.fillStyle = "#f7faf8";
  ctx.font = "500 22px Iowan Old Style, Georgia, serif";
  ctx.textAlign = "center";
  ctx.fillText(t("jiaoName"), centerX, centerY + 2);
  ctx.fillStyle = "#55dce0";
  ctx.font = "8px SFMono-Regular, monospace";
  ctx.fillText("L. JIAO", centerX, centerY + 20);
}

function renderCoauthorList() {
  const allAuthors = state.atlas.coauthors || state.atlas.topCoauthors;
  const query = state.coauthorQuery.trim().toLocaleLowerCase();
  const matches = query
    ? allAuthors.filter((author) => author.name.toLocaleLowerCase().includes(query))
    : allAuthors;
  const visibleAuthors = state.coauthorShowAll || query ? matches : matches.slice(0, 12);
  $("#coauthorList").innerHTML = visibleAuthors.length
    ? visibleAuthors.map((author, index) => `
    <li><span>${String(index + 1).padStart(2, "0")}</span><span>${escapeHtml(author.name)}</span><strong>${author.count}</strong></li>
  `).join("")
    : `<li><span>—</span><span>${t("noAuthors")}</span><strong>0</strong></li>`;
  $("#coauthorResult").textContent = query
    ? t("authorsFound", { count: formatNumber(matches.length) })
    : t("authorsSummary", {
      count: formatNumber(allAuthors.length),
      visible: formatNumber(visibleAuthors.length)
    });
  $("#coauthorToggle").textContent = state.coauthorShowAll
    ? t("showTop")
    : t("showAll", { count: formatNumber(allAuthors.length) });
}

function bindCoauthorInteraction() {
  const canvas = $("#coauthorGraph");
  const tooltip = $("#coauthorTooltip");
  const wrapper = canvas.parentElement;
  canvas.addEventListener("pointermove", (event) => {
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    const point = nearestPoint(state.coauthorPoints, x, y, 28);
    showTooltip(
      tooltip,
      point,
      x,
      y,
      wrapper,
      point
        ? `<strong>${escapeHtml(point.author.name)}</strong><small>${t("coauthored", { count: formatNumber(point.author.count) })}</small>`
        : ""
    );
  });
  canvas.addEventListener("pointerleave", () => tooltip.classList.remove("visible"));
}

function fact(label, value) {
  return `<div><dt>${label}</dt><dd>${escapeHtml(value || "—")}</dd></div>`;
}

function bibtexValue(value = "") {
  return String(value)
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
  const fallbackKey = paper.id || `Jiao${paper.year}`;
  const rawKey = paper.dblp_key?.split("/").at(-1) || fallbackKey;
  const key = rawKey.replace(/[^A-Za-z0-9:_-]/g, "") || fallbackKey;
  const fields = [
    ["title", paper.title],
    ["author", paper.authors.split(/\s*;\s*/).join(" and ")],
    ["year", paper.year]
  ];
  if (paper.venue) fields.push([type === "article" ? "journal" : type === "inproceedings" ? "booktitle" : "howpublished", paper.venue]);
  if (paper.volume_pages) fields.push(["note", paper.volume_pages]);
  if (paper.doi) fields.push(["doi", paper.doi]);
  if (paper.landing_url || paper.dblp_url) fields.push(["url", paper.landing_url || paper.dblp_url]);
  const body = fields
    .filter(([, value]) => value !== "" && value != null)
    .map(([name, value]) => `  ${name} = {${bibtexValue(value)}}`)
    .join(",\n");
  return `@${type}{${key},\n${body}\n}`;
}

function openPaper(paper) {
  if (!paper) return;
  const bibtex = buildBibtex(paper);
  const topic = TOPICS[paper.topic] || TOPICS.general;
  const task = taskMeta(paper);
  const publicationType = paper.pub_type === "article"
    ? t("journalArticle")
    : paper.pub_type === "inproceedings"
      ? t("conferencePaper")
      : t("academicRecord");
  $("#drawerMeta").textContent = `${paper.year} · ${topic.label} / ${task.label} · ${publicationType}`;
  $("#drawerTitle").textContent = paper.title;
  $("#drawerAuthors").innerHTML = formatAuthorsHtml(paper.authors);
  $("#drawerFacts").innerHTML = [
    fact(t("factVenue"), paper.venue),
    fact(t("factPages"), paper.volume_pages),
    fact("DOI", paper.doi),
    fact("DBLP Key", paper.dblp_key),
    fact(t("factPublisher"), paper.publisher_group),
    fact(t("factCitations"), paper.citation_count == null ? t("unmatched") : formatNumber(paper.citation_count)),
    fact(t("factAccess"), paper.access === "open" ? t("openAccess") : t("publicationAvailable"))
  ].join("");
  $("#drawerAbstract").textContent = paper.abstract || t("missingAbstract");
  const primary = paper.landing_url || paper.dblp_url;
  const actions = [];
  if (primary) actions.push(`<a href="${escapeHtml(primary)}" target="_blank" rel="noopener">${t("visitPaper")}</a>`);
  if (paper.direct_pdf_url) actions.push(`<a href="${escapeHtml(paper.direct_pdf_url)}" target="_blank" rel="noopener">${t("openPdf")}</a>`);
  if (paper.dblp_url && paper.dblp_url !== primary) actions.push(`<a href="${escapeHtml(paper.dblp_url)}" target="_blank" rel="noopener">DBLP ↗</a>`);
  actions.push(`<button type="button" id="copyBib">${t("copyBib")}</button>`);
  $("#drawerActions").innerHTML = actions.join("");
  $("#drawerBibtex").textContent = bibtex;
  $("#copyBib").addEventListener("click", async () => {
    try {
      await navigator.clipboard.writeText(bibtex);
      $("#copyBib").textContent = t("copied");
    } catch {
      $("#copyBib").textContent = t("copyFailed");
    }
  });
  const drawer = $("#paperDrawer");
  if (!drawer.open) drawer.showModal();
}

function bindControls() {
  let searchTimer;
  $("#paperSearch").addEventListener("input", (event) => {
    window.clearTimeout(searchTimer);
    searchTimer = window.setTimeout(() => {
      state.query = event.target.value;
      state.visible = 24;
      applyFilters();
    }, 120);
  });
  $("#yearFilter").addEventListener("change", (event) => {
    state.year = event.target.value;
    state.visible = 24;
    renderTimeline();
    applyFilters();
  });
  $("#typeFilter").addEventListener("change", (event) => {
    state.type = event.target.value;
    state.visible = 24;
    applyFilters();
  });
  $("#resetFilters").addEventListener("click", () => {
    state.topic = "";
    state.task = "";
    state.year = "";
    state.type = "";
    state.query = "";
    state.visible = 24;
    $("#paperSearch").value = "";
    $("#yearFilter").value = "";
    $("#typeFilter").value = "";
    renderTopicFilters();
    renderTimeline();
    applyFilters();
  });
  $("#loadMore").addEventListener("click", () => {
    state.visible += 24;
    renderPaperList();
    $("#resultCount").textContent = t("results", {
      count: formatNumber(state.filtered.length),
      visible: formatNumber(Math.min(state.visible, state.filtered.length))
    });
  });
  $("#coauthorSearch").addEventListener("input", (event) => {
    state.coauthorQuery = event.target.value;
    renderCoauthorList();
  });
  $("#coauthorToggle").addEventListener("click", () => {
    state.coauthorShowAll = !state.coauthorShowAll;
    renderCoauthorList();
    $(".coauthor-ranking").scrollTop = 0;
  });
  $("#drawerClose").addEventListener("click", () => $("#paperDrawer").close());
  $("#paperDrawer").addEventListener("click", (event) => {
    if (event.target === $("#paperDrawer")) $("#paperDrawer").close();
  });
}

async function init() {
  try {
    const [papersResponse, atlasResponse, citations, milestones, coverage] = await Promise.all([
      fetch(new URL("data/publications.json", APP_ROOT)),
      fetch(new URL("data/atlas.json", APP_ROOT)),
      fetch(new URL("data/citations.json", APP_ROOT))
        .then((response) => response.ok ? response.json() : null)
        .catch(() => null),
      fetch(new URL("data/milestones.json", APP_ROOT))
        .then((response) => response.ok ? response.json() : null)
        .catch(() => null),
      fetch(new URL("data/coverage.json", APP_ROOT))
        .then((response) => response.ok ? response.json() : null)
        .catch(() => null)
    ]);
    if (!papersResponse.ok || !atlasResponse.ok) throw new Error(t("dataLoadFailed"));
    state.papers = await papersResponse.json();
    state.atlas = await atlasResponse.json();
    state.milestones = milestones;
    state.coverage = coverage;
    TASKS = Object.fromEntries((state.atlas.tasks || []).map((task) => [task.key, {
      ...task,
      label: LANG === "en" ? task.short : task.label
    }]));
    attachCitationData(citations);
    state.filtered = [...state.papers];
    buildHeroLegend();
    renderStats();
    renderCoverage();
    renderTimeline();
    renderMilestones();
    renderTopicFilters();
    renderTopicCards();
    populateFilters();
    renderCoauthorList();
    bindControls();
    bindHeroInteraction();
    bindPaperGraph();
    bindCoauthorInteraction();
    applyFilters();
    drawHero();
    drawCoauthors();
    let resizeTimer;
    window.addEventListener("resize", () => {
      window.clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(() => {
        drawHero();
        drawPaperGraph();
        drawCoauthors();
      }, 120);
    });
  } catch (error) {
    console.error(error);
    $("#resultCount").textContent = t("loadFailed");
    $("#dataVersion").textContent = t("dataLoadFailed");
  }
}

init();
