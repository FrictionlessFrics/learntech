(function () {
  "use strict";

  var REPO = "https://github.com/FrictionlessFrics/fssai-dashboard";
  var PAGE = 50;
  var RETIRED = { withdrawn: true, overturned: true };
  var data = window.FSD || { entities: [], sources: [], scope: {} };
  var shown = PAGE;

  function el(tag, attrs, children) {
    var node = document.createElement(tag);
    Object.keys(attrs || {}).forEach(function (k) {
      if (k === "text") node.textContent = attrs[k];
      else node.setAttribute(k, attrs[k]);
    });
    (children || []).forEach(function (c) { if (c) node.appendChild(c); });
    return node;
  }

  function link(url, text) {
    // Only ever link out to https sources.
    if (!/^https:\/\//.test(url || "")) return el("span", { text: text });
    return el("a", { href: url, text: text, rel: "noopener", target: "_blank" });
  }

  function day(iso) {
    if (!iso) return "date not stated";
    var d = new Date(iso.slice(0, 10) + "T00:00:00");
    return isNaN(d) ? iso : d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
  }

  function correctionUrl(e) {
    return REPO + "/issues/new?template=correction.yml&title=" + encodeURIComponent("Correction: " + (e.name || e.key) + " (" + e.key + ")");
  }

  function reviewedSources() {
    return data.sources.filter(function (s) { return s.applies_to_all && s.reviewed_through; });
  }

  function badges(e) {
    var out = [];
    var live = e.actions.filter(function (a) { return !RETIRED[a.status]; });
    var retired = e.actions.length - live.length;
    if (live.length) out.push(el("span", { "class": "badge action", text: live.length + " regulatory action" + (live.length > 1 ? "s" : "") + " on record" }));
    if (retired) out.push(el("span", { "class": "badge retired", text: retired + " withdrawn or overturned" }));
    if (!e.actions.length) out.push(el("span", { "class": "badge none", text: "No actions found in the sources we checked" }));
    var status = (e.licence && e.licence.found && e.licence.status) || "";
    if (/suspend|cancel/i.test(status)) out.push(el("span", { "class": "badge severe", text: "Licence " + status.toLowerCase() + " (FoSCoS, " + day(e.licence.checked_at) + ")" }));
    else if (/expir/i.test(status)) out.push(el("span", { "class": "badge info", text: "Licence shown as expired on FoSCoS" }));
    e.hygiene.forEach(function (h) {
      if (h.rating) out.push(el("span", { "class": "badge info", text: "FSSAI hygiene rating: " + h.rating }));
    });
    return el("div", { "class": "badges" }, out);
  }

  function actionItem(a) {
    var what = a.label + (a.section ? ", " + a.section : "") + " (" + day(a.date) + ", " + a.authority + ")";
    var lines = [el("div", { "class": "what", text: what })];
    if (a.finding) lines.push(el("div", { text: "Legal finding stated in source: " + a.finding }));
    if (a.summary) lines.push(el("div", { text: a.summary }));
    lines.push(el("div", { "class": "fine" }, [
      document.createTextNode("Status: " + a.status_label + " as of " + day(a.status_as_of) + ". Source: "),
      link(a.source_url, a.source_title || "government document"),
      document.createTextNode(a.name_in_source ? ". Named in source as “" + a.name_in_source + "”." : ".")
    ]));
    lines.push(el("div", { "class": "fine", text: a.match === "licence_in_source"
      ? "The source gives this licence number."
      : "Matched to this licence by a reviewer, by name and address." }));
    return el("li", { "class": "event" + (RETIRED[a.status] ? " retired" : "") }, lines);
  }

  function detail(e) {
    var parts = [];
    if (e.actions.length) {
      parts.push(el("h3", { text: "Regulatory actions" }), el("ul", {}, e.actions.map(actionItem)));
    } else {
      parts.push(el("h3", { text: "Regulatory actions" }), el("p", { text:
        "None found in the sources listed below. That is not the same as a clean record: most actions are never published." }));
    }
    if (e.licence) {
      var lic = e.licence;
      parts.push(el("h3", { text: "Licence" }), el("p", {}, [
        document.createTextNode(lic.found
          ? [lic.kind, lic.status && "status " + lic.status, lic.valid_until && "valid until " + day(lic.valid_until)].filter(Boolean).join(", ") + ". "
          : "We could not read a FoSCoS record for this number. "),
        el("span", { "class": "fine", text: "Checked " + day(lic.checked_at) + " on " }),
        link(lic.source_url, "FoSCoS")
      ]));
    }
    e.hygiene.forEach(function (h) {
      var said = [h.rating && "Rating " + h.rating, h.audit_date && "audited " + day(h.audit_date),
        h.valid_until && "valid until " + day(h.valid_until), h.auditor && "by " + h.auditor].filter(Boolean).join(", ");
      parts.push(el("h3", { text: "FSSAI hygiene rating" }), el("p", {}, [
        document.createTextNode((said || "Listed in the directory") +
          (h.licence_no ? ". " : ". The directory gives no licence number for this entry, so it is not linked to any other record. ")),
        link(h.source_url, "FSSAI hygiene directory")
      ]));
    });
    var checked = [];
    if (e.hygiene.length) checked.push("FSSAI hygiene rating directory");
    if (e.licence) checked.push("FoSCoS licence register");
    reviewedSources().forEach(function (s) {
      checked.push(s.name + (s.reviewed_from ? ", " + day(s.reviewed_from) + " to " : ", up to ") + day(s.reviewed_through));
    });
    parts.push(el("h3", { text: "Sources checked for this entry" }), el("ul", {}, checked.map(function (c) { return el("li", { text: c }); })),
      el("p", { "class": "fine" }, [link(correctionUrl(e), "Ask for a correction to this entry")]));
    return el("details", {}, [el("summary", { text: "Details and sources" }), el("div", { "class": "detail" }, parts)]);
  }

  function card(e) {
    var meta = [e.address, e.district].filter(Boolean).join(", ");
    meta += (meta ? " · " : "") + (e.licence_no ? "FSSAI licence " + e.licence_no : "No licence number in source");
    return el("article", { "class": "card" }, [
      el("h2", { text: e.name || "Name not given" }), el("p", { "class": "meta", text: meta }), badges(e), detail(e)
    ]);
  }

  function matches(e, q) {
    if (!q) return true;
    var digits = q.replace(/[\s-]/g, "");
    if (/^\d{4,}$/.test(digits)) return (e.licence_no || "").indexOf(digits) !== -1;
    var hay = (e.name + " " + e.address + " " + e.district).toLowerCase();
    return q.toLowerCase().split(/\s+/).every(function (w) { return hay.indexOf(w) !== -1; });
  }

  function render() {
    var q = document.getElementById("q").value.trim();
    var only = document.getElementById("only-actions").checked;
    var list = data.entities.filter(function (e) { return matches(e, q) && (!only || e.actions.length); });
    var results = document.getElementById("results");
    results.textContent = "";

    if (!data.entities.length) {
      results.appendChild(el("p", { "class": "empty", text:
        "Nothing published yet. The data pipeline has not finished its first run, so this page has no records to show. That is not a statement about any business." }));
      document.getElementById("count").textContent = "";
      return;
    }
    if (!list.length) {
      results.appendChild(el("p", { "class": "empty", text:
        "Not in our data. That tells you nothing about this business either way: most establishments do not appear in any public record we can read." }));
      document.getElementById("count").textContent = "";
      return;
    }
    document.getElementById("count").textContent = list.length + " entr" + (list.length === 1 ? "y" : "ies") +
      (list.length > shown ? ", showing the first " + shown : "");
    list.slice(0, shown).forEach(function (e) { results.appendChild(card(e)); });
    if (list.length > shown) {
      var more = el("button", { "class": "more", type: "button", text: "Show more" });
      more.addEventListener("click", function () { shown += PAGE; render(); });
      results.appendChild(more);
    }
  }

  function sourcesTable() {
    var STATUS = { not_started: "Not started", active: "Active", paused: "Paused" };
    var table = document.getElementById("sources");
    table.appendChild(el("tr", {}, ["Source", "What it covers", "Status", "Last run"].map(function (h) { return el("th", { text: h }); })));
    data.sources.forEach(function (s) {
      var run = s.run ? day(s.run.last_attempt) + (s.run.outcome === "complete" ? "" : " (stopped early)") : "Never";
      var cover = s.covers + (s.reviewed_through ? " Reviewed up to " + day(s.reviewed_through) + "." : "");
      table.appendChild(el("tr", {}, [
        el("td", {}, [s.url ? link(s.url, s.name) : el("span", { text: s.name })]),
        el("td", { text: cover }), el("td", { text: STATUS[s.status] || s.status }), el("td", { text: s.kind === "manual" ? "Entered by hand" : run })
      ]));
    });
    document.getElementById("generated").textContent = data.generated_at
      ? "Data last built " + day(data.generated_at) + ". Area covered: " + (data.scope.districts || []).join(" and ") + "."
      : "No data built yet.";
  }

  document.getElementById("city").textContent = data.scope.city || "India";
  document.getElementById("correct-link").href = REPO + "/issues/new?template=correction.yml";
  document.getElementById("q").addEventListener("input", function () { shown = PAGE; render(); });
  document.getElementById("only-actions").addEventListener("change", function () { shown = PAGE; render(); });
  sourcesTable();
  render();
})();
