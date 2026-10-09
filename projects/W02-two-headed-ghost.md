# Project brief: The Two-Headed Ghost

**Week 2 · Repo:** `two-headed-ghost` · **Language:** Python 3.11+ · **Libraries:** Flask

## What it is

The Week 1 fortune teller, now configured entirely from its environment. The same code runs as a dev ghost on port 5000 and a prod ghost on port 5001. You don't edit any code between the two runs.

## Start from

Copy `app.py` from `ghost-fortune-teller`. Keep the three ghosts and the Week 1 routes.

## Settings (all from environment variables)

| Variable | Required | Default | Meaning |
|---|---|---|---|
| `PORT` | no | `5000` | Port to listen on |
| `GHOST_PASSPHRASE` | yes | none | The passphrase callers must send |
| `FORTUNE_MODE` | no | `prod` | `dev` or `prod` |

If `GHOST_PASSPHRASE` is missing, the app refuses to start. It prints a clear message and exits with code 1.

## Spec changes

### /fortune now needs a passphrase

Callers send it in the header `X-Passphrase`.

| When | Status | JSON body |
|---|---|---|
| Header missing or wrong | 401 | `{"error": "The ghost doesn't trust you"}` |
| Correct header | as in Week 1 | as in Week 1 |

### Dev mode

When `FORTUNE_MODE=dev`, every 200 response also includes `"mode": "dev"`. In prod it is left out.

### GET /health

Returns status 200 and `{"status": "alive"}`. It needs no passphrase. You'll use it in Week 3.

## Files

- `app.py`: reads its settings from the environment
- `.env.example`: lists `PORT`, `GHOST_PASSPHRASE` and `FORTUNE_MODE`, with no values
- `.gitignore`: includes `.env`

## Done when

- [ ] `PORT=5000 FORTUNE_MODE=dev GHOST_PASSPHRASE=... python app.py` and `PORT=5001 FORTUNE_MODE=prod GHOST_PASSPHRASE=... python app.py` both run, with no code changes between them
- [ ] Starting without `GHOST_PASSPHRASE` exits with code 1 and a clear message
- [ ] Wrong passphrase gives 401; correct passphrase gives 200
- [ ] `grep -r` for your passphrase across the repo finds nothing
- [ ] A 12-factor scorecard exists, with one line of reasoning per factor

## Break it on purpose

1. Hardcode the passphrase in `app.py` and commit it. Find it with `grep`. Remove it, then explain why deleting it from the latest commit isn't enough.
2. Start the app without the variable and read the error it gives.

## Working agreement

Teach first. Review my code, and don't write it for me unless I ask after I've tried.
