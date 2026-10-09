# Project brief: The Pirate Treasure Counter

**Week 4 · Folder:** `pirate-treasure-counter` · **Language:** Python 3.11+, standard library only

## What it is

A script that reads a CSV of treasure chests, totals the gold per island, and writes a report. If the data is bad, it must say so loudly, with a clear error and a failing exit code.

## Files

- `count.py`: the counter
- `chests.csv`: good sample data. Make up 10 rows, with fake islands and whole-number gold.
- `bad_chests.csv`: three rows: one with negative gold, one with `twelve` as its gold, and one normal row
- `report.txt`: created by the counter when a run succeeds

## Input format

Both CSV files have the header `chest_id,island,gold_coins`. `gold_coins` is a whole number, zero or more.

## Behaviour

- Command: `python count.py [path]`. The path defaults to `chests.csv`.
- Logging uses the `logging` module, with the format `%(asctime)s %(levelname)s %(message)s`, written to the terminal.
- At the start of a run, log the time. At the end, log the chests read, the total gold, the duration in seconds, and the status.
- Validation. Every error is logged with its row number:
  - a missing column is an error
  - a file with no data rows is an error
  - a `gold_coins` value that isn't a whole number, or is negative, is an error
- On any error: log at ERROR level, write **no** report, and exit with code 1.
- On success: write `report.txt` with one line per island (`Island: total`), and exit with code 0.
- Optional alert: if the environment variable `ALERT_WEBHOOK_URL` is set and the run fails, POST `{"content": "Treasure count FAILED: <reason>"}` to it. If the alert fails, log that and carry on. Don't crash.

## Done when

- [ ] `python count.py` on `chests.csv` writes `report.txt`, and `echo $?` prints 0
- [ ] `python count.py bad_chests.csv` logs an ERROR, writes no report, and `echo $?` prints 1
- [ ] A failing run produces an alert: a message in Discord or Slack, or a printed alert if you'd rather skip the account
- [ ] One failed run's log is saved, with the line that explains the failure

## Break it on purpose

1. Remove the exit code on the error path. Run the bad file and see `echo $?` print 0 on bad data. Put the exit code back, then explain in one sentence why a 0 on bad data is the worst outcome.
2. Set `ALERT_WEBHOOK_URL` to a wrong address. Confirm the run still finishes and logs that the alert failed.

## Stretch (needs a GitHub account, so ask me first)

Run the counter every night with GitHub Actions: a `.github/workflows/nightly.yml` file with `cron: '0 3 * * *'`. A run that exits with 1 then shows as red on GitHub.

## Working agreement

Teach first. Review my code, and don't write it for me unless I ask after I've tried.
