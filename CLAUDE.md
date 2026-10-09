# LearnTech

Static personal learning site. No build step and no dependencies: plain HTML, CSS and JS that
must keep working when `index.html` is opened straight from disk. Content scripts set globals on
`window.LT`, so don't convert them to ES modules or fetch() calls.

- Content lives in `content/` (curriculum, glossary, prompts). The owner edits these by hand.
- Task ids (`RUN-01.2`) and glossary ids (`idempotency`) are storage keys for the owner's
  progress. Never rename or reuse one. Add new ids instead.
- When expanding a planned track, match the shape of the active track's weeks: id, title, goal,
  concepts (glossary ids, adding glossary entries as needed), tasks with id/kind/mins/text and an
  optional teach-me prompt, read, exec { ask, decides }, proof, explain.
- Run `node scripts/check-content.js` after any content change.
- Colors are tokens in `assets/styles.css`; every token has light and dark values.
- The owner is a data and operations executive who codes part-time. Write content in plain
  language, ground examples in their supply chain control tower, and prefer teaching prompts
  over doing the work for them.
