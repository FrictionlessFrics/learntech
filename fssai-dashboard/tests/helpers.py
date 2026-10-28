import shutil
import tempfile
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
FIXTURES = Path(__file__).resolve().parent / "fixtures"


class FakeResponse:
    def __init__(self, status=200, body=b"", headers=None):
        self.status_code = status
        self.content = body if isinstance(body, bytes) else body.encode()
        self.text = self.content.decode()
        self.headers = headers or {}

    def raise_for_status(self):
        if self.status_code >= 400:
            raise RuntimeError(f"HTTP {self.status_code}")


class FakeSession:
    """Answers requests from a dict of (method, url) -> list of responses (last one repeats)."""

    def __init__(self, routes, robots="User-agent: *\nAllow: /\n"):
        self.headers = {}
        self.routes = routes
        self.robots = robots
        self.calls = []

    def get(self, url, timeout=None):
        if url.endswith("/robots.txt"):
            return FakeResponse(200, self.robots) if self.robots is not None else FakeResponse(404)
        return self.request("GET", url)

    def request(self, method, url, params=None, data=None, headers=None, timeout=None):
        self.calls.append((method, url, params, data))
        answers = self.routes[(method, url)]
        return answers.pop(0) if len(answers) > 1 else answers[0]


def temp_project():
    """A throwaway copy of config/ and data/ to build against."""
    tmp = Path(tempfile.mkdtemp())
    shutil.copytree(ROOT / "config", tmp / "config")
    (tmp / "data" / "manual").mkdir(parents=True)
    shutil.copy(ROOT / "data" / "sources.json", tmp / "data" / "sources.json")
    (tmp / "site").mkdir()
    return tmp
