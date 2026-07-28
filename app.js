const TOPICS = {
  frontier: {
    label: "基础模型与多模态",
    short: "Frontier AI",
    color: "#55dce0",
    description: "Transformer、视觉语言、提示学习、Mamba、扩散模型与生成式学习。"
  },
  remote: {
    label: "遥感智能解译",
    short: "Remote sensing",
    color: "#e1b75d",
    description: "SAR、极化遥感、高光谱、卫星与航空影像的分类、检测及变化分析。"
  },
  vision: {
    label: "视觉感知与理解",
    short: "Visual perception",
    color: "#ee8e78",
    description: "目标检测、跟踪、分割、识别、图像分类与场景理解。"
  },
  evolution: {
    label: "进化与智能优化",
    short: "Evolutionary optimization",
    color: "#a7d48b",
    description: "进化计算、多目标优化、群体智能与复杂优化方法。"
  },
  learning: {
    label: "神经与机器学习",
    short: "Neural learning",
    color: "#a998e4",
    description: "神经网络、深度学习、迁移学习、图学习与小样本学习。"
  },
  imaging: {
    label: "信号与计算成像",
    short: "Computational imaging",
    color: "#8ebad8",
    description: "小波、稀疏表示、图像融合、重建、恢复与超分辨率。"
  },
  general: {
    label: "交叉方法与应用",
    short: "Interdisciplinary",
    color: "#9fb5b3",
    description: "跨方向方法、系统应用与尚待进一步语义聚类的研究工作。"
  }
};

const state = {
  papers: [],
  atlas: null,
  filtered: [],
  topic: "",
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

function formatNumber(value) {
  return new Intl.NumberFormat("zh-CN").format(value || 0);
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
  for (let index = 0; index < state.papers.length; index += stride) {
    const paper = state.papers[index];
    const topicIndex = Math.max(0, topicKeys.indexOf(paper.topic));
    const sector = (Math.PI * 2) / topicKeys.length;
    const angle = -Math.PI / 2 + topicIndex * sector + (hash(paper.id) - 0.5) * sector * 0.78;
    const normalizedYear = (paper.year - minYear) / yearSpan;
    const radius = maxRadius * (0.16 + normalizedYear * 0.78 + (hash(paper.title) - 0.5) * 0.05);
    const x = centerX + Math.cos(angle) * radius;
    const y = centerY + Math.sin(angle) * radius;
    const topic = TOPICS[paper.topic] || TOPICS.general;
    const pointSize = paper.oa_confirmed === "是" ? 2.2 : 1.35;
    ctx.fillStyle = topic.color;
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
  const containerRect = container.getBoundingClientRect();
  const left = Math.min(x + 14, containerRect.width - 326);
  const top = Math.min(y + 14, containerRect.height - 125);
  element.style.left = `${Math.max(8, left)}px`;
  element.style.top = `${Math.max(8, top)}px`;
  element.classList.add("visible");
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
      point ? `<strong>${escapeHtml(point.paper.title)}</strong><small>${point.paper.year} · ${escapeHtml(point.paper.venue || "未注明来源")}</small>` : ""
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
  $("#dataVersion").textContent = `${state.atlas.generatedAt.slice(0, 10)} · DBLP ${formatNumber(state.atlas.total)} 条`;
  $("#peakYear").textContent = state.atlas.peakYear;
  $("#peakCount").textContent = `${state.atlas.peakCount} 篇论文`;
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
      title="${item.year} · ${item.count} 篇"
      aria-label="筛选 ${item.year} 年的 ${item.count} 篇论文"
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

function renderTopicFilters() {
  const allButton = `<button type="button" class="${state.topic ? "" : "active"}" data-topic="" style="--topic-color:#55dce0"><i></i>全部主题</button>`;
  const topicButtons = Object.entries(TOPICS).map(([key, topic]) => {
    const count = state.atlas.topicCounts[key] || 0;
    return `<button type="button" class="${state.topic === key ? "active" : ""}" data-topic="${key}" style="--topic-color:${topic.color}">
      <i></i>${topic.label} ${formatNumber(count)}
    </button>`;
  }).join("");
  $("#topicFilter").innerHTML = allButton + topicButtons;
  $$("#topicFilter button").forEach((button) => button.addEventListener("click", () => {
    state.topic = button.dataset.topic;
    state.visible = 24;
    renderTopicFilters();
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
  $("#resultCount").textContent = `找到 ${formatNumber(state.filtered.length)} 篇论文 · 当前显示 ${Math.min(state.visible, state.filtered.length)} 篇`;
}

function paperItem(paper) {
  const topic = TOPICS[paper.topic] || TOPICS.general;
  return `<article class="paper-item" role="button" tabindex="0" data-id="${paper.id}" style="--topic-color:${topic.color}">
    <time>${paper.year}<small>${escapeHtml(topic.short)}</small></time>
    <div>
      <h3>${escapeHtml(paper.title)}</h3>
      <p>${escapeHtml(paper.authors)} · ${escapeHtml(paper.venue || "来源待补")}</p>
    </div>
  </article>`;
}

function renderPaperList() {
  const visible = state.filtered.slice(0, state.visible);
  $("#paperList").innerHTML = visible.length
    ? visible.map(paperItem).join("")
    : `<p style="padding:48px 0;color:#789798">没有匹配论文。尝试缩短关键词或清除筛选。</p>`;
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

function graphCoordinates(paper, width, height) {
  const topicKeys = Object.keys(TOPICS);
  const topicIndex = Math.max(0, topicKeys.indexOf(paper.topic));
  const columns = 4;
  const rows = Math.ceil(topicKeys.length / columns);
  const cellWidth = width / columns;
  const cellHeight = height / rows;
  const centerX = cellWidth * (topicIndex % columns + 0.5);
  const centerY = cellHeight * (Math.floor(topicIndex / columns) + 0.5);
  const yearPosition = (paper.year - state.atlas.minYear) / Math.max(1, state.atlas.maxYear - state.atlas.minYear);
  const radius = 18 + yearPosition * Math.min(cellWidth, cellHeight) * 0.36;
  const angle = hash(paper.id) * Math.PI * 2;
  return {
    x: centerX + Math.cos(angle) * radius + (hash(paper.title) - .5) * 18,
    y: centerY + Math.sin(angle) * radius + (hash(paper.authors) - .5) * 18
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
    ? state.filtered.filter((_, index) => index % 2 === 0)
    : state.filtered;
  const topicGroups = {};
  papers.forEach((paper) => {
    const position = graphCoordinates(paper, width, height);
    const screenX = (position.x - width / 2) * graph.scale + width / 2 + graph.x;
    const screenY = (position.y - height / 2) * graph.scale + height / 2 + graph.y;
    const point = { ...position, screenX, screenY, paper };
    state.paperPoints.push(point);
    (topicGroups[paper.topic] ||= []).push(point);
  });

  ctx.lineWidth = .6 / graph.scale;
  Object.entries(topicGroups).forEach(([topicKey, points]) => {
    const color = TOPICS[topicKey]?.color || TOPICS.general.color;
    ctx.strokeStyle = `${color}22`;
    points
      .sort((a, b) => a.paper.year - b.paper.year || a.paper.title.localeCompare(b.paper.title))
      .forEach((point, index) => {
        if (!index || index % 2) return;
        const previous = points[index - 1];
        ctx.beginPath();
        ctx.moveTo(previous.x, previous.y);
        ctx.lineTo(point.x, point.y);
        ctx.stroke();
      });
  });

  state.paperPoints.forEach((point) => {
    const topic = TOPICS[point.paper.topic] || TOPICS.general;
    const radius = (point.paper.oa_confirmed === "是" ? 2.7 : 1.8) / Math.sqrt(graph.scale);
    ctx.fillStyle = topic.color;
    ctx.globalAlpha = point.paper.year >= 2020 ? .92 : .58;
    ctx.beginPath();
    ctx.arc(point.x, point.y, radius, 0, Math.PI * 2);
    ctx.fill();
  });
  ctx.globalAlpha = 1;

  Object.entries(TOPICS).forEach(([key, topic], index) => {
    if (state.topic && state.topic !== key) return;
    const center = graphCoordinates({ topic: key, year: state.atlas.minYear, id: key, title: key, authors: key }, width, height);
    const columns = 4;
    const cellWidth = width / columns;
    const cellHeight = height / Math.ceil(Object.keys(TOPICS).length / columns);
    const x = cellWidth * (index % columns + .5);
    const y = cellHeight * (Math.floor(index / columns) + .5);
    ctx.fillStyle = `${topic.color}bb`;
    ctx.font = `${10 / graph.scale}px SFMono-Regular, monospace`;
    ctx.textAlign = "center";
    ctx.fillText(topic.short.toUpperCase(), x, y);
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
      point ? `<strong>${escapeHtml(point.paper.title)}</strong><small>${point.paper.year} · ${escapeHtml(TOPICS[point.paper.topic]?.label)}</small>` : ""
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
  ctx.fillText("焦李成", centerX, centerY + 2);
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
    : `<li><span>—</span><span>没有匹配作者</span><strong>0</strong></li>`;
  $("#coauthorResult").textContent = query
    ? `找到 ${formatNumber(matches.length)} 位作者`
    : `共 ${formatNumber(allAuthors.length)} 位合作作者 · 当前显示 ${formatNumber(visibleAuthors.length)} 位`;
  $("#coauthorToggle").textContent = state.coauthorShowAll ? "仅看前12位" : `显示全部 ${formatNumber(allAuthors.length)}`;
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
      point ? `<strong>${escapeHtml(point.author.name)}</strong><small>共同署名 ${point.author.count} 篇</small>` : ""
    );
  });
  canvas.addEventListener("pointerleave", () => tooltip.classList.remove("visible"));
}

function fact(label, value) {
  return `<div><dt>${label}</dt><dd>${escapeHtml(value || "—")}</dd></div>`;
}

function openPaper(paper) {
  if (!paper) return;
  const topic = TOPICS[paper.topic] || TOPICS.general;
  $("#drawerMeta").textContent = `${paper.year} · ${topic.label} · ${paper.pub_type === "article" ? "期刊论文" : paper.pub_type === "inproceedings" ? "会议论文" : "学术记录"}`;
  $("#drawerTitle").textContent = paper.title;
  $("#drawerAuthors").textContent = paper.authors;
  $("#drawerFacts").innerHTML = [
    fact("Venue / 来源", paper.venue),
    fact("Pages / 卷页", paper.volume_pages),
    fact("DOI", paper.doi),
    fact("DBLP Key", paper.dblp_key),
    fact("Publisher / 出版方", paper.publisher_group),
    fact("Access / 访问状态", paper.access === "open" ? "开放获取" : "出版信息可用")
  ].join("");
  $("#drawerAbstract").textContent = paper.abstract || "暂未收录来源明确的摘要，请访问论文原始页面查看完整信息。";
  const primary = paper.landing_url || paper.dblp_url;
  const actions = [];
  if (primary) actions.push(`<a href="${escapeHtml(primary)}" target="_blank" rel="noopener">访问论文页面 ↗</a>`);
  if (paper.direct_pdf_url) actions.push(`<a href="${escapeHtml(paper.direct_pdf_url)}" target="_blank" rel="noopener">开放 PDF ↗</a>`);
  if (paper.dblp_url && paper.dblp_url !== primary) actions.push(`<a href="${escapeHtml(paper.dblp_url)}" target="_blank" rel="noopener">DBLP ↗</a>`);
  actions.push(`<button type="button" id="copyBib">复制 BibTeX</button>`);
  $("#drawerActions").innerHTML = actions.join("");
  $("#drawerBibtex").textContent = paper.bibtex || "暂无 BibTeX";
  $("#copyBib").addEventListener("click", async () => {
    try {
      await navigator.clipboard.writeText(paper.bibtex || "");
      $("#copyBib").textContent = "已复制";
    } catch {
      $("#copyBib").textContent = "复制失败";
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
    $("#resultCount").textContent = `找到 ${formatNumber(state.filtered.length)} 篇论文 · 当前显示 ${Math.min(state.visible, state.filtered.length)} 篇`;
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
    const [papersResponse, atlasResponse] = await Promise.all([
      fetch("./data/publications.json"),
      fetch("./data/atlas.json")
    ]);
    if (!papersResponse.ok || !atlasResponse.ok) throw new Error("数据文件载入失败");
    state.papers = await papersResponse.json();
    state.atlas = await atlasResponse.json();
    state.filtered = [...state.papers];
    buildHeroLegend();
    renderStats();
    renderTimeline();
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
    $("#resultCount").textContent = "论文数据载入失败。请通过本地 Web 服务器访问本页面。";
    $("#dataVersion").textContent = "数据载入失败";
  }
}

init();
