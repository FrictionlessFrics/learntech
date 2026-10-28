"""A deliberately slow, polite HTTP client for government portals.

  * Refuses any URL that robots.txt disallows.
  * Waits at least `min_delay` seconds (plus jitter) between requests to one host.
  * Backs off on 429 and 5xx, honouring Retry-After.
  * Stops the source the moment it sees a CAPTCHA. It never tries to solve one.
  * Caches responses on disk for `cache_max_age`, so a run cut short resumes where it stopped.
  * Stops cleanly when the run's time budget is used up.
"""
import hashlib
import json
import random
import re
import time
from pathlib import Path
from urllib.parse import urlsplit
from urllib.robotparser import RobotFileParser

import requests

USER_AGENT = "fssai-dashboard/0.1 (public-interest research; +https://github.com/FrictionlessFrics/fssai-dashboard)"
CAPTCHA_RE = re.compile(rb"captcha", re.IGNORECASE)


class StopSource(Exception):
    """The current source must stop now. Data fetched so far is kept."""


class Disallowed(StopSource):
    pass


class CaptchaEncountered(StopSource):
    pass


class OutOfTime(StopSource):
    pass


class TooManyFailures(StopSource):
    pass


class PoliteClient:
    def __init__(self, cache_dir, min_delay=3.0, deadline=None, max_retries=4, cache_max_age=20 * 3600,
                 captcha_re=CAPTCHA_RE, session=None, sleep=time.sleep, clock=time.monotonic):
        self.cache_dir = Path(cache_dir)
        self.cache_dir.mkdir(parents=True, exist_ok=True)
        self.min_delay = min_delay
        self.deadline = deadline
        self.max_retries = max_retries
        self.cache_max_age = cache_max_age
        self.captcha_re = captcha_re
        self.session = session or requests.Session()
        self.session.headers["User-Agent"] = USER_AGENT
        self.sleep = sleep
        self.clock = clock
        self._last_hit = {}
        self._robots = {}
        self.requests_made = 0

    def get(self, url, params=None):
        return self._request("GET", url, params=params)

    def post(self, url, data=None, headers=None):
        return self._request("POST", url, data=data, headers=headers)

    def text(self, body):
        return body.decode("utf-8", errors="replace")

    # -- internals ---------------------------------------------------------

    def _cache_path(self, method, url, params, data):
        key = json.dumps([method, url, params, data], sort_keys=True, default=str)
        return self.cache_dir / hashlib.sha256(key.encode()).hexdigest()

    def _request(self, method, url, params=None, data=None, headers=None):
        cached = self._cache_path(method, url, params, data)
        if cached.exists() and time.time() - cached.stat().st_mtime < self.cache_max_age:
            return cached.read_bytes()
        if self.deadline is not None and self.clock() >= self.deadline:
            raise OutOfTime("time budget used up")
        if not self.allowed(url):
            raise Disallowed(f"robots.txt disallows {url}")

        for attempt in range(self.max_retries + 1):
            self._throttle(url)
            try:
                resp = self.session.request(method, url, params=params, data=data,
                                            headers=headers, timeout=60)
            except requests.RequestException as exc:
                if attempt == self.max_retries:
                    raise TooManyFailures(f"{url}: {exc}") from exc
                self.sleep(self._backoff(attempt))
                continue
            if resp.status_code == 429 or resp.status_code >= 500:
                if attempt == self.max_retries:
                    raise TooManyFailures(f"{url}: HTTP {resp.status_code}")
                self.sleep(self._retry_after(resp) or self._backoff(attempt))
                continue
            break

        if self.captcha_re and self.captcha_re.search(resp.content):
            raise CaptchaEncountered(f"CAPTCHA at {url}; stopping this source")
        if resp.status_code in (401, 403):
            raise Disallowed(f"{url}: HTTP {resp.status_code}")
        resp.raise_for_status()
        cached.write_bytes(resp.content)
        return resp.content

    def _throttle(self, url):
        host = urlsplit(url).netloc
        wait = self.min_delay + random.uniform(0, self.min_delay / 2)
        last = self._last_hit.get(host)
        if last is not None:
            remaining = wait - (self.clock() - last)
            if remaining > 0:
                self.sleep(remaining)
        self._last_hit[host] = self.clock()
        self.requests_made += 1

    def _backoff(self, attempt):
        return min(600, 30 * 2 ** attempt)

    def _retry_after(self, resp):
        try:
            return min(3600, int(resp.headers.get("Retry-After", "")))
        except ValueError:
            return None

    def allowed(self, url):
        parts = urlsplit(url)
        root = f"{parts.scheme}://{parts.netloc}"
        if root not in self._robots:
            parser = RobotFileParser()
            self._throttle(root)
            try:
                resp = self.session.get(root + "/robots.txt", timeout=30)
            except requests.RequestException as exc:
                raise TooManyFailures(f"could not read {root}/robots.txt: {exc}") from exc
            # RFC 9309: unreachable (5xx) or forbidden means stay out; missing means allowed.
            if resp.status_code in (401, 403) or resp.status_code >= 500:
                parser.disallow_all = True
            elif resp.status_code >= 400:
                parser.allow_all = True
            else:
                parser.parse(resp.text.splitlines())
            self._robots[root] = parser
        return self._robots[root].can_fetch(USER_AGENT, url)
