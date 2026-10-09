# Project brief: The Galaxy Map Generator

**Week 12 · Repo:** `galaxy-map-generator` · **Language:** Python 3.11+ · **Libraries:** Flask

## What it is

A service that renders a map of the galaxy from a seed. A render takes 90 seconds, far too long to keep a web request waiting. You'll move the render into a background job, limit how many maps one user can order, and work out what each map costs.

## Files

- `app.py`: the Flask service
- `costs.csv`: the cost model
- `memo.md`: State of the Dragon Kingdom

## Settings

- `RENDER_SECONDS`: how long a render takes. Defaults to `90`. Set it to `5` while you develop.

## The render

`render_map(seed)` sleeps for `RENDER_SECONDS`, then returns `{"seed": seed, "stars": [...]}`. `stars` is 50 `[x, y]` pairs generated from `random.Random(seed)`.

## Endpoints

### POST /maps

- Optional header `X-User`. Defaults to `anonymous`.
- JSON body: `{"seed": <integer>}`.
- Starts a background thread (`threading.Thread`, daemon) that renders the map and stores the result in an in-memory `jobs` dict.
- Returns 202 with `{"job_id": "<id>", "status": "queued"}` straight away. It must return in under a second.
- Rate limit: 10 jobs per user in any rolling hour. The 11th request gets a 429 with `{"error": "Slow down. Try again later.", "retry_after_seconds": <n>}` and a `Retry-After` header.

### GET /jobs/<job_id>

- Returns 200 with `{"job_id": ..., "status": "queued" | "running" | "done" | "failed"}`.
- When the status is `done`, it also includes `"map": {...}`.
- Unknown IDs get a 404 with `{"error": "No such job"}`.

## Known limits (write these down)

- Jobs live in memory, so a restart loses them. That's a deliberate teaching point.
- The rate limit is also per process, for the same reason.

## Cost model: `costs.csv`

Fill in these rows with your own values, and note where each value came from:

| item | value | source |
|---|---|---|
| Compute seconds per map (from `RENDER_SECONDS`) | | |
| Compute price per second | | your host's pricing page |
| Storage per map, in MB | | |
| Storage price per GB-month | | |
| Maps per user per month | | your guess; say so |
| Price you'd charge per map | | |

Then calculate: cost per map, cost per 1,000 maps, and margin per map.

## Memo: `memo.md`

One page, titled **State of the Dragon Kingdom**. Cover what the service does, the cost per map, what breaks first at ten times the users, and what you'd fix next. Compare the architecture with the Week 1 diagram.

## Done when

- [ ] POST returns 202 in under a second
- [ ] Polling shows the status moving from queued to running to done
- [ ] The 11th POST from one user within an hour gets a 429 with `Retry-After`
- [ ] Restarting the server loses a job in progress, and you've written down why that matters
- [ ] `costs.csv` and `memo.md` exist, and the memo states the cost per 1,000 maps

## Break it on purpose

1. Remove the thread, and call the render directly inside POST. Time the request, and explain what the user experiences.
2. Make `render_map` raise an exception. Check that the job ends as `failed`, not stuck in `running`.

## Working agreement

Teach first. Review my code, and don't write it for me unless I ask after I've tried.
