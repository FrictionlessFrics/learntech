"""FSSAI hygiene rating directory, old portal (hygiene.fssai.gov.in).

Two ways in, chosen by `mode` in config/endpoints.toml:

sweep (default): walk the public per-establishment pages (fboDetails.php?id=N)
  in order, keep the ones in scope, and remember where it stopped so the next
  night carries on. Slow but needs nothing beyond plain GET pages.

search: read the state dropdown on knowRating.php, call the AJAX endpoint that
  lists a state's districts, then POST the search once per district (and per
  page, if paged). Faster for one city, but the endpoints must first be found
  in DevTools. A district is only saved once all its pages are in.
"""
import hashlib

from .. import parse
from ..http import StopSource
from ..store import now


def pick(options, wanted, what):
    for label, value in options.items():
        if parse.norm(label) == parse.norm(wanted):
            return value
    raise StopSource(f"{what} '{wanted}' not in the portal's list: {sorted(options)[:20]}")


def to_record(row, district, state):
    licence = parse.licence_no(row.get("licence_no", ""))
    name, address = row.get("name", ""), row.get("address", "")
    digest = hashlib.sha1(f"{name}|{address}|{district}".lower().encode()).hexdigest()[:12]
    return {
        "id": f"hyg-{digest}",
        "licence_no": licence,
        "name": name,
        "address": address,
        "district": district,
        "state": state,
        "rating": row.get("rating", ""),
        "audit_date": parse.iso_date(row.get("audit_date")),
        "valid_until": parse.iso_date(row.get("valid_until")),
        "auditor": row.get("auditor", ""),
        "retrieved_at": now(),
    }


def run(client, cfg, scope, store):
    if cfg.get("mode", "sweep") == "sweep":
        return run_sweep(client, cfg, scope, store)
    return run_search(client, cfg, scope, store)


def in_scope(fields, scope):
    """Same state, and a scope district or the city named in the district or address."""
    if fields.get("state") and parse.norm(fields["state"]) != parse.norm(scope["state"]):
        return False
    place = parse.norm(fields.get("district", "") + " " + fields.get("address", ""))
    names = [parse.norm(d) for d in scope["districts"]] + [parse.norm(scope["city"])]
    return any(n in place for n in names)


def run_sweep(client, cfg, scope, store):
    state = store.runs.get("hygiene", {})
    next_id = state.get("next_id", cfg.get("start_id", 1))
    missing, kept = 0, 0
    last = next_id + cfg.get("max_ids_per_run", 3000)
    try:
        while next_id < last:
            url = cfg["detail_url"].format(id=next_id)
            fields = parse.label_values(client.get(url), cfg["labels"])
            if not (fields.get("name") or fields.get("licence_no")):
                missing += 1
                if missing >= cfg.get("stop_after_missing", 500):
                    # A long run of empty ids means we've passed the newest page. Start over next time.
                    next_id = cfg.get("start_id", 1)
                    break
            else:
                missing = 0
                if in_scope(fields, scope):
                    district = fields.get("district") or scope["city"]
                    record = to_record(fields, district, scope["state"])
                    record.update(id=f"hyg-fbo-{next_id}", source_url=url)
                    store.upsert_hygiene(district, record)
                    kept += 1
            next_id += 1
    finally:
        # Saved even when the run is cut short, so the next run resumes here.
        store.runs.setdefault("hygiene", {})["next_id"] = next_id
    return kept


def run_search(client, cfg, scope, store):
    form = client.get(cfg["form_url"])
    state_id = pick(parse.options(form, cfg["state_field"]), scope["state"], "State")
    districts = parse.options(client.post(cfg["districts_url"], data={cfg["districts_state_param"]: state_id}))

    saved = 0
    for district in scope["districts"]:
        district_id = pick(districts, district, "District")
        rows, previous = [], None
        for page in range(1, cfg.get("max_pages", 1) + 1):
            data = {cfg["state_field"]: state_id, cfg["district_field"]: district_id, **cfg.get("extra_form_fields", {})}
            if cfg.get("page_field"):
                data[cfg["page_field"]] = str(page)
            page_rows = parse.table_rows(client.post(cfg["search_url"], data=data), cfg["columns"])
            if not page_rows or page_rows == previous:
                break
            rows.extend(page_rows)
            previous = page_rows
            if not cfg.get("page_field"):
                break
        records = {r["id"]: dict(r, source_url=cfg["form_url"]) for r in (to_record(row, district, scope["state"]) for row in rows)}
        store.replace_hygiene_district(district, sorted(records.values(), key=lambda r: r["id"]))
        saved += len(records)
    return saved
