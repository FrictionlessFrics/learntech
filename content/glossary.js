/*
  GLOSSARY: every concept in the curriculum, explained three ways:
  - plain:   what it is, in one or two sentences
  - analogy: the same idea in everyday or supply chain terms
  - project: where you'll meet it in the weekly projects

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
      "A store places an order (client) and the warehouse fulfils it (server). The warehouse is in turn a client of its own suppliers.",
    project:
      "Week 1: the browser is the client, and the Ghost Fortune Teller is the server."
  },
  {
    id: "http",
    term: "HTTP request",
    area: "RUN",
    plain:
      "The standard message format clients and servers use: a method (GET to read, POST to send), a URL, headers (metadata such as auth), and an optional body. The server replies with a status code and a body.",
    analogy:
      "A standard purchase-order format every supplier accepts: order type, ship-to address, references, line items.",
    project:
      "Week 1: every question to the Ghost Fortune Teller is one HTTP GET request."
  },
  {
    id: "status-codes",
    term: "Status codes",
    area: "RUN",
    plain:
      "Three-digit results on every response. 2xx means it worked. 4xx means the caller got something wrong (401 not logged in, 403 not allowed, 404 not found, 429 too many requests). 5xx means the server broke.",
    analogy:
      "Order acknowledgements: confirmed, rejected for a bad SKU, rejected for no credit, or the supplier's system is down.",
    project:
      "Week 1: the fortune teller returns 400, 404 and 500 on purpose so you can see each one."
  },
  {
    id: "api",
    term: "API",
    area: "RUN",
    plain:
      "The set of requests a system accepts and what it promises to return. You can use it without knowing how the system works inside.",
    analogy:
      "A supplier's catalogue and order form. You don't need to know how their warehouse is laid out.",
    project:
      "Week 1: the /fortune route is an API. Anyone who knows the URL can call it."
  },
  {
    id: "json",
    term: "JSON",
    area: "RUN",
    plain:
      "A text format for structured data, such as an object with named fields. It's the default language most APIs speak.",
    analogy: "A packing list in a layout every system can read.",
    project:
      "Week 1: each fortune comes back as a JSON object with one field called fortune."
  },
  {
    id: "process-port",
    term: "Processes and ports",
    area: "RUN",
    plain:
      "A process is a running program. A port is the numbered door it listens on, such as 5000. Localhost means 'this same machine'.",
    analogy:
      "A building with numbered dock doors. Each process works one door, and deliveries need the right door number.",
    project:
      "Week 2: the Two-Headed Ghost runs one process on port 5000 and another on port 5001."
  },
  {
    id: "env-vars",
    term: "Environment variables",
    area: "RUN",
    plain:
      "Settings handed to a program from outside its code, such as a passphrase or a port number. The same code then runs anywhere with different settings.",
    analogy:
      "One standard procedure used at every site. Only the site parameters change: address, number of docks, cut-off times.",
    project:
      "Week 2 and 3: the ghost's passphrase and port come from environment variables, set differently on your laptop and on the host."
  },
  {
    id: "twelve-factor",
    term: "Twelve-Factor App",
    area: "RUN",
    plain:
      "Twelve rules for building apps that are easy to deploy, move and scale: config in the environment, stateless processes, logs as streams, and so on.",
    analogy:
      "A standard operating model that lets a new contractor take over a site without rewriting the processes.",
    project:
      "Week 2: you score the Ghost Fortune Teller against all twelve factors."
  },
  {
    id: "container",
    term: "Containers (Docker)",
    area: "RUN",
    plain:
      "An app packaged with everything it needs, so it behaves the same on any machine. An image is the packaged blueprint; a container is a running copy of it.",
    analogy:
      "Literally the shipping container: one standard box that any ship, train or port can handle without unpacking.",
    project:
      "Week 3: you write a Dockerfile that builds the fortune teller into an image, then run it as a container."
  },
  {
    id: "deployment",
    term: "Deployment",
    area: "RUN",
    plain:
      "Getting a specific version of your code running somewhere other people can reach, in a repeatable way.",
    analogy:
      "Go-live of a new process at a site, ideally with a checklist that works the same way every time.",
    project:
      "Week 3: the container goes live on Render or Railway at a public URL."
  },
  {
    id: "health-check",
    term: "Health check",
    area: "RUN",
    plain:
      "A simple endpoint, often /health, that the hosting platform calls to confirm the service is alive. If it fails, the platform restarts the service or holds back a bad deploy.",
    analogy: "The morning check that the dock doors open and the scanners work before the trucks arrive.",
    project:
      "Week 3: the fortune teller gets a /health route the host can check."
  },

  /* REL ---------------------------------------------------------------- */
  {
    id: "logging",
    term: "Logging",
    area: "REL",
    plain:
      "A timestamped record of what a program did and why. Good logs answer 'what happened at 6:02am?' without rerunning anything.",
    analogy: "The warehouse transaction log: every movement, who made it, and when.",
    project:
      "Week 4: the Pirate Treasure Counter logs its start time, chests read, gold total, duration and status."
  },
  {
    id: "error-handling",
    term: "Error handling",
    area: "REL",
    plain:
      "Deciding what happens when something goes wrong: retry, stop, alert, or carry on. Silently swallowing errors is the classic trap.",
    analogy:
      "Exception management. A late shipment is rerouted, escalated or accepted, but never ignored.",
    project:
      "Week 4: a chest with a negative gold count stops the counter and reports it, instead of quietly adding zero."
  },
  {
    id: "exit-code",
    term: "Exit code",
    area: "REL",
    plain:
      "The number a program returns when it finishes: 0 means success, anything else means failure. Schedulers like GitHub Actions use it to mark a run green or red.",
    analogy: "The final status on a work order: closed complete, or closed with an exception.",
    project:
      "Week 4: a failed count exits with code 1, which echo $? shows. A scheduler would show that run as red."
  },
  {
    id: "monitoring-alerts",
    term: "Monitoring and alerts",
    area: "REL",
    plain:
      "Monitoring watches key signals over time. An alert tells a person when a signal crosses a line that needs action. The four golden signals are latency, traffic, errors and saturation.",
    analogy:
      "Exception management in a control room. Nobody watches every shipment; people are flagged on the ones that will miss.",
    project:
      "Week 4: a failed run posts an alert to Discord or Slack, or a printed alert if you skip the account."
  },
  {
    id: "idempotency",
    term: "Idempotency",
    area: "REL",
    plain:
      "An operation is idempotent if doing it twice has the same effect as doing it once. It's what makes retries and re-runs safe.",
    analogy: "Re-posting the same goods receipt should not double the stock on hand.",
    project:
      "Week 5: running the Storm Oracle Importer twice must leave exactly the same row count."
  },
  {
    id: "upsert",
    term: "Upsert",
    area: "REL",
    plain:
      "Insert a row if its key is new, or update it if the key already exists. It's the usual way to make a data load idempotent.",
    analogy: "Update the item master if the SKU exists, create it if it doesn't. Never two records for one SKU.",
    project:
      "Week 5: the importer upserts each island and date, so a second run updates rows instead of adding them."
  },
  {
    id: "retries-backoff",
    term: "Retries with backoff",
    area: "REL",
    plain:
      "Trying again after a temporary failure, waiting longer each time (1s, 2s, 4s and so on), with a cap on attempts.",
    analogy: "Calling a supplier who didn't pick up, at growing intervals, rather than fifty times a minute.",
    project:
      "Week 5: the importer retries the sneezing oracle's 503s after 1s, 2s and 4s, then gives up."
  },
  {
    id: "transient-error",
    term: "Transient vs permanent errors",
    area: "REL",
    plain:
      "Transient errors go away if you wait: timeouts, rate limits, a server restarting. Permanent ones won't: bad credentials, malformed data. Retry the first kind; stop and alert on the second.",
    analogy: "A truck stuck in traffic vs a truck sent to the wrong address. Only one fixes itself.",
    project:
      "Week 5: 503 and timeouts get retried, but a 401 with a bad key stops the importer straight away."
  },
  {
    id: "unit-test",
    term: "Unit test",
    area: "REL",
    plain:
      "A small automated check of one function: known inputs go in, and the expected output is checked. Fast, and runs in isolation.",
    analogy: "Inspecting one component against its spec before it goes on the line.",
    project:
      "Week 6: scale_recipe() is tested against known recipes, including 0 guests and 1/3 cup."
  },
  {
    id: "integration-test",
    term: "Integration test",
    area: "REL",
    plain:
      "A test of several parts working together, such as your code plus a real test database. Slower than unit tests, but it catches problems where the parts join.",
    analogy: "A trial run of the whole assembled line, not just each machine on its own.",
    project:
      "Week 6: a whole recipe file goes in, through the scaler, and the output file is checked line by line."
  },
  {
    id: "ci",
    term: "Continuous integration (CI)",
    area: "REL",
    plain:
      "Tests run automatically on every change, so a broken change is caught before it merges.",
    analogy: "Incoming quality inspection on every shipment, rather than a sample once a quarter.",
    project:
      "Week 6 (optional stretch): GitHub Actions runs the recipe tests on every push."
  },
  {
    id: "postmortem",
    term: "Blameless postmortem",
    area: "REL",
    plain:
      "A short write-up after an incident: what happened, the impact, the timeline, the root causes, and the actions that stop it happening again. It focuses on systems, not on who to blame.",
    analogy: "A root-cause review after a major stock-out, aimed at fixing the process rather than the planner.",
    project:
      "Week 6: you multiply the robot chef's salt by ten on purpose, then write up what happened and why."
  },

  /* SEC ---------------------------------------------------------------- */
  {
    id: "secrets",
    term: "Secrets",
    area: "SEC",
    plain:
      "Credentials that grant access: API keys, database passwords, service keys. They belong in environment variables or a secrets manager, never in code or git history.",
    analogy: "Master keys to the building. You don't leave them taped to the front door, even for a minute.",
    project:
      "Week 7: a fake key is committed by accident, found, and rotated. Deleting the commit doesn't make it safe again."
  },
  {
    id: "authn-authz",
    term: "Authentication vs authorization",
    area: "SEC",
    plain:
      "Authentication checks who you are. Authorization decides what you're allowed to do once you're in.",
    analogy: "The guard checking your face at the gate, vs the key ring that decides which doors open.",
    project:
      "Week 8: logging into the Dragon Club proves who you are; row-level security decides which gold you see."
  },
  {
    id: "least-privilege",
    term: "Least privilege",
    area: "SEC",
    plain:
      "Give every person and program the minimum access it needs and nothing more, so one mistake or leak does limited damage.",
    analogy: "A picker's badge doesn't open the finance office or the high-value stock cage.",
    project:
      "Week 7: the goblin_reader role can SELECT from the hoard, and gets 'permission denied' on anything else."
  },
  {
    id: "service-key",
    term: "Supabase anon vs service-role key",
    area: "SEC",
    plain:
      "The anon key is meant for browsers and relies on row-level security to limit what it can do. The service_role key bypasses row-level security entirely. It's the master key, and it belongs only on trusted servers.",
    analogy: "A visitor badge vs the facility manager's master key.",
    project:
      "Week 8: the Dragon Club's front end uses the anon key, and the admin script uses service_role, kept on the server."
  },
  {
    id: "rls",
    term: "Row-level security (RLS)",
    area: "SEC",
    plain:
      "The database itself decides which rows each user can read or change, using policies. Even if the app has a bug, the database refuses.",
    analogy:
      "Each customer sees only their own orders, enforced at the warehouse door rather than by a website hiding them.",
    project:
      "Week 8: each dragon in the Dragon Club sees only its own rows, enforced by policies on the gold table."
  },
  {
    id: "sql-injection",
    term: "SQL injection",
    area: "SEC",
    plain:
      "When user input is treated as SQL code instead of data. The fix is parameterised queries: values are passed separately from the SQL text.",
    analogy: "Someone writing 'and also ship me 500 units' in the delivery-notes field, and the system obeying it.",
    project:
      "Week 8: the Tavern Guestbook builds SQL by pasting in text. You break it, then fix it with parameters."
  },
  {
    id: "prompt-injection",
    term: "Prompt injection",
    area: "SEC",
    plain:
      "Text that tricks an LLM into ignoring its instructions. It can come from the user directly, or from data the model reads, which is the harder case.",
    analogy: "A forged instruction slipped into a shipping document that the receiving clerk follows.",
    project:
      "Week 8: a review that says 'ignore your instructions' tries to steer the Review Summariser. You plant one, then defend against it."
  },

  /* SCL ---------------------------------------------------------------- */
  {
    id: "latency-throughput",
    term: "Latency vs throughput",
    area: "SCL",
    plain:
      "Latency is how long one request takes. Throughput is how many requests you can handle per second. Improving one doesn't automatically improve the other.",
    analogy: "Lead time vs capacity. A fast lane that serves one truck an hour has low latency but low throughput.",
    project:
      "Week 9: the Dragon Post Office. One letter's wait time is latency; letters delivered per minute is throughput."
  },
  {
    id: "percentiles",
    term: "Percentiles (p50, p95)",
    area: "SCL",
    plain:
      "p95 means 95% of requests are faster than this figure. Averages hide the slow tail that users actually complain about.",
    analogy: "Like on-time delivery: an average lead time of three days can hide the one order in twenty that takes twelve.",
    project:
      "Week 9: you measure p50 and p95 for each step of the post office."
  },
  {
    id: "bottleneck",
    term: "Bottleneck",
    area: "SCL",
    plain:
      "The slowest step, which sets the pace for the whole system. Speeding up anything else is wasted effort.",
    analogy: "Theory of constraints: find the constraint first, then get the most out of it.",
    project:
      "Week 9: is the owl sorter really the slowest step? Measuring is how you find out."
  },
  {
    id: "index",
    term: "Database index",
    area: "SCL",
    plain:
      "A sorted lookup structure that lets the database jump to matching rows, instead of reading the whole table. Reads get faster; writes get a little slower.",
    analogy: "Bin locations. Without them, a picker walks every aisle to find one SKU.",
    project:
      "Week 10: an index on the Pirate Manifest's island column turns a full scan of a million rows into a quick lookup."
  },
  {
    id: "query-plan",
    term: "Query plan (EXPLAIN)",
    area: "SCL",
    plain:
      "The route the database chooses to answer a query. EXPLAIN shows the plan, and EXPLAIN ANALYZE adds real timings. A sequential scan on a big table means it read every row.",
    analogy: "The pick path. You can see whether the picker went straight to the bin or walked the whole warehouse.",
    project:
      "Week 10: run EXPLAIN on the Pirate Manifest's slowest query, before and after adding an index."
  },
  {
    id: "caching",
    term: "Caching",
    area: "SCL",
    plain:
      "Keeping a copy of an expensive result close by, so the next request is fast. The cost is that the copy can go stale.",
    analogy: "Forward-positioned stock: fast to serve, but it can be the wrong stock if demand has shifted.",
    project:
      "Week 11: the Crystal Ball keeps fortunes warm, so repeated questions skip the two-second spirit lookup."
  },
  {
    id: "ttl-invalidation",
    term: "TTL and invalidation",
    area: "SCL",
    plain:
      "TTL (time to live) is how long a cached value is trusted. Invalidation is throwing it away early because the source data changed.",
    analogy: "TTL is shelf life. Invalidation is a recall when the product underneath has changed.",
    project:
      "Week 11: each cached fortune expires after 60 seconds, and the whole cache clears when moon_phase.txt changes."
  },
  {
    id: "background-jobs",
    term: "Background jobs and queues",
    area: "SCL",
    plain:
      "Long work runs outside the request. The user gets a job ID straight away and checks back later. A queue holds jobs waiting for a worker.",
    analogy: "You don't keep a customer at the counter while their order is made. You give them an order number.",
    project:
      "Week 12: POST /maps returns a job ID in milliseconds, while the 90-second render happens in the background."
  },
  {
    id: "rate-limit",
    term: "Rate limit",
    area: "SCL",
    plain:
      "A cap on requests per period, per user or per key. It protects capacity and cost, and a breach usually shows up as a 429.",
    analogy: "Dock appointment slots: everyone gets served, and nobody floods the yard.",
    project:
      "Week 12: each user gets 10 maps an hour, and the 11th request gets a 429 with a clear retry time."
  },
  {
    id: "unit-cost",
    term: "Unit cost",
    area: "SCL",
    plain:
      "What one unit of work costs, such as one answered question or one map, across compute, storage and any third-party fees. It tells you whether scaling up is affordable.",
    analogy: "Cost to serve per order line.",
    project:
      "Week 12: the cost per galaxy map, and per 1,000 maps, in the State of the Dragon Kingdom memo."
  }
];
