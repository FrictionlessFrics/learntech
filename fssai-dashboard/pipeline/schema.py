"""Record types and the validation rules that guard against defamation.

Every published regulatory action must:
  * be keyed by a 14-digit FSSAI licence number (never by a name match),
  * describe what the regulator DID, not what an inspector saw,
  * carry a source document link, a date and a status.
"""
import re
from datetime import date

LICENCE_RE = re.compile(r"^\d{14}$")
ID_RE = re.compile(r"^[A-Za-z0-9][A-Za-z0-9-]*$")

# What the regulator did. Labels are what the site shows.
ACTION_TYPES = {
    "improvement_notice": "Improvement notice issued",
    "licence_suspended": "Licence suspended",
    "licence_cancelled": "Licence cancelled",
    "prohibition_order": "Prohibition order",
    "stop_business_order": "Order to stop business",
    "seizure": "Stock seized",
    "sample_declared": "Sample declared non-conforming by Food Analyst",
    "penalty": "Penalty imposed by Adjudicating Officer",
    "prosecution_filed": "Prosecution filed",
    "conviction": "Convicted by court",
    "consumer_order": "Consumer commission order",
}

# The legal category of a finding, if the source states one. No free text here.
FINDINGS = {
    "": "",
    "unsafe": "Unsafe food (FSS Act Sec 3(1)(zz))",
    "sub_standard": "Sub-standard food",
    "misbranded": "Misbranded food",
    "no_licence": "Operating without a licence or registration",
    "licence_conditions": "Breach of licence conditions",
}

STATUSES = {
    "in_force": "In force",
    "pending": "Pending",
    "complied": "Complied / closed",
    "under_appeal": "Under appeal",
    "withdrawn": "Withdrawn",
    "overturned": "Overturned on appeal",
    "unknown": "Current status not known",
}

# licence_in_source: the source document itself states the licence number.
# verified_manually: a reviewer matched name AND address against the FoSCoS record.
MATCH_METHODS = {"licence_in_source", "verified_manually"}

# Words that describe a condition rather than an action. A summary using them is
# rejected: record "Improvement notice, Sec 32", not what was found in the kitchen.
CONDITION_WORDS = re.compile(
    r"\b(cockroach\w*|rats?|rodents?|mice|insects?|worms?|maggots?|lizards?|fung\w*|"
    r"mou?ld\w*|filth\w*|dirty|unhygienic|rotten|stale|sewage|urine|hair|"
    r"contaminat\w*|disgusting|infest\w*)\b",
    re.IGNORECASE,
)

ACTION_FIELDS = [
    "id", "licence_no", "name_in_source", "action_type", "action_date", "authority",
    "legal_section", "finding", "summary", "status", "status_as_of", "source_url",
    "source_title", "match_method", "verified_by", "verified_on", "match_note",
]

SUMMARY_MAX = 200


def parse_iso(value):
    try:
        return date.fromisoformat(value)
    except (TypeError, ValueError):
        return None


def validate_action(row, today=None):
    """Return a list of problems with one row of data/manual/actions.csv."""
    today = today or date.today()
    errors = []

    def need(field):
        if not (row.get(field) or "").strip():
            errors.append(f"{field} is required")
            return False
        return True

    if need("id") and not ID_RE.match(row["id"]):
        errors.append("id may only use letters, digits and dashes")
    if need("licence_no") and not LICENCE_RE.match(row["licence_no"]):
        errors.append("licence_no must be exactly 14 digits")
    if need("action_type") and row["action_type"] not in ACTION_TYPES:
        errors.append(f"action_type must be one of {', '.join(ACTION_TYPES)}")
    for field in ("action_date", "status_as_of"):
        if need(field):
            d = parse_iso(row[field])
            if not d:
                errors.append(f"{field} must be a date like 2026-08-12")
            elif d > today:
                errors.append(f"{field} is in the future")
    need("authority")
    if row.get("finding", "") not in FINDINGS:
        errors.append(f"finding must be blank or one of {', '.join(k for k in FINDINGS if k)}")
    if need("status") and row["status"] not in STATUSES:
        errors.append(f"status must be one of {', '.join(STATUSES)}")
    if need("source_url") and not row["source_url"].startswith("https://"):
        errors.append("source_url must be an https:// link to the source document")

    summary = row.get("summary", "")
    if len(summary) > SUMMARY_MAX:
        errors.append(f"summary is longer than {SUMMARY_MAX} characters")
    hit = CONDITION_WORDS.search(summary)
    if hit:
        errors.append(f"summary describes a condition ('{hit.group(0)}'); record the action instead")

    method = row.get("match_method", "")
    if method not in MATCH_METHODS:
        errors.append(f"match_method must be one of {', '.join(sorted(MATCH_METHODS))}")
    elif method == "verified_manually":
        for field in ("verified_by", "verified_on", "match_note"):
            need(field)
        if row.get("verified_on") and not parse_iso(row["verified_on"]):
            errors.append("verified_on must be a date like 2026-08-12")
    return errors
