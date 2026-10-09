# Project brief: The Storm Oracle Importer

**Week 5 · Repo:** `storm-oracle-importer` · **Language:** Python 3.11+ · **Libraries:** Flask, requests · **Storage:** SQLite (standard library)

## What it is

A forecast importer. For every treasure island and each of the next seven days, it asks the Storm Oracle for a storm risk score and saves it. The Storm Oracle is an API that sneezes: about one request in three fails with a 503. The importer has to survive that, and it has to be safe to run twice.

## Files

- `storm_oracle.py`: the fake API, which you write (Flask, port 5001)
- `importer.py`: the client that fetches and stores forecasts
- `islands.txt`: three lines: `Smugglers' Cove`, `Isle of Crabs`, `Kraken Reef`
- `forecasts.db`: created by the importer. Add it to `.gitignore`.

## The fake API: `storm_oracle.py`

### GET /forecast?island=<name>&date=YYYY-MM-DD

| When | Status | JSON body |
|---|---|---|
| Header `X-API-Key` is not `kraken-key` | 401 | `{"error": "Wrong API key"}` |
| `island` or `date` missing | 400 | `{"error": "Need island and date"}` |
| Random: about 1 request in 3 | 503 | `{"error": "The oracle sneezed"}` |
| Otherwise | 200 | `{"island": "...", "date": "...", "storm_risk": <random int 0-100>}` |

Check in this order: API key first, then parameters, then the sneeze.

## The importer: `importer.py`

- Dates: today and the next six days, seven in total.
- Calls: every island × every date, so 21 calls per run. Timeout 5 seconds per call.
- Retries: on a 503 or a timeout, wait 1 second, then 2, then 4. Four attempts in total. On a 401 or 400, stop straight away. Retrying a wrong key is pointless.
- Storage: table `forecasts(island TEXT, date TEXT, storm_risk INTEGER, PRIMARY KEY (island, date))`. Writes use:
  `INSERT ... ON CONFLICT(island, date) DO UPDATE SET storm_risk = excluded.storm_risk`
- Logging: every attempt and every retry, with its reason.
- Summary and exit: print `stored N, failed M`. Exit with 0 if M is 0, otherwise 1.

## Done when

- [ ] Three runs in a row leave exactly 21 rows in `forecasts`
- [ ] The logs show at least one retry after a 503. You'll see them.
- [ ] A wrong key stops at the first attempt, with no retries
- [ ] You can explain why a call fails all four attempts about 1 time in 80 ((1/3)⁴ ≈ 1.2%)

## Break it on purpose

1. Remove the PRIMARY KEY and use a plain `INSERT`. Run the importer twice and watch the row count double. Put the key back and run it again. Explain why you now get an error instead.
2. Set the retry count to 1. Run the importer several times and count the failed rows. Explain the difference from the real retry logic.

## Working agreement

Teach first. Review my code, and don't write it for me unless I ask after I've tried.
