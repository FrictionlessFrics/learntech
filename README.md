# LearnTech

A personal upskilling site for a data executive who builds on the side. The first track,
**Production Foundations**, is 12 weeks across four areas. Every concept is applied to your own
supply chain control tower: the text-to-SQL agent, the MEIO backend, the GitHub Actions sync,
`tagging_pipeline.py` and the Supabase tables.

| Weeks | Area | You'll ship |
| --- | --- | --- |
| 1–3 | **RUN** How software runs | A request-flow diagram, a twelve-factor scorecard, the MEIO backend live from your own Dockerfile |
| 4–6 | **REL** Reliability | A sync that fails loudly and runs twice safely, plus tests for the tagging pipeline |
| 7–8 | **SEC** Security | No keys in git, a read-only database user for the agent, RLS on all seven tables |
| 9–12 | **SCL** Scaling | p95 latency per hop, indexes with before/after numbers, cached forecasts, background jobs, a cost model |

Budget is 3–4.5 hours a week. Tasks are 15–90 minutes so they fit around a day job.

## What's on the site

- **Today**: your current week, a pace check, a scorecard, and a *Needs attention* list
  (late tasks, missing reflections, concepts you still can't explain). It works like
  exception management in your control tower.
- **Week pages**: concepts (plain English, supply chain analogy, where it lives in your stack),
  tasks with time estimates and copyable *teach-me* prompts, reading, an **exec lens** (the
  questions you can now ask, and the decision it informs), proof, and a reflection.
- **Roadmap**: all 12 weeks, plus outlines for the next three tracks: *AI Systems That Hold Up*,
  *Data Platform Fluency* and *Technical Leadership for Executives*.
- **Glossary**: 40 concepts you rate as *Heard of it*, *Can explain it* or *Have used it*.
- **Prompts**: "teach, don't do" prompts for Claude Code, plus a coach-mode `CLAUDE.md`.
- **Journal** and **Proof**: your reflections, and the evidence you shipped each week.

## Open it

**On your computer:** double-click `index.html`. Or, from this folder, run
`python3 -m http.server 8000` and go to <http://localhost:8000>.

**On the web (GitHub Pages):**

1. Merge this branch into `main`.
2. In the repo, go to **Settings → Pages** and set **Source** to **GitHub Actions**.
3. Each push to `main` runs `.github/workflows/pages.yml`. It checks the content files, then
   deploys. The URL appears on the workflow run and on the Pages settings screen.

GitHub Pages on a private repo needs a paid GitHub plan. Your progress is never in the repo,
so a public repo exposes only the curriculum.

## Where your progress is saved

- **In your browser** (localStorage) on GitHub Pages or locally. Each browser keeps its own copy.
  Use **Settings → Back up** to copy or download everything, and **Restore** on another device.
- **In your Claude account** when you open it as a claude.ai artifact. That copy syncs across
  devices, and Claude can read it back when you ask for a progress review.

Ticks, ratings, proof links and reflections never leave the device or account they're saved in.

## Change what you learn

All content is in three plain files. You don't need to touch the app code.

| File | What's in it |
| --- | --- |
| `content/curriculum.js` | Tracks, areas, weeks, tasks, reading, exec lens, proof |
| `content/glossary.js` | Concepts: `plain`, `analogy` (supply chain), `stack` (your control tower) |
| `content/prompts.js` | The prompt library and the coach-mode text |

Rules that keep your progress safe:

- **Never change an existing task `id` or glossary `id`.** Progress is saved against them.
  To replace a task, add a new one with a new id.
- Wrap code-ish words in backticks (`` `docker build` ``) to show them as code.
- Run `node scripts/check-content.js` after editing. It catches syntax slips, duplicate ids and
  missing glossary terms. The deploy runs the same check and stops if it fails.

To turn a planned track into full weeks, open the Roadmap, copy the track's
*Prompt to expand this track*, and give it to Claude Code in this repo.

## Make Claude Code teach by default

Copy `templates/CLAUDE-coach-mode.md` into the `CLAUDE.md` of each control tower repo. Claude Code
will then explain before it acts, ask you to predict results, review your code rather than write
it, and end each session with a summary for your journal.

## Files

```
index.html                 page shell
assets/app.js              routing, views, interactions
assets/store.js            saving: browser storage, plus Claude account sync on claude.ai
assets/styles.css          design tokens (light and dark) and layout
content/                   everything you'd edit
scripts/check-content.js   content checker (runs in CI)
templates/                 coach-mode CLAUDE.md for your other repos
.github/workflows/         check + GitHub Pages deploy
```
