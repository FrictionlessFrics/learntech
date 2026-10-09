/*
  CURRICULUM — the tracks, areas, weeks and tasks shown on the site.

  How to edit (no coding needed beyond keeping the punctuation intact):
  - Change any text freely.
  - NEVER change an existing task `id` (e.g. "RUN-01.2"). Your ticked boxes are
    saved against these ids. Give new tasks a new id instead.
  - `mins` is your time estimate for the task. Week totals add these up.
  - `kind` is one of: "learn", "do", "read", "prove".
  - `prompt` (optional) is a "teach, don't do" prompt to paste into Claude Code.
  - `concepts` lists glossary ids from content/glossary.js.
  - Wrap code-ish words in backticks, e.g. `docker build`, to show them as code.
*/
window.LT = window.LT || {};

window.LT.curriculum = {
  tracks: [
    {
      id: "foundations",
      title: "Production Foundations",
      status: "active",
      summary:
        "Twelve weeks that take your control tower from 'works on my laptop' to something you would trust in front of a board: how it runs, how it fails, who can touch it, and what it costs.",
      areas: [
        /* ---------------------------------------------------------- RUN */
        {
          id: "run",
          code: "RUN",
          title: "How software runs",
          summary:
            "What calls what, where each piece lives, and how code becomes a running service other people can reach.",
          weeks: [
            {
              id: "W01",
              title: "Follow one question through the stack",
              goal:
                "Trace one planner question through your text-to-SQL agent end to end and draw it on one page.",
              concepts: ["client-server", "http", "status-codes", "api", "json"],
              tasks: [
                {
                  id: "RUN-01.1",
                  kind: "learn",
                  mins: 30,
                  text: "Learn client vs server and how an HTTP request works, using your own agent as the example.",
                  prompt:
                    "Explain client vs server and how an HTTP request works, using my text-to-SQL agent as the example. Don't change any code. Point me to the exact files where a request is sent and where it is received."
                },
                {
                  id: "RUN-01.2",
                  kind: "do",
                  mins: 60,
                  text: "Trace one question hop by hop: UI → backend → LLM (OpenRouter) → Supabase → back. For each hop write who calls whom, over what, and where it runs.",
                  prompt:
                    "I want to trace one question through my text-to-SQL agent end to end. Ask me to guess each hop first, then confirm or correct me by showing the code that makes that call."
                },
                {
                  id: "RUN-01.3",
                  kind: "do",
                  mins: 30,
                  text: "Open browser DevTools → Network, ask the agent a question, and find the request. Note the method, URL, status code and the JSON that came back."
                },
                {
                  id: "RUN-01.4",
                  kind: "do",
                  mins: 30,
                  text: "Break it on purpose: use a wrong API key, then ask about a table that doesn't exist. Write down which status code or error each failure produces.",
                  prompt:
                    "I'm going to break my agent on purpose (wrong API key, then a non-existent table). Before each test, ask me to predict the status code and error message. Explain the difference afterwards."
                },
                {
                  id: "RUN-01.5",
                  kind: "prove",
                  mins: 30,
                  text: "Draw the request-flow diagram on one page: boxes, arrows, and where each box runs. A whiteboard photo or a Mermaid diagram in your repo both count."
                }
              ],
              read: [
                {
                  title: "MDN: An overview of HTTP",
                  url: "https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/Overview",
                  focus: "Requests, responses, methods, headers. Skip the history.",
                  mins: 20
                },
                {
                  title: "MDN: HTTP response status codes",
                  url: "https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Status",
                  focus: "Learn the five families and 200, 201, 400, 401, 403, 404, 429, 500, 503.",
                  mins: 10
                }
              ],
              exec: {
                ask: [
                  "Where does each piece run, and who do we pay for each hop?",
                  "If step three is down, what does the planner see?",
                  "Which calls leave our network, and what data travels with them?"
                ],
                decides:
                  "Third-party data exposure. You'll know exactly which vendors see your schema and your questions."
              },
              proof: "One-page request-flow diagram of the text-to-SQL agent.",
              explain:
                "In 60 seconds, tell your CFO what happens between a planner typing a question and seeing the answer, and which outside companies touch the data."
            },
            {
              id: "W02",
              title: "Config, processes and the Twelve-Factor test",
              goal:
                "Run the MEIO backend locally, move every setting into environment variables, and score it against the twelve factors.",
              concepts: ["process-port", "env-vars", "twelve-factor", "secrets"],
              tasks: [
                {
                  id: "RUN-02.1",
                  kind: "read",
                  mins: 45,
                  text: "Read Twelve-Factor App factors I–VI: codebase, dependencies, config, backing services, build/release/run, processes."
                },
                {
                  id: "RUN-02.2",
                  kind: "do",
                  mins: 45,
                  text: "Run the MEIO backend locally. Find the port it listens on and call one endpoint with `curl`. Read the JSON it returns.",
                  prompt:
                    "Walk me through running my MEIO backend locally. Before each command, tell me what it will do and ask me to predict the output. Don't run anything I haven't predicted."
                },
                {
                  id: "RUN-02.3",
                  kind: "do",
                  mins: 60,
                  text: "List every setting and secret the MEIO backend and the agent use. Move hardcoded ones into environment variables and add a `.env.example` with names only, no values.",
                  prompt:
                    "Help me find every hardcoded setting or secret in this repo. List them in a table (name, file, line, is it a secret?). Don't change anything; I'll move them myself and you'll review."
                },
                {
                  id: "RUN-02.4",
                  kind: "read",
                  mins: 30,
                  text: "Read Twelve-Factor App factors VII–XII: port binding, concurrency, disposability, dev/prod parity, logs, admin processes."
                },
                {
                  id: "RUN-02.5",
                  kind: "prove",
                  mins: 30,
                  text: "Score the MEIO backend against all twelve factors: pass, partial or fail, with one line of reasoning each."
                }
              ],
              read: [
                {
                  title: "The Twelve-Factor App",
                  url: "https://12factor.net/",
                  focus: "Read it as a checklist for your own backend, not as theory.",
                  mins: 75
                }
              ],
              exec: {
                ask: [
                  "If we had to move this to another cloud tomorrow, what would break?",
                  "Where do the secrets live, and who can see them?",
                  "Is what runs in production the same as what we test?"
                ],
                decides: "Portability and vendor lock-in for anything your team builds or buys."
              },
              proof: "A twelve-factor scorecard for the MEIO backend, plus `.env.example` in the repo.",
              explain:
                "Explain why configuration shouldn't live inside the code, using one example from your supply chain."
            },
            {
              id: "W03",
              title: "Ship it: Docker and a real deployment",
              goal:
                "Put the MEIO backend in a container you wrote yourself and deploy it to Render or Railway.",
              concepts: ["container", "deployment", "env-vars", "health-check"],
              tasks: [
                {
                  id: "RUN-03.1",
                  kind: "learn",
                  mins: 30,
                  text: "Learn what a container is, how it differs from a virtual machine, and the difference between an image and a container.",
                  prompt:
                    "Explain Docker images and containers with a shipping-container analogy, then map each concept onto my MEIO backend. Don't write the Dockerfile yet."
                },
                {
                  id: "RUN-03.2",
                  kind: "do",
                  mins: 60,
                  text: "Write the Dockerfile for the MEIO backend yourself, line by line. Claude reviews; you type.",
                  prompt:
                    "I'm going to write a Dockerfile for my MEIO backend one line at a time. After each line, tell me what's wrong or missing, but don't write it for me."
                },
                {
                  id: "RUN-03.3",
                  kind: "do",
                  mins: 45,
                  text: "Build and run it locally with `docker build` and `docker run -p 8000:8000`, then call it with `curl`."
                },
                {
                  id: "RUN-03.4",
                  kind: "do",
                  mins: 60,
                  text: "Deploy to Render or Railway. Set environment variables in their dashboard, never in git. Add a `/health` endpoint the platform can check.",
                  prompt:
                    "I'm deploying my containerised MEIO backend to Render. Give me a checklist of what I need to configure and why, then let me do each step and tell you what I see."
                },
                {
                  id: "RUN-03.5",
                  kind: "prove",
                  mins: 15,
                  text: "Log the live URL of the deployed backend and link the Dockerfile in your repo."
                }
              ],
              read: [
                {
                  title: "Docker: Get started",
                  url: "https://docs.docker.com/get-started/",
                  focus: "Images, containers, and the Dockerfile basics. Skip Compose for now.",
                  mins: 40
                },
                {
                  title: "Render: Docker on Render",
                  url: "https://render.com/docs/docker",
                  focus: "How the platform builds and runs your image, and where env vars go.",
                  mins: 15
                }
              ],
              exec: {
                ask: [
                  "What does it cost per month to run, and what happens to that cost at ten times the usage?",
                  "How long from merged code to live, and who can push the button?",
                  "If the host has an outage, how do we move?"
                ],
                decides: "Hosting choice, and whether infrastructure is something you build or buy."
              },
              proof: "Live URL of the MEIO backend running from your own Dockerfile.",
              explain:
                "Explain to a peer executive what 'deploying' means and why containers made it cheaper and safer."
            }
          ]
        },

        /* ---------------------------------------------------------- REL */
        {
          id: "rel",
          code: "REL",
          title: "Reliability",
          summary:
            "Jobs that fail loudly, can safely run twice, and come with tests that prove the business logic still holds.",
          weeks: [
            {
              id: "W04",
              title: "Make the sync fail loudly",
              goal:
                "Every run of the GitHub Actions sync leaves a log, turns red when it fails, and tells you about it.",
              concepts: ["logging", "error-handling", "exit-code", "monitoring-alerts"],
              tasks: [
                {
                  id: "REL-04.1",
                  kind: "learn",
                  mins: 30,
                  text: "Find every way the sync can fail silently today. Rank them by business impact before fixing anything.",
                  prompt:
                    "Read my GitHub Actions sync workflow and the script it runs. List every way it could fail silently today. Don't fix anything; I'll rank them by business impact first."
                },
                {
                  id: "REL-04.2",
                  kind: "do",
                  mins: 60,
                  text: "Add logging to the sync: start time, rows fetched, rows written, duration, and final status.",
                  prompt:
                    "Explain what good logging looks like for a data sync job. Then I'll add log lines to my script and you review whether they would help me debug a failed run at 6am."
                },
                {
                  id: "REL-04.3",
                  kind: "do",
                  mins: 45,
                  text: "Make errors exit with a non-zero code so GitHub Actions marks the run red. Test it by breaking the credentials on a branch."
                },
                {
                  id: "REL-04.4",
                  kind: "do",
                  mins: 45,
                  text: "Alert yourself on failure: turn on GitHub Actions failure notifications, or add a final step that emails or posts to Slack when the job fails."
                },
                {
                  id: "REL-04.5",
                  kind: "prove",
                  mins: 15,
                  text: "Capture a deliberately failed run that alerted you, and the log that shows why it failed."
                }
              ],
              read: [
                {
                  title: "Google SRE book, ch. 6: Monitoring Distributed Systems",
                  url: "https://sre.google/sre-book/monitoring-distributed-systems/",
                  focus: "The four golden signals, and the difference between symptoms and causes.",
                  mins: 45
                }
              ],
              exec: {
                ask: [
                  "How would we know if yesterday's data didn't load?",
                  "Who gets alerted, and what is the first thing they do?",
                  "Which dashboards would be silently wrong right now if a job failed?"
                ],
                decides: "How much you can trust the numbers in front of you on any given morning."
              },
              proof: "A failed sync run that alerted you, with the log line that explains it.",
              explain: "Explain why a job that fails loudly is better than one that 'usually works'."
            },
            {
              id: "W05",
              title: "Retries and idempotency",
              goal:
                "The sync can run twice without duplicating data, and it retries temporary errors without hammering anything.",
              concepts: ["idempotency", "upsert", "retries-backoff", "transient-error"],
              tasks: [
                {
                  id: "REL-05.1",
                  kind: "learn",
                  mins: 30,
                  text: "Learn what idempotency means for your sync script, then attempt the fix yourself before seeing one.",
                  prompt:
                    "Explain what idempotency means for my sync script, then let me try the fix first. Only show me your version after I've shown you mine."
                },
                {
                  id: "REL-05.2",
                  kind: "do",
                  mins: 30,
                  text: "Run the sync twice in a row against a test table. Count rows before and after. Write down what happened."
                },
                {
                  id: "REL-05.3",
                  kind: "do",
                  mins: 60,
                  text: "Make the writes idempotent: upsert on a natural key (for example SKU + location + date) instead of a plain insert."
                },
                {
                  id: "REL-05.4",
                  kind: "do",
                  mins: 45,
                  text: "Add retries with exponential backoff for temporary errors only (timeouts, 429, 5xx). Fail fast on 401s and bad data.",
                  prompt:
                    "Which errors in my sync are worth retrying and which should stop immediately? Quiz me on five example errors before you explain the rule."
                },
                {
                  id: "REL-05.5",
                  kind: "prove",
                  mins: 15,
                  text: "Run the sync three times in a row and show the row count is identical each time."
                }
              ],
              read: [
                {
                  title: "Stripe: Designing robust and predictable APIs with idempotency",
                  url: "https://stripe.com/blog/idempotency",
                  focus: "Why retries are only safe when the operation is idempotent.",
                  mins: 20
                }
              ],
              exec: {
                ask: [
                  "If this job runs twice by accident, what happens to the numbers?",
                  "Which errors do we retry, and which do we stop on?",
                  "Could a retry have double-counted anything we reported last quarter?"
                ],
                decides: "The integrity guarantees you can give to anyone planning off this data."
              },
              proof: "Three consecutive sync runs with identical row counts.",
              explain: "Explain idempotency using a purchase order or a goods receipt."
            },
            {
              id: "W06",
              title: "Tests for the tagging pipeline",
              goal:
                "`tagging_pipeline.py` has tests built from SKUs you know, and they run on every push.",
              concepts: ["unit-test", "integration-test", "ci", "postmortem"],
              tasks: [
                {
                  id: "REL-06.1",
                  kind: "learn",
                  mins: 30,
                  text: "Learn unit vs integration tests, and decide which parts of the tagging pipeline need which.",
                  prompt:
                    "Explain unit vs integration tests using my tagging_pipeline.py. Ask me which five SKUs would make the best test cases before you suggest any."
                },
                {
                  id: "REL-06.2",
                  kind: "do",
                  mins: 45,
                  text: "Pick 10 known SKUs including edge cases (missing description, odd units, a new category). Write the expected tags by hand. Your domain knowledge is the spec."
                },
                {
                  id: "REL-06.3",
                  kind: "do",
                  mins: 60,
                  text: "Write `pytest` tests that feed those SKUs into `tagging_pipeline.py` and check the expected tags come out.",
                  prompt:
                    "I'm writing pytest tests for tagging_pipeline.py from a table of SKUs and expected tags. Review my first test and explain anything I'd regret later. Don't write the rest for me."
                },
                {
                  id: "REL-06.4",
                  kind: "do",
                  mins: 30,
                  text: "Run the tests in GitHub Actions on every push and pull request."
                },
                {
                  id: "REL-06.5",
                  kind: "read",
                  mins: 45,
                  text: "Read SRE ch. 15 on postmortems, then write a one-page blameless postmortem for a past data incident."
                },
                {
                  id: "REL-06.6",
                  kind: "prove",
                  mins: 15,
                  text: "Show a green test run in CI, and keep your postmortem doc next to it."
                }
              ],
              read: [
                {
                  title: "pytest: Get started",
                  url: "https://docs.pytest.org/en/stable/getting-started.html",
                  focus: "Writing a test, running it, and reading a failure.",
                  mins: 20
                },
                {
                  title: "Google SRE book, ch. 15: Postmortem Culture",
                  url: "https://sre.google/sre-book/postmortem-culture/",
                  focus: "Blameless writing and what makes a postmortem lead to change.",
                  mins: 30
                }
              ],
              exec: {
                ask: [
                  "What's our test coverage on the logic that drives decisions?",
                  "When the tagging rules change, how do we know nothing else broke?",
                  "When did we last write down what we learned from an incident?"
                ],
                decides: "How quickly you can change business rules without breaking reports."
              },
              proof: "Green CI run of the tagging tests, plus one blameless postmortem.",
              explain: "Explain to a planner why tests let you change tagging rules faster, not slower."
            }
          ]
        },

        /* ---------------------------------------------------------- SEC */
        {
          id: "sec",
          code: "SEC",
          title: "Security",
          summary:
            "Keys out of git, the AI on a read-only account, and the database itself deciding who sees which rows.",
          weeks: [
            {
              id: "W07",
              title: "Secrets and least privilege",
              goal:
                "No live keys in any repo, and the text-to-SQL agent connects as a database user that can only read.",
              concepts: ["secrets", "authn-authz", "least-privilege", "service-key"],
              tasks: [
                {
                  id: "SEC-07.1",
                  kind: "do",
                  mins: 45,
                  text: "Scan your repos for exposed keys, including git history: the Supabase service key, the OpenRouter key, anything else. Use GitHub secret scanning or `gitleaks`.",
                  prompt:
                    "Help me check my repos for exposed secrets, including git history. Explain what each finding means and how bad it is before telling me how to fix it."
                },
                {
                  id: "SEC-07.2",
                  kind: "do",
                  mins: 30,
                  text: "Rotate any key that was ever committed, even if you deleted it later. Store the new ones in GitHub Actions secrets and your host's environment settings."
                },
                {
                  id: "SEC-07.3",
                  kind: "learn",
                  mins: 30,
                  text: "Learn authentication vs authorization, and the Supabase anon key vs the service-role key. Write down which of your components uses which, and why.",
                  prompt:
                    "Explain authentication vs authorization, then the Supabase anon key vs the service_role key. Ask me which key each of my components uses, and tell me which answers worry you."
                },
                {
                  id: "SEC-07.4",
                  kind: "do",
                  mins: 60,
                  text: "Create a read-only Postgres role for the text-to-SQL agent (SELECT only, only the tables it needs) and switch the agent to it. An LLM writing SQL should never be able to delete or change data.",
                  prompt:
                    "Teach me how Postgres roles and GRANT work. I'll write the SQL to create a read-only role for my text-to-SQL agent; you check it before I run it."
                },
                {
                  id: "SEC-07.5",
                  kind: "read",
                  mins: 45,
                  text: "Skim all of the OWASP Top 10, then read Broken Access Control and Injection closely."
                },
                {
                  id: "SEC-07.6",
                  kind: "prove",
                  mins: 15,
                  text: "Show the agent's database user getting 'permission denied' on a DELETE and an UPDATE."
                }
              ],
              read: [
                {
                  title: "OWASP Top 10",
                  url: "https://owasp.org/www-project-top-ten/",
                  focus: "Broken Access Control and Injection matter most for your stack.",
                  mins: 45
                },
                {
                  title: "PostgreSQL: GRANT",
                  url: "https://www.postgresql.org/docs/current/sql-grant.html",
                  focus: "Just the examples. You need SELECT, USAGE, and how roles inherit.",
                  mins: 15
                }
              ],
              exec: {
                ask: [
                  "If this key leaked today, what could someone do, and how fast could we rotate it?",
                  "Can the AI change data, or only read it? Show me.",
                  "Who has the master key, and do they need it?"
                ],
                decides:
                  "Your AI risk posture, and what you can credibly tell auditors and leadership."
              },
              proof: "A 'permission denied' on DELETE from the agent's read-only user.",
              explain: "Explain to your CEO why the AI agent has a read-only account."
            },
            {
              id: "W08",
              title: "Row-level security and injection",
              goal:
                "Row-level security is on for all seven tables, and the agent has guardrails against SQL and prompt injection.",
              concepts: ["rls", "sql-injection", "prompt-injection", "least-privilege"],
              tasks: [
                {
                  id: "SEC-08.1",
                  kind: "read",
                  mins: 30,
                  text: "Read Supabase's guide to row-level security."
                },
                {
                  id: "SEC-08.2",
                  kind: "do",
                  mins: 90,
                  text: "Turn on RLS for all seven tables and write a policy for each: who can read, who can write. Then check that the anon key can't read what it shouldn't.",
                  prompt:
                    "I'm enabling row-level security on my seven Supabase tables. For each table, ask me who should read and who should write, then review the policy I write."
                },
                {
                  id: "SEC-08.3",
                  kind: "learn",
                  mins: 30,
                  text: "Learn SQL injection vs prompt injection, and how a user, or text stored in a SKU description, could trick the agent.",
                  prompt:
                    "Show me how prompt injection could reach my text-to-SQL agent, including through data stored in my own tables. Then ask me what defences I'd add before you suggest any."
                },
                {
                  id: "SEC-08.4",
                  kind: "do",
                  mins: 60,
                  text: "Add guardrails to the agent: allow only a single SELECT statement, set a statement timeout and a row limit, and log every SQL statement it generates."
                },
                {
                  id: "SEC-08.5",
                  kind: "prove",
                  mins: 30,
                  text: "Write a one-page security note: data flows, who has which access, and what the agent can and cannot do."
                }
              ],
              read: [
                {
                  title: "Supabase: Row Level Security",
                  url: "https://supabase.com/docs/guides/database/postgres/row-level-security",
                  focus: "Policies, the anon vs authenticated roles, and why service_role bypasses RLS.",
                  mins: 30
                },
                {
                  title: "OWASP: LLM01 Prompt Injection",
                  url: "https://genai.owasp.org/llmrisk/llm01-prompt-injection/",
                  focus: "Direct vs indirect injection. Indirect is the one that reaches you through your own data.",
                  mins: 20
                }
              ],
              exec: {
                ask: [
                  "Which users can see which rows, and is that enforced in the app or in the database?",
                  "What's the worst case if someone types a malicious question?",
                  "Could text inside our own data change what the AI does?"
                ],
                decides: "Whether you can safely open the tool to more users, teams or customers."
              },
              proof: "One-page security note for the control tower.",
              explain: "Explain the difference between 'the app hides it' and 'the database refuses it'."
            }
          ]
        },

        /* ---------------------------------------------------------- SCL */
        {
          id: "scl",
          code: "SCL",
          title: "Scaling",
          summary:
            "Measure where the time and money go, then fix the biggest constraint: indexes, caching, background jobs and caps.",
          weeks: [
            {
              id: "W09",
              title: "Measure before you optimize",
              goal: "Know the p50 and p95 for each hop of the agent, and which hop is the bottleneck.",
              concepts: ["latency-throughput", "percentiles", "bottleneck"],
              tasks: [
                {
                  id: "SCL-09.1",
                  kind: "learn",
                  mins: 30,
                  text: "Learn latency vs throughput, and why the p95 matters more than the average.",
                  prompt:
                    "Explain latency vs throughput and p50 vs p95 using lead time and OTIF as analogies. Then tell me where the analogy breaks."
                },
                {
                  id: "SCL-09.2",
                  kind: "do",
                  mins: 60,
                  text: "Log how long each hop of the agent takes (LLM call, SQL execution, total). Run 20 real planner questions through it."
                },
                {
                  id: "SCL-09.3",
                  kind: "do",
                  mins: 30,
                  text: "Find the five slowest questions and the slowest hop. Is the time going to the LLM or the database?"
                },
                {
                  id: "SCL-09.4",
                  kind: "read",
                  mins: 45,
                  text: "Read the System Design Primer sections on performance vs scalability and latency vs throughput."
                },
                {
                  id: "SCL-09.5",
                  kind: "prove",
                  mins: 15,
                  text: "Build a small table with one row per hop and columns for p50 and p95."
                }
              ],
              read: [
                {
                  title: "The System Design Primer",
                  url: "https://github.com/donnemartin/system-design-primer",
                  focus: "Performance vs scalability, latency vs throughput, availability vs consistency.",
                  mins: 45
                }
              ],
              exec: {
                ask: [
                  "What's the p95, not the average?",
                  "Where does the time actually go?",
                  "Did anyone measure before proposing the fix?"
                ],
                decides: "Where optimization money goes, and where it would be wasted."
              },
              proof: "A latency table: p50 and p95 per hop.",
              explain: "Explain why an average response time can hide an unhappy user."
            },
            {
              id: "W10",
              title: "Indexes and query plans",
              goal:
                "The agent's slowest queries no longer scan whole tables, with before and after numbers to prove it.",
              concepts: ["index", "query-plan", "bottleneck"],
              tasks: [
                {
                  id: "SCL-10.1",
                  kind: "learn",
                  mins: 30,
                  text: "Learn how an index works and how to read `EXPLAIN ANALYZE` output.",
                  prompt:
                    "Explain database indexes using warehouse bin locations, then show me how to read EXPLAIN ANALYZE on one of my real queries. Ask me to spot the slow part before you point it out."
                },
                {
                  id: "SCL-10.2",
                  kind: "do",
                  mins: 45,
                  text: "Run `EXPLAIN ANALYZE` on the five slowest queries from week 9. Mark every Seq Scan on a large table."
                },
                {
                  id: "SCL-10.3",
                  kind: "do",
                  mins: 60,
                  text: "Add indexes on the columns those queries filter and join on. Re-run `EXPLAIN ANALYZE` and compare the plans and timings."
                },
                {
                  id: "SCL-10.4",
                  kind: "learn",
                  mins: 20,
                  text: "Learn the cost of indexes (slower writes, more storage) and when not to add one."
                },
                {
                  id: "SCL-10.5",
                  kind: "prove",
                  mins: 15,
                  text: "Record before and after timings for every query you indexed."
                }
              ],
              read: [
                {
                  title: "PostgreSQL: Using EXPLAIN",
                  url: "https://www.postgresql.org/docs/current/using-explain.html",
                  focus: "Seq Scan vs Index Scan, and estimated vs actual rows.",
                  mins: 30
                },
                {
                  title: "Use The Index, Luke",
                  url: "https://use-the-index-luke.com/",
                  focus: "Chapter 1 on the anatomy of an index. Free and very clear.",
                  mins: 30
                }
              ],
              exec: {
                ask: [
                  "Did we measure before and after?",
                  "Is this a code problem or a data-volume problem?",
                  "What does this change cost on the write side?"
                ],
                decides: "Infrastructure spend vs engineering effort. Often an index beats a bigger server."
              },
              proof: "Before and after timings for each indexed query.",
              explain: "Explain an index to a warehouse manager in two sentences."
            },
            {
              id: "W11",
              title: "Cache the forecasts",
              goal:
                "Forecast results that get requested repeatedly come from a cache, with a clear rule for when they expire.",
              concepts: ["caching", "ttl-invalidation", "latency-throughput"],
              tasks: [
                {
                  id: "SCL-11.1",
                  kind: "learn",
                  mins: 30,
                  text: "Learn caching, cache keys, TTLs and invalidation, and why invalidation is the hard part.",
                  prompt:
                    "Explain caching and cache invalidation for my forecast results. Ask me how stale a forecast can be before it hurts a decision; my answer should drive the design."
                },
                {
                  id: "SCL-11.2",
                  kind: "do",
                  mins: 30,
                  text: "Find which forecast requests repeat. Log requests by their parameters for a few days, or mine your existing logs."
                },
                {
                  id: "SCL-11.3",
                  kind: "do",
                  mins: 75,
                  text: "Cache forecast results keyed by their inputs (SKU, location, horizon, data version) with a TTL. Invalidate the cache when the sync loads new data."
                },
                {
                  id: "SCL-11.4",
                  kind: "do",
                  mins: 30,
                  text: "Measure the cache hit rate and response times before and after."
                },
                {
                  id: "SCL-11.5",
                  kind: "read",
                  mins: 60,
                  text: "Read Designing Data-Intensive Applications, chapter 1: reliable, scalable, maintainable applications."
                },
                {
                  id: "SCL-11.6",
                  kind: "prove",
                  mins: 15,
                  text: "Record the hit rate and the before and after response times."
                }
              ],
              read: [
                {
                  title: "Designing Data-Intensive Applications",
                  url: "https://dataintensive.net/",
                  focus: "Chapter 1 now; keep chapters 2–3 for the weeks after the track.",
                  mins: 60
                }
              ],
              exec: {
                ask: [
                  "How stale can this number be before it hurts a decision?",
                  "What happens to the cache when new data lands?",
                  "What's the hit rate?"
                ],
                decides:
                  "Freshness vs cost. That is a business call, and you're the one qualified to make it."
              },
              proof: "Cache hit rate plus before and after forecast response times.",
              explain: "Explain caching as forward-positioned inventory, including what 'expiry' means."
            },
            {
              id: "W12",
              title: "Background jobs, rate limits and cost",
              goal:
                "Long forecast runs happen in the background, spend has a cap, and you know the unit cost of a question.",
              concepts: ["background-jobs", "rate-limit", "unit-cost"],
              tasks: [
                {
                  id: "SCL-12.1",
                  kind: "learn",
                  mins: 30,
                  text: "Learn synchronous vs background work, queues, and job status.",
                  prompt:
                    "I want to move my long forecast runs into background jobs. Explain the options (a simple jobs table in Supabase vs a queue service) and their trade-offs at my scale before writing any code."
                },
                {
                  id: "SCL-12.2",
                  kind: "do",
                  mins: 90,
                  text: "Move long forecast runs into a background job: the API returns a job ID straight away and the client checks back for the result."
                },
                {
                  id: "SCL-12.3",
                  kind: "do",
                  mins: 45,
                  text: "Add rate limits to the agent endpoint and cap OpenRouter spend, per user and per month."
                },
                {
                  id: "SCL-12.4",
                  kind: "do",
                  mins: 45,
                  text: "Build a one-page cost model: hosting, Supabase, LLM tokens. Show the cost per month and per 1,000 questions.",
                  prompt:
                    "Help me build a cost model for my control tower. Ask me for each input (hosting plan, Supabase tier, average tokens per question, questions per day) and explain what drives each line."
                },
                {
                  id: "SCL-12.5",
                  kind: "prove",
                  mins: 60,
                  text: "Capstone: redraw the architecture diagram, compare it with week 1, and write a one-page 'state of the control tower' memo."
                }
              ],
              read: [
                {
                  title: "The System Design Primer: asynchronism",
                  url: "https://github.com/donnemartin/system-design-primer#asynchronism",
                  focus: "Message queues, task queues and back pressure.",
                  mins: 20
                }
              ],
              exec: {
                ask: [
                  "What's the unit cost per question and per forecast?",
                  "What's the cap if usage spikes, and who gets told?",
                  "Which part of the bill grows fastest with more users?"
                ],
                decides: "Budget, pricing, and how fast you roll out to more users."
              },
              proof: "Capstone memo plus before and after architecture diagrams.",
              explain:
                "In 90 seconds, present the state of the control tower to your leadership team: what it does, what it costs, what could go wrong, and what you've done about it."
            }
          ]
        }
      ]
    },

    /* ------------------------------------------------ PLANNED TRACKS
       Outlines only. When you reach one, ask Claude Code to expand it
       into full weeks in the same shape as the track above. */
    {
      id: "ai-systems",
      title: "AI Systems That Hold Up",
      status: "planned",
      summary:
        "Make the text-to-SQL agent trustworthy enough to hand to other teams: measured accuracy, guardrails, and cost you can explain.",
      outline: [
        { title: "Evals", goal: "A test set of 50 real questions with known-good answers, and an accuracy score you track." },
        { title: "Schema context", goal: "Table and column descriptions that measurably improve the agent's answers." },
        { title: "Observability for LLM calls", goal: "Every question traced: prompt, SQL, tokens, cost, latency." },
        { title: "Model choice", goal: "Compare models on your eval set by accuracy, cost and speed, then choose with data." },
        { title: "Guardrails and fallbacks", goal: "Clarifying questions, refusals, and 'I don't know' when confidence is low." },
        { title: "Human in the loop", goal: "Feedback buttons and a review queue that feed back into the evals." }
      ]
    },
    {
      id: "data-platform",
      title: "Data Platform Fluency",
      status: "planned",
      summary:
        "Turn scripts into a data platform someone else could take over: modeled, tested, scheduled and documented.",
      outline: [
        { title: "Data modeling", goal: "Facts, dimensions and grain for your seven tables." },
        { title: "Transformations as code", goal: "Business logic in version-controlled SQL (dbt or views), not in notebooks." },
        { title: "Data quality and contracts", goal: "Freshness, uniqueness and accepted-value tests that alert." },
        { title: "Orchestration", goal: "Dependencies, schedules and backfills you can rerun safely." },
        { title: "Metrics layer", goal: "One definition of fill rate, forecast accuracy and the rest, used everywhere." },
        { title: "Lineage and documentation", goal: "Anyone can see where a number came from." }
      ]
    },
    {
      id: "tech-leadership",
      title: "Technical Leadership for Executives",
      status: "planned",
      summary:
        "Lead engineers and vendors with judgment rather than jargon. This is where the first two tracks pay off in your primary role.",
      outline: [
        { title: "Reading architecture", goal: "Review a design doc or diagram and ask the three questions that matter." },
        { title: "Build vs buy vs partner", goal: "Total cost of ownership, lock-in and exit cost for one real decision." },
        { title: "Estimates and delivery", goal: "Why estimates slip, and how to scope work into milestones that land." },
        { title: "Risk and due diligence", goal: "A tech due-diligence checklist you could use on a vendor or acquisition." }
      ]
    }
  ]
};
