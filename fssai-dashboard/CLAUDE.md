# FSSAI dashboard: rules for anyone (or any agent) working here

A public dashboard of regulatory food-safety actions against Indian restaurants and hotels.
It names real businesses, so a wrong entry can harm a business and expose the owner to a
defamation claim. These rules come before speed or coverage.

## Data rules (the build enforces most of these; don't weaken the checks)
- Join records on the 14-digit FSSAI licence number only. Never attach a record to a
  business by fuzzy or name matching. An entry without a licence number stays on its own.
- An action may be linked to a licence only if the source states the number
  (`licence_in_source`) or a person confirmed name AND address on FoSCoS
  (`verified_manually`, with who, when and a note). An agent must not set
  `verified_manually` on its own: propose the match and let a person confirm it.
- Record what the regulator did (notice, suspension, seizure, penalty), never the
  condition ("cockroaches", "dirty kitchen"). `pipeline/schema.py` rejects condition words.
- Every action needs a source document link, a date, a status and a status-as-of date.
  Withdrawn and overturned actions stay listed, marked as such. Don't delete them.
- "No actions found" must never look like a clean record: no green, no ticks, no "safe".
- Extract facts from press notes, don't republish their text.
- Action ids in `data/manual/actions.csv` are permanent. Never reuse or renumber one.

## Scraping rules
- Use `pipeline/http.py` (PoliteClient) for every request. It checks robots.txt,
  throttles, backs off and stops on CAPTCHAs. Never bypass, solve or outsource a
  CAPTCHA, rotate IPs or spoof the user agent.
- Do not scrape fssai.gov.in/hygieneRating (robots.txt disallows bots). Use the old
  hygiene.fssai.gov.in portal.
- Do not scrape Instagram or other social media. Enter anything found there by hand,
  with a link to the official post.
- eCourts and e-Jagriti: manual entry only, unless a CAPTCHA-free official route exists.
- A source stays `verified = false` in `config/endpoints.toml` until a person has checked
  its URLs and fields against the live site. Don't flip it without that check.

## Working here
- `python -m unittest` and `python -m pipeline check` must pass before any commit.
- `python -m pipeline build` writes `site/data.js`; it is generated, don't hand-edit it.
- Test fixtures use fictional names and licence numbers starting `1000000000000`.
  Never put fictional records in `data/`.
- Keep the site plain HTML/CSS/JS. Colours are tokens in `site/styles.css` with light and dark values.
- Expand area by editing `config/scope.toml` only once the current area's coverage is
  described honestly in `data/sources.json`.
