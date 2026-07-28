import { readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const publicationsPath = resolve(root, "data/publications.json");
const atlasPath = resolve(root, "data/atlas.json");
const outputPath = resolve(root, "data/coverage.json");
const papers = JSON.parse(await readFile(publicationsPath, "utf8"));
const atlas = JSON.parse(await readFile(atlasPath, "utf8"));
const hasCjk = (value = "") => /[\u3400-\u9fff]/u.test(String(value));

const conferenceRecords = papers.filter((paper) => paper.pub_type === "inproceedings");
const conferenceVenues = new Set(conferenceRecords.map((paper) => paper.venue).filter(Boolean));
const cjkTitleRecords = papers.filter((paper) => hasCjk(paper.title));
const cjkVenueRecords = papers.filter((paper) => hasCjk(paper.venue));
const nativeCjkConferenceRecords = conferenceRecords.filter(
  (paper) => hasCjk(paper.title) || hasCjk(paper.venue)
);

const coverage = {
  generatedAt: atlas.generatedAt,
  scope: "Coverage signals are not additive until identities, document types, and work versions are reconciled.",
  primaryCorpus: {
    source: "DBLP-anchored public corpus",
    records: papers.length,
    unit: "bibliographic records",
    status: "public, versioned, field-allowlisted"
  },
  externalSignals: [
    {
      source: "Scopus",
      count: 2564,
      display: "2,564 documents",
      verification: "user-supplied profile snapshot; not yet independently exported or deduplicated",
      caveat: "Broader subject and document-type coverage may include multiple versions and non-article records."
    },
    {
      source: "Baidu Scholar",
      count: 3983,
      approximate: true,
      display: "≈3,983 results",
      verification: "user-supplied search snapshot; not yet identity-audited",
      caveat: "May mix homonyms, duplicate versions, books, theses, and other scholarly outputs."
    },
    {
      source: "Google Scholar",
      count: null,
      display: "No stable total",
      verification: "access verification currently prevents a reproducible count",
      caveat: "Do not add an unverified search-result estimate to the DBLP corpus."
    }
  ],
  conferenceAudit: {
    conferenceRecords: conferenceRecords.length,
    conferenceVenues: conferenceVenues.size,
    cjkTitleRecords: cjkTitleRecords.length,
    cjkVenueRecords: cjkVenueRecords.length,
    nativeCjkConferenceRecords: nativeCjkConferenceRecords.length,
    interpretation: "The DBLP-anchored corpus contains substantial conference coverage but almost no native Chinese-language metadata. CNKI, Wanfang, and official institutional sources require a separate identity-audited ingestion pass."
  },
  methodologyLinks: {
    dblpScope: "https://dblp.org/faq/1474671",
    scopusProfiles: "https://service.elsevier.com/app/answers/detail/a_id/29506/supporthub/scopus/p/10524/",
    googleScholarScope: "https://scholar.google.com/intl/us/scholar/help.html"
  }
};

await writeFile(outputPath, `${JSON.stringify(coverage, null, 2)}\n`, "utf8");
console.log(
  `Coverage audit: ${conferenceRecords.length} conference records across ${conferenceVenues.size} venue labels; `
  + `${nativeCjkConferenceRecords.length} native CJK conference records.`
);
