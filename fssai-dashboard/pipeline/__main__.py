"""Command line: python -m pipeline <command>

  fetch [--source NAME] [--budget-minutes N]   scrape the switched-on sources
  check                                        validate the hand-edited data
  build                                        validate, then write site/data.js
  run [--budget-minutes N]                     fetch, then build (what the nightly job runs)
  inbox [--done DOC_ID]                        list press notes waiting for review, or mark one reviewed
"""
import argparse
import sys
import time
import tomllib

from .build import build, check
from .http import PoliteClient, StopSource
from .sources import foscos, hygiene, mh_fda
from .store import Store

SOURCES = {"hygiene": hygiene, "foscos": foscos, "mh_fda": mh_fda}


def load(store, name):
    return tomllib.loads((store.root / "config" / f"{name}.toml").read_text(encoding="utf-8"))


def fetch(store, only=None, budget_minutes=300):
    endpoints, scope = load(store, "endpoints"), load(store, "scope")
    deadline = time.monotonic() + budget_minutes * 60
    for name, module in SOURCES.items():
        if only and name != only:
            continue
        cfg = endpoints[name]
        if not cfg.get("verified"):
            print(f"[{name}] skipped: endpoints not verified yet (config/endpoints.toml)")
            continue
        client = PoliteClient(store.root / ".cache" / name, min_delay=cfg.get("min_delay_seconds", 5),
                              deadline=deadline)
        try:
            count = module.run(client, cfg, scope, store)
            store.record_run(name, "complete", records=count, requests=client.requests_made)
            print(f"[{name}] complete: {count} records, {client.requests_made} requests")
        except StopSource as exc:
            # Keep what was saved, record why it stopped, move on to the next source.
            store.record_run(name, "stopped", reason=str(exc), requests=client.requests_made)
            print(f"[{name}] stopped: {exc}")


def main(argv=None):
    p = argparse.ArgumentParser(prog="python -m pipeline")
    sub = p.add_subparsers(dest="cmd", required=True)
    f = sub.add_parser("fetch")
    f.add_argument("--source", choices=SOURCES)
    f.add_argument("--budget-minutes", type=int, default=300)
    sub.add_parser("check")
    sub.add_parser("build")
    r = sub.add_parser("run")
    r.add_argument("--budget-minutes", type=int, default=300)
    i = sub.add_parser("inbox")
    i.add_argument("--done", metavar="DOC_ID")
    args = p.parse_args(argv)

    store = Store()
    if args.cmd in ("fetch", "run"):
        fetch(store, getattr(args, "source", None), args.budget_minutes)
    if args.cmd == "check":
        errors = check(store)
    elif args.cmd in ("build", "run"):
        errors = build(store)
    elif args.cmd == "inbox":
        return inbox(store, args.done)
    else:
        return 0
    for e in errors:
        print(e, file=sys.stderr)
    if not errors:
        print("OK" if args.cmd == "check" else "Wrote site/data.js")
    return 1 if errors else 0


def inbox(store, done):
    if done:
        for doc in store.inbox:
            if doc["id"] == done:
                doc["status"] = "reviewed"
                store.save_inbox()
                print(f"Marked {done} reviewed")
                return 0
        print(f"No inbox document {done}", file=sys.stderr)
        return 1
    pending = [d for d in store.inbox if d["status"] == "pending"]
    for d in pending:
        print(f"{d['id']}  {d['retrieved_at'][:10]}  {d['link_text'][:60]}\n    {d['url']}")
    print(f"{len(pending)} press notes waiting for review")
    return 0


if __name__ == "__main__":
    sys.exit(main())
