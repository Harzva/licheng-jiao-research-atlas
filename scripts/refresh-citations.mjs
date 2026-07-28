import { readFile, rename, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const publicationsPath = resolve(root, "data/publications.json");
const outputPath = resolve(root, "data/citations.json");
const delayMs = Math.max(250, Number(process.env.CROSSREF_DELAY_MS || 350));
const checkpointEvery = 25;

const sleep = (milliseconds) => new Promise((resolvePromise) => {
  setTimeout(resolvePromise, milliseconds);
});

const normalizeDoi = (value = "") => String(value)
  .trim()
  .toLocaleLowerCase()
  .replace(/^https?:\/\/(?:dx\.)?doi\.org\//, "");

async function readExisting() {
  try {
    return JSON.parse(await readFile(outputPath, "utf8"));
  } catch {
    return { counts: {} };
  }
}

async function saveSnapshot(counts, stats) {
  const payload = {
    source: "Crossref Cited-by",
    sourceUrl: "https://www.crossref.org/documentation/cited-by/",
    updatedAt: new Date().toISOString().slice(0, 10),
    coverage: stats,
    counts
  };
  const temporaryPath = `${outputPath}.tmp`;
  await writeFile(temporaryPath, JSON.stringify(payload));
  await rename(temporaryPath, outputPath);
}

async function fetchCitationCount(doi) {
  const url = `https://api.crossref.org/works/${encodeURIComponent(doi)}`;
  for (let attempt = 0; attempt < 4; attempt += 1) {
    const response = await fetch(url, {
      headers: {
        "User-Agent": "JiaoResearchAtlas/1.0 (public academic metadata project)"
      }
    });
    if (response.ok) {
      const payload = await response.json();
      const count = Number(payload.message?.["is-referenced-by-count"]);
      return Number.isFinite(count) ? Math.max(0, count) : 0;
    }
    if (response.status === 404) return null;
    if (response.status !== 429 && response.status < 500) {
      throw new Error(`Crossref returned HTTP ${response.status}`);
    }
    const retryAfter = Number(response.headers.get("retry-after"));
    await sleep(Number.isFinite(retryAfter) ? retryAfter * 1000 : 1200 * (attempt + 1));
  }
  throw new Error("Crossref retry budget exhausted");
}

const papers = JSON.parse(await readFile(publicationsPath, "utf8"));
const dois = [...new Set(papers.map((paper) => normalizeDoi(paper.doi)).filter(Boolean))];
const existing = await readExisting();
const counts = { ...(existing.counts || {}) };
let matched = Object.keys(counts).filter((doi) => dois.includes(doi)).length;
let failed = 0;
let processed = 0;
const pending = dois.filter((doi) => !Object.hasOwn(counts, doi));

console.log(`Crossref citation refresh: ${dois.length} DOI records, ${pending.length} pending.`);

for (const doi of pending) {
  try {
    const count = await fetchCitationCount(doi);
    if (count != null) {
      counts[doi] = count;
      matched += 1;
    } else {
      failed += 1;
    }
  } catch (error) {
    failed += 1;
    console.warn(`Skipped ${doi}: ${error.message}`);
  }
  processed += 1;
  if (processed % checkpointEvery === 0) {
    await saveSnapshot(counts, {
      publications: papers.length,
      dois: dois.length,
      matched,
      failed
    });
    console.log(`Processed ${processed}/${pending.length}; matched ${matched}.`);
  }
  await sleep(delayMs);
}

await saveSnapshot(counts, {
  publications: papers.length,
  dois: dois.length,
  matched,
  failed
});

console.log(`Citation refresh complete: ${matched}/${dois.length} DOI records matched.`);
