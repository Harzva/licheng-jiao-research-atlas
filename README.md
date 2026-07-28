# Licheng Jiao Research Atlas

An interactive academic atlas of publications, research evolution, and
collaboration networks.

Live site: <https://harzva.github.io/licheng-jiao-research-atlas/>

The repository also includes an accessible HTML and LaTeX research review in
[`review/`](./review/).

## Build data

```bash
node scripts/build-data.mjs ./source/publications.json
```

Refresh DOI-linked Crossref Cited-by counts with:

```bash
node scripts/refresh-citations.mjs
```

Rebuild corpus-scoped first-venue milestones and the review figures/QR codes:

```bash
npm install
npm run build:milestones
npm run build:review-assets
```

The citation refresh is single-concurrency, rate-limited, cached, and safe to
resume. The website labels these values as Crossref citations; they are not
presented as Google Scholar totals.

The public dataset is generated through a strict field allowlist. Local file
paths, download-queue state, internal notes, and non-public URLs are excluded.

## Data policy

- DBLP author profile `40/3714` and DOI identifiers are identity anchors.
- Domains and fine-grained task labels are explainable keyword classifications,
  not claims made by the author.
- High-citation highlighting is year-normalized and retains the raw,
  source-specific Crossref count.
- Venue “firsts” mean first appearance in the current DBLP-anchored corpus,
  not an absolute claim about records outside the dataset.
- Only source-backed abstracts may be shown.
- Public data is checked automatically before every GitHub Pages update.

## License

The website source code is released under the MIT License. Publication metadata
remains subject to its original sources and identifiers; paper full text is not
included in this repository.
