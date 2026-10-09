# Project brief: The Dragon's Hoard

**Week 7 · Folders:** `hoard-leak-practice` (throwaway) and `dragons-hoard` · **Tools:** Docker, Postgres 16, gitleaks, psql, Python 3.11+ with `psycopg` (or any Postgres client)

## What it is

Two exercises in one project. First you leak a fake key on purpose, find it and deal with it. Then you run a Postgres database of dragon treasure and give a goblin script the least access it needs.

## Part A: the leaked key (throwaway folder `hoard-leak-practice`)

1. Create the folder. Add `config.py` containing `API_KEY = "dragon_live_FAKE0123456789abcdef"` and commit it. Then delete that line and commit again. The key is still in the history.
2. Scan the folder with gitleaks: `gitleaks detect --source . -v`. Save the finding.
3. Treat the key as compromised. Write down why deleting the commit doesn't make it safe, and what rotating it would involve in a real service: revoke it, issue a new one, and update every place that uses it.
4. Delete the throwaway folder when you're done.

## Part B: the hoard (folder `dragons-hoard`)

### Database

Run Postgres in Docker:

`docker run --name hoard -e POSTGRES_PASSWORD=<admin password, from your shell environment> -p 5432:5432 -d postgres:16`

Never write the admin password into a file.

Create a database called `hoard`, then:

```sql
CREATE TABLE treasure (
  id serial PRIMARY KEY,
  dragon text NOT NULL,
  item text NOT NULL,
  gold integer NOT NULL
);
```

Insert at least ten rows for four dragons: `Ember`, `Frostwing`, `Old Scale` and `Nightclaw`.

### Roles

- `goblin_reader` has LOGIN, and its password is read from an environment variable.
- It may connect to `hoard`, use the `public` schema, and SELECT from `treasure`. Nothing else.
- The admin account stays with you. The goblin never gets it.

### The goblin script

`goblin_report.py` reads `DATABASE_URL` from the environment, connects as `goblin_reader`, and prints the total gold per dragon. It runs only SELECT statements.

## Files

- `goblin_report.py`
- `setup.sql`: the table, roles and grants, with no passwords in it
- `proof.txt`: the output of the permission tests (see below)
- `.gitignore`: includes `.env`

## Done when

- [ ] gitleaks finds the fake key in the throwaway folder, and you can explain the finding
- [ ] `goblin_report.py` prints gold per dragon when run as `goblin_reader`
- [ ] As `goblin_reader`, `DELETE FROM treasure` fails with "permission denied"
- [ ] As `goblin_reader`, an `UPDATE treasure` fails with "permission denied"
- [ ] `grep -r` for any password across `dragons-hoard` finds nothing

## Break it on purpose

1. Grant the goblin UPDATE "just to test it". Confirm it can now change gold. Then revoke it, and write one sentence on how this happens by accident in real teams.
2. Connect as the goblin and run `SELECT * FROM pg_roles;`. Note what you can see and what you can't.

## Working agreement

Teach first. Review my SQL before I run it, and don't write the grants for me.
