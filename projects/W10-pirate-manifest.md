# Project brief: The Pirate Manifest

**Week 10 · Folder:** `pirate-manifest` · **Language:** Python 3.11+ · **Storage:** SQLite (standard library)

## What it is

A cargo database with one million rows, one for every crate that ever sailed. Finding the gold from Skull Island is painfully slow until you fix it.

## Files

- `generate_manifest.py`: builds `manifest.db`
- `query.py`: runs the slow query and times it
- `manifest.db`: generated. Add it to `.gitignore`, because it's around 60–80 MB.
- `results.md`: your before-and-after table

## Data: `generate_manifest.py`

- `random.seed(42)`, so everyone's data is the same.
- Table:

```sql
CREATE TABLE cargo (
  id INTEGER PRIMARY KEY,
  ship TEXT,
  island TEXT,
  cargo_type TEXT,
  coins INTEGER,
  sailed_on TEXT
);
```

- 1,000,000 rows.
- 200 ships, named like `The Salty Gull 001`.
- 50 islands. Include `Skull Island`, and make up the other 49.
- Cargo types: `gold coins`, `rum`, `silk`, `cannonballs` and `maps`.
- `coins`: a random integer from 0 to 500 for `gold coins`, and 0 for everything else.
- `sailed_on`: a random date from 1720 to 1730, as `YYYY-MM-DD`.
- Insert in batches of 10,000, all inside one transaction.

## The query: `query.py`

```sql
SELECT COUNT(*), SUM(coins)
FROM cargo
WHERE island = 'Skull Island' AND cargo_type = 'gold coins' AND coins > 100;
```

- Run it five times and report the median time.
- Print the plan with `EXPLAIN QUERY PLAN` on the same query. Look for `SCAN cargo`.

## The fix

- Add an index on the two columns the query filters on, `island` and `cargo_type`. Try it yourself first: predict the index columns, then compare with the plan.
- Run `EXPLAIN QUERY PLAN` again. Look for `SEARCH cargo USING INDEX`.
- Time the query again.

## Done when

- [ ] `results.md` has the before and after median times, and both plans
- [ ] The query returns the same answer before and after (the same COUNT and SUM)
- [ ] You've tried one index that doesn't help, such as one on `sailed_on`, and written down why
- [ ] You can name one column you should never index on this table, and why

## Break it on purpose

1. Drop the index and create one on `sailed_on` instead. Time the query and explain the result.
2. Generate a second manifest with 2,000,000 rows. Predict how the query time changes, with and without the index, then measure both.

## Working agreement

Teach first. Review my code, and don't write it for me unless I ask after I've tried.
