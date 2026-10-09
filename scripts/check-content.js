/*
  Checks the files in content/ before the site deploys.
  Run locally with:  node scripts/check-content.js

  Catches the mistakes that would break the site or lose progress:
  a syntax slip, a duplicated id, a week pointing at a concept that
  isn't in the glossary, or a task missing its minutes.
*/
const path = require("path");

global.window = {};
const root = path.join(__dirname, "..");
const errors = [];

for (const file of ["content/curriculum.js", "content/glossary.js", "content/prompts.js"]) {
  try {
    require(path.join(root, file));
  } catch (e) {
    errors.push(`${file} doesn't load: ${e.message}`);
  }
}

const LT = window.LT || {};
const KINDS = new Set(["learn", "do", "read", "prove"]);
const glossaryIds = new Set();

(LT.glossary || []).forEach((t, i) => {
  if (!t.id) errors.push(`Glossary entry ${i + 1} has no id`);
  else if (glossaryIds.has(t.id)) errors.push(`Glossary id "${t.id}" is used twice`);
  glossaryIds.add(t.id);
  for (const key of ["term", "plain", "analogy", "stack"]) {
    if (!t[key]) errors.push(`Glossary "${t.id}" is missing "${key}"`);
  }
});

const tracks = (LT.curriculum && LT.curriculum.tracks) || [];
if (!tracks.some((t) => t.status === "active")) errors.push('No track has status: "active"');

const weekIds = new Set();
const taskIds = new Set();
let weekCount = 0;

tracks.forEach((track) => {
  if (track.status !== "active") {
    if (!Array.isArray(track.outline)) errors.push(`Planned track "${track.id}" needs an outline list`);
    return;
  }
  (track.areas || []).forEach((area) => {
    (area.weeks || []).forEach((w) => {
      weekCount++;
      if (!/^W\d{2,}$/.test(w.id || "")) errors.push(`Week id "${w.id}" should look like W13`);
      if (weekIds.has(w.id)) errors.push(`Week id "${w.id}" is used twice`);
      weekIds.add(w.id);
      for (const key of ["title", "goal", "proof", "explain"]) {
        if (!w[key]) errors.push(`${w.id} is missing "${key}"`);
      }
      if (!w.exec || !Array.isArray(w.exec.ask) || !w.exec.decides) {
        errors.push(`${w.id} needs exec.ask (a list) and exec.decides`);
      }
      (w.concepts || []).forEach((c) => {
        if (!glossaryIds.has(c)) errors.push(`${w.id} lists concept "${c}", which isn't in glossary.js`);
      });
      (w.tasks || []).forEach((t) => {
        if (!t.id) errors.push(`${w.id} has a task without an id`);
        else if (taskIds.has(t.id)) errors.push(`Task id "${t.id}" is used twice`);
        taskIds.add(t.id);
        if (!KINDS.has(t.kind)) errors.push(`${t.id}: kind must be learn, do, read or prove`);
        if (!(t.mins > 0)) errors.push(`${t.id}: mins must be a number above 0`);
        if (!t.text) errors.push(`${t.id} has no text`);
      });
      (w.read || []).forEach((r) => {
        if (!/^https?:\/\//.test(r.url || "")) errors.push(`${w.id}: reading "${r.title}" needs a full https:// url`);
      });
    });
  });
});

if (errors.length) {
  console.error(`Content check failed (${errors.length}):\n- ` + errors.join("\n- "));
  process.exit(1);
}
console.log(
  `Content OK: ${weekCount} weeks, ${taskIds.size} tasks, ${glossaryIds.size} concepts, ` +
    `${(LT.prompts || []).reduce((n, g) => n + g.items.length, 0)} prompts.`
);
