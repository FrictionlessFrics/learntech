# Project brief: Ghost in a Shipping Container

**Week 3 · Repo:** `ghost-in-a-container` · **Language:** Python 3.11+ · **Tools:** Docker, Render or Railway

## What it is

The Two-Headed Ghost, packaged in a Docker container and deployed to a public URL. Anyone with the passphrase can ask the ghost a question from their phone.

## Start from

Copy `app.py` from `two-headed-ghost`. The deployed copy runs with `FORTUNE_MODE=prod`.

## Files

- `app.py`: reads `PORT` from the environment and listens on `0.0.0.0`
- `requirements.txt`: `flask` and `gunicorn`
- `Dockerfile`: builds the image
- `.dockerignore`: `.env`, `.git` and `__pycache__`

## Requirements

- `app.py` exposes a Flask object called `app`, so gunicorn can run it.
- `GET /health` returns 200 `{"status": "alive"}`. It needs no passphrase.
- The Dockerfile starts the app in **shell form**, so that `$PORT` gets expanded:
  `CMD gunicorn --bind 0.0.0.0:${PORT:-5000} app:app`
- Secrets never go in the repo. On the host, set `GHOST_PASSPHRASE` and `FORTUNE_MODE=prod` in its dashboard.

## Done when

- [ ] `docker build -t ghost .` succeeds
- [ ] `docker run -p 5000:5000 -e GHOST_PASSPHRASE=... ghost` runs, and `curl localhost:5000/health` returns 200
- [ ] The deployed URL returns 200 for `/health`
- [ ] `/fortune` works on the public URL with the `X-Passphrase` header
- [ ] The Dockerfile is linked from the repo's README

## Break it on purpose

1. Change the bind address to `127.0.0.1`. Rebuild and run it. Explain why `curl` from your laptop fails even though the container is running.
2. Change the CMD to exec form (a JSON array) with `$PORT` in it. Predict what gunicorn receives, then check.

## Working agreement

Teach first. Review my Dockerfile line by line, and don't write it for me unless I ask after I've tried.
