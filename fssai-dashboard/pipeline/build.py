"""Validate the data and write site/data.js, the only file the dashboard reads.

Records are joined on the 14-digit licence number only. A hygiene rating with
no licence number stays a separate entry under the name FSSAI gave it; it is
never attached to anything by name.
"""
import json
import tomllib

from . import schema
from .store import Store, now


def check(store, today=None):
    """All problems with the hand-edited actions file, as readable strings."""
    errors, seen = [], {}
    for row in store.actions():
        where = f"data/manual/actions.csv line {row['_line']} ({row.get('id') or 'no id'})"
        for problem in schema.validate_action(row, today):
            errors.append(f"{where}: {problem}")
        if row.get("id"):
            if row["id"] in seen:
                errors.append(f"{where}: id already used on line {seen[row['id']]}")
            seen.setdefault(row["id"], row["_line"])
    ids = [s.get("id") for s in store.sources()]
    for dup in {i for i in ids if ids.count(i) > 1}:
        errors.append(f"data/sources.json: source id '{dup}' is listed twice")
    return errors


def public_action(row):
    return {
        "id": row["id"],
        "type": row["action_type"],
        "label": schema.ACTION_TYPES[row["action_type"]],
        "date": row["action_date"],
        "authority": row["authority"],
        "section": row.get("legal_section", ""),
        "finding": schema.FINDINGS[row.get("finding", "")],
        "summary": row.get("summary", ""),
        "status": row["status"],
        "status_label": schema.STATUSES[row["status"]],
        "status_as_of": row["status_as_of"],
        "source_url": row["source_url"],
        "source_title": row.get("source_title", ""),
        "name_in_source": row.get("name_in_source", ""),
        "match": row["match_method"],
    }


def entities(store):
    found = {}

    def entity(key, licence_no=None):
        return found.setdefault(key, {"key": key, "licence_no": licence_no, "name": "", "address": "",
                                      "district": "", "licence": None, "hygiene": [], "actions": []})

    for number, lic in store.licences.items():
        e = entity(number, number)
        e["licence"] = lic
        if lic.get("found"):
            e.update(name=lic.get("name", ""), address=lic.get("address", ""), district=lic.get("district", ""))
    for rows in store.hygiene.values():
        for r in rows:
            e = entity(r["licence_no"] or r["id"], r["licence_no"])
            e["hygiene"].append(r)
            for field in ("name", "address", "district"):
                e[field] = e[field] or r.get(field, "")
    for row in store.actions():
        e = entity(row["licence_no"], row["licence_no"])
        e["actions"].append(public_action(row))
        e["name"] = e["name"] or row.get("name_in_source", "")
    for e in found.values():
        e["actions"].sort(key=lambda a: a["date"], reverse=True)
    return sorted(found.values(), key=lambda e: (e["name"].lower(), e["key"]))


def build(store=None, today=None):
    store = store or Store()
    errors = check(store, today)
    if errors:
        return errors
    scope = tomllib.loads((store.root / "config" / "scope.toml").read_text(encoding="utf-8"))
    sources = [dict(s, run=store.runs.get(s["id"])) for s in store.sources()]
    payload = {"generated_at": now(), "scope": scope, "sources": sources, "entities": entities(store)}
    out = store.root / "site" / "data.js"
    out.write_text("window.FSD = " + json.dumps(payload, ensure_ascii=False, indent=1) + ";\n", encoding="utf-8")
    return []
