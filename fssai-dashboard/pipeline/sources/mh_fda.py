"""Maharashtra FDA press notes: collect the documents, don't publish them.

Press notes name businesses but rarely give a licence number, and many are in
Marathi. So this only downloads new notes into inbox/ for a person to read.
The reviewer records the facts (action, date, section, status) and the licence
number they confirmed on FoSCoS in data/manual/actions.csv. The article text
itself is never republished.
"""
import hashlib

from .. import parse
from ..store import now


def run(client, cfg, scope, store):
    known = {doc["url"] for doc in store.inbox}
    docs_dir = store.root / "inbox" / "docs"
    docs_dir.mkdir(parents=True, exist_ok=True)
    added = 0
    for listing in cfg["listing_urls"]:
        for url, text in parse.links(client.get(listing), listing, cfg["link_pattern"]):
            if url in known:
                continue
            body = client.get(url)
            sha = hashlib.sha256(body).hexdigest()
            name = sha[:16] + (".pdf" if body[:4] == b"%PDF" else ".html")
            (docs_dir / name).write_bytes(body)
            store.inbox.append({"id": f"doc-{sha[:10]}", "url": url, "link_text": text, "found_on": listing,
                                "retrieved_at": now(), "sha256": sha, "file": f"inbox/docs/{name}",
                                "status": "pending"})
            known.add(url)
            added += 1
            store.save_inbox()
    return added
