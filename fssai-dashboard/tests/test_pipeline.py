import csv
import json
import tempfile
import unittest
from datetime import date

from pipeline import parse, schema
from pipeline.build import build
from pipeline.http import CaptchaEncountered, Disallowed, OutOfTime, PoliteClient
from pipeline.sources import hygiene
from pipeline.store import Store

from .helpers import FIXTURES, FakeResponse, FakeSession, temp_project

TODAY = date(2026, 10, 28)

GOOD_ACTION = {
    "id": "A-0001", "licence_no": "10000000000001", "name_in_source": "Example Test Kitchen",
    "action_type": "improvement_notice", "action_date": "2026-08-12", "authority": "Maharashtra FDA",
    "legal_section": "Sec 32", "finding": "", "summary": "", "status": "in_force", "status_as_of": "2026-10-01",
    "source_url": "https://example.org/press-note.pdf", "source_title": "Press note", "match_method": "licence_in_source",
    "verified_by": "", "verified_on": "", "match_note": "",
}


def client(routes, **kw):
    return PoliteClient(tempfile.mkdtemp(), min_delay=0, session=FakeSession(routes, **kw), sleep=lambda s: None)


class SchemaTests(unittest.TestCase):
    def test_good_action_passes(self):
        self.assertEqual(schema.validate_action(GOOD_ACTION, TODAY), [])

    def test_licence_must_be_14_digits(self):
        errors = schema.validate_action(dict(GOOD_ACTION, licence_no="1234"), TODAY)
        self.assertIn("licence_no must be exactly 14 digits", errors)

    def test_condition_words_rejected(self):
        errors = schema.validate_action(dict(GOOD_ACTION, summary="Cockroaches found in kitchen"), TODAY)
        self.assertTrue(any("describes a condition" in e for e in errors))

    def test_future_date_rejected(self):
        errors = schema.validate_action(dict(GOOD_ACTION, action_date="2027-01-01"), TODAY)
        self.assertIn("action_date is in the future", errors)

    def test_manual_match_needs_reviewer_and_note(self):
        errors = schema.validate_action(dict(GOOD_ACTION, match_method="verified_manually"), TODAY)
        self.assertIn("verified_by is required", errors)
        self.assertIn("match_note is required", errors)

    def test_source_must_be_https(self):
        errors = schema.validate_action(dict(GOOD_ACTION, source_url="http://example.org/x"), TODAY)
        self.assertTrue(any("https" in e for e in errors))


class ClientTests(unittest.TestCase):
    URL = "https://portal.example/search"

    def test_refuses_what_robots_disallows(self):
        c = client({("GET", self.URL): [FakeResponse(200, "ok")]}, robots="User-agent: *\nDisallow: /search\n")
        with self.assertRaises(Disallowed):
            c.get(self.URL)

    def test_stops_on_captcha(self):
        c = client({("GET", self.URL): [FakeResponse(200, '<img src="captcha.php">')]})
        with self.assertRaises(CaptchaEncountered):
            c.get(self.URL)

    def test_backs_off_and_retries_on_429(self):
        c = client({("GET", self.URL): [FakeResponse(429, "", {"Retry-After": "5"}), FakeResponse(200, "ok")]})
        self.assertEqual(c.get(self.URL), b"ok")

    def test_out_of_time(self):
        c = client({("GET", self.URL): [FakeResponse(200, "ok")]})
        c.deadline = c.clock() - 1
        with self.assertRaises(OutOfTime):
            c.get(self.URL)

    def test_cached_response_is_not_refetched(self):
        c = client({("GET", self.URL): [FakeResponse(200, "ok")]})
        c.get(self.URL)
        c.get(self.URL)
        self.assertEqual(len(c.session.calls), 1)


class ParseTests(unittest.TestCase):
    def test_licence_number_with_spaces(self):
        self.assertEqual(parse.licence_no("Lic. No. 1000 0000 0000 01"), "10000000000001")
        self.assertIsNone(parse.licence_no("123456789012345"))  # 15 digits is not a licence number

    def test_dates(self):
        self.assertEqual(parse.iso_date("01-03-2026"), "2026-03-01")
        self.assertEqual(parse.iso_date("12 Aug 2026"), "2026-08-12")
        self.assertIsNone(parse.iso_date("soon"))

    def test_options_from_json(self):
        self.assertEqual(parse.options('[{"id": 5, "name": "Pune"}]'), {"Pune": "5"})


class HygieneTests(unittest.TestCase):
    def test_run_saves_both_districts(self):
        cfg = {"mode": "search", "form_url": "https://h.example/form", "state_field": "state", "districts_url": "https://h.example/d",
               "districts_state_param": "state_id", "district_field": "district", "search_url": "https://h.example/s",
               "columns": {"name": ["establishment name"], "address": ["address"], "licence_no": ["license no"],
                           "rating": ["rating"], "audit_date": ["audit date"], "valid_until": ["valid upto"]}}
        results = (FIXTURES / "hygiene_results.html").read_text()
        c = client({("GET", cfg["form_url"]): [FakeResponse(200, (FIXTURES / "hygiene_form.html").read_text())],
                    ("POST", cfg["districts_url"]): [FakeResponse(200, (FIXTURES / "hygiene_districts.html").read_text())],
                    ("POST", cfg["search_url"]): [FakeResponse(200, results)]})
        store = Store(temp_project())
        scope = {"state": "Maharashtra", "districts": ["Mumbai City", "Mumbai Suburban"]}
        self.assertEqual(hygiene.run(c, cfg, scope, store), 4)
        city = store.hygiene["Mumbai City"]
        linked = next(r for r in city if r["name"] == "Example Test Kitchen")
        self.assertEqual(linked["licence_no"], "10000000000001")
        self.assertEqual(linked["audit_date"], "2026-03-01")
        self.assertIsNone(next(r for r in city if r["name"] == "Sample Snack Corner")["licence_no"])
        self.assertEqual(c.session.calls[-1][3], {"state": "27", "district": "520"})


def detail_page(name, licence, address, state="Maharashtra"):
    return FakeResponse(200, f"<table><tr><td>Name of FBO</td><td>{name}</td></tr>"
                             f"<tr><td>FSSAI License No</td><td>{licence}</td></tr>"
                             f"<tr><td>Address</td><td>{address}</td></tr><tr><td>State</td><td>{state}</td></tr>"
                             f"<tr><td>Agency Name</td><td>Fictional Audits</td></tr></table>")


class SweepTests(unittest.TestCase):
    CFG = {"mode": "sweep", "detail_url": "https://h.example/fbo?id={id}", "start_id": 1, "max_ids_per_run": 10,
           "stop_after_missing": 2, "labels": {"name": ["name of fbo"], "licence_no": ["fssai license no"],
                                               "address": ["address"], "state": ["state"], "auditor": ["agency name"]}}
    SCOPE = {"city": "Mumbai", "state": "Maharashtra", "districts": ["Mumbai City", "Mumbai Suburban"]}

    def routes(self):
        empty = FakeResponse(200, "<p>No record</p>")
        pages = {1: detail_page("Example Test Kitchen", "10000000000001", "1 Test Road, Fort, Mumbai 400001"),
                 2: detail_page("Sample Pune Bakery", "10000000000002", "5 Demo Road, Pune"),
                 3: empty, 4: empty}
        return {("GET", self.CFG["detail_url"].format(id=i)): [p] for i, p in pages.items()}

    def test_keeps_only_in_scope_and_restarts_after_the_end(self):
        store = Store(temp_project())
        self.assertEqual(hygiene.run(client(self.routes()), self.CFG, self.SCOPE, store), 1)
        (record,) = store.hygiene["Mumbai"]
        self.assertEqual((record["id"], record["licence_no"], record["auditor"]), ("hyg-fbo-1", "10000000000001", "Fictional Audits"))
        self.assertEqual(record["source_url"], "https://h.example/fbo?id=1")
        self.assertEqual(store.runs["hygiene"]["next_id"], 1)  # passed the end, so start over next run

    def test_resumes_where_it_stopped(self):
        store = Store(temp_project())
        c = client(self.routes())
        hygiene.run(c, dict(self.CFG, max_ids_per_run=2), self.SCOPE, store)
        self.assertEqual(store.runs["hygiene"]["next_id"], 3)
        c.deadline = c.clock() - 1  # out of time straight away: position still saved
        with self.assertRaises(OutOfTime):
            hygiene.run(c, self.CFG, self.SCOPE, store)
        self.assertEqual(store.runs["hygiene"]["next_id"], 3)


class BuildTests(unittest.TestCase):
    def project_with(self, actions):
        root = temp_project()
        with (root / "data" / "manual" / "actions.csv").open("w", newline="") as f:
            w = csv.DictWriter(f, fieldnames=schema.ACTION_FIELDS)
            w.writeheader()
            w.writerows(actions)
        (root / "data" / "hygiene_ratings.json").write_text(json.dumps({"Mumbai City": [
            {"id": "hyg-1", "licence_no": "10000000000001", "name": "Example Test Kitchen", "address": "1 Test Road",
             "district": "Mumbai City", "rating": "4"},
            {"id": "hyg-2", "licence_no": None, "name": "Example Test Kitchen", "address": "9 Other Road",
             "district": "Mumbai City", "rating": "5"}]}))
        return root

    def built(self, root):
        text = (root / "site" / "data.js").read_text()
        return json.loads(text[len("window.FSD = "):-2])

    def test_joins_on_licence_number_only(self):
        root = self.project_with([GOOD_ACTION])
        self.assertEqual(build(Store(root), TODAY), [])
        entities = {e["key"]: e for e in self.built(root)["entities"]}
        self.assertEqual(len(entities["10000000000001"]["actions"]), 1)
        # Same name, no licence number: stays its own entry, gets no actions.
        self.assertEqual(entities["hyg-2"]["actions"], [])

    def test_invalid_action_blocks_the_build(self):
        root = self.project_with([dict(GOOD_ACTION, summary="rats seen")])
        errors = build(Store(root), TODAY)
        self.assertTrue(errors and "line 2" in errors[0])
        self.assertFalse((root / "site" / "data.js").exists())

    def test_duplicate_ids_rejected(self):
        root = self.project_with([GOOD_ACTION, GOOD_ACTION])
        self.assertTrue(any("id already used" in e for e in build(Store(root), TODAY)))


if __name__ == "__main__":
    unittest.main()
