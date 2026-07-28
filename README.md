# Licheng Jiao Research Atlas · Preview V1

Static-first academic website generated from the locally verified DBLP catalog.

Live site: <https://harzva.github.io/licheng-jiao-research-atlas/>

## Build data

```bash
node scripts/build-data.mjs
```

The build reads the canonical catalog from:

```text
../output/jiao_full_catalog_20260717/data/publications_full.json
```

## Preview locally

```bash
python3 -m http.server 4173 --directory .
```

Open `http://127.0.0.1:4173/`.

## Data policy

- DBLP PID `40/3714` is the V1 identity anchor.
- Topic labels are explainable keyword classifications, not claims made by the author.
- Only source-backed abstracts may be shown.
- No credentials, cookies, private memory, or browser profiles belong in this directory.

## License

The website source code is released under the MIT License. Publication metadata
remains subject to its original sources and identifiers; paper full text is not
included in this repository.
