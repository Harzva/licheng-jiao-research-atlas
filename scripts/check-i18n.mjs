import { access, readFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const pages = [
  { path: "index.html", lang: "zh-CN", marker: "language-switch" },
  { path: "en/index.html", lang: "en", marker: "language-switch" },
  { path: "review/index.html", lang: "en", marker: "review-language" },
  { path: "review/zh/index.html", lang: "zh-CN", marker: "review-language" }
];
const requiredMainIds = [
  "main",
  "coverage",
  "coverageCards",
  "conferenceAudit",
  "evolution",
  "milestones",
  "publications",
  "collaboration",
  "methodology",
  "paperDrawer"
];
const failures = [];

for (const page of pages) {
  const absolutePath = resolve(root, page.path);
  const content = await readFile(absolutePath, "utf8");
  if (!content.includes(`<html lang="${page.lang}">`)) {
    failures.push(`${page.path}: expected lang="${page.lang}"`);
  }
  if (!content.includes(page.marker)) failures.push(`${page.path}: missing language switch`);
  if (!content.includes('rel="canonical"')) failures.push(`${page.path}: missing canonical URL`);
  if (!content.includes('hreflang="en"') || !content.includes('hreflang="zh-CN"')) {
    failures.push(`${page.path}: missing reciprocal hreflang links`);
  }
  if (page.path === "index.html" || page.path === "en/index.html") {
    for (const id of requiredMainIds) {
      if (!content.includes(`id="${id}"`)) failures.push(`${page.path}: missing #${id}`);
    }
  } else {
    const figureCount = (content.match(/class="survey-figure/g) || []).length;
    const qrCount = (content.match(/class="figure-qr"/g) || []).length;
    if (figureCount !== 5) failures.push(`${page.path}: expected 5 review figures, found ${figureCount}`);
    if (qrCount !== 5) failures.push(`${page.path}: expected 5 QR blocks, found ${qrCount}`);
  }

  const localReferences = [...content.matchAll(/\b(?:href|src)="([^"]+)"/g)]
    .map((match) => match[1])
    .filter((value) => !/^(?:https?:|#|data:|mailto:)/.test(value))
    .map((value) => value.split(/[?#]/)[0])
    .filter(Boolean);
  for (const reference of new Set(localReferences)) {
    try {
      await access(resolve(dirname(absolutePath), reference));
    } catch {
      failures.push(`${page.path}: missing local asset "${reference}"`);
    }
  }
}

if (failures.length) {
  console.error("Bilingual route check failed:");
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exit(1);
}

console.log("Bilingual route check passed for Chinese and English Atlas/review pages.");
