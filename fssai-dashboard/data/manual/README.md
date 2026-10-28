# Adding a regulatory action by hand

Press notes, court orders, consumer commission orders, FSSAI announcements and RTI
replies all end up as one row in `actions.csv`. Run `python -m pipeline check`
after editing; it tells you exactly which line is wrong.

## Steps for a press note in the inbox

1. `python -m pipeline inbox` lists notes waiting for review. Open the link.
2. For each business named, note the action, the date, the authority and the legal section.
3. Find the licence number. If the note gives it, use `licence_in_source`.
   If not, search FoSCoS and accept a match only if **both name and address** agree.
   Use `verified_manually`, put your name in `verified_by`, today in `verified_on`, and
   say what matched in `match_note`. If you're not sure, leave the action out.
4. Add the row, run `python -m pipeline check`, then `python -m pipeline inbox --done doc-...`.
5. Once you've read every note up to a date, update `reviewed_from` / `reviewed_through`
   for `mh_fda` in `data/sources.json`. That date range is what the site shows as checked.

## Columns

| Column | What goes in it |
|---|---|
| id | Permanent id, e.g. `MH-2026-0001`. Never reuse or renumber. |
| licence_no | 14 digits, no spaces. |
| name_in_source | The business name exactly as the document spells it. |
| action_type | `improvement_notice`, `licence_suspended`, `licence_cancelled`, `prohibition_order`, `stop_business_order`, `seizure`, `sample_declared`, `penalty`, `prosecution_filed`, `conviction`, `consumer_order` |
| action_date | Date of the action, `YYYY-MM-DD`. |
| authority | e.g. `Maharashtra FDA`, `FSSAI`, `Adjudicating Officer, Mumbai`. |
| legal_section | e.g. `Sec 32`, `Sec 68`. Blank if the source doesn't say. |
| finding | Blank, or the legal category the source states: `unsafe`, `sub_standard`, `misbranded`, `no_licence`, `licence_conditions`. |
| summary | Optional, at most 200 characters, about the action, never the condition. "Licence suspended until compliance" is fine; "rats in kitchen" is rejected. |
| status | `in_force`, `pending`, `complied`, `under_appeal`, `withdrawn`, `overturned`, `unknown`. |
| status_as_of | The date you last confirmed the status. |
| source_url | `https://` link to the government document. |
| source_title | Short title of that document. |
| match_method | `licence_in_source` or `verified_manually`. |
| verified_by, verified_on, match_note | Required when `match_method` is `verified_manually`. |

## Sources that aren't online (RTI replies)
`source_url` must be an https link. For an RTI reply, remove personal details (yours and
any officer's phone or email), save it as a PDF under `evidence/rti/`, commit it, and use
its GitHub link as the source.
