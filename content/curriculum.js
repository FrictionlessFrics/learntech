/*
  CURRICULUM: the tracks, areas, weeks, projects and tasks shown on the site.

  How to edit (no coding needed beyond keeping the punctuation intact):
  - Change any text freely.
  - NEVER change an existing task `id` (e.g. "RUN-01.2"). Ticked boxes are saved
    against these ids. Give new tasks a new id instead.
  - `mins` is the time estimate for a task. Week totals add these up.
  - `kind` is one of: "learn", "do", "read", "prove".
  - `project` is the invented build for the week: name, pitch, tools.
  - `prompt` (optional) is a "teach, don't do" prompt to paste into Claude Code.
  - `concepts` lists glossary ids from content/glossary.js.
  - Wrap code-ish words in backticks, e.g. `docker build`, to show them as code.

  Every project is invented for learning. Nothing here assumes the owner has
  a codebase, a database or a team of their own.
*/
window.LT = window.LT || {};

window.LT.curriculum = {
  tracks: [
    {
      id: "foundations",
      title: "Production Foundations",
      status: "active",
      summary:
        "Twelve weeks, twelve invented projects. Each one is a little absurd on purpose, and each one teaches a concept that every real system depends on.",
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
              title: "Ask a ghost a question",
              goal:
                "Build a tiny web server, call it from a browser and a terminal, and draw exactly what happens when someone asks it something.",
              project: {
                name: "The Ghost Fortune Teller",
                pitch:
                  "A tiny web server that answers questions with fortunes from the spirits. The ghosts are unreliable, so the server is honest about failures using proper status codes.",
                tools: ["Python", "Flask", "curl", "browser DevTools"]
              },
              concepts: ["client-server", "http", "status-codes", "api", "json"],
              tasks: [
                {
                  id: "RUN-01.1",
                  kind: "learn",
                  mins: 30,
                  text: "Learn client vs server and how an HTTP request works, using the Ghost Fortune Teller as the example.",
                  prompt:
                    "Explain client vs server and HTTP requests using a fortune-teller web server as the example. Don't write code yet. Then ask me one question to check I understand before we move on."
                },
                {
                  id: "RUN-01.2",
                  kind: "do",
                  mins: 60,
                  text: "Write the Ghost Fortune Teller yourself: one GET /fortune route that reads a query parameter called q and returns a JSON object with one field called fortune.",
                  prompt:
                    "I'm writing a tiny Flask server called the Ghost Fortune Teller, with one route, GET /fortune, that reads a query parameter q and returns JSON. Review each line I write and ask me what it does. Don't write it for me."
                },
                {
                  id: "RUN-01.3",
                  kind: "do",
                  mins: 30,
                  text: "Call it from the browser and from curl. In browser DevTools, open the Network tab and find the request. Note the method, URL, status code and the JSON that came back."
                },
                {
                  id: "RUN-01.4",
                  kind: "do",
                  mins: 30,
                  text: "Break it on purpose: send no question (expect 400), ask for a ghost that doesn't exist (expect 404), then make the code crash (expect 500). Write down each status code and what caused it.",
                  prompt:
                    "Before each test I run on my fortune teller, ask me to predict the status code. After each one, explain any difference between my prediction and the real result."
                },
                {
                  id: "RUN-01.5",
                  kind: "prove",
                  mins: 30,
                  text: "Draw the request flow on one page: browser, then your server, then the ghost's list of fortunes. Mark where each box runs. A photo of a whiteboard or a Mermaid diagram both count."
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
                  focus: "Learn the five families, and 200, 201, 400, 401, 403, 404, 429, 500, 503.",
                  mins: 10
                }
              ],
              exec: {
                ask: [
                  "If another team changes a status code from 200 to 201 tomorrow, what breaks downstream?",
                  "Which outside APIs do we depend on that nobody on the team has ever called directly?",
                  "Where does each piece run, and who pays for each hop?"
                ],
                decides:
                  "Vendor and integration risk. You'll know what breaks when another team's API changes."
              },
              proof: "A request-flow diagram of the Ghost Fortune Teller, plus a log of the 400, 404 and 500 tests.",
              explain:
                "In 60 seconds, explain what happens between someone typing a question and seeing the answer, and why status codes matter to the people downstream."
            },
            {
              id: "W02",
              title: "One ghost, two personalities",
              goal:
                "Run the same fortune teller as a dev copy and a prod copy, with every setting moved out of the code and into the environment.",
              project: {
                name: "The Two-Headed Ghost",
                pitch:
                  "One fortune teller, two personalities. A dev ghost on port 5000 and a prod ghost on port 5001 run the same code and differ only in their settings.",
                tools: ["Python", "environment variables", ".env file", "a Twelve-Factor scorecard"]
              },
              concepts: ["process-port", "env-vars", "twelve-factor"],
              tasks: [
                {
                  id: "RUN-02.1",
                  kind: "read",
                  mins: 45,
                  text: "Read the Twelve-Factor App, factors I to VI: codebase, dependencies, config, backing services, build/release/run, processes."
                },
                {
                  id: "RUN-02.2",
                  kind: "do",
                  mins: 45,
                  text: "Run the Ghost Fortune Teller on port 5000. Then run a second copy on port 5001 by setting an environment variable. Don't edit the code to change the port.",
                  prompt:
                    "Walk me through running my fortune teller on two ports. Before each command, tell me what it will do and ask me to predict the output. Don't run anything I haven't predicted."
                },
                {
                  id: "RUN-02.3",
                  kind: "do",
                  mins: 60,
                  text: "Move every setting out of the code: the port, the ghost's secret passphrase and the debug flag. Read them from environment variables, and add a .env.example file that lists the names but no values.",
                  prompt:
                    "Help me find every hardcoded setting or secret in my fortune teller. List them in a table with name, line and whether it's a secret. Don't change anything. I'll move them myself and you'll review."
                },
                {
                  id: "RUN-02.4",
                  kind: "read",
                  mins: 30,
                  text: "Read the Twelve-Factor App, factors VII to XII: port binding, concurrency, disposability, dev/prod parity, logs, admin processes."
                },
                {
                  id: "RUN-02.5",
                  kind: "prove",
                  mins: 30,
                  text: "Score the fortune teller against all twelve factors: pass, partial or fail, with one line of reasoning each. Save the scorecard and the .env.example in the project folder."
                }
              ],
              read: [
                {
                  title: "The Twelve-Factor App",
                  url: "https://12factor.net/",
                  focus: "Read it as a checklist for your own app, not as theory.",
                  mins: 75
                }
              ],
              exec: {
                ask: [
                  "If we had to move this to another cloud provider tomorrow, what would break?",
                  "Where do the secrets live, and who can see them?",
                  "Is production running the same software we tested?"
                ],
                decides: "Portability and vendor lock-in for anything your team builds or buys."
              },
              proof: "A twelve-factor scorecard for the fortune teller, plus its .env.example.",
              explain:
                "Explain why a password should never live inside the code. Use the ghost's passphrase as the example."
            },
            {
              id: "W03",
              title: "Ship the ghost in a crate",
              goal:
                "Package the fortune teller in a Docker container and deploy it, so anyone on the internet can ask it a question.",
              project: {
                name: "Ghost in a Shipping Container",
                pitch:
                  "Pack the fortune teller into a container and deploy it to a public URL, so strangers can ask the ghost questions from their phones.",
                tools: ["Docker", "Render or Railway", "curl"]
              },
              concepts: ["container", "deployment", "env-vars", "health-check"],
              tasks: [
                {
                  id: "RUN-03.1",
                  kind: "learn",
                  mins: 30,
                  text: "Learn what a container is, how it differs from a virtual machine, and the difference between an image and a container.",
                  prompt:
                    "Explain Docker images and containers with a shipping container analogy. Then map each concept onto my fortune teller. Don't write the Dockerfile yet."
                },
                {
                  id: "RUN-03.2",
                  kind: "do",
                  mins: 60,
                  text: "Write the Dockerfile for the fortune teller yourself, line by line. Claude reviews; you type.",
                  prompt:
                    "I'm going to write a Dockerfile for my fortune teller one line at a time. After each line, tell me what's wrong or missing. Don't write it for me."
                },
                {
                  id: "RUN-03.3",
                  kind: "do",
                  mins: 45,
                  text: "Build and run it locally with docker build, then docker run with a port mapping of 5000:5000. Call it with curl."
                },
                {
                  id: "RUN-03.4",
                  kind: "do",
                  mins: 60,
                  text: "Add a /health route that returns 200 and the word alive. Deploy to Render or Railway, and set the environment variables in their dashboard, never in your files.",
                  prompt:
                    "I'm deploying my containerised fortune teller to Render. Give me a checklist of what to configure and why, then let me do each step and tell you what I see."
                },
                {
                  id: "RUN-03.5",
                  kind: "prove",
                  mins: 15,
                  text: "Record the live URL and keep the Dockerfile in the project folder. Ask a friend to ask the ghost a question."
                }
              ],
              read: [
                {
                  title: "Docker: Get started",
                  url: "https://docs.docker.com/get-started/",
                  focus: "Images, containers and the Dockerfile basics. Skip Compose for now.",
                  mins: 40
                },
                {
                  title: "Render: Docker on Render",
                  url: "https://render.com/docs/docker",
                  focus: "How the platform builds and runs your image, and where environment variables go.",
                  mins: 15
                }
              ],
              exec: {
                ask: [
                  "What does this cost per month to run, and what does it cost at ten times the traffic?",
                  "How long from merged code to live, and who can press the button?",
                  "If the host has an outage, how quickly can we move?"
                ],
                decides: "Hosting choice, and whether infrastructure is something you build or buy."
              },
              proof: "A live URL for the fortune teller, running from your own Dockerfile.",
              explain:
                "Explain 'deploying' to a peer executive, and why containers made it cheaper and safer."
            }
          ]
        },

        /* ---------------------------------------------------------- REL */
        {
          id: "rel",
          code: "REL",
          title: "Reliability",
          summary:
            "Jobs that fail loudly, can safely run twice, and come with tests that prove they still work.",
          weeks: [
            {
              id: "W04",
              title: "Count the gold without lying",
              goal:
                "Make a nightly treasure counter log every run, turn red on bad data, and alert you the same night.",
              project: {
                name: "The Pirate Treasure Counter",
                pitch:
                  "A script that reads a CSV of treasure chests every night, totals the gold and writes a report. It must scream when the data is bad, and it can run on a schedule later.",
                tools: ["Python", "a Discord or Slack webhook (optional)", "GitHub Actions (optional stretch)"]
              },
              concepts: ["logging", "error-handling", "exit-code", "monitoring-alerts"],
              tasks: [
                {
                  id: "REL-04.1",
                  kind: "learn",
                  mins: 30,
                  text: "List every way the treasure counter can fail silently, producing a wrong total with no error. Rank them by how much gold you'd lose.",
                  prompt:
                    "Read my treasure counter script. List every way it could fail silently and produce a wrong total with no error. Don't fix anything yet. I'll rank them first."
                },
                {
                  id: "REL-04.2",
                  kind: "do",
                  mins: 60,
                  text: "Add logging: start time, chests read, gold total, duration and final status. Then read the log as if you were a sleepy captain at 6am. Is it enough?",
                  prompt:
                    "Explain what good logging looks like for a nightly batch job. Then I'll add log lines to my script, and you review whether they'd help me debug a failed run at 6am."
                },
                {
                  id: "REL-04.3",
                  kind: "do",
                  mins: 45,
                  text: "Make bad data exit with a non-zero code. Check it in the terminal with echo $?: it should print 1 for bad data and 0 for good data."
                },
                {
                  id: "REL-04.4",
                  kind: "do",
                  mins: 45,
                  text: "Alert yourself on failure. Post to a Discord or Slack webhook, or print the alert to the terminal if you'd rather skip the account."
                },
                {
                  id: "REL-04.5",
                  kind: "prove",
                  mins: 15,
                  text: "Capture one deliberately failed run that alerted you, and the log line that explains why it failed."
                }
              ],
              read: [
                {
                  title: "Google SRE book, ch. 6: Monitoring Distributed Systems",
                  url: "https://sre.google/sre-book/monitoring-distributed-systems/",
                  focus: "The four golden signals, and the difference between a symptom and a cause.",
                  mins: 45
                }
              ],
              exec: {
                ask: [
                  "How would we know if yesterday's report silently came out wrong?",
                  "Who gets alerted, and what is the first thing they do?",
                  "Which dashboards would be quietly wrong right now if this job had failed?"
                ],
                decides: "How much you can trust the numbers on any given morning."
              },
              proof: "A deliberately failed run, the exit code it returned, and the log line that explains it.",
              explain:
                "Explain why a job that fails loudly is better than one that 'usually works'. Use the pirate ship as the example."
            },
            {
              id: "W05",
              title: "Sneezing weather and double counting",
              goal:
                "Build an importer that survives a flaky weather API and can run twice without doubling anything.",
              project: {
                name: "The Storm Oracle Importer",
                pitch:
                  "Imports a forecast for every treasure island from the Storm Oracle, an API that sneezes out 503 errors about a third of the time. The importer must survive the sneezes and never double count.",
                tools: ["Python", "requests", "SQLite", "a fake flaky API you write yourself"]
              },
              concepts: ["idempotency", "upsert", "retries-backoff", "transient-error"],
              tasks: [
                {
                  id: "REL-05.1",
                  kind: "learn",
                  mins: 30,
                  text: "Learn what idempotency means for the importer. Then attempt the fix yourself before you see one.",
                  prompt:
                    "Explain idempotency using a pirate who posts the same treasure map twice. Then let me try making my importer idempotent before you show me anything."
                },
                {
                  id: "REL-05.2",
                  kind: "do",
                  mins: 45,
                  text: "Write a fake Storm Oracle server that returns a 503 about a third of the time. Run the importer twice on a test SQLite file. Count the rows before and after, and write down what happened."
                },
                {
                  id: "REL-05.3",
                  kind: "do",
                  mins: 60,
                  text: "Make the writes idempotent: upsert on island_id and date, so a second run updates rows instead of adding them."
                },
                {
                  id: "REL-05.4",
                  kind: "do",
                  mins: 45,
                  text: "Add retries with exponential backoff (1s, 2s, 4s) for 503s and timeouts. Fail fast on 401 and 400.",
                  prompt:
                    "Which errors from the Storm Oracle are worth retrying and which should stop the importer immediately? Quiz me on five example errors before you explain the rule."
                },
                {
                  id: "REL-05.5",
                  kind: "prove",
                  mins: 15,
                  text: "Run the importer three times in a row against the sneezing oracle and show the row count is identical each time."
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
                  "If this job runs twice by accident, what happens to the totals?",
                  "Which errors do we retry, and which do we stop on?",
                  "Could a retry have double counted anything in a report we already sent?"
                ],
                decides: "The integrity guarantees you can give to anyone planning from the numbers."
              },
              proof: "Three consecutive importer runs with identical row counts, plus the run log of the sneezing oracle.",
              explain:
                "Explain idempotency using a purchase order that was accidentally sent twice."
            },
            {
              id: "W06",
              title: "The robot chef's measuring spoon",
              goal:
                "Test a recipe scaler properly, run the tests on every push, then break it on purpose and write up the damage.",
              project: {
                name: "The Robot Chef's Recipe Scaler",
                pitch:
                  "A function that scales any recipe from 1 to 1,000 guests, converting cups, grams and dragon pepper pinches. Its tests catch mistakes, and then you break it on purpose.",
                tools: ["Python", "pytest"]
              },
              concepts: ["unit-test", "integration-test", "ci", "postmortem"],
              tasks: [
                {
                  id: "REL-06.1",
                  kind: "learn",
                  mins: 30,
                  text: "Learn unit tests vs integration tests, and decide which parts of the recipe scaler need which.",
                  prompt:
                    "Explain unit vs integration tests using my recipe scaler. Ask me which five recipes would make the best test cases before you suggest any."
                },
                {
                  id: "REL-06.2",
                  kind: "do",
                  mins: 45,
                  text: "Pick ten recipes, including edge cases: 0 guests, 1/3 cup, 1,000 guests, and a line that says 'salt to taste'. Write the expected output by hand. Your cooking knowledge is the spec."
                },
                {
                  id: "REL-06.3",
                  kind: "do",
                  mins: 60,
                  text: "Write pytest tests that feed those recipes into scale_recipe() and check the expected output.",
                  prompt:
                    "I'm writing pytest tests for a recipe scaling function from a table of recipes and expected output. Review my first test and explain anything I'd regret later. Don't write the rest for me."
                },
                {
                  id: "REL-06.4",
                  kind: "do",
                  mins: 30,
                  text: "Run the tests automatically on every change. Stretch: add GitHub Actions (needs a GitHub account, so ask first). Otherwise run pytest by hand before each change."
                },
                {
                  id: "REL-06.5",
                  kind: "read",
                  mins: 45,
                  text: "Read SRE ch. 15 on postmortem culture. Then break the scaler on purpose by multiplying the salt by ten, and write a one-page blameless postmortem for the disaster."
                },
                {
                  id: "REL-06.6",
                  kind: "prove",
                  mins: 15,
                  text: "Show a passing pytest run and a failing one, and keep the postmortem next to them."
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
                  focus: "Blameless writing, and what makes a postmortem lead to change.",
                  mins: 30
                }
              ],
              exec: {
                ask: [
                  "What share of our decision logic is covered by tests?",
                  "When the rules change, how do we know nothing else broke?",
                  "When did we last write down what we learned from a failure?"
                ],
                decides: "How quickly you can change business rules without breaking reports."
              },
              proof: "A passing pytest run and a failing one, plus one blameless postmortem for the salt disaster.",
              explain:
                "Explain to a planner why tests let you change rules faster, not slower."
            }
          ]
        },

        /* ---------------------------------------------------------- SEC */
        {
          id: "sec",
          code: "SEC",
          title: "Security",
          summary:
            "Keys kept out of git, a read-only account for anything that doesn't need to write, and a database that decides who sees which rows.",
          weeks: [
            {
              id: "W07",
              title: "Guard the dragon's hoard",
              goal:
                "Leak a fake key on purpose, find it, rotate it, then give a goblin script read-only access to a database.",
              project: {
                name: "The Dragon's Hoard",
                pitch:
                  "A Postgres database of dragon treasure, a goblin intern script that should only ever read it, and a throwaway folder with a fake secret key you'll commit by accident, find and lock down.",
                tools: ["Docker", "Postgres", "gitleaks", "psql"]
              },
              concepts: ["secrets", "authn-authz", "least-privilege", "service-key"],
              tasks: [
                {
                  id: "SEC-07.1",
                  kind: "do",
                  mins: 45,
                  text: "In a throwaway folder, run git init and commit a fake API key by accident. Scan the history with gitleaks, and read the finding.",
                  prompt:
                    "Help me scan a throwaway folder for leaked secrets, including its git history. Explain each finding and how bad it is before telling me how to fix it."
                },
                {
                  id: "SEC-07.2",
                  kind: "do",
                  mins: 30,
                  text: "Rotate the key: revoke it, create a new one and store that in an environment variable. Then explain why deleting the commit doesn't make the old key safe again."
                },
                {
                  id: "SEC-07.3",
                  kind: "learn",
                  mins: 30,
                  text: "Learn authentication vs authorization using a castle. The guard checks your face; the key ring decides which doors open.",
                  prompt:
                    "Explain authentication vs authorization using a castle with a guard and a key ring. Then give me five scenarios and ask me to say which one is which before you confirm."
                },
                {
                  id: "SEC-07.4",
                  kind: "do",
                  mins: 60,
                  text: "Run Postgres in Docker. Create a hoard database with a treasure table. Create a role called goblin_reader that can SELECT and nothing else. Connect as the goblin and try a DELETE. Expect permission denied.",
                  prompt:
                    "Teach me how Postgres roles and GRANT work before I write any SQL. Then I'll write the commands for a read-only goblin role, and you check them before I run them."
                },
                {
                  id: "SEC-07.5",
                  kind: "read",
                  mins: 45,
                  text: "Skim the OWASP Top 10, then read Broken Access Control and Injection closely."
                },
                {
                  id: "SEC-07.6",
                  kind: "prove",
                  mins: 15,
                  text: "Capture the goblin getting permission denied on a DELETE and on an UPDATE."
                }
              ],
              read: [
                {
                  title: "OWASP Top 10",
                  url: "https://owasp.org/www-project-top-ten/",
                  focus: "Broken Access Control and Injection matter most for everything in this track.",
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
                  "If this key leaked today, what could someone do with it, and how fast could we rotate it?",
                  "Can our scripts and AI tools change data, or only read it? Show me.",
                  "Who holds the master key, and do they really need it?"
                ],
                decides:
                  "Your automation and AI risk posture, and what you can credibly tell auditors and leadership."
              },
              proof: "A screenshot of permission denied on the goblin's DELETE.",
              explain:
                "Explain to a CEO why a script that only reads reports should have a read-only account."
            },
            {
              id: "W08",
              title: "Members see only their own gold",
              goal:
                "Use row-level security so each member sees only their rows, then break a guestbook with SQL injection and trick a summariser with prompt injection.",
              project: {
                name: "The Dragon Club",
                pitch:
                  "A members-only Supabase club where each dragon sees only their own gold. You'll also attack a deliberately broken Tavern Guestbook with SQL injection, and trick a Review Summariser with prompt injection.",
                tools: ["Supabase", "Flask", "any LLM you have access to"]
              },
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
                  mins: 75,
                  text: "Create a Supabase project with a gold table (member_id, amount). Turn on row-level security and write policies so each dragon sees only its own rows. Test with two test users.",
                  prompt:
                    "I'm turning on row-level security for a gold table in Supabase, so each dragon only sees its own rows. Ask me who should read and who should write before you review the policy I write."
                },
                {
                  id: "SEC-08.3",
                  kind: "learn",
                  mins: 30,
                  text: "Learn SQL injection vs prompt injection. Work out how a guestbook entry, or a review, could change what the system does.",
                  prompt:
                    "Show me how a guestbook entry could change a SQL query, and how a review could change what an LLM summariser does. Don't show the fixes yet. Ask me to suggest one for each first."
                },
                {
                  id: "SEC-08.4",
                  kind: "do",
                  mins: 60,
                  text: "Build the Tavern Guestbook: a small Flask app that builds SQL by pasting in text, running only on your laptop. Inject a query that returns every row. Then fix it with parameterised queries and prove the attack no longer works."
                },
                {
                  id: "SEC-08.5",
                  kind: "do",
                  mins: 60,
                  text: "Build a Review Summariser that sends review text to an LLM. Plant an instruction in one review to make it change its output. Then add defences: treat review text as data, give the model no tools, and check its output before showing it.",
                  prompt:
                    "I'm building a review summariser that sends user reviews to an LLM. Tell me which of my defences would actually stop a planted instruction, and which only look like they would."
                },
                {
                  id: "SEC-08.6",
                  kind: "prove",
                  mins: 30,
                  text: "Write a one-page security note: where the data flows, who has access to what, and what each part can and can't do. Attach the RLS test output."
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
                  focus: "Direct vs indirect injection. Indirect is the one that arrives through data you didn't write.",
                  mins: 20
                }
              ],
              exec: {
                ask: [
                  "Which users can see which rows, and is that enforced in the app or in the database?",
                  "What's the worst case if someone types a malicious question or review?",
                  "Could text inside our own data change what our AI does?"
                ],
                decides:
                  "Whether you can safely open a tool to more users, teams or customers."
              },
              proof: "The one-page security note, plus RLS test output showing each dragon sees only its own gold.",
              explain:
                "Explain the difference between 'the app hides it' and 'the database refuses it', using the dragons' gold as the example."
            }
          ]
        },

        /* ---------------------------------------------------------- SCL */
        {
          id: "scl",
          code: "SCL",
          title: "Scaling",
          summary:
            "Measure where the time and money go, then fix the biggest constraint: indexes, caching, background jobs and limits.",
          weeks: [
            {
              id: "W09",
              title: "Why the owls are always late",
              goal:
                "Build a slow mail service, load test it, and prove which step is the bottleneck using percentiles, not averages.",
              project: {
                name: "The Dragon Post Office",
                pitch:
                  "A mail service with three steps: check, sort, deliver. The owl sorter sometimes naps for two seconds. You'll build it, load test it, and find which step holds everyone up.",
                tools: ["Python", "a load script with threads", "timing decorators"]
              },
              concepts: ["latency-throughput", "percentiles", "bottleneck"],
              tasks: [
                {
                  id: "SCL-09.1",
                  kind: "learn",
                  mins: 30,
                  text: "Learn latency vs throughput, and why the p95 matters more than the average.",
                  prompt:
                    "Explain latency vs throughput and p50 vs p95 using a post office queue as the analogy. Then tell me where the analogy breaks."
                },
                {
                  id: "SCL-09.2",
                  kind: "do",
                  mins: 60,
                  text: "Build the Dragon Post Office with three steps. Make the sorter sleep for a random 50ms to 2 seconds about 10% of the time. Log how long each step takes."
                },
                {
                  id: "SCL-09.3",
                  kind: "do",
                  mins: 45,
                  text: "Write a load script that sends 200 letters with 10 at a time, using Python threads. Record how long each one takes."
                },
                {
                  id: "SCL-09.4",
                  kind: "do",
                  mins: 30,
                  text: "Calculate p50 and p95 for each step and for the whole service. Which step is the bottleneck? Is it really the sorter?"
                },
                {
                  id: "SCL-09.5",
                  kind: "read",
                  mins: 45,
                  text: "Read the System Design Primer sections on performance vs scalability, and latency vs throughput."
                },
                {
                  id: "SCL-09.6",
                  kind: "prove",
                  mins: 15,
                  text: "Build a small table with one row per step and columns for p50 and p95."
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
                  "What's the p95, not just the average?",
                  "Where does the time actually go?",
                  "Did anyone measure before proposing the fix?"
                ],
                decides: "Where optimisation money goes, and where it would be wasted."
              },
              proof: "A latency table with p50 and p95 for each step.",
              explain:
                "Explain why an average response time can hide an unhappy customer. Use the owl sorter as the example."
            },
            {
              id: "W10",
              title: "Find the gold in a million manifests",
              goal:
                "Make a slow query over a million rows fast, with an index, and show the before and after plans.",
              project: {
                name: "The Pirate Manifest",
                pitch:
                  "A database with one million cargo rows from every ship that ever sailed. Finding all the gold from Skull Island takes ages, until you make it fast.",
                tools: ["SQLite or Postgres", "EXPLAIN", "a data generator script"]
              },
              concepts: ["index", "query-plan", "bottleneck"],
              tasks: [
                {
                  id: "SCL-10.1",
                  kind: "learn",
                  mins: 30,
                  text: "Learn how an index works, and how to read a query plan.",
                  prompt:
                    "Explain database indexes using warehouse bin locations. Then show me how to read a query plan, and ask me to spot the slow part before you point it out."
                },
                {
                  id: "SCL-10.2",
                  kind: "do",
                  mins: 45,
                  text: "Write a script that generates one million manifest rows: ship, island, cargo type, coins and date. Run the query 'gold coins from Skull Island over 100 coins' and time it."
                },
                {
                  id: "SCL-10.3",
                  kind: "do",
                  mins: 30,
                  text: "Run EXPLAIN on that query. Mark every full table scan. Write down how many rows the database read to return the answer."
                },
                {
                  id: "SCL-10.4",
                  kind: "do",
                  mins: 45,
                  text: "Add an index on the columns the query filters on. Run EXPLAIN again and compare the plans and timings."
                },
                {
                  id: "SCL-10.5",
                  kind: "learn",
                  mins: 20,
                  text: "Learn the cost of indexes: slower writes and more storage. Name one column that you should never index."
                },
                {
                  id: "SCL-10.6",
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
                  focus: "Chapter 1, on the anatomy of an index. Free and very clear.",
                  mins: 30
                }
              ],
              exec: {
                ask: [
                  "Did we measure before and after?",
                  "Is this a code problem or a data-volume problem?",
                  "What does this index cost us on writes?"
                ],
                decides: "Infrastructure spend vs engineering time. An index often beats a bigger server."
              },
              proof: "Before and after timings and query plans for each indexed query.",
              explain: "Explain an index to a pirate captain in two sentences."
            },
            {
              id: "W11",
              title: "Keep the crystal ball warm",
              goal:
                "Cache the fortune teller's answers, choose how long they stay fresh, and clear them when the data underneath changes.",
              project: {
                name: "The Crystal Ball Cache",
                pitch:
                  "The Week 1 fortune teller now asks the spirits, and each answer takes two seconds. You'll cache answers, decide how long they stay fresh, and clear them when the moon changes.",
                tools: ["Python", "a dictionary cache, or Redis if you want to go further", "the Week 9 load script"]
              },
              concepts: ["caching", "ttl-invalidation", "latency-throughput"],
              tasks: [
                {
                  id: "SCL-11.1",
                  kind: "learn",
                  mins: 30,
                  text: "Learn caching, time to live (TTL) and invalidation, and why invalidation is the hard part.",
                  prompt:
                    "Explain caching and cache invalidation for my fortune teller. Ask me how stale a fortune can be before it hurts someone's decision. My answer should drive the design."
                },
                {
                  id: "SCL-11.2",
                  kind: "do",
                  mins: 30,
                  text: "Add a two-second 'spirit lookup' to the fortune teller. Log every question and count which ones repeat."
                },
                {
                  id: "SCL-11.3",
                  kind: "do",
                  mins: 75,
                  text: "Cache fortunes keyed by question and ghost name, with a TTL of 60 seconds. Clear the whole cache whenever a moon_phase.txt file changes."
                },
                {
                  id: "SCL-11.4",
                  kind: "do",
                  mins: 30,
                  text: "Run the Week 9 load script before and after caching. Record the hit rate and the response times."
                },
                {
                  id: "SCL-11.5",
                  kind: "read",
                  mins: 60,
                  text: "Read Designing Data-Intensive Applications, chapter 1: reliable, scalable and maintainable applications."
                },
                {
                  id: "SCL-11.6",
                  kind: "prove",
                  mins: 15,
                  text: "Record the hit rate and the before and after response times on one page."
                }
              ],
              read: [
                {
                  title: "Designing Data-Intensive Applications",
                  url: "https://dataintensive.net/",
                  focus: "Chapter 1 now. Keep chapters 2 and 3 for after the track.",
                  mins: 60
                }
              ],
              exec: {
                ask: [
                  "How stale can this number be before it hurts a decision?",
                  "What clears the cache when the underlying data changes?",
                  "What's the hit rate, and what does a miss cost us?"
                ],
                decides:
                  "Freshness vs cost. That's a business call, and it belongs to the people who own the decision."
              },
              proof: "A one-page note with the hit rate and before and after response times.",
              explain:
                "Explain caching as keeping the last answer warm, including what 'expiry' means and why it exists."
            },
            {
              id: "W12",
              title: "Render the galaxy without waiting",
              goal:
                "Move a 90-second job into the background, rate limit it, work out what each map costs, and write the state of the kingdom.",
              project: {
                name: "The Galaxy Map Generator",
                pitch:
                  "Renders a map of the galaxy, and each render takes 90 seconds. You'll move the render into a background job, rate limit it so one user can't hog the render farm, and work out what each map costs.",
                tools: ["Python", "a jobs table or simple queue", "a spreadsheet for the cost model"]
              },
              concepts: ["background-jobs", "rate-limit", "unit-cost"],
              tasks: [
                {
                  id: "SCL-12.1",
                  kind: "learn",
                  mins: 30,
                  text: "Learn the difference between synchronous and background work, and what a queue and a job status do.",
                  prompt:
                    "I want to move my galaxy map renders into background jobs. Explain the options, a simple jobs table vs a proper queue, and their trade-offs at my scale, before writing any code."
                },
                {
                  id: "SCL-12.2",
                  kind: "do",
                  mins: 90,
                  text: "Add a fake 90-second render. POST /maps returns a job ID straight away, and GET /jobs/{id} returns the status and, once finished, the map."
                },
                {
                  id: "SCL-12.3",
                  kind: "do",
                  mins: 45,
                  text: "Rate limit: allow each user 10 maps per hour. The 11th request gets a 429 with a clear message about when to try again."
                },
                {
                  id: "SCL-12.4",
                  kind: "do",
                  mins: 45,
                  text: "Build a one-page cost model: compute and storage per map, then the price you'd charge. Show the cost per map and per 1,000 maps.",
                  prompt:
                    "Help me build a cost model for the galaxy map service. Ask me for each input, such as compute seconds per map, storage per map and maps per day, and explain what drives each line."
                },
                {
                  id: "SCL-12.5",
                  kind: "prove",
                  mins: 60,
                  text: "Capstone: redraw the architecture diagram from Week 1, compare it with this one, and write a one-page memo called State of the Dragon Kingdom."
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
                  "What's the unit cost per map?",
                  "What's the cap if usage spikes, and who gets told?",
                  "Which part of the cost grows fastest as more users join?"
                ],
                decides: "Budget, pricing, and how fast you can roll out to more users."
              },
              proof: "The State of the Dragon Kingdom memo, plus the before and after architecture diagrams.",
              explain:
                "In 90 seconds, present the state of the Dragon Kingdom to leadership: what it does, what it costs, what could go wrong, and what you've done about it."
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
        "Make an LLM feature trustworthy enough to hand to other teams: measured accuracy, guardrails, and cost you can explain.",
      outline: [
        { title: "Evals", goal: "A test set of 50 questions with known-good answers, and an accuracy score you track over time." },
        { title: "Context design", goal: "Descriptions and examples that measurably improve the model's answers, tested against your evals." },
        { title: "Observability for LLM calls", goal: "Every call traced: prompt, output, tokens, cost and latency." },
        { title: "Model choice", goal: "Compare models on your eval set by accuracy, cost and speed, then choose with data." },
        { title: "Guardrails and fallbacks", goal: "Clarifying questions, refusals and 'I don't know' when confidence is low." },
        { title: "Human in the loop", goal: "Feedback buttons and a review queue that feed back into the evals." }
      ]
    },
    {
      id: "data-platform",
      title: "Data Platform Fluency",
      status: "planned",
      summary:
        "Turn one-off scripts into a data platform someone else could take over: modelled, tested, scheduled and documented.",
      outline: [
        { title: "Data modelling", goal: "Facts, dimensions and grain, using a made-up bakery chain's sales data." },
        { title: "Transformations as code", goal: "Business logic in version-controlled SQL, not in notebooks." },
        { title: "Data quality and contracts", goal: "Freshness, uniqueness and accepted-value tests that alert when they fail." },
        { title: "Orchestration", goal: "Dependencies, schedules and backfills you can safely rerun." },
        { title: "Metrics layer", goal: "One definition of each metric, used everywhere it appears." },
        { title: "Lineage and documentation", goal: "Anyone can trace where a number came from." }
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
        { title: "Build vs buy vs partner", goal: "Total cost of ownership, lock-in and exit cost for one realistic decision." },
        { title: "Estimates and delivery", goal: "Why estimates slip, and how to scope work into milestones that land." },
        { title: "Risk and due diligence", goal: "A tech due-diligence checklist you could use on a vendor or an acquisition." }
      ]
    }
  ]
};
