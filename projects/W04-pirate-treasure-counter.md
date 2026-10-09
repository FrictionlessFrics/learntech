# Project brief: The Pirate Treasure Counter

**Week 4 · Repo:** `pirate-treasure-counter` · **Language:** Python 3.11+, standard library only · **Tools:** GitHub Actions, a Discord or Slack webhook

## What it is

A script that reads a CSV of treasure chests, totals the gold per island, and writes a report. It runs every night in GitHub Actions. If the data is bad or the run fails, it must say so loudly.

## Files

- `count.py`: the counter
- `chests.csv`: good sample data, 10 rows
- `bad_chests.csv`: sample data with errors
- `.github/workflows/nightly.yml`: the schedule

## Input format

`chests.csv` has the header `chest_id,island,gold_coins`. `gold_coins` is a whole number, zero or more.

## Behaviour

- Command: `python count.py [path]`. The path defaults to `chests.csv`.
- Logging uses the `logging` module with the format `%(asctime)s %(levelname)s %(message)s`, written to stdout.
- At the start of a run, log the time. At the end, log the chests read, the total gold, the duration in seconds, and the status.
- Validation. Every error is logged with its row number:
  - a missing column is an error
  - a file with no data rows is an error
  - a `gold_coins` value that isn't a whole number, or is negative, is an error
- On any error: log at ERROR level, write **no** report, and exit with code 1.
- On success: write `report.txt` with one line per island (`Island: total`), and exit with code 0.
- Alerts: if the environment variable `ALERT_WEBHOOK_URL` is set and the run fails, POST `{"content": "Treasure count FAILED: <reason>"}` to it. If the alert itself fails, log that and carry on. Don't crash.
- Nightly workflow: runs at 03:00 UTC (`cron: '0 3 * * *'`) and on manual trigger. It reads `ALERT_WEBHOOK_URL` from a repo secret.

## Done when

- [ ] `python count.py` on `chests.csv` writes `report.txt` and exits with 0
- [ ] `python count.py bad_chests.csv` logs an ERROR, writes no report, and exits with 1
- [ ] The failure arrives in your Discord or Slack channel
- [ ] A manually triggered workflow run goes red when `bad_chests.csv` is used
- [ ] The log of one failed run is saved, with the line that explains the failure

## Break it on purpose

1. Remove the exit code on the error path. Run the bad file and watch the workflow go green on bad data. Put it back, then explain in one sentence why green on bad data is the worst outcome.
2. Set `ALERT_WEBHOOK_URL` to a wrong address. Confirm the run still finishes and logs that the alert failed.

## Working agreement

Teach first. Review my code, and don't write it for me unless I ask after I've tried.
