"""FSSAI hygiene rating directory, old portal (hygiene.fssai.gov.in/knowRating.php).

Flow: read the state dropdown, call the AJAX endpoint that lists a state's
districts, then POST the search form once per district (and per page, if paged).
A district is only saved once all its pages are in, so a run cut short never
leaves a half-written district behind.
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
        records = {r["id"]: r for r in (to_record(row, district, scope["state"]) for row in rows)}
        store.replace_hygiene_district(district, sorted(records.values(), key=lambda r: r["id"]))
        saved += len(records)
    return saved
