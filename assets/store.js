/*
  Where your progress is saved.

  - Always: this browser's localStorage. Works anywhere, including GitHub Pages
    and opening index.html straight from disk.
  - Also, when the site runs as a claude.ai artifact: your Claude account
    (the artifact's `db` capability). That copy follows you across devices,
    and Claude can read it back when you ask for a progress review.

  Progress is kept in two buckets so neither grows too large:
    progress: settings, ticked tasks, fluency ratings, proof links
    journal:  weekly reflections
*/
(function () {
  "use strict";

  var LOCAL_KEYS = { progress: "learntech:progress:v1", journal: "learntech:journal:v1" };
  var REMOTE_DOCS = { progress: "kv/progress", journal: "kv/journal" };
  var PUSH_DELAY_MS = 900;

  function obj(x) {
    return x && typeof x === "object" && !Array.isArray(x) ? x : {};
  }

  function clone(x) {
    return JSON.parse(JSON.stringify(x));
  }

  function normalize(raw) {
    var p = obj(raw && raw.progress);
    var j = obj(raw && raw.journal);
    return {
      progress: {
        settings: obj(p.settings),
        done: obj(p.done),
        fluency: obj(p.fluency),
        proof: obj(p.proof),
        updatedAt: p.updatedAt || null
      },
      journal: { weeks: obj(j.weeks), updatedAt: j.updatedAt || null }
    };
  }

  function readLocal(key) {
    try {
      var s = window.localStorage.getItem(key);
      return s ? JSON.parse(s) : null;
    } catch (e) {
      return null;
    }
  }

  function writeLocal(key, value) {
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (e) {
      return false;
    }
  }

  var Store = {
    data: normalize(null),
    /* local | cloud | cloud-error | read-only */
    mode: "local",
    localOk: true,
    db: null,
    timers: {},
    chains: {},
    inFlight: 0,
    onStatus: function () {},
    onRemoteChange: function () {},

    load: function () {
      this.data = normalize({
        progress: readLocal(LOCAL_KEYS.progress),
        journal: readLocal(LOCAL_KEYS.journal)
      });
      this.localOk = writeLocal("learntech:probe", 1);
    },

    isEmpty: function (d) {
      d = d || this.data;
      return (
        !d.progress.settings.start &&
        !Object.keys(d.progress.done).length &&
        !Object.keys(d.progress.fluency).length &&
        !Object.keys(d.progress.proof).length &&
        !Object.keys(d.journal.weeks).length
      );
    },

    statusText: function () {
      switch (this.mode) {
        case "cloud":
          return "Synced to your Claude account";
        case "cloud-error":
          return "Sync paused. Changes are kept in this browser and retry on your next edit.";
        case "read-only":
          return "View only. Your changes stay in this browser.";
        default:
          return this.localOk
            ? "Saved in this browser. Export a backup from Settings."
            : "This browser isn't saving (private window?). Export a backup before you close it.";
      }
    },

    setMode: function (mode) {
      this.mode = mode;
      this.onStatus(mode);
    },

    /* Connect to the claude.ai artifact store when it exists. Safe to call anywhere. */
    connect: function () {
      var self = this;
      var c = window.claude;
      if (!c || typeof c.use !== "function") return Promise.resolve();
      return Promise.resolve()
        .then(function () {
          return c.use("db");
        })
        .catch(function () {
          return null;
        })
        .then(function (db) {
          if (!db) return;
          self.db = db;
          return self
            .fetchRemote()
            .then(function (remote) {
              if (remote) {
                self.data = remote;
                self.saveLocalAll();
                self.onRemoteChange();
              } else if (!self.isEmpty()) {
                /* First visit with an account: carry this browser's progress up. */
                return Promise.all([self.push("progress"), self.push("journal")]);
              }
            })
            .then(function () {
              if (self.mode !== "read-only" && self.mode !== "cloud-error") self.setMode("cloud");
              document.addEventListener("visibilitychange", function () {
                if (document.visibilityState === "visible") self.refresh();
              });
              window.addEventListener("pagehide", function () {
                self.flush();
              });
            })
            .catch(function () {
              self.db = null;
              self.setMode("cloud-error");
            });
        });
    },

    fetchRemote: function () {
      var self = this;
      return Promise.all([
        this.db.doc(REMOTE_DOCS.progress).get(),
        this.db.doc(REMOTE_DOCS.journal).get()
      ]).then(function (snaps) {
        var p = snaps[0];
        var j = snaps[1];
        if (!p.exists && !j.exists) return null;
        return normalize({
          progress: p.exists ? clone(p.data()) : self.data.progress,
          journal: j.exists ? clone(j.data()) : self.data.journal
        });
      });
    },

    /* Pick up edits made on another device when you come back to this tab. */
    refresh: function () {
      var self = this;
      if (!this.db || this.mode === "read-only") return;
      if (this.inFlight > 0 || Object.keys(this.timers).length) return;
      var a = document.activeElement;
      if (a && (a.tagName === "TEXTAREA" || a.tagName === "INPUT")) return;
      this.fetchRemote()
        .then(function (remote) {
          if (remote && JSON.stringify(remote) !== JSON.stringify(self.data)) {
            self.data = remote;
            self.saveLocalAll();
            self.onRemoteChange();
          }
        })
        .catch(function () {});
    },

    saveLocalAll: function () {
      writeLocal(LOCAL_KEYS.progress, this.data.progress);
      writeLocal(LOCAL_KEYS.journal, this.data.journal);
    },

    /* Call after changing this.data[bucket]. */
    save: function (bucket) {
      var self = this;
      this.data[bucket].updatedAt = new Date().toISOString();
      writeLocal(LOCAL_KEYS[bucket], this.data[bucket]);
      if (!this.db || this.mode === "read-only") return;
      clearTimeout(this.timers[bucket]);
      this.timers[bucket] = setTimeout(function () {
        delete self.timers[bucket];
        self.push(bucket);
      }, PUSH_DELAY_MS);
    },

    flush: function () {
      var self = this;
      Object.keys(this.timers).forEach(function (bucket) {
        clearTimeout(self.timers[bucket]);
        delete self.timers[bucket];
        self.push(bucket);
      });
    },

    /* One write at a time per document. */
    push: function (bucket) {
      var self = this;
      if (!this.db) return Promise.resolve();
      var body = clone(this.data[bucket]);
      var ref = this.db.doc(REMOTE_DOCS[bucket]);
      this.inFlight++;
      var prev = this.chains[bucket] || Promise.resolve();
      this.chains[bucket] = prev
        .then(function () {
          return ref.set(body);
        })
        .then(
          function () {
            if (self.mode !== "cloud") self.setMode("cloud");
          },
          function (err) {
            var code = err && err.code;
            if (code === "invalid_argument" || code === "not_granted" || code === "revoked") {
              self.setMode("read-only");
            } else {
              self.setMode("cloud-error");
            }
          }
        )
        .then(function () {
          self.inFlight--;
        });
      return this.chains[bucket];
    },

    replaceAll: function (raw) {
      this.data = normalize(raw);
      this.save("progress");
      this.save("journal");
    },

    reset: function () {
      this.replaceAll(null);
    },

    exportData: function () {
      return {
        app: "learntech",
        version: 1,
        exportedAt: new Date().toISOString(),
        progress: this.data.progress,
        journal: this.data.journal
      };
    }
  };

  window.LTStore = Store;
})();
