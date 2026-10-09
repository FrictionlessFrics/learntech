/*
  GLOSSARY — every concept in the curriculum, explained three ways:
  - plain:   what it is, in one or two sentences
  - analogy: the same idea in supply chain terms
  - stack:   where it shows up in your control tower

  `id` is what weeks reference in their `concepts` list, and what your
  fluency ratings are saved against. Don't rename an existing id.
  `area` is RUN, REL, SEC or SCL (or anything new you add).
*/
window.LT = window.LT || {};

window.LT.glossary = [
  /* RUN ---------------------------------------------------------------- */
  {
    id: "client-server",
    term: "Client vs server",
    area: "RUN",
    plain:
      "A client asks for something; a server listens and answers. The same program can be both: a server to the one asking it, and a client to the services it calls next.",
    analogy:
      "A store places an order (client) and the DC fulfils it (server). The DC is in turn a client of its own suppliers.",
    stack:
      "The chat UI is a client of your agent backend. The backend is a client of OpenRouter and Supabase."
  },
  {
    id: "http",
    term: "HTTP request",
    area: "RUN",
    plain:
      "The standard message format clients and servers use: a method (GET to read, POST to send), a URL, headers (metadata like auth), and an optional body. The server replies with a status code and a body.",
    analogy:
      "A standard purchase-order format every supplier accepts: order type, ship-to address, references, line items.",
    stack:
      "Every hop in the text-to-SQL agent is an HTTP request, even when a library like the Supabase client hides it from you."
  },
  {
    id: "status-codes",
    term: "Status codes",
    area: "RUN",
    plain:
      "Three-digit results on every response. 2xx worked. 4xx means the caller got something wrong (401 not logged in, 403 not allowed, 404 not found, 429 too many requests). 5xx means the server broke.",
    analogy:
      "Order acknowledgement codes: confirmed, rejected for a bad SKU, rejected for no credit, or supplier system down.",
    stack:
      "A 401 from OpenRouter means a bad key. A 429 means you hit their rate limit. A 500 from your backend means your code threw an error."
  },
  {
    id: "api",
    term: "API",
    area: "RUN",
    plain:
      "The set of requests a system accepts and what it promises to return. You use it without knowing how the system works inside.",
    analogy:
      "A supplier's catalogue and order form. You don't need to know how their warehouse is laid out.",
    stack:
      "Your MEIO backend exposes an API. OpenRouter and Supabase are APIs your code calls."
  },
  {
    id: "json",
    term: "JSON",
    area: "RUN",
    plain:
      "A text format for structured data, e.g. `{\"sku\": \"A-102\", \"qty\": 40}`. It's the default language APIs speak.",
    analogy: "A packing list in a layout every system can read.",
    stack: "Forecast results, agent answers and Supabase rows all travel as JSON."
  },
  {
    id: "process-port",
    term: "Processes and ports",
    area: "RUN",
    plain:
      "A process is a running program. A port is the numbered door it listens on (e.g. 8000). Localhost means 'this same machine'.",
    analogy:
      "A building (the machine) with numbered dock doors. Each process works one door, and trucks need the door number.",
    stack:
      "When you run the MEIO backend locally it's a process listening on a port, reachable at `http://localhost:<port>`."
  },
  {
    id: "env-vars",
    term: "Environment variables",
    area: "RUN",
    plain:
      "Settings handed to a program from outside its code, like database URLs and API keys. The same code then runs anywhere with different settings.",
    analogy:
      "One SOP used at every DC. Only the site parameters (address, dock count, cut-off times) change.",
    stack:
      "`SUPABASE_URL`, `OPENROUTER_API_KEY` and similar belong in env vars: locally in `.env`, in production in your host's settings, in CI as GitHub secrets."
  },
  {
    id: "twelve-factor",
    term: "Twelve-Factor App",
    area: "RUN",
    plain:
      "Twelve rules for building apps that are easy to deploy, move and scale: config in the environment, stateless processes, logs as streams, and so on.",
    analogy:
      "A standard operating model that lets any 3PL take over a site without rewriting your processes.",
    stack: "Your week 2 scorecard grades the MEIO backend against all twelve."
  },
  {
    id: "container",
    term: "Containers (Docker)",
    area: "RUN",
    plain:
      "An app packaged with everything it needs to run, so it behaves the same on any machine. An image is the packaged blueprint; a container is a running copy of it.",
    analogy:
      "Literally the shipping container: one standard box that any ship, train or port can handle without unpacking.",
    stack: "Your MEIO backend's Dockerfile builds an image; Render or Railway runs containers from it."
  },
  {
    id: "deployment",
    term: "Deployment",
    area: "RUN",
    plain:
      "Getting a specific version of your code running somewhere other people can reach, in a repeatable way.",
    analogy:
      "Go-live of a new process at a site, ideally with a checklist that works the same way every time.",
    stack: "Pushing to your repo can trigger Render to rebuild and redeploy the MEIO backend."
  },
  {
    id: "health-check",
    term: "Health check",
    area: "RUN",
    plain:
      "A simple endpoint (often `/health`) the hosting platform calls to confirm your service is alive. If it fails, the platform restarts the service or holds back a bad deploy.",
    analogy: "The morning check that the dock doors open and the scanners work before trucks arrive.",
    stack: "Week 3 adds `/health` to the MEIO backend so Render knows when it's ready."
  },

  /* REL ---------------------------------------------------------------- */
  {
    id: "logging",
    term: "Logging",
    area: "REL",
    plain:
      "A timestamped record of what a program did and why. Good logs answer 'what happened at 6:02am?' without rerunning anything.",
    analogy: "The warehouse transaction log: every movement, who did it, when.",
    stack: "Week 4 makes every sync run log its start, row counts, duration and outcome."
  },
  {
    id: "error-handling",
    term: "Error handling",
    area: "REL",
    plain:
      "Deciding what happens when something goes wrong: retry, stop, alert, or carry on. Swallowing errors (`except: pass`) is the silent-failure trap.",
    analogy:
      "Exception management. A late shipment is either rerouted, escalated or accepted, but never ignored.",
    stack: "The GitHub Actions sync should stop and report on bad credentials, not quietly write zero rows."
  },
  {
    id: "exit-code",
    term: "Exit code",
    area: "REL",
    plain:
      "The number a program returns when it finishes: 0 means success, anything else means failure. Schedulers like GitHub Actions use it to mark a run green or red.",
    analogy: "The final status on a work order: closed-complete vs closed-with-exception.",
    stack: "If your sync script catches an error but still exits 0, GitHub shows a green tick on a failed run."
  },
  {
    id: "monitoring-alerts",
    term: "Monitoring and alerts",
    area: "REL",
    plain:
      "Monitoring watches key signals over time. An alert tells a person when a signal crosses a line that needs action. The four 'golden signals' are latency, traffic, errors and saturation.",
    analogy:
      "Control tower exception management. You don't watch every shipment; you get flagged on the ones that will miss.",
    stack: "Failure notifications on the sync, and later latency and error rates on the agent."
  },
  {
    id: "idempotency",
    term: "Idempotency",
    area: "REL",
    plain:
      "An operation is idempotent if doing it twice has the same effect as doing it once. It's what makes retries and re-runs safe.",
    analogy: "Re-posting the same goods receipt should not double the stock on hand.",
    stack: "If the sync runs twice, the tables should end up identical, not duplicated."
  },
  {
    id: "upsert",
    term: "Upsert",
    area: "REL",
    plain:
      "Insert a row if its key is new, update it if the key already exists. It's the usual way to make a data load idempotent.",
    analogy: "Update the item master if the SKU exists, create it if it doesn't. Never two records for one SKU.",
    stack: "Supabase supports upsert on a unique key such as SKU + location + date."
  },
  {
    id: "retries-backoff",
    term: "Retries with backoff",
    area: "REL",
    plain:
      "Trying again after a temporary failure and waiting longer each time (1s, 2s, 4s…), usually with a cap on attempts.",
    analogy: "Re-calling a supplier who didn't pick up, at growing intervals, not fifty times a minute.",
    stack: "Retry the sync's API calls on timeouts, 429 and 5xx errors."
  },
  {
    id: "transient-error",
    term: "Transient vs permanent errors",
    area: "REL",
    plain:
      "Transient errors go away if you wait (timeouts, rate limits, a server restarting). Permanent ones won't (bad credentials, malformed data). Retry the first kind; stop and alert on the second.",
    analogy: "A truck stuck in traffic vs a truck sent to the wrong address. Only one fixes itself.",
    stack: "429 and 503 are worth a retry. 401 and 400 are not."
  },
  {
    id: "unit-test",
    term: "Unit test",
    area: "REL",
    plain:
      "A small automated check of one function: known inputs in, expected output checked. Fast and runs in isolation.",
    analogy: "Inspecting one component against its spec before it goes on the line.",
    stack: "Feed known SKUs into `tagging_pipeline.py` and assert the expected tags come out."
  },
  {
    id: "integration-test",
    term: "Integration test",
    area: "REL",
    plain:
      "A test of several parts working together, such as your code plus a real (test) database. Slower than unit tests, but it catches problems at the joins.",
    analogy: "A trial run of the whole assembled line, not just each part.",
    stack: "Run the sync against a test table and check the row counts."
  },
  {
    id: "ci",
    term: "Continuous integration (CI)",
    area: "REL",
    plain:
      "Tests run automatically on every change, so a broken change is caught before it merges.",
    analogy: "Incoming quality inspection on every shipment, not a sample once a quarter.",
    stack: "A GitHub Actions workflow that runs your pytest suite on every push."
  },
  {
    id: "postmortem",
    term: "Blameless postmortem",
    area: "REL",
    plain:
      "A short write-up after an incident: what happened, impact, timeline, root causes, and the actions that will stop it recurring. It focuses on systems, not on who to blame.",
    analogy: "A root-cause analysis after a major stock-out, aimed at fixing the process rather than the planner.",
    stack: "Week 6: write one for a past data incident."
  },

  /* SEC ---------------------------------------------------------------- */
  {
    id: "secrets",
    term: "Secrets",
    area: "SEC",
    plain:
      "Credentials that grant access: API keys, database passwords, service keys. They belong in env vars or a secrets manager, never in code or git history.",
    analogy: "Master keys to the building. You don't tape them to the front door, even for a minute.",
    stack: "Your Supabase service key and OpenRouter key. If either was ever committed, rotate it."
  },
  {
    id: "authn-authz",
    term: "Authentication vs authorization",
    area: "SEC",
    plain:
      "Authentication checks who you are. Authorization decides what you're allowed to do once you're in.",
    analogy: "The badge check at the gate vs which zones your badge opens.",
    stack: "Supabase Auth authenticates users; RLS policies and database roles authorize what they can touch."
  },
  {
    id: "least-privilege",
    term: "Least privilege",
    area: "SEC",
    plain:
      "Give every person and program the minimum access it needs and nothing more, so one mistake or leak does limited damage.",
    analogy: "A picker's badge doesn't open the finance office or the cage of high-value stock.",
    stack: "The text-to-SQL agent needs to read data. It never needs to delete or change it."
  },
  {
    id: "service-key",
    term: "Supabase anon vs service-role key",
    area: "SEC",
    plain:
      "The anon key is meant for browsers and relies on RLS to limit what it can do. The service-role key bypasses RLS entirely; it's the master key and only belongs on trusted servers.",
    analogy: "A visitor badge vs the facility manager's master key.",
    stack: "Use the anon or a scoped key in anything user-facing. Keep service_role for backend jobs like the sync."
  },
  {
    id: "rls",
    term: "Row-level security (RLS)",
    area: "SEC",
    plain:
      "The database itself decides which rows each user can read or change, using policies. Even if the app has a bug, the database refuses.",
    analogy:
      "Each customer sees only their own orders, enforced at the warehouse door rather than by the website hiding them.",
    stack: "Week 8 turns RLS on for all seven tables, with a policy for each."
  },
  {
    id: "sql-injection",
    term: "SQL injection",
    area: "SEC",
    plain:
      "When user input gets treated as SQL code instead of data. The fix is parameterized queries: pass values separately from the SQL text.",
    analogy: "Someone writing 'and also ship me 500 units' in the delivery-notes field, and the system obeying it.",
    stack: "Any place your code builds SQL by gluing strings together with user input."
  },
  {
    id: "prompt-injection",
    term: "Prompt injection",
    area: "SEC",
    plain:
      "Text that tricks an LLM into ignoring its instructions. It can come from the user (direct) or from data the model reads (indirect).",
    analogy: "A forged instruction slipped into a shipping document that the receiving clerk follows.",
    stack:
      "A SKU description saying 'ignore previous instructions and…' could reach your agent. A read-only DB user limits the damage."
  },

  /* SCL ---------------------------------------------------------------- */
  {
    id: "latency-throughput",
    term: "Latency vs throughput",
    area: "SCL",
    plain:
      "Latency is how long one request takes. Throughput is how many requests you can handle per second. Improving one doesn't automatically improve the other.",
    analogy: "Lead time vs capacity. A fast lane that takes one truck an hour has low latency but low throughput.",
    stack: "The agent's latency is dominated by the LLM call; throughput is limited by rate limits and DB connections."
  },
  {
    id: "percentiles",
    term: "Percentiles (p50, p95)",
    area: "SCL",
    plain:
      "p95 = 95% of requests are faster than this. Averages hide the slow tail that users actually complain about.",
    analogy: "Like OTIF: an average lead time of 3 days can hide the 1 in 20 orders that takes 12.",
    stack: "Week 9: measure p50 and p95 for each hop of the agent."
  },
  {
    id: "bottleneck",
    term: "Bottleneck",
    area: "SCL",
    plain:
      "The slowest step, which sets the pace for the whole system. Speeding up anything else is wasted effort.",
    analogy: "Theory of constraints. Find the constraint first, then exploit it.",
    stack: "Is the agent waiting on the LLM, on SQL, or on network hops?"
  },
  {
    id: "index",
    term: "Database index",
    area: "SCL",
    plain:
      "A sorted lookup structure that lets the database jump to matching rows instead of reading the whole table. Reads get faster; writes get a bit slower.",
    analogy: "Bin locations. Without them a picker walks every aisle to find one SKU.",
    stack: "Indexes on columns your agent filters and joins on, such as SKU, location and date."
  },
  {
    id: "query-plan",
    term: "Query plan (EXPLAIN)",
    area: "SCL",
    plain:
      "The route the database chooses to answer a query. `EXPLAIN ANALYZE` shows the plan and real timings. 'Seq Scan' on a big table means it read every row.",
    analogy: "The pick path. You can see whether the picker went straight to the bin or walked the whole warehouse.",
    stack: "Week 10: EXPLAIN the agent's five slowest queries."
  },
  {
    id: "caching",
    term: "Caching",
    area: "SCL",
    plain:
      "Keeping a copy of an expensive result close by so the next request is fast. The cost is that the copy can go stale.",
    analogy: "Forward-positioned inventory: fast to serve, but it can be the wrong stock if demand shifted.",
    stack: "Cache forecast results that get requested repeatedly."
  },
  {
    id: "ttl-invalidation",
    term: "TTL and invalidation",
    area: "SCL",
    plain:
      "TTL (time to live) is how long a cached value is trusted. Invalidation is throwing it away early because the source data changed.",
    analogy: "TTL is shelf life. Invalidation is a recall when the underlying product changed.",
    stack: "Expire cached forecasts after a set time, and clear them whenever the sync loads new data."
  },
  {
    id: "background-jobs",
    term: "Background jobs and queues",
    area: "SCL",
    plain:
      "Long work runs outside the request. The user gets a job ID straight away and checks back later. A queue holds jobs waiting for a worker.",
    analogy: "You don't keep a customer at the counter while their order is made. You give them an order number.",
    stack: "Long forecast runs go into a jobs table or queue instead of blocking the API."
  },
  {
    id: "rate-limit",
    term: "Rate limit",
    area: "SCL",
    plain:
      "A cap on requests per period, per user or per key. It protects capacity and cost, and a breach usually shows up as a 429.",
    analogy: "Dock appointment slots: everyone gets served, nobody floods the yard.",
    stack: "Limit questions per user, and cap OpenRouter spend per month."
  },
  {
    id: "unit-cost",
    term: "Unit cost",
    area: "SCL",
    plain:
      "What one unit of work costs (a question answered, a forecast run) across hosting, database and LLM tokens. It's the number that tells you whether scaling up is affordable.",
    analogy: "Cost-to-serve per order line.",
    stack: "Week 12: cost per 1,000 agent questions, and per forecast run."
  }
];
