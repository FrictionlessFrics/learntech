"""The data files the pipeline reads and writes.

Everything is plain JSON or CSV in the repo, so every change to the published
record shows up in git history: who changed what, and when.
"""
import csv
import json
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent


def now():
    return datetime.now(timezone.utc).replace(microsecond=0).isoformat()


def read_json(path, default):
    path = Path(path)
    if not path.exists():
        return default
    return json.loads(path.read_text(encoding="utf-8"))


def write_json(path, data):
    path = Path(path)
    path.parent.mkdir(parents=True, exist_ok=True)
    tmp = path.with_suffix(path.suffix + ".tmp")
    tmp.write_text(json.dumps(data, indent=2, ensure_ascii=False, sort_keys=True) + "\n", encoding="utf-8")
    tmp.replace(path)


class Store:
    def __init__(self, root=ROOT):
        self.root = Path(root)
        self.data = self.root / "data"
        self.hygiene = read_json(self.data / "hygiene_ratings.json", {})
        self.licences = read_json(self.data / "licences.json", {})
        self.runs = read_json(self.data / "runs.json", {})
        self.inbox = read_json(self.root / "inbox" / "index.json", [])

    @property
    def actions_path(self):
        return self.data / "manual" / "actions.csv"

    def actions(self):
        if not self.actions_path.exists():
            return []
        with self.actions_path.open(newline="", encoding="utf-8") as f:
            # Line 1 is the header, so data row n is on line n + 1.
            return [dict(row, _line=i + 2) for i, row in enumerate(csv.DictReader(f))]

    def sources(self):
        return read_json(self.data / "sources.json", [])

    def replace_hygiene_district(self, district, records):
        self.hygiene[district] = records
        write_json(self.data / "hygiene_ratings.json", self.hygiene)

    def upsert_hygiene(self, district, record):
        rows = [r for r in self.hygiene.get(district, []) if r["id"] != record["id"]]
        self.hygiene[district] = sorted(rows + [record], key=lambda r: r["id"])
        write_json(self.data / "hygiene_ratings.json", self.hygiene)

    def save_licences(self):
        write_json(self.data / "licences.json", self.licences)

    def save_inbox(self):
        write_json(self.root / "inbox" / "index.json", self.inbox)

    def record_run(self, source, outcome, **details):
        entry = self.runs.setdefault(source, {})
        entry.update(details, last_attempt=now(), outcome=outcome)
        if outcome == "complete":
            entry["last_complete"] = entry["last_attempt"]
        write_json(self.data / "runs.json", self.runs)

    def known_licence_numbers(self):
        numbers = {r["licence_no"] for rows in self.hygiene.values() for r in rows if r.get("licence_no")}
        numbers |= {a["licence_no"] for a in self.actions() if a.get("licence_no", "").isdigit()}
        return numbers
