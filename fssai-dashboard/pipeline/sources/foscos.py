"""FoSCoS licence lookup: status, validity, suspension, by 14-digit licence number.

Only looks up licence numbers we already hold (from the hygiene directory or the
reviewed actions file). It never searches by name. Licences never checked go
first, then the ones checked longest ago, so a long run spread over several
nights works through the whole list.
"""
from .. import parse
from ..store import now


def run(client, cfg, scope, store):
    wanted = store.known_licence_numbers()
    order = sorted(wanted, key=lambda n: store.licences.get(n, {}).get("checked_at", ""))
    done = 0
    for number in order[: cfg.get("max_lookups_per_run", 400)]:
        if cfg.get("method", "GET").upper() == "POST":
            body = client.post(cfg["lookup_url"], data={cfg["licence_param"]: number})
        else:
            body = client.get(cfg["lookup_url"], params={cfg["licence_param"]: number})
        fields = parse.label_values(body, cfg["labels"])
        record = {"licence_no": number, "found": bool(fields.get("name") or fields.get("status")),
                  "checked_at": now(), "source_url": cfg["public_url"]}
        record.update(fields)
        if "valid_until" in fields:
            record["valid_until"] = parse.iso_date(fields["valid_until"]) or fields["valid_until"]
        store.licences[number] = record
        done += 1
        if done % 20 == 0:
            store.save_licences()
    store.save_licences()
    return done
