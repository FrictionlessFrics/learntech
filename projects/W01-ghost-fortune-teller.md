# Project brief: The Ghost Fortune Teller

**Week 1 · Repo:** `ghost-fortune-teller` · **Language:** Python 3.11+ · **Libraries:** Flask

## What it is

A small web server. You send it a question and it sends back a fortune from a ghost. The ghosts are unreliable, so the server is strict about its answers: every response is JSON, and every failure has the right status code.

## Files

- `app.py`: the whole server. Keep it under 60 lines this week.
- `requirements.txt`: `flask`

## The spec

### Ghosts

Three ghosts, three fortunes each. Write the fortunes yourself; the wording is up to you.

- `madame-ruth`
- `sir-reginald`
- `the-bell-boy`

### GET /fortune

Query parameters:

- `q`: the question. Required, and it must not be blank.
- `ghost`: which ghost answers. Optional, defaults to `madame-ruth`.

| When | Status | JSON body |
|---|---|---|
| Question given, ghost exists | 200 | `{"ghost": "madame-ruth", "question": "...", "fortune": "..."}` |
| `q` missing or blank | 400 | `{"error": "Ask a question with ?q=..."}` |
| Ghost name not in the list | 404 | `{"error": "No ghost called <name> lives here"}` |
| Anything unexpected | 500 | `{"error": "The ghost fainted. Try again."}` |

The fortune is picked at random from that ghost's list.

The 500 response must be JSON. Flask's default HTML error page does not count.

### GET /ghosts

Returns status 200 and `{"ghosts": ["madame-ruth", "sir-reginald", "the-bell-boy"]}`.

### Running it

`python app.py` starts the server on port 5000.

## Done when

- [ ] `curl "http://localhost:5000/fortune?q=Will+I+win"` returns 200 with the JSON above
- [ ] A request with no `q` returns 400
- [ ] `?ghost=nobody` returns 404
- [ ] A forced 500 returns JSON, not HTML (see below)
- [ ] The request shows up in browser DevTools → Network with its status code

## Break it on purpose

1. Remove the `q` check. Predict what happens with no question, then check.
2. Temporarily add `1/0` inside the fortune code. Confirm you get the JSON 500, then remove it.
3. Call `?ghost=` with a name that has a space in it. Predict the status code first.

## Stretch (optional)

- Add `GET /fortune/random`, which also picks a random ghost.

## Working agreement

Teach first. Review my code, and don't write it for me unless I ask after I've tried.
