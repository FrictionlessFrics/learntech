/*
  LearnTech app: routing, rendering and interactions.
  Content lives in /content; saving lives in assets/store.js.
  You shouldn't need to edit this file to change what you're learning.
*/
(function () {
  "use strict";

  var LT = window.LT || {};
  var Store = window.LTStore;
  var main = document.getElementById("main");
  var nav = document.getElementById("nav");
  var syncEl = document.getElementById("sync-status");
  var toastEl = document.getElementById("toast");

  /* ------------------------------------------------------------ index */

  var tracks = LT.curriculum.tracks;
  var track = tracks.find(function (t) { return t.status === "active"; }) || tracks[0];
  var plannedTracks = tracks.filter(function (t) { return t !== track; });
  var weeks = [];
  track.areas.forEach(function (area) {
    area.weeks.forEach(function (w) {
      weeks.push(Object.assign({}, w, { n: weeks.length + 1, area: area }));
    });
  });
  var weekById = {};
  weeks.forEach(function (w) { weekById[w.id] = w; });
  var terms = LT.glossary || [];
  var termById = {};
  terms.forEach(function (t) { termById[t.id] = t; });
  var termWeeks = {};
  weeks.forEach(function (w) {
    (w.concepts || []).forEach(function (id) {
      (termWeeks[id] = termWeeks[id] || []).push(w);
    });
  });
  var allTasks = [];
  weeks.forEach(function (w) { allTasks = allTasks.concat(w.tasks); });

  var KIND = { learn: "Learn", do: "Do", read: "Read", prove: "Prove" };
  var LEVELS = [[1, "Heard of it"], [2, "Can explain it"], [3, "Have used it"]];
  var FIELDS = [
    ["built", "What I built or changed"],
    ["explain", "Explain it"],
    ["unsure", "Still unsure about"]
  ];
  var DAY = 864e5;

  /* ---------------------------------------------------------- helpers */

  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }
  /* Escapes text, then shows `backticked` words as code. */
  function fmt(s) {
    return esc(s).replace(/`([^`]+)`/g, "<code>$1</code>");
  }
  function pad2(n) { return String(n).padStart(2, "0"); }
  function today() { var d = new Date(); d.setHours(0, 0, 0, 0); return d; }
  function parseDate(s) {
    var m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(s || "");
    return m ? new Date(+m[1], +m[2] - 1, +m[3]) : null;
  }
  function isoDate(d) { return d.getFullYear() + "-" + pad2(d.getMonth() + 1) + "-" + pad2(d.getDate()); }
  function addDays(d, n) { var x = new Date(d); x.setDate(x.getDate() + n); return x; }
  function mondayOf(d) { var x = new Date(d); x.setHours(0, 0, 0, 0); x.setDate(x.getDate() - ((x.getDay() + 6) % 7)); return x; }
  function daysBetween(a, b) { return Math.round((b - a) / DAY); }
  function fmtDay(d) { return d.toLocaleDateString(undefined, { day: "numeric", month: "short" }); }
  function fmtLong(d) { return d.toLocaleDateString(undefined, { weekday: "long", day: "numeric", month: "long" }); }
  function fmtMins(m) {
    if (m < 60) return m + " min";
    var h = Math.floor(m / 60), r = m % 60;
    return r ? h + " h " + r + " min" : h + " h";
  }
  function fmtHours(m) { return String(Math.round(m / 6) / 10) + " h"; }
  function pct(a, b) { return b ? Math.round((a / b) * 100) : 0; }
  function plural(n, one, many) { return n + " " + (n === 1 ? one : many); }
  function weekHref(w) { return "#" + w.id.toLowerCase(); }
  function safeUrl(u) { return /^https?:\/\/\S+$/i.test(String(u || "").trim()) ? String(u).trim() : ""; }

  var copyBank = new Map();
  function copyBtn(text, label, cls) {
    var key = "c" + (copyBank.size + 1);
    copyBank.set(key, text);
    return '<button type="button" class="btn ' + (cls || "secondary small") + '" data-copy="' + key + '">' + esc(label || "Copy") + "</button>";
  }

  var openDetails = new Set();
  function promptBlock(key, text, label) {
    return (
      '<details class="prompt" data-key="' + esc(key) + '"' + (openDetails.has(key) ? " open" : "") + ">" +
      "<summary>" + esc(label || "Teach-me prompt") + "</summary>" +
      '<div class="prompt-body"><p class="prompt-text">' + esc(text) + "</p>" + copyBtn(text, "Copy prompt") + "</div></details>"
    );
  }

  function chip(kind, text) {
    return '<span class="chip' + (kind ? " " + kind : "") + '">' + esc(text) + "</span>";
  }

  /* ------------------------------------------------------------ state */

  function P() { return Store.data.progress; }
  function J() { return Store.data.journal; }

  /* n: 0 = starts in the future, 1..12 = in that week, 13+ = past the end */
  function plan() {
    var s = P().settings || {};
    var start = parseDate(s.start);
    var hours = Number(s.hours) > 0 ? Number(s.hours) : 4;
    var t = today();
    var n = 1;
    var dayOfWeek = 1;
    if (start) {
      var days = daysBetween(start, t);
      n = days < 0 ? 0 : Math.floor(days / 7) + 1;
      dayOfWeek = days < 0 ? 0 : (days % 7) + 1;
    }
    return { start: start, started: !!start, hours: hours, n: n, dayOfWeek: dayOfWeek, today: t };
  }
  function currentWeek(p) {
    if (p.n < 1) return weeks[0];
    if (p.n > weeks.length) return weeks[weeks.length - 1];
    return weeks[p.n - 1];
  }
  function weekDates(w, p) {
    var s = addDays(p.start, (w.n - 1) * 7);
    return [s, addDays(s, 6)];
  }
  function isDone(id) { return !!P().done[id]; }
  function weekStats(w) {
    var done = w.tasks.filter(function (t) { return isDone(t.id); });
    return {
      done: done.length,
      total: w.tasks.length,
      mins: w.tasks.reduce(function (a, t) { return a + t.mins; }, 0),
      doneMins: done.reduce(function (a, t) { return a + t.mins; }, 0)
    };
  }
  function fluency(id) { return Number(P().fluency[id]) || 0; }
  function reflection(w) { return J().weeks[w.id] || {}; }
  function hasReflection(w) {
    var r = reflection(w);
    return FIELDS.some(function (f) { return String(r[f[0]] || "").trim(); });
  }
  function proveTask(w) { return w.tasks.find(function (t) { return t.kind === "prove"; }); }
  function proofShipped(w) { var t = proveTask(w); return t ? isDone(t.id) : false; }

  function weekStatus(w, p) {
    var s = weekStats(w);
    if (s.done === s.total) return ["ok", "Done"];
    if (!p.started) return w.n === 1 ? ["now", "Up first"] : ["", "Later"];
    if (w.n === p.n) return ["now", "This week"];
    if (w.n < p.n) return p.n - w.n >= 2 ? ["bad", "Late"] : ["warn", "Open"];
    if (w.n === p.n + 1) return ["", "Next"];
    return ["", "Later"];
  }

  function openBehind(p) {
    if (!p.started) return 0;
    return weeks
      .filter(function (w) { return w.n < p.n; })
      .reduce(function (a, w) { var s = weekStats(w); return a + s.total - s.done; }, 0);
  }

  function exceptions(p) {
    var out = [];
    if (!p.started || p.n < 1) return out;
    var past = weeks.filter(function (w) { return w.n < p.n; });
    past.forEach(function (w) {
      var s = weekStats(w);
      var open = s.total - s.done;
      if (!open) return;
      var late = p.n - w.n >= 2;
      out.push({
        sev: late ? "bad" : "warn",
        tag: late ? "Late" : "Open",
        text: w.id + " · " + plural(open, "open task", "open tasks") + " in “" + w.title + "”",
        href: weekHref(w)
      });
    });
    var unreflected = past.filter(function (w) { return !hasReflection(w); });
    if (unreflected.length) {
      out.push({
        sev: "warn",
        tag: "Reflect",
        text: "No reflection yet for " + unreflected.map(function (w) { return w.id; }).join(", "),
        href: weekHref(unreflected[0])
      });
    }
    var seen = {};
    var weak = [];
    past.forEach(function (w) {
      w.concepts.forEach(function (id) {
        if (!seen[id] && fluency(id) < 2) weak.push(id);
        seen[id] = true;
      });
    });
    if (weak.length) {
      out.push({
        sev: "warn",
        tag: "Fluency",
        text: plural(weak.length, "concept", "concepts") + " from past weeks you can't explain yet",
        href: "#glossary"
      });
    }
    var cur = weeks[p.n - 1];
    if (cur) {
      var s = weekStats(cur);
      if (p.dayOfWeek >= 5 && s.done < s.total / 2) {
        out.push({
          sev: "warn",
          tag: "Pace",
          text: cur.id + " is under half done with " + plural(8 - p.dayOfWeek, "day", "days") + " left",
          href: weekHref(cur)
        });
      }
    }
    out.sort(function (a, b) { return (a.sev === "bad" ? 0 : 1) - (b.sev === "bad" ? 0 : 1); });
    return out;
  }

  /* -------------------------------------------------------- fragments */

  function taskRow(t) {
    var done = P().done[t.id];
    var doneDate = parseDate(done);
    return (
      '<li class="task' + (done ? " is-done" : "") + '">' +
      '<input type="checkbox" id="task-' + t.id + '" data-task="' + t.id + '"' + (done ? " checked" : "") + ">" +
      '<div class="task-body">' +
      '<label class="task-text" for="task-' + t.id + '">' + fmt(t.text) + "</label>" +
      '<div class="task-meta"><span class="code">' + t.id + "</span>" +
      '<span class="kind kind-' + t.kind + '">' + (KIND[t.kind] || t.kind) + "</span>" +
      "<span>" + fmtMins(t.mins) + "</span>" +
      (doneDate ? '<span class="done-on">Done ' + fmtDay(doneDate) + "</span>" : "") +
      "</div>" +
      (t.prompt ? promptBlock("task:" + t.id, t.prompt) : "") +
      "</div></li>"
    );
  }

  function weekStrip(p) {
    var cols = weeks.length;
    var areaCells = track.areas
      .map(function (a) {
        var aw = weeks.filter(function (w) { return w.area === a; });
        return (
          '<span class="strip-area" style="grid-column:' + aw[0].n + " / span " + aw.length + '">' +
          esc(a.code) + "</span>"
        );
      })
      .join("");
    var cells = weeks
      .map(function (w) {
        var s = weekStats(w);
        var now = p.started && w.n === p.n;
        var cls = "cell" + (s.done === s.total ? " is-done" : "") + (now ? " is-now" : "");
        return (
          '<a class="' + cls + '" href="' + weekHref(w) + '" aria-label="Week ' + w.n + ", " + esc(w.title) + ", " +
          s.done + " of " + s.total + ' tasks done">' +
          '<span class="cell-bar"><span class="cell-fill" style="height:' + pct(s.done, s.total) + '%"></span></span>' +
          '<span class="cell-n">' + pad2(w.n) + "</span></a>"
        );
      })
      .join("");
    return '<div class="strip" style="--cols:' + cols + '">' + areaCells + cells + "</div>";
  }

  function conceptCard(t, showWeeks) {
    var lvl = fluency(t.id);
    var wks = termWeeks[t.id] || [];
    var search = (t.term + " " + t.plain + " " + t.analogy + " " + t.project).toLowerCase();
    return (
      '<article class="concept" id="term-' + t.id + '" data-area="' + esc(t.area) + '" data-level="' + lvl +
      '" data-search="' + esc(search) + '">' +
      '<header class="concept-head"><h3>' + esc(t.term) + '</h3><span class="code">' + esc(t.area) + "</span></header>" +
      '<p class="concept-plain">' + fmt(t.plain) + "</p>" +
      '<dl class="lens">' +
      "<div><dt>Supply chain</dt><dd>" + fmt(t.analogy) + "</dd></div>" +
      "<div><dt>Where you'll meet it</dt><dd>" + fmt(t.project) + "</dd></div>" +
      "</dl>" +
      (showWeeks && wks.length
        ? '<p class="small muted">Covered in ' +
          wks.map(function (w) { return '<a href="' + weekHref(w) + '">' + w.id + "</a>"; }).join(", ") +
          "</p>"
        : "") +
      '<div class="fluency" role="group" aria-label="How well do you know ' + esc(t.term) + '?">' +
      LEVELS.map(function (l) {
        return (
          '<button type="button" id="flu-' + t.id + "-" + l[0] + '" data-term="' + t.id + '" data-level="' + l[0] +
          '" aria-pressed="' + (lvl === l[0]) + '">' + l[1] + "</button>"
        );
      }).join("") +
      "</div></article>"
    );
  }

  function sectionHead(title, aside, id) {
    return (
      '<div class="section-head"><h2' + (id ? ' id="' + id + '"' : "") + ">" + esc(title) + "</h2>" +
      (aside ? '<p class="section-aside">' + aside + "</p>" : "") + "</div>"
    );
  }

  /* ------------------------------------------------------------ views */

  function viewToday() {
    var p = plan();
    var w = currentWeek(p);
    var s = weekStats(w);
    var behind = openBehind(p);
    var eyebrow;
    var chips = [];
    if (!p.started) {
      eyebrow = "Preview · Week 1 of " + weeks.length;
    } else if (p.n < 1) {
      eyebrow = "Starts " + fmtLong(p.start);
      chips.push(chip("", "Starts in " + plural(daysBetween(p.today, p.start), "day", "days")));
    } else if (p.n > weeks.length) {
      eyebrow = fmtLong(p.today) + " · Track finished";
    } else {
      eyebrow = fmtLong(p.today) + " · Week " + p.n + " of " + weeks.length;
    }
    if (p.started && p.n >= 1) {
      chips.push(behind ? chip(behind > 3 ? "bad" : "warn", plural(behind, "task", "tasks") + " behind") : chip("ok", "On pace"));
    }
    if (p.n <= weeks.length) chips.push(chip("", s.done + " of " + s.total + " done this week"));

    var allDone = allTasks.filter(function (t) { return isDone(t.id); });
    var totalMins = allTasks.reduce(function (a, t) { return a + t.mins; }, 0);
    var doneMins = allDone.reduce(function (a, t) { return a + t.mins; }, 0);
    var explainable = terms.filter(function (t) { return fluency(t.id) >= 2; }).length;
    var shipped = weeks.filter(proofShipped).length;
    var reflected = weeks.filter(hasReflection).length;

    var setup = !p.started
      ? '<section class="panel setup" aria-labelledby="setup-h">' +
        '<h2 id="setup-h">Set your start date</h2>' +
        "<p>The plan runs " + weeks.length + " weeks from the day you pick. Your current week, pace and exceptions all count from it. You can change it later in Settings.</p>" +
        '<div class="form-row">' +
        '<div class="field"><label for="setup-start">Start date</label><input type="date" id="setup-start" value="' + isoDate(mondayOf(p.today)) + '"></div>' +
        '<div class="field"><label for="setup-hours">Hours per week</label><input type="number" id="setup-hours" min="1" max="30" step="0.5" value="4"></div>' +
        '<button type="button" class="btn" data-action="start-plan">Start the plan</button>' +
        "</div></section>"
      : "";

    var finished = p.started && p.n > weeks.length;
    var weekPanel = finished
      ? '<section class="panel">' + sectionHead("Track finished") +
        "<p>The " + weeks.length + " weeks are up. Close any open items below, then pick your next track from the roadmap.</p>" +
        '<p><a class="btn" href="#roadmap">See what\'s next</a></p></section>'
      : '<section class="panel this-week" aria-labelledby="tw-h">' +
        '<div class="section-head"><h2 id="tw-h"><span class="code">' + w.id + "</span> " + esc(w.title) + "</h2>" +
        '<p class="section-aside">' + fmtHours(s.doneMins) + " of " + fmtHours(s.mins) + " planned</p></div>" +
        '<p class="muted">' + fmt(w.goal) + "</p>" +
        '<p class="small muted">Project: <strong>' + esc(w.project.name) + "</strong></p>" +
        (startPrompt(w) ? '<p class="btn-row">' + copyBtn(startPrompt(w), "Copy start prompt", "primary small") + "</p>" : "") +
        '<ul class="tasks">' + w.tasks.map(taskRow).join("") + "</ul>" +
        '<p class="panel-foot"><a href="' + weekHref(w) + '">Open ' + w.id + ": concepts, reading, exec lens, reflection →</a></p>" +
        "</section>";

    var kpi = function (label, value, of, fill) {
      return (
        '<div class="kpi"><dt>' + label + "</dt><dd>" + value + '<span class="of"> / ' + of + "</span></dd>" +
        '<span class="bar" aria-hidden="true"><span style="width:' + fill + '%"></span></span></div>'
      );
    };

    var ex = exceptions(p);
    var exHtml = !p.started
      ? '<p class="muted">Exceptions show up here once your plan has started: late tasks, missing reflections, and concepts you still can\'t explain.</p>'
      : ex.length
        ? '<ul class="exceptions">' +
          ex.map(function (e) {
            return '<li><a href="' + e.href + '">' + chip(e.sev, e.tag) + "<span>" + esc(e.text) + '</span><span class="arrow" aria-hidden="true">→</span></a></li>';
          }).join("") +
          "</ul>"
        : '<p class="all-clear">' + chip("ok", "Clear") + " Nothing needs attention. You're on the plan.</p>";

    var habit =
      "Explain what idempotency means for my Storm Oracle importer, then let me try the fix first.";

    return (
      '<div class="page">' +
      '<header class="page-head"><p class="eyebrow">' + esc(eyebrow) + "</p>" +
      "<h1>" + (finished ? "You finished " + esc(track.title) : esc(w.title)) + "</h1>" +
      '<div class="chips">' + chips.join("") + "</div></header>" +
      setup +
      '<section aria-label="Weekly progress">' + weekStrip(p) + "</section>" +
      '<div class="today-grid">' + weekPanel +
      '<aside class="panel" aria-labelledby="kpi-h"><h2 id="kpi-h">Scorecard</h2><dl class="kpis">' +
      kpi("Tasks done", allDone.length, allTasks.length, pct(allDone.length, allTasks.length)) +
      kpi("Planned hours done", fmtHours(doneMins).replace(" h", ""), fmtHours(totalMins), pct(doneMins, totalMins)) +
      kpi("Concepts you can explain", explainable, terms.length, pct(explainable, terms.length)) +
      kpi("Proof shipped", shipped, weeks.length, pct(shipped, weeks.length)) +
      kpi("Weeks reflected on", reflected, weeks.length, pct(reflected, weeks.length)) +
      "</dl></aside></div>" +
      "<section>" + sectionHead("Needs attention", "Only what needs your attention.") + exHtml + "</section>" +
      '<section class="habit">' +
      '<p class="eyebrow">The habit that ties it together</p>' +
      "<p class=\"habit-line\">Ask Claude Code to teach instead of do.</p>" +
      '<p class="prompt-text">' + esc(habit) + "</p>" +
      '<p class="habit-actions">' + copyBtn(habit, "Copy this prompt") + ' <a href="#prompts">All prompts</a></p>' +
      "</section>" +
      "</div>"
    );
  }

  function viewRoadmap() {
    var p = plan();
    var areas = track.areas
      .map(function (a) {
        var aw = weeks.filter(function (w) { return w.area === a; });
        var done = 0, total = 0;
        aw.forEach(function (w) { var s = weekStats(w); done += s.done; total += s.total; });
        var rows = aw
          .map(function (w) {
            var s = weekStats(w);
            var st = weekStatus(w, p);
            return (
              '<li><a class="week-row" href="' + weekHref(w) + '">' +
              '<span class="code">' + w.id + "</span>" +
              '<span class="wr-main"><span class="wr-title">' + esc(w.title) + '</span><span class="wr-goal">' + fmt(w.goal) + "</span></span>" +
              '<span class="wr-progress"><span class="mini" aria-hidden="true"><span style="width:' + pct(s.done, s.total) + '%"></span></span>' +
              '<span class="num">' + s.done + "/" + s.total + "</span></span>" +
              chip(st[0], st[1]) +
              "</a></li>"
            );
          })
          .join("");
        return (
          '<section class="area">' +
          '<header class="area-head"><span class="area-code">' + esc(a.code) + "</span>" +
          '<div class="area-title"><h2>' + esc(a.title) + "</h2><p>" + fmt(a.summary) + "</p></div>" +
          '<p class="area-meta">Weeks ' + aw[0].n + "–" + aw[aw.length - 1].n + "<br>" + done + "/" + total + " tasks</p></header>" +
          '<ol class="weeks">' + rows + "</ol></section>"
        );
      })
      .join("");

    var next = plannedTracks
      .map(function (t) {
        var expand =
          "Expand the \"" + t.title + "\" track in content/curriculum.js into full weeks, in the same format as the " + track.title +
          " track (tasks with ids and minutes, teach-me prompts, reading, exec lens, proof, explain prompt). Ask me what I want from this track before you write anything.";
        return (
          '<article class="track-card">' +
          '<p class="eyebrow">Outline · ' + plural((t.outline || []).length, "week", "weeks") + "</p>" +
          "<h3>" + esc(t.title) + "</h3><p>" + fmt(t.summary) + "</p>" +
          '<ol class="outline">' +
          (t.outline || []).map(function (o) { return "<li><strong>" + esc(o.title) + ".</strong> " + fmt(o.goal) + "</li>"; }).join("") +
          "</ol>" +
          promptBlock("track:" + t.id, expand, "Prompt to expand this track") +
          "</article>"
        );
      })
      .join("");

    return (
      '<div class="page">' +
      '<header class="page-head"><p class="eyebrow">Roadmap · ' + weeks.length + " weeks · " + track.areas.length + " areas</p>" +
      "<h1>" + esc(track.title) + '</h1><p class="lede">' + fmt(track.summary) + "</p></header>" +
      '<section aria-label="Weekly progress">' + weekStrip(p) + "</section>" +
      areas +
      "<section>" + sectionHead("After this track", "Outlines to grow into full weeks when you get there.") +
      '<div class="track-grid">' + next + "</div></section>" +
      "</div>"
    );
  }

  /* One paste starts a project: coaching rules, set-up steps and the brief. Begins at the next unfinished task. */
  function startPrompt(w) {
    var b = LT.briefs && LT.briefs[w.id];
    if (!b) return "";
    var next = w.tasks.find(function (t) { return !isDone(t.id); }) || w.tasks[0];
    return [
      "I want to learn by building the project below. Work with me the way this says:",
      "",
      LT.coachMode || "",
      "",
      "## Set-up (I don't need to create anything myself)",
      "- Create the folder or folders the brief names, inside the current working directory.",
      "- Run git init in each one, so commit history exists when a task needs it. I don't need a GitHub account.",
      "- Before any step that needs an account (GitHub, Render, Supabase, Discord), a paid API key or Docker, stop and ask me.",
      "- Work one task at a time. Start with task " + next.id + ": " + next.text,
      "  Teach it first, then wait for me before writing any code.",
      "",
      "---",
      "",
      b.text
    ].join("\n");
  }

  function startBlock(w) {
    var prompt = startPrompt(w);
    if (!prompt) return "";
    return (
      '<section class="panel start-panel" aria-labelledby="start-h"><p class="eyebrow">Start here</p>' +
      '<h2 id="start-h">Start this project in Claude Code</h2>' +
      "<p>Copy the prompt and paste it into a new Claude Code chat. Claude creates the folder and walks you through the first task. There's nothing else to set up.</p>" +
      '<p class="btn-row">' + copyBtn(prompt, "Copy start prompt", "primary") + "</p>" +
      '<details class="brief"><summary>Read the full brief</summary>' +
      '<pre class="code-block brief-text">' + esc(LT.briefs[w.id].text) + "</pre></details></section>"
    );
  }

  function viewWeek(w) {
    var p = plan();
    var s = weekStats(w);
    var st = weekStatus(w, p);
    var dates = p.started ? weekDates(w, p) : null;
    var overMins = s.mins - p.hours * 60;
    var r = reflection(w);
    var proof = P().proof[w.id] || {};
    var prev = weeks[w.n - 2];
    var next = weeks[w.n];
    var shipped = proofShipped(w);

    var concepts = (w.concepts || [])
      .map(function (id) { return termById[id] ? conceptCard(termById[id], false) : ""; })
      .join("");

    var reading = (w.read || [])
      .map(function (rd) {
        return (
          '<li><a href="' + esc(rd.url) + '" target="_blank" rel="noopener">' + esc(rd.title) + "</a>" +
          '<span class="read-meta">' + fmtMins(rd.mins) + "</span>" +
          '<p class="muted">' + fmt(rd.focus) + "</p></li>"
        );
      })
      .join("");

    var reflect = FIELDS.map(function (f) {
      var id = "refl-" + w.id + "-" + f[0];
      var hint = f[0] === "explain" ? '<p class="hint" id="' + id + '-hint">' + fmt(w.explain) + "</p>" : "";
      return (
        '<div class="field"><label for="' + id + '">' + f[1] + "</label>" + hint +
        '<textarea id="' + id + '" rows="4" data-journal="' + w.id + ":" + f[0] + '"' +
        (hint ? ' aria-describedby="' + id + '-hint"' : "") + ">" + esc(r[f[0]] || "") + "</textarea></div>"
      );
    }).join("");

    var pt = proveTask(w);

    return (
      '<article class="page">' +
      '<header class="page-head">' +
      '<dl class="manifest">' +
      '<div><dt>Week</dt><dd class="big">' + w.id + "</dd></div>" +
      "<div><dt>Area</dt><dd>" + esc(w.area.code) + " · " + esc(w.area.title) + "</dd></div>" +
      "<div><dt>Dates</dt><dd>" + (dates ? fmtDay(dates[0]) + " – " + fmtDay(dates[1]) : "Not scheduled") + "</dd></div>" +
      "<div><dt>Planned</dt><dd>" + fmtHours(s.mins) + ' <span class="of">/ ' + p.hours + " h budget</span></dd></div>" +
      "<div><dt>Done</dt><dd>" + s.done + " / " + s.total + "</dd></div>" +
      "</dl>" +
      '<div class="title-row"><h1>' + esc(w.title) + "</h1>" + chip(st[0], st[1]) + "</div>" +
      '<p class="lede">' + fmt(w.goal) + "</p>" +
      '<section class="panel project-panel" aria-labelledby="proj-h"><p class="eyebrow">The project</p>' +
      '<h2 id="proj-h">' + esc(w.project.name) + "</h2><p>" + fmt(w.project.pitch) + "</p>" +
      '<p class="small muted">You\'ll use: ' + esc(w.project.tools.join(", ")) + "</p></section>" +
      startBlock(w) +
      (overMins > 0
        ? '<p class="note">This week plans ' + fmtHours(s.mins) + ", " + fmtHours(overMins) + " over your weekly budget. Pick one task to carry into next week rather than squeezing it in.</p>"
        : "") +
      "</header>" +

      "<section>" + sectionHead("Concepts", "Rate each one honestly. “Can explain it” means you could explain it to a peer without notes.") +
      '<div class="concepts">' + concepts + "</div></section>" +

      "<section>" + sectionHead("Tasks", fmtHours(s.doneMins) + " of " + fmtHours(s.mins) + " done") +
      '<ul class="tasks">' + w.tasks.map(taskRow).join("") + "</ul></section>" +

      (reading ? "<section>" + sectionHead("Reading") + '<ul class="reading">' + reading + "</ul></section>" : "") +

      '<section class="exec" aria-labelledby="exec-h">' +
      '<p class="eyebrow">Exec lens</p><h2 id="exec-h">What this changes in your day job</h2>' +
      '<div class="exec-grid"><div><h3>Questions you can now ask</h3><ul>' +
      w.exec.ask.map(function (q) { return "<li>" + fmt(q) + "</li>"; }).join("") +
      "</ul></div><div><h3>Decision this informs</h3><p>" + fmt(w.exec.decides) + "</p></div></div></section>" +

      '<section class="proof-block">' + sectionHead("Proof", shipped ? chip("ok", "Shipped") : chip("", "Not shipped yet")) +
      '<p class="deliverable">' + fmt(w.proof) + "</p>" +
      (pt ? '<p class="small muted">Ticking ' + '<span class="code">' + pt.id + "</span> marks this week's proof as shipped.</p>" : "") +
      '<div class="form-row">' +
      '<div class="field grow"><label for="proof-' + w.id + '-url">Evidence link</label>' +
      '<input type="url" id="proof-' + w.id + '-url" placeholder="https://…" data-proof="' + w.id + ':url" value="' + esc(proof.url || "") + '"></div>' +
      '<div class="field grow"><label for="proof-' + w.id + '-note">Note</label>' +
      '<input type="text" id="proof-' + w.id + '-note" placeholder="Where it lives, what it shows" data-proof="' + w.id + ':note" value="' + esc(proof.note || "") + '"></div>' +
      "</div></section>" +

      "<section>" + sectionHead("Reflect", "Saved as you type.") + '<div class="reflect">' + reflect + "</div></section>" +

      '<nav class="pager" aria-label="Weeks">' +
      (prev ? '<a href="' + weekHref(prev) + '"><span class="eyebrow">Previous</span>' + prev.id + " · " + esc(prev.title) + "</a>" : "<span></span>") +
      (next ? '<a class="next" href="' + weekHref(next) + '"><span class="eyebrow">Next</span>' + next.id + " · " + esc(next.title) + "</a>" : '<a class="next" href="#roadmap"><span class="eyebrow">Next</span>What comes after</a>') +
      "</nav>" +
      "</article>"
    );
  }

  var glossFilter = { q: "", area: "all", weak: false };

  function viewGlossary() {
    var counts = [0, 0, 0, 0];
    terms.forEach(function (t) { counts[fluency(t.id)]++; });
    var segs = [
      [3, "Have used it", "used"],
      [2, "Can explain it", "explain"],
      [1, "Heard of it", "heard"],
      [0, "Not rated", "none"]
    ];
    var bar = segs
      .map(function (sg) {
        return counts[sg[0]] ? '<span class="seg seg-' + sg[2] + '" style="flex:' + counts[sg[0]] + '"></span>' : "";
      })
      .join("");
    var legend = segs
      .map(function (sg) {
        return '<li><span class="sw seg-' + sg[2] + '"></span>' + sg[1] + ' <strong class="num">' + counts[sg[0]] + "</strong></li>";
      })
      .join("");
    var areaCodes = ["all"].concat(track.areas.map(function (a) { return a.code; }));
    var filters = areaCodes
      .map(function (c) {
        return '<button type="button" class="filter" data-area-filter="' + c + '" aria-pressed="' + (glossFilter.area === c) + '">' + (c === "all" ? "All" : c) + "</button>";
      })
      .join("");

    return (
      '<div class="page">' +
      '<header class="page-head"><p class="eyebrow">Glossary · ' + terms.length + " concepts</p><h1>Concepts, three ways</h1>" +
      '<p class="lede">Each term in plain English, in supply chain terms, and where you\'ll meet it in the weekly projects. Your ratings feed the fluency score on Today.</p></header>' +
      '<section aria-label="Fluency"><div class="stack-bar" role="img" aria-label="' +
      counts[3] + " used, " + counts[2] + " can explain, " + counts[1] + " heard of, " + counts[0] + ' not rated">' + bar + "</div>" +
      '<ul class="legend">' + legend + "</ul></section>" +
      '<div class="toolbar">' +
      '<div class="field grow"><label for="gloss-q" class="sr-only">Search concepts</label>' +
      '<input type="search" id="gloss-q" placeholder="Search concepts" value="' + esc(glossFilter.q) + '"></div>' +
      '<div class="filters" role="group" aria-label="Area">' + filters + "</div>" +
      '<button type="button" class="filter" data-weak-filter aria-pressed="' + glossFilter.weak + '">Can\'t explain yet</button>' +
      "</div>" +
      '<div class="concepts" id="gloss-list">' + terms.map(function (t) { return conceptCard(t, true); }).join("") + "</div>" +
      '<p class="muted" id="gloss-empty" hidden>No concepts match. Clear the search or filters.</p>' +
      "</div>"
    );
  }

  function applyGlossFilter() {
    var list = document.getElementById("gloss-list");
    if (!list) return;
    var q = glossFilter.q.trim().toLowerCase();
    var shown = 0;
    Array.prototype.forEach.call(list.children, function (el) {
      var ok =
        (glossFilter.area === "all" || el.dataset.area === glossFilter.area) &&
        (!glossFilter.weak || Number(el.dataset.level) < 2) &&
        (!q || el.dataset.search.indexOf(q) !== -1);
      el.hidden = !ok;
      if (ok) shown++;
    });
    document.getElementById("gloss-empty").hidden = shown > 0;
  }

  function viewPrompts() {
    var groups = (LT.prompts || [])
      .map(function (g) {
        return (
          "<section>" + sectionHead(g.group) + '<div class="prompt-grid">' +
          g.items.map(function (it) {
            return (
              '<article class="prompt-card"><h3>' + esc(it.title) + '</h3><p class="small muted">' + esc(it.when) + "</p>" +
              '<p class="prompt-text">' + esc(it.text) + "</p>" + copyBtn(it.text, "Copy prompt") + "</article>"
            );
          }).join("") +
          "</div></section>"
        );
      })
      .join("");
    return (
      '<div class="page">' +
      '<header class="page-head"><p class="eyebrow">Prompt library</p><h1>Teach, don\'t do</h1>' +
      '<p class="lede">Prompts that make Claude Code your coach rather than your ghostwriter. Fill in the {braces} before you paste.</p></header>' +
      '<section class="panel coach">' + sectionHead("Make teaching the default") +
      "<p>Paste this into the <code>CLAUDE.md</code> at the root of any repo you learn in. Claude Code reads it at the start of every session, so you don't have to ask each time. The same text is in <code>templates/CLAUDE-coach-mode.md</code>.</p>" +
      '<pre class="code-block">' + esc(LT.coachMode || "") + "</pre>" +
      copyBtn(LT.coachMode || "", "Copy coach mode", "small") + "</section>" +
      groups +
      "</div>"
    );
  }

  function viewJournal() {
    var entries = weeks
      .filter(hasReflection)
      .map(function (w) {
        var r = reflection(w);
        return (
          '<article class="entry"><header class="entry-head"><span class="code">' + w.id + "</span><h2>" + esc(w.title) + "</h2>" +
          '<a href="' + weekHref(w) + '">Edit</a></header><dl>' +
          FIELDS.filter(function (f) { return String(r[f[0]] || "").trim(); })
            .map(function (f) { return "<div><dt>" + f[1] + '</dt><dd class="journal-text">' + esc(r[f[0]]) + "</dd></div>"; })
            .join("") +
          "</dl></article>"
        );
      })
      .join("");
    return (
      '<div class="page">' +
      '<header class="page-head"><p class="eyebrow">Journal</p><h1>What you learned, in your words</h1>' +
      '<p class="lede">Your weekly reflections in one place. The “Explain it” answers are the ones to reread before a meeting with engineers or vendors.</p></header>' +
      (entries ||
        '<p class="empty">Reflections you write at the bottom of each week page show up here. Start with <a href="' +
          weekHref(currentWeek(plan())) + '">this week</a>.</p>') +
      "</div>"
    );
  }

  function viewProof() {
    var rows = weeks
      .map(function (w) {
        var pr = P().proof[w.id] || {};
        var url = safeUrl(pr.url);
        var shipped = proofShipped(w);
        return (
          '<li class="proof-row"><a class="code" href="' + weekHref(w) + '">' + w.id + "</a>" +
          '<div class="pr-main"><p class="pr-title">' + fmt(w.proof) + "</p>" +
          (url ? '<p class="small"><a href="' + esc(url) + '" target="_blank" rel="noopener">' + esc(url) + "</a></p>" : "") +
          (pr.note ? '<p class="small muted">' + esc(pr.note) + "</p>" : "") +
          "</div>" + (shipped ? chip("ok", "Shipped") : chip("", "Not yet")) + "</li>"
        );
      })
      .join("");
    var shippedCount = weeks.filter(proofShipped).length;
    return (
      '<div class="page">' +
      '<header class="page-head"><p class="eyebrow">Proof · ' + shippedCount + " of " + weeks.length + " shipped</p><h1>Evidence, not certificates</h1>" +
      '<p class="lede">One tangible deliverable per week, built on that week\'s project. This list is what sets you apart: a live deployment, a deliberately broken build that alerted you, a database role that can\'t delete, before-and-after timings.</p></header>' +
      '<ul class="proof-list">' + rows + "</ul>" +
      "</div>"
    );
  }

  function viewSettings() {
    var p = plan();
    var s = P().settings;
    var json = JSON.stringify(Store.exportData(), null, 2);
    var topLevel = window.self === window.top;
    return (
      '<div class="page">' +
      '<header class="page-head"><p class="eyebrow">Settings</p><h1>Plan and data</h1></header>' +
      '<section class="panel">' + sectionHead("Plan") +
      '<div class="form-row">' +
      '<div class="field"><label for="set-start">Start date</label><input type="date" id="set-start" value="' + esc(s.start || "") + '"></div>' +
      '<div class="field"><label for="set-hours">Hours per week</label><input type="number" id="set-hours" min="1" max="30" step="0.5" value="' + p.hours + '"></div>' +
      "</div>" +
      '<p class="small muted">Changing the start date moves every week. Your ticked tasks stay ticked.</p></section>' +

      '<section class="panel">' + sectionHead("Your data") +
      '<p class="sync-line"><span class="dot dot-' + Store.mode + '"></span>' + esc(Store.statusText()) + "</p>" +
      '<h3>Back up</h3><p class="small muted">Everything: ticks, ratings, proof links and reflections. Keep a copy somewhere safe, or paste it to Claude for a progress review.</p>' +
      '<label for="export-box" class="sr-only">Backup</label><textarea id="export-box" rows="6" readonly>' + esc(json) + "</textarea>" +
      '<p class="btn-row">' + copyBtn(json, "Copy backup", "small") +
      (topLevel ? ' <button type="button" class="btn secondary small" data-action="download">Download .json</button>' : "") + "</p>" +
      '<h3>Restore</h3><p class="small muted">Paste a backup or choose a file. This replaces everything here.</p>' +
      '<div class="field"><label for="import-file">Backup file</label><input type="file" id="import-file" accept="application/json,.json"></div>' +
      '<div class="field"><label for="import-box">Or paste it</label><textarea id="import-box" rows="4" placeholder="{ &quot;app&quot;: &quot;learntech&quot;, … }"></textarea></div>' +
      '<p class="btn-row"><button type="button" class="btn small" data-action="import">Replace with this backup</button></p>' +
      '<h3>Start over</h3><p class="small muted">Erases every tick, rating, link and reflection.</p>' +
      '<p class="btn-row"><button type="button" class="btn danger small" data-action="reset">Erase all progress</button></p>' +
      "</section>" +

      '<section class="panel">' + sectionHead("Change what you learn") +
      '<ul class="plain-list">' +
      "<li><code>content/curriculum.js</code>: tracks, weeks, tasks, reading, exec lens.</li>" +
      "<li><code>content/glossary.js</code>: concepts with plain, analogy and project explanations.</li>" +
      "<li><code>content/prompts.js</code>: the prompt library and coach mode.</li>" +
      "<li><code>projects/*.md</code>: the project briefs. After editing, run <code>node scripts/build-briefs.js</code>.</li>" +
      "</ul>" +
      '<p class="small muted">Never change an existing task or concept id; your progress is saved against them. The README explains the rest.</p>' +
      "</section>" +
      "</div>"
    );
  }

  function viewNotFound() {
    return (
      '<div class="page"><header class="page-head"><p class="eyebrow">Not found</p><h1>That page doesn\'t exist</h1>' +
      '<p class="lede"><a href="#today">Go to Today</a> or pick a page from the menu.</p></header></div>'
    );
  }

  /* ------------------------------------------------------------ router */

  function currentRoute() {
    return decodeURIComponent((location.hash || "").slice(1)).toLowerCase() || "today";
  }

  function renderNav(r) {
    var p = plan();
    var cw = currentWeek(p);
    var items = [
      ["today", "Today"],
      [cw.id.toLowerCase(), "Week " + pad2(cw.n)],
      ["roadmap", "Roadmap"],
      ["glossary", "Glossary"],
      ["prompts", "Prompts"],
      ["journal", "Journal"],
      ["proof", "Proof"],
      ["settings", "Settings"]
    ];
    var active = r.indexOf("term-") === 0 ? "glossary" : r;
    nav.innerHTML = items
      .map(function (it) {
        return '<a href="#' + it[0] + '"' + (active === it[0] ? ' aria-current="page"' : "") + ">" + it[1] + "</a>";
      })
      .join("");
  }

  function renderSync() {
    syncEl.innerHTML = '<span class="dot dot-' + Store.mode + '"></span>' + esc(Store.statusText());
  }

  function render(scroll) {
    var r = currentRoute();
    var focusId = document.activeElement && document.activeElement.id;
    var y = window.scrollY;
    copyBank = new Map();
    var html;
    var title = "";
    var wk = /^w\d+$/.test(r) ? weekById[r.toUpperCase()] : null;
    if (r === "today") { html = viewToday(); title = "Today"; }
    else if (wk) { html = viewWeek(wk); title = wk.id + " · " + wk.title; }
    else if (r === "roadmap") { html = viewRoadmap(); title = "Roadmap"; }
    else if (r === "glossary" || r.indexOf("term-") === 0) { html = viewGlossary(); title = "Glossary"; }
    else if (r === "prompts") { html = viewPrompts(); title = "Prompts"; }
    else if (r === "journal") { html = viewJournal(); title = "Journal"; }
    else if (r === "proof") { html = viewProof(); title = "Proof"; }
    else if (r === "settings") { html = viewSettings(); title = "Settings"; }
    else { html = viewNotFound(); title = "Not found"; }
    main.innerHTML = html;
    renderNav(r);
    try { document.title = "LearnTech · " + title; } catch (e) {}
    applyGlossFilter();

    if (scroll) {
      var target = r.indexOf("term-") === 0 ? document.getElementById(r) : null;
      if (target) {
        glossFilter = { q: "", area: "all", weak: false };
        applyGlossFilter();
        target.scrollIntoView({ block: "start" });
        target.classList.add("flash");
      } else {
        window.scrollTo(0, 0);
      }
      main.focus({ preventScroll: true });
    } else {
      window.scrollTo(0, y);
      var f = focusId && document.getElementById(focusId);
      if (f) f.focus({ preventScroll: true });
    }
  }

  /* ----------------------------------------------------- interactions */

  var toastTimer;
  function toast(msg) {
    toastEl.textContent = msg;
    toastEl.hidden = false;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toastEl.hidden = true; }, 2200);
  }

  function copyText(text) {
    var done = function () { toast("Copied"); };
    var fallback = function () {
      var ta = document.createElement("textarea");
      ta.value = text;
      ta.setAttribute("readonly", "");
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.select();
      var ok = false;
      try { ok = document.execCommand("copy"); } catch (e) {}
      document.body.removeChild(ta);
      toast(ok ? "Copied" : "Couldn't copy. Select the text and copy it yourself.");
    };
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(done, fallback);
    } else {
      fallback();
    }
  }

  function toggleTask(id, checked) {
    if (checked) P().done[id] = isoDate(today());
    else delete P().done[id];
    Store.save("progress");
    render(false);
    if (checked) {
      var w = weeks.find(function (x) { return x.tasks.some(function (t) { return t.id === id; }); });
      var s = w && weekStats(w);
      if (s && s.done === s.total) {
        toast(hasReflection(w) ? w.id + " complete." : w.id + " complete. Write your reflection while it's fresh.");
      }
    }
  }

  function armButton(btn, label, onConfirm) {
    if (btn.dataset.armed === "1") {
      btn.dataset.armed = "";
      onConfirm();
      return;
    }
    var original = btn.textContent;
    btn.dataset.armed = "1";
    btn.textContent = label;
    setTimeout(function () {
      if (btn.isConnected && btn.dataset.armed === "1") {
        btn.dataset.armed = "";
        btn.textContent = original;
      }
    }, 5000);
  }

  var actions = {
    "start-plan": function () {
      var start = document.getElementById("setup-start").value;
      var hours = Number(document.getElementById("setup-hours").value);
      if (!parseDate(start)) { toast("Pick a start date first."); return; }
      P().settings.start = start;
      P().settings.hours = hours > 0 ? hours : 4;
      Store.save("progress");
      render(true);
      toast("Plan started. Week 1 runs " + fmtDay(parseDate(start)) + " – " + fmtDay(addDays(parseDate(start), 6)) + ".");
    },
    download: function () {
      var blob = new Blob([JSON.stringify(Store.exportData(), null, 2)], { type: "application/json" });
      var a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = "learntech-backup-" + isoDate(today()) + ".json";
      document.body.appendChild(a);
      a.click();
      setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 500);
    },
    "import": function (btn) {
      var raw = document.getElementById("import-box").value.trim();
      var parsed;
      try { parsed = JSON.parse(raw); } catch (e) { parsed = null; }
      if (!parsed || !parsed.progress) {
        toast("That isn't a LearnTech backup. It should start with { \"app\": \"learntech\".");
        return;
      }
      armButton(btn, "Click again to replace everything", function () {
        Store.replaceAll(parsed);
        render(false);
        toast("Backup restored.");
      });
    },
    reset: function (btn) {
      armButton(btn, "Click again to erase everything", function () {
        Store.reset();
        render(true);
        toast("Progress erased.");
      });
    }
  };

  main.addEventListener("change", function (e) {
    var el = e.target;
    if (el.dataset && el.dataset.task) {
      toggleTask(el.dataset.task, el.checked);
    } else if (el.id === "set-start") {
      if (el.value && !parseDate(el.value)) return;
      if (el.value) P().settings.start = el.value;
      else delete P().settings.start;
      Store.save("progress");
      renderNav(currentRoute());
    } else if (el.id === "set-hours") {
      var h = Number(el.value);
      if (h > 0) { P().settings.hours = h; Store.save("progress"); }
    } else if (el.id === "import-file" && el.files && el.files[0]) {
      var reader = new FileReader();
      reader.onload = function () { document.getElementById("import-box").value = String(reader.result || ""); };
      reader.readAsText(el.files[0]);
    }
  });

  main.addEventListener("input", function (e) {
    var el = e.target;
    var parts;
    if (el.dataset && el.dataset.journal) {
      parts = el.dataset.journal.split(":");
      var entry = (J().weeks[parts[0]] = J().weeks[parts[0]] || {});
      entry[parts[1]] = el.value;
      Store.save("journal");
    } else if (el.dataset && el.dataset.proof) {
      parts = el.dataset.proof.split(":");
      var pr = (P().proof[parts[0]] = P().proof[parts[0]] || {});
      pr[parts[1]] = el.value;
      Store.save("progress");
    } else if (el.id === "gloss-q") {
      glossFilter.q = el.value;
      applyGlossFilter();
    }
  });

  main.addEventListener("click", function (e) {
    var b = e.target.closest("button");
    if (!b || !main.contains(b)) return;
    if (b.dataset.copy) {
      copyText(copyBank.get(b.dataset.copy) || "");
    } else if (b.dataset.term) {
      var lvl = Number(b.dataset.level);
      if (fluency(b.dataset.term) === lvl) delete P().fluency[b.dataset.term];
      else P().fluency[b.dataset.term] = lvl;
      Store.save("progress");
      render(false);
    } else if (b.dataset.areaFilter) {
      glossFilter.area = b.dataset.areaFilter;
      main.querySelectorAll("[data-area-filter]").forEach(function (x) {
        x.setAttribute("aria-pressed", String(x === b));
      });
      applyGlossFilter();
    } else if (b.hasAttribute("data-weak-filter")) {
      glossFilter.weak = !glossFilter.weak;
      b.setAttribute("aria-pressed", String(glossFilter.weak));
      applyGlossFilter();
    } else if (b.dataset.action && actions[b.dataset.action]) {
      actions[b.dataset.action](b);
    }
  });

  /* `toggle` doesn't bubble, so listen during capture. */
  main.addEventListener(
    "toggle",
    function (e) {
      var d = e.target;
      if (d.tagName !== "DETAILS" || !d.dataset.key) return;
      if (d.open) openDetails.add(d.dataset.key);
      else openDetails.delete(d.dataset.key);
    },
    true
  );

  window.addEventListener("hashchange", function () { render(true); });

  /* ------------------------------------------------------------- boot */

  Store.onStatus = renderSync;
  Store.onRemoteChange = function () { render(false); };
  Store.load();
  renderSync();
  render(true);
  Store.connect();
})();
