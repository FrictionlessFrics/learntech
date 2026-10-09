# Project brief: The Robot Chef's Recipe Scaler

**Week 6 · Folder:** `robot-chefs-scaler` · **Language:** Python 3.11+ · **Libraries:** pytest

## What it is

A function that scales a recipe for any number of guests from 1 to 1,000. The robot chef uses it to cook for a wedding, a pirate crew or a single dragon.

## Files

- `scale.py`: the function
- `recipes/pancakes.json`: a recipe for 2 guests
- `recipes/dragon_chili.json`: a recipe for 4 guests
- `expected/pancakes_6.json`: the expected output for pancakes scaled to 6 guests
- `tests/test_scale.py` and `tests/test_integration.py`
- `docs/postmortem.md`: written in the break-it section below

## Data format

A recipe is a JSON object: `{"base_guests": 2, "ingredients": [...]}`. Each ingredient looks like:

`{"name": "flour", "amount": 1.5, "unit": "cup"}`

Allowed units: `cup`, `tsp`, `g`, `pinch` and `to taste`. For `to taste`, `amount` is `null`.

Write `recipes/pancakes.json` and `recipes/dragon_chili.json` yourself. Each needs at least five ingredients.

## The function

`scale_recipe(ingredients, base_guests, guests)` returns a new list of ingredients.

- Scaled amount = `amount * guests / base_guests`, rounded to two decimal places.
- `to taste` ingredients come back unchanged.
- The input list is not modified.
- It raises `ValueError` when:
  - `base_guests` is less than 1
  - `guests` is less than 1 or more than 1000
  - a unit isn't in the list above
  - an amount is negative

## Tests

- `tests/test_scale.py`: at least ten unit tests. Include 0 guests (an error), 1000 guests (works), 1/3 cup scaled, `to taste` unchanged, and the input not being modified.
- `tests/test_integration.py`: loads `recipes/pancakes.json`, scales it to 6 guests, and compares the result with `expected/pancakes_6.json`.
- Run everything with `pytest` in the folder. It exits with 0 when every test passes and 1 when any test fails. Check with `echo $?`.

## Done when

- [ ] `pytest` passes
- [ ] A deliberately failing test makes `pytest` exit with 1, and then you fix it
- [ ] `docs/postmortem.md` exists (see below)

## Break it on purpose

1. In `scale.py`, multiply the amount by 10 for any ingredient called `salt`. Run `pytest`. Did any test fail? If not, add the missing test and watch it fail.
2. Write `docs/postmortem.md` for that mistake: what happened, how it was found, the impact, and one action that stops it happening again. Keep it blameless: describe the system, not a person.

## Stretch (needs a GitHub account, so ask me first)

Run `pytest` automatically on every push with GitHub Actions: a `.github/workflows/test.yml` file that runs `pytest`.

## Working agreement

Teach first. Review my tests before I run them, and don't write the test cases for me.
