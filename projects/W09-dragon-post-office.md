# Project brief: The Dragon Post Office

**Week 9 · Repo:** `dragon-post-office` · **Language:** Python 3.11+, standard library only

## What it is

A mail service with three steps: check, sort and deliver. The owl sorter sometimes naps. You'll build it, load test it, and measure which step causes the waiting.

## Files

- `post_office.py`: the three steps and `handle()`
- `load_test.py`: sends letters and prints the table
- `README.md`: your results

## The steps (`post_office.py`)

- `check(letter)`: sleeps for 5 ms.
- `sort(letter)`: 90% of the time it sleeps 10 ms. 10% of the time it sleeps a random time between 50 ms and 2000 ms (`random.uniform` on seconds).
- `deliver(letter)`: sleeps for 100 ms.
- `handle(letter)`: runs the three steps in order and returns `{"check_ms", "sort_ms", "deliver_ms", "total_ms"}`. Time each step with `time.perf_counter()`.

Call `random.seed` only inside `load_test.py`, so the runs are repeatable.

## Load test (`load_test.py`)

- Send 200 letters, each `{"id": i, "to": "Cave 7"}`, using `concurrent.futures.ThreadPoolExecutor(max_workers=10)`.
- Collect the `handle()` results.
- For each of `check_ms`, `sort_ms`, `deliver_ms` and `total_ms`, print p50, p95 and max.
- Percentiles: sort the values. p50 is the value at index `int(0.50 * n)`, and p95 is the value at index `int(0.95 * n)`.

Expected output shape:

```
step        p50      p95      max
check       ...
sort        ...
deliver     ...
total       ...
```

## Done when

- [ ] The table prints for 200 letters
- [ ] `README.md` says which step is the bottleneck, and whether the numbers back up your guess
- [ ] You can explain why p95 for `total_ms` is higher than p95 for `sort_ms` alone. Which other steps add time to every letter?

## Break it on purpose

1. Change the chance of a nap from 10% to 50%. Predict what happens to p50 and p95 before you run it.
2. Set `max_workers=1`. Time the whole 200-letter run with `time.perf_counter()` around it. Compare the total time with the per-letter numbers, and explain the difference. This is the gap between latency and throughput.

## Working agreement

Teach first. Review my code, and don't write it for me unless I ask after I've tried.
