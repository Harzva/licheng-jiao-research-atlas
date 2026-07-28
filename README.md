# Licheng Jiao Research Atlas

An interactive academic atlas of publications, research evolution, and
collaboration networks.

Live site: <https://harzva.github.io/licheng-jiao-research-atlas/>

## Build data

```bash
node scripts/build-data.mjs ./source/publications.json
```

The public dataset is generated through a strict field allowlist. Local file
paths, download-queue state, internal notes, and non-public URLs are excluded.

## Data policy

- DBLP author profile `40/3714` and DOI identifiers are identity anchors.
- Topic labels are explainable keyword classifications, not claims made by the author.
- Only source-backed abstracts may be shown.
- Public data is checked automatically before every GitHub Pages update.

## License

The website source code is released under the MIT License. Publication metadata
remains subject to its original sources and identifiers; paper full text is not
included in this repository.
