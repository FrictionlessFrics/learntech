# Food Safety Actions (India)

A public dashboard of regulatory food-safety actions against restaurants and hotels, so
people can make informed choices. It starts with Mumbai (Mumbai City and Mumbai Suburban).

India has no public establishment-level enforcement database, so this one is assembled
from several sources and joined on the 14-digit FSSAI licence number. It records what a
regulator did, never what an inspector saw, and it says plainly what it hasn't checked.

## How it works

```
 FSSAI hygiene directory ──> data/*.json ──┐  (automated, nightly)
 Maharashtra FDA notes ──> inbox/ ──> person reviews ──> data/manual/actions.csv
 FoSCoS checks, courts, RTI, FSSAI press ──────────────┘ (entered by hand)
                                                │
                     python -m pipeline build (validates, joins on licence no.)
                                                │
                                   site/ ──> GitHub Pages
```

- **Nightly job** (`.github/workflows/publish.yml`): at 02:00 India time it scrapes the
  switched-on sources for up to about 5.5 hours, commits the new data, rebuilds the site
  and publishes it. A run cut short resumes the next night.
- **Polite scraping** (`pipeline/http.py`): checks robots.txt, waits between requests,
  backs off when a server is busy, and stops at the first CAPTCHA. It never solves one.
- **Press notes are reviewed by a person.** They rarely give a licence number and are often
  in Marathi, so the collector only downloads them to `inbox/`.
  See `data/manual/README.md`.
- **Validation** (`pipeline/schema.py`): no row is published without a 14-digit licence
  number, a source link, a date and a status. Summaries that describe conditions rather
  than actions are rejected.

## Getting it live

1. **Turn on Pages:** Settings > Pages > Source: *GitHub Actions*. The site publishes on the
   next push to `main`, empty at first, saying so.
2. **Check each source in a browser** and fill in `config/endpoints.toml`, then set
   `verified = true`. Until then that source is skipped.
   - Hygiene directory: open a page such as `https://hygiene.fssai.gov.in/fboDetails.php?id=978`
     and check the labels on it match `[hygiene.labels]`. That's all the sweep needs. It
     walks every id slowly (about 3,000 a night), keeps Mumbai entries and resumes each
     night, so a full first pass can take a few weeks. For a faster Mumbai-only pass, find
     the knowRating.php search endpoints in DevTools > Network and switch `mode = "search"`.
   - Press notes: find the FDA's press-note listing page and put it in `listing_urls`.
   - FoSCoS stays manual (its lookup is encrypted; we don't break that).
3. **Run it once by hand:** Actions > Collect and publish > Run workflow. Check the log
   and the committed data before trusting the nightly run.
4. **Start with `inbox/leads.md`:** recent news-reported FDA actions in Mumbai whose official press notes should be found first.
5. **Review press notes:** download the `press-notes-*` artifact from the run, or open the
   links from `python -m pipeline inbox`, and add actions to `data/manual/actions.csv`.

### Known risk: India-only access
Some Indian government sites block traffic from outside India. GitHub's runners are not in
India. If the nightly log shows timeouts or 403s from a portal that works in your browser,
run the job on a self-hosted runner, or a small server, in India.

## Running locally

```
pip install -r requirements.txt
python -m unittest                    # tests (fictional fixtures only)
python -m pipeline check              # validate data/manual/actions.csv
python -m pipeline run --budget-minutes 30
python -m pipeline build && python -m http.server -d site
```

## Not online at all
Section 32 improvement notices and Section 68 adjudication orders are only available
through RTI requests to district Designated Officers. Keep requests narrow and
licence-specific; enter replies by hand with the RTI reply as the source.

## Corrections
Anyone can ask for a correction through the issue template. Withdrawn or overturned actions
are marked, not deleted, and every change is in the git history.
