"""HTML helpers shared by the sources.

The portals' exact markup hasn't been checked yet, so these parse by header and
label text (configured in config/endpoints.toml) rather than by position. If a
portal renames a column, fix it in the config, not here.
"""
import json
import re
from datetime import datetime
from urllib.parse import urljoin

from bs4 import BeautifulSoup

LICENCE_IN_TEXT = re.compile(r"(?<!\d)(\d{14})(?!\d)")
DATE_FORMATS = ("%d-%m-%Y", "%d/%m/%Y", "%d.%m.%Y", "%Y-%m-%d", "%d %b %Y", "%d %B %Y", "%d-%b-%Y")


def norm(text):
    return re.sub(r"\s+", " ", (text or "")).strip().lower().rstrip(":")


def iso_date(text):
    text = re.sub(r"\s+", " ", (text or "")).strip()
    for fmt in DATE_FORMATS:
        try:
            return datetime.strptime(text, fmt).date().isoformat()
        except ValueError:
            pass
    return None


def licence_no(text):
    """A 14-digit licence number in the text, or None. Spaces inside are ignored."""
    match = LICENCE_IN_TEXT.search(re.sub(r"(?<=\d)[\s-](?=\d)", "", text or ""))
    return match.group(1) if match else None


def options(body, select_name=None, json_value="id", json_label="name"):
    """{label: value} from <option> tags, or from a JSON list of objects."""
    text = body.decode("utf-8", errors="replace") if isinstance(body, bytes) else body
    try:
        items = json.loads(text)
    except ValueError:
        items = None
    if isinstance(items, list):
        return {str(i[json_label]).strip(): str(i[json_value]) for i in items
                if isinstance(i, dict) and json_label in i and json_value in i}
    soup = BeautifulSoup(text, "html.parser")
    root = soup.find("select", attrs={"name": select_name}) if select_name else soup
    if root is None:
        return {}
    return {o.get_text(strip=True): o.get("value", "") for o in root.find_all("option")
            if o.get("value", "").strip() not in ("", "0", "-1")}


def table_rows(body, columns):
    """Rows of the results table as dicts, keyed by the field names in `columns`.

    `columns` maps a field to the header texts it may appear under, e.g.
    {"name": ["establishment name", "name of fbo"]}. The table with the most
    matching headers wins.
    """
    soup = BeautifulSoup(body, "html.parser")
    wanted = {norm(h): field for field, headers in columns.items() for h in headers}
    best, best_map = None, {}
    for table in soup.find_all("table"):
        header_row = table.find("tr")
        if header_row is None:
            continue
        cells = header_row.find_all(["th", "td"])
        mapping = {i: wanted[norm(c.get_text())] for i, c in enumerate(cells) if norm(c.get_text()) in wanted}
        if len(mapping) > len(best_map):
            best, best_map = table, mapping
    if best is None:
        return []
    rows = []
    for tr in best.find_all("tr")[1:]:
        cells = tr.find_all("td")
        if not cells:
            continue
        row = {field: cells[i].get_text(" ", strip=True) for i, field in best_map.items() if i < len(cells)}
        if any(row.values()):
            rows.append(row)
    return rows


def label_values(body, labels):
    """Pick fields from a details page laid out as label/value pairs, or from JSON.

    `labels` maps a field to the labels it may appear under.
    """
    text = body.decode("utf-8", errors="replace") if isinstance(body, bytes) else body
    wanted = {norm(l): field for field, ls in labels.items() for l in ls}
    found = {}
    try:
        data = json.loads(text)
    except ValueError:
        data = None
    if data is not None:
        for key, value in _flatten(data):
            field = wanted.get(norm(key))
            if field and field not in found and value not in (None, ""):
                found[field] = str(value).strip()
        return found
    soup = BeautifulSoup(text, "html.parser")
    for tr in soup.find_all("tr"):
        cells = tr.find_all(["th", "td"])
        for label, value in zip(cells, cells[1:]):
            field = wanted.get(norm(label.get_text()))
            if field and field not in found:
                found[field] = value.get_text(" ", strip=True)
    return found


def _flatten(data):
    if isinstance(data, dict):
        for key, value in data.items():
            if isinstance(value, (dict, list)):
                yield from _flatten(value)
            else:
                yield key, value
    elif isinstance(data, list):
        for item in data:
            yield from _flatten(item)


def links(body, base_url, pattern):
    """(absolute url, link text) for every <a> whose href matches `pattern`."""
    soup = BeautifulSoup(body, "html.parser")
    rx = re.compile(pattern, re.IGNORECASE)
    seen, out = set(), []
    for a in soup.find_all("a", href=True):
        url = urljoin(base_url, a["href"].strip())
        if rx.search(url) and url not in seen:
            seen.add(url)
            out.append((url, a.get_text(" ", strip=True)))
    return out
