# Updating `data/venues.json`

This page tells the next person how to keep the **Venues** tab on sigmlab.com fresh.

## Quick guide — "I just want to update CVPR's deadline"

1. Open `data/venues.json`.
2. Find `"id": "cvpr"`.
3. In the `deadlines` array, replace the entries for the new cycle. Keep `year` consistent (the cycle year, not the submission year — CVPR 2027's full-paper deadline is in Nov 2026 but `"year": 2027`).
4. Update `lastVerified` to today (`YYYY-MM-DD`).
5. From the repo root: `npm run build` — should succeed.
6. `git add data/venues.json && git commit -m "data: update CVPR 2027 deadlines" && git push`.
7. On the server, run the deploy step from `CLAUDE.md`.

## Adding a new venue

Copy this template into the `venues` array, then fill it in:

```json
{
  "id": "venue-acronym-lowercase",
  "name": "ACRONYM",
  "fullName": "Full Title of the Venue",
  "aliases": ["Alternate name"],
  "type": "conference|journal|workshop",
  "topics": ["computer-vision", "..."],
  "website": "https://...",
  "publisher": "IEEE|Springer|Elsevier|ACM|MDPI|...",
  "issn": "0000-0000",
  "eIssn": "0000-0000",
  "rankings": {
    "scopus": true, "isi": true, "dblp": true,
    "scimagoQuartile": "Q1", "sjr": 0.0, "jcrImpactFactor": 0.0,
    "citeScore": 0.0, "hIndex": 0,
    "core": "A*", "ccf": "A", "era": "A*"
  },
  "deadlines": [
    { "year": 2027, "kind": "abstract", "date": "2026-11-07", "timezone": "AoE" },
    { "year": 2027, "kind": "full-paper", "date": "2026-11-14", "timezone": "AoE" }
  ],
  "frequency": "annual|biannual|rolling|irregular",
  "acceptanceRate": 0.25,
  "location": "City, Country",
  "notes": "Anything noteworthy.",
  "lastVerified": "2026-04-29"
}
```

**Required fields:** `id`, `name`, `fullName`, `type`, `topics`, `website`, `rankings`, `frequency`.
**Everything else is optional** — leave it out rather than putting in `null` or empty strings.

### Where to look up each field

| Field | Source |
|---|---|
| `core` (CORE rank) | https://portal.core.edu.au/conf-ranks/ |
| `scimagoQuartile`, `sjr`, `hIndex` | https://www.scimagojr.com/ |
| `jcrImpactFactor`, `jcrQuartile` | Web of Science Journal Citation Reports (institutional access via library) |
| `citeScore` | https://www.scopus.com/sources |
| `scopus` (indexed yes/no) | https://www.scopus.com/sources — search by venue name |
| `isi` (Web of Science indexed) | https://mjl.clarivate.com/ |
| `dblp` | https://dblp.org/ — search by venue acronym |
| `ccf` (China Computer Federation) | https://www.ccf.org.cn/ — annual rankings PDF |
| `era` (Excellence in Research for Australia) | https://www.arc.gov.au/era/ |
| Conference deadlines | https://aideadlin.es/, https://ccfddl.com/, official call-for-papers |
| `acceptanceRate` | Venue website / openreview / Google Scholar listings |

## Yearly deadline refresh workflow

Top conferences open submissions in Q4. Every December, update these venues first:

- **CVPR** (March-ish), **ICML** (Jan), **ICCV** (March, odd years only), **ECCV** (March, even years only)
- **NeurIPS** (May), **ICLR** (Sept), **AAAI** (Aug), **IJCAI** (Jan)
- **ACM MM** (April), **BMVC** (May), **WACV** (Aug)
- **MICCAI** (March), **ICASSP** (Sept), **ICIP** (Feb)
- **ICRA** (Sept), **IROS** (March)

For each:
1. Visit the official call-for-papers (linked from the venue's `website`).
2. Update `deadlines` array — replace previous cycle's entries.
3. If the venue announces an extension, update the `date` and add a `note: "extended from <old date>"`.
4. Bump `lastVerified`.

## Schema reference

The TypeScript interface is `lib/venues/types.ts`. Zod validation runs at build time — `npm run build` will fail with a useful error if a field is malformed.

## Topic taxonomy

The controlled vocabulary lives in `lib/venues/topics.ts`. Reuse existing tags wherever possible. To add a new topic:
1. Add the slug to `TOPIC_VOCABULARY`.
2. Add the human label to `TOPIC_LABELS`.
3. Use it in `data/venues.json`.

Slugs are lowercase, hyphenated, no spaces.

## Validation errors — common fixes

| Error message | Fix |
|---|---|
| `id must be lowercase a-z, 0-9, hyphen` | Don't capitalize `id`. `cvpr`, not `CVPR`. |
| `Invalid url` for `website` | Must include scheme: `https://...` |
| `Required` for `rankings` | Even if empty, write `"rankings": {}`. |
| `Number must be less than or equal to 1` for `acceptanceRate` | This is a fraction (0.236), not a percent (23.6). |
| `String must match regex` for `lastVerified` | Format is `YYYY-MM-DD`, not `April 2026`. |

## Bulk edits

To set `lastVerified` on every entry after a sweep:

```bash
jq '.venues |= map(.lastVerified = "2026-04-29")' data/venues.json > /tmp/v.json
mv /tmp/v.json data/venues.json
```

To find venues missing a CORE rank:

```bash
jq '.venues[] | select(.type == "conference" and (.rankings.core // null) == null) | .id' data/venues.json
```
