# Project brief: The Crystal Ball Cache

**Week 11 · Repo:** `crystal-ball-cache` · **Language:** Python 3.11+ · **Libraries:** Flask

## What it is

The Two-Headed Ghost's fortune teller now asks the spirits before it answers, and each spirit lookup takes two seconds. You'll add a cache, so repeated questions come back quickly, and clear the cache when the moon changes.

## Start from

Copy `app.py` from `two-headed-ghost`. Keep every route, status code and passphrase rule from Week 2 unchanged.

## Changes

### Slow spirits

`spirit_lookup(question, ghost)` calls `time.sleep(2)`, then returns a random fortune from that ghost's list. `/fortune` calls it on a cache miss.

### The cache

- Held in memory, as a dict keyed by `(ghost, question.strip().lower())`.
- Each entry stores its fortune and the time it was stored.
- An entry is a hit only if it is less than 60 seconds old. Older entries are misses.
- `CACHE_ENABLED` environment variable: `1` by default, and `0` turns the cache off. You'll need this for the measurements.

### Moon phase invalidation

- Create `moon_phase.txt` in the repo.
- On every `/fortune` request, check `os.path.getmtime("moon_phase.txt")`. If it differs from the last value you saw, clear the whole cache.
- To test it, touch the file and make a request.

### Response

Add a field `"cached": true` or `"cached": false` to every 200 response.

## Measure

- Copy `load_test.py` from `dragon-post-office`, and point it at `GET /fortune?q=...&ghost=madame-ruth`, sending the header `X-Passphrase`.
- Send 200 requests, 10 at a time, using only five different questions.
- Report:
  - hit rate: the number of `cached: true` responses divided by 200
  - p50 and p95 response time
- Run it twice: once with `CACHE_ENABLED=0`, and once with the cache on.

## Done when

- [ ] A new question takes about 2 seconds, and the same question straight after takes milliseconds
- [ ] Touching `moon_phase.txt` makes the next request a miss
- [ ] Entries older than 60 seconds are misses
- [ ] `results.md` shows the hit rate and p50/p95, with the cache off and on

## Break it on purpose

1. Run two workers with `gunicorn -w 2`. Ask the same question several times. Explain why you sometimes get a miss right after a hit.
2. Restart the app. Explain what the cache lost, and how a shared cache such as Redis would change that.

## Working agreement

Teach first. Review my code, and don't write it for me unless I ask after I've tried.
