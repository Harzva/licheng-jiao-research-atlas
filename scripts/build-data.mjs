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

const TASK_DEFINITIONS = [
  {
    key: "frontier_state_space",
    topic: "frontier",
    label: "状态空间与 Mamba",
    short: "State space · Mamba",
    color: "#38b9c8",
    pattern: /\b(mamba|state[- ]space|selective state)\b/i
  },
  {
    key: "frontier_foundation",
    topic: "frontier",
    label: "基础模型与预训练",
    short: "Foundation models",
    color: "#7ee9e7",
    pattern: /\b(foundation model|large language|pre[- ]?train|pretrained|pre-trained)\b/i
  },
  {
    key: "frontier_vlm_prompt",
    topic: "frontier",
    label: "视觉语言与提示学习",
    short: "Vision-language · Prompt",
    color: "#56dce0",
    pattern: /\b(vision[- ]language|visual[- ]language|language[- ]guided|prompt|text knowledge|text[- ]guided|referring)\b/i
  },
  {
    key: "frontier_generative",
    topic: "frontier",
    label: "生成式与扩散学习",
    short: "Generative · Diffusion",
    color: "#78cde4",
    pattern: /\b(diffusion|generative|generation|autoregress|world model|image synthesis|video editing)\b/i
  },
  {
    key: "frontier_multimodal",
    topic: "frontier",
    label: "多模态融合与理解",
    short: "Multimodal learning",
    color: "#3fc5d2",
    pattern: /\b(multimodal|multi-modal|cross-modal|cross modal|modality|vision and language)\b/i
  },
  {
    key: "frontier_transformer",
    topic: "frontier",
    label: "Transformer 与注意力",
    short: "Transformer · Attention",
    color: "#9bece8",
    pattern: /\b(transformer|attention)\b/i
  },
  {
    key: "frontier_architecture",
    topic: "frontier",
    label: "前沿模型架构",
    short: "Emerging architectures",
    color: "#279dab",
    fallback: true
  },

  {
    key: "remote_sar",
    topic: "remote",
    label: "SAR 与 PolSAR 解译",
    short: "SAR · PolSAR",
    color: "#f0c459",
    pattern: /\b(pol?SAR|synthetic aperture|radar image|radar target)\b/i
  },
  {
    key: "remote_hyperspectral",
    topic: "remote",
    label: "高光谱与多光谱",
    short: "Hyperspectral · Multispectral",
    color: "#f4d77f",
    pattern: /\b(hyperspectral|multispectral|spectral-spatial|spatial-spectral)\b/i
  },
  {
    key: "remote_change",
    topic: "remote",
    label: "遥感变化检测",
    short: "Change detection",
    color: "#d89b3e",
    pattern: /\b(change detection|change map|bi[- ]?temporal|bitemporal)\b/i
  },
  {
    key: "remote_caption",
    topic: "remote",
    label: "遥感图文理解",
    short: "Caption · Retrieval",
    color: "#f2bd86",
    pattern: /\b(caption|vision[- ]language|text[- ]guided|cross-modal retrieval|visual grounding|referring)\b/i
  },
  {
    key: "remote_detection",
    topic: "remote",
    label: "目标检测与跟踪",
    short: "Detection · Tracking",
    color: "#dbaa4b",
    pattern: /\b(object detection|target detection|ship detection|tracking|anomaly detection|salient object)\b/i
  },
  {
    key: "remote_registration",
    topic: "remote",
    label: "配准、融合与定位",
    short: "Registration · Fusion",
    color: "#f7df9d",
    pattern: /\b(registration|fusion|pansharpen|pan-sharpen|geo[- ]?locali[sz]ation|image matching)\b/i
  },
  {
    key: "remote_classification",
    topic: "remote",
    label: "地物分类与场景识别",
    short: "Classification · Mapping",
    color: "#c68b34",
    fallback: true
  },

  {
    key: "vision_detection",
    topic: "vision",
    label: "目标检测",
    short: "Object detection",
    color: "#f48c78",
    pattern: /\b(object detection|target detection|pedestrian detection|tiny object|small object)\b/i
  },
  {
    key: "vision_segmentation",
    topic: "vision",
    label: "图像分割",
    short: "Segmentation",
    color: "#ffad98",
    pattern: /\b(segmentation|segmenting|pixel-wise|pixelwise)\b/i
  },
  {
    key: "vision_tracking",
    topic: "vision",
    label: "目标跟踪与重识别",
    short: "Tracking · Re-ID",
    color: "#df6f68",
    pattern: /\b(tracking|tracker|re-identification|reid|re-id)\b/i
  },
  {
    key: "vision_matching",
    topic: "vision",
    label: "匹配、定位与检索",
    short: "Matching · Localization",
    color: "#d87f97",
    pattern: /\b(matching|locali[sz]ation|retrieval|place recognition|geo[- ]?location)\b/i
  },
  {
    key: "vision_medical",
    topic: "vision",
    label: "医学视觉",
    short: "Medical vision",
    color: "#f2b28d",
    pattern: /\b(medical|lesion|tumou?r|organ|disease|ultrasound|histopath|retinal|brain image)\b/i
  },
  {
    key: "vision_video",
    topic: "vision",
    label: "视频与行为理解",
    short: "Video understanding",
    color: "#e45f55",
    pattern: /\b(video|action recognition|motion|temporal)\b/i
  },
  {
    key: "vision_recognition",
    topic: "vision",
    label: "分类与视觉识别",
    short: "Recognition · Classification",
    color: "#ff9a79",
    fallback: true
  },

  {
    key: "evolution_multiobjective",
    topic: "evolution",
    label: "多目标与多目标优化",
    short: "Multiobjective optimization",
    color: "#a8d779",
    pattern: /\b(multi[- ]?objective|many[- ]?objective|pareto|nondominated|non-dominated)\b/i
  },
  {
    key: "evolution_nas",
    topic: "evolution",
    label: "神经架构搜索",
    short: "Neural architecture search",
    color: "#c8e59b",
    pattern: /\b(neural architecture|architecture search|network architecture search|NAS\b)\b/i
  },
  {
    key: "evolution_swarm",
    topic: "evolution",
    label: "群体智能",
    short: "Swarm intelligence",
    color: "#7bbb72",
    pattern: /\b(particle swarm|ant colony|swarm intelligence|bee colony|artificial bee)\b/i
  },
  {
    key: "evolution_combinatorial",
    topic: "evolution",
    label: "调度与组合优化",
    short: "Scheduling · Combinatorial",
    color: "#73aa84",
    pattern: /\b(schedul|combinatorial|travelling salesman|traveling salesman|vehicle routing|knapsack)\b/i
  },
  {
    key: "evolution_clustering",
    topic: "evolution",
    label: "聚类与社区发现",
    short: "Clustering · Community",
    color: "#b9d8a4",
    pattern: /\b(cluster|community detection|partitioning)\b/i
  },
  {
    key: "evolution_transfer",
    topic: "evolution",
    label: "知识迁移与多任务进化",
    short: "Transfer · Multitask",
    color: "#8dc899",
    pattern: /\b(knowledge transfer|multitask|multi-task|transfer search|meta knowledge)\b/i
  },
  {
    key: "evolution_algorithm",
    topic: "evolution",
    label: "进化算法与黑盒优化",
    short: "Evolutionary algorithms",
    color: "#d5e8ae",
    fallback: true
  },

  {
    key: "learning_fewshot",
    topic: "learning",
    label: "小样本、零样本与增量学习",
    short: "Few-shot · Incremental",
    color: "#b19ce2",
    pattern: /\b(few[- ]?shot|zero[- ]?shot|incremental|continual|long-tailed|open-set|open set)\b/i
  },
  {
    key: "learning_graph",
    topic: "learning",
    label: "图学习",
    short: "Graph learning",
    color: "#927bd0",
    pattern: /\b(graph neural|graph convolution|graph learning|graph representation|GNN\b)\b/i
  },
  {
    key: "learning_transfer",
    topic: "learning",
    label: "迁移学习与域适应",
    short: "Transfer · Adaptation",
    color: "#819bd7",
    pattern: /\b(transfer learning|domain adaptation|domain generalization|cross-domain|domain-invariant)\b/i
  },
  {
    key: "learning_semisupervised",
    topic: "learning",
    label: "自监督、半监督与无监督",
    short: "Self · Semi · Unsupervised",
    color: "#c5a7e0",
    pattern: /\b(self-supervised|semi-supervised|unsupervised|weakly supervised|weakly-supervised)\b/i
  },
  {
    key: "learning_representation",
    topic: "learning",
    label: "表示、度量与对比学习",
    short: "Representation · Metric",
    color: "#9e8ed8",
    pattern: /\b(representation|metric learning|contrastive|embedding|manifold|feature learning)\b/i
  },
  {
    key: "learning_brain",
    topic: "learning",
    label: "脉冲神经与类脑学习",
    short: "Spiking · Brain-inspired",
    color: "#d7c8ee",
    pattern: /\b(spiking|brain-inspired|neuromorphic|memrist)\b/i
  },
  {
    key: "learning_neural",
    topic: "learning",
    label: "神经网络与机器学习",
    short: "Neural · Machine learning",
    color: "#7c68b8",
    fallback: true
  },

  {
    key: "imaging_superresolution",
    topic: "imaging",
    label: "超分辨率",
    short: "Super-resolution",
    color: "#8abbd9",
    pattern: /\b(super[- ]resolution|resolution enhancement)\b/i
  },
  {
    key: "imaging_restoration",
    topic: "imaging",
    label: "图像恢复、去噪与增强",
    short: "Restoration · Denoising",
    color: "#b2d4e8",
    pattern: /\b(restoration|denois|deblur|dehaze|derain|enhancement|inpainting)\b/i
  },
  {
    key: "imaging_fusion",
    topic: "imaging",
    label: "图像融合与全色锐化",
    short: "Fusion · Pansharpening",
    color: "#73c1c7",
    pattern: /\b(image fusion|multimodal fusion|pansharpen|pan-sharpen|data fusion)\b/i
  },
  {
    key: "imaging_reconstruction",
    topic: "imaging",
    label: "重建与逆问题",
    short: "Reconstruction · Inverse",
    color: "#679bc3",
    pattern: /\b(reconstruction|inverse problem|tomograph|computed tomography|compressive sensing|compressed sensing)\b/i
  },
  {
    key: "imaging_multiscale",
    topic: "imaging",
    label: "小波、轮廓波与稀疏表示",
    short: "Wavelet · Sparse",
    color: "#9ab3db",
    pattern: /\b(wavelet|contourlet|curvelet|sparse representation|dictionary learning|scattering)\b/i
  },
  {
    key: "imaging_compression",
    topic: "imaging",
    label: "压缩与编码",
    short: "Compression · Coding",
    color: "#568bb5",
    pattern: /\b(compression|coding|quantization|compressed)\b/i
  },
  {
    key: "imaging_computational",
    topic: "imaging",
    label: "计算成像与信号处理",
    short: "Computational imaging",
    color: "#c1d9e8",
    fallback: true
  },

  {
    key: "general_communications",
    topic: "general",
    label: "通信、雷达与调制识别",
    short: "Communications · Radar",
    color: "#9fb9b3",
    pattern: /\b(modulation|communication|wireless|channel estimation|jamming|signal recognition|radio frequency|6G\b)\b/i
  },
  {
    key: "general_medical",
    topic: "general",
    label: "医学与生物计算",
    short: "Medical · Bioinformatics",
    color: "#bfd0c9",
    pattern: /\b(medical|disease|tumou?r|cancer|lesion|organ|protein|gene|biological|bioinformatics|clinical)\b/i
  },
  {
    key: "general_quantum",
    topic: "general",
    label: "量子与类脑计算",
    short: "Quantum · Brain-inspired",
    color: "#8e9fba",
    pattern: /\b(quantum|brain-inspired|spiking|neuromorphic|memrist)\b/i
  },
  {
    key: "general_multimedia",
    topic: "general",
    label: "多媒体与视频理解",
    short: "Multimedia · Video",
    color: "#8db7b2",
    pattern: /\b(video|multimedia|image-text|visual question|caption|retrieval|anomaly detection|quality assessment|event extraction)\b/i
  },
  {
    key: "general_geometry",
    topic: "general",
    label: "三维视觉与几何感知",
    short: "3D vision · Geometry",
    color: "#9daec5",
    pattern: /\b(3D\b|three-dimensional|point cloud|pose estimation|rendering|gaussian splatting|view synthesis|registration|depth estimation)\b/i
  },
  {
    key: "general_data_mining",
    topic: "general",
    label: "数据挖掘与知识发现",
    short: "Data mining · Knowledge",
    color: "#7ca7a4",
    pattern: /\b(data mining|knowledge graph|knowledge distillation|feature selection|feature extraction|clustering|classification|matrix factori[sz]ation|long-tailed|curriculum learning|manifold|ensemble learning)\b/i
  },
  {
    key: "general_security",
    topic: "general",
    label: "安全、隐私与对抗学习",
    short: "Security · Privacy",
    color: "#b6a99a",
    pattern: /\b(adversarial|attack|privacy|secure|security|federated)\b/i
  },
  {
    key: "general_mathematical",
    topic: "general",
    label: "数学建模与决策方法",
    short: "Mathematical methods",
    color: "#8da8a2",
    pattern: /\b(matrix|factorization|projection|belief rule|decision|scheduling|equation|kernel|topology|regression)\b/i
  },
  {
    key: "general_industrial",
    topic: "general",
    label: "工业系统与交叉应用",
    short: "Systems · Applications",
    color: "#aabda5",
    pattern: /\b(industry|industrial|fault|traffic|vehicle|robot|UAV|internet of things|IoT\b|system)\b/i
  },
  {
    key: "general_methods",
    topic: "general",
    label: "交叉方法与新兴应用",
    short: "Interdisciplinary methods",
    color: "#718f91",
    fallback: true
  }
];

function inferTopic(paper) {
  const text = `${paper.title || ""} ${paper.venue || ""}`;
  for (const [topic, pattern] of TOPIC_RULES) {
    if (pattern.test(text)) return topic;
  }
  return "general";
}

function inferTask(paper, topic) {
  const text = `${paper.title || ""} ${paper.venue || ""}`;
  const definitions = TASK_DEFINITIONS.filter((task) => task.topic === topic);
  return definitions.find((task) => task.pattern?.test(text))?.key
    || definitions.find((task) => task.fallback)?.key;
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
  const topic = inferTopic(paper);
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
    topic,
    task: inferTask(paper, topic)
  };
  if (cleanText(paper.abstract)) sanitized.abstract = cleanText(paper.abstract);
  return sanitized;
});

const years = papers.map((paper) => paper.year).filter(Number.isFinite);
const yearMap = new Map();
const topicCounts = {};
const taskCounts = {};
const coauthorCounts = new Map();
const venues = new Set();

for (const paper of papers) {
  venues.add(paper.venue || "Unknown");
  topicCounts[paper.topic] = (topicCounts[paper.topic] || 0) + 1;
  taskCounts[paper.task] = (taskCounts[paper.task] || 0) + 1;
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
  generatedAt: new Date().toISOString().slice(0, 10),
  source: "DBLP author profile 40/3714 and DOI-linked public metadata",
  total: papers.length,
  minYear: Math.min(...years),
  maxYear: Math.max(...years),
  peakYear: peak.year,
  peakCount: peak.count,
  coauthorCount: coauthorCounts.size,
  venueCount: venues.size,
  topicCounts,
  taskCounts,
  tasks: TASK_DEFINITIONS.map(({ key, topic, label, short, color }) => ({
    key,
    topic,
    label,
    short,
    color
  })),
  yearCounts,
  coauthors,
  topCoauthors
};

await mkdir(outputDir, { recursive: true });
await Promise.all([
  writeFile(resolve(outputDir, "publications.json"), JSON.stringify(papers)),
  writeFile(resolve(outputDir, "atlas.json"), JSON.stringify(atlas, null, 2))
]);

console.log(`Built ${papers.length} publications across ${TASK_DEFINITIONS.length} research tasks, ${coauthorCounts.size} coauthors, ${venues.size} venues.`);
