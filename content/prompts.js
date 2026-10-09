/*
  PROMPT LIBRARY — reusable "teach, don't do" prompts for Claude Code.
  Words in {braces} are blanks to fill in before you paste.
  Add your own: copy a block, give it a new id, and edit.
*/
window.LT = window.LT || {};

window.LT.prompts = [
  {
    group: "Learn it",
    items: [
      {
        id: "explain-then-try",
        title: "Explain, then let me try",
        when: "Before you fix anything yourself.",
        text: "Explain what {concept} means for {file or system}, then let me try the fix first. Only show me your version after I've shown you mine."
      },
      {
        id: "predict-first",
        title: "Predict before you run",
        when: "Running commands you don't fully understand yet.",
        text: "Before you run anything, tell me what the command does and ask me to predict the output. Then run it and explain any gap between my prediction and what happened."
      },
      {
        id: "domain-analogy",
        title: "Map it to supply chain",
        when: "A concept won't stick.",
        text: "Explain {concept} using a supply chain analogy, then tell me exactly where the analogy breaks down."
      },
      {
        id: "quiz-me",
        title: "Quiz me",
        when: "End of a session, to check it stuck.",
        text: "Ask me five questions that check whether I really understand {concept}, from easy to hard. Wait for my answer to each before giving feedback."
      },
      {
        id: "code-tour",
        title: "Guided code tour",
        when: "Opening a repo you haven't touched in a while.",
        text: "Give me a guided tour of this repo: the entry point, the main flows, and where data comes in and goes out. Stop after each step and wait for my questions."
      }
    ]
  },
  {
    group: "Build it",
    items: [
      {
        id: "review-dont-write",
        title: "Review, don't write",
        when: "You're writing the code; Claude is the senior reviewer.",
        text: "I'm going to write {thing}. Review it as I go and point out mistakes and risks, but don't write it for me. Be direct."
      },
      {
        id: "socratic-debug",
        title: "Socratic debugging",
        when: "Something is failing and you want to learn why.",
        text: "This is failing: {error message}. Don't fix it. Ask me questions that lead me to the cause, one at a time."
      },
      {
        id: "silent-failures",
        title: "Find silent failures",
        when: "Before trusting any job or pipeline.",
        text: "List every way {script or job} could fail silently and leave wrong or missing data with no error. Don't fix anything; I'll rank them first."
      },
      {
        id: "smallest-step",
        title: "Smallest next step",
        when: "A task feels too big for the time you have.",
        text: "I have {minutes} minutes. What is the smallest useful step toward {goal} that I can finish and verify in that time? Explain why that step first."
      }
    ]
  },
  {
    group: "Lead with it",
    items: [
      {
        id: "two-audiences",
        title: "Board version, engineer version",
        when: "Preparing to explain something upward or across.",
        text: "Explain {topic} in three sentences for a non-technical executive, then in three sentences for a senior engineer. Point out what the executive version leaves out."
      },
      {
        id: "pushback",
        title: "What would a senior engineer push back on?",
        when: "Before you commit to a technical decision.",
        text: "I'm about to {decision}. What would an experienced engineer push back on? Give me the three strongest objections and what evidence would settle each."
      },
      {
        id: "vendor-check",
        title: "Vendor questions",
        when: "Evaluating a tool, platform or agency.",
        text: "I'm evaluating {vendor or tool} for {use case}. Give me eight questions to ask them on security, reliability, scaling and cost, and what a strong vs weak answer sounds like."
      },
      {
        id: "review-a-proposal",
        title: "Review a proposal from your team",
        when: "Someone brings you a design or an estimate.",
        text: "Here is a proposal from my team: {paste}. Help me understand it well enough to ask three sharp questions. Don't judge it for me; tell me what to look for."
      }
    ]
  },
  {
    group: "Close the loop",
    items: [
      {
        id: "journal-summary",
        title: "Session to journal",
        when: "Last five minutes of a session.",
        text: "Summarize what I learned this session in five bullet points for my learning journal, including one thing I'm still unsure about and one question to ask next time."
      },
      {
        id: "progress-review",
        title: "Weekly progress review",
        when: "Start of each week.",
        text: "Here is my progress export from LearnTech: {paste JSON}. Tell me where I'm behind, which concepts I rated low that matter most for this week, and the one task to start with."
      }
    ]
  }
];

/* Shown on the Prompts page as "Make teaching the default". The same text
   lives in templates/CLAUDE-coach-mode.md so you can copy the file. */
window.LT.coachMode = [
  "## How to work with me (coach mode)",
  "",
  "I'm a data and operations executive learning engineering on this codebase.",
  "My goal is to understand and own it, not just to get it working.",
  "",
  "- Teach before you do. Explain the concept and the plan, then let me try first.",
  "- Before running a command, say what it does and ask me to predict the result.",
  "- When I write code, review it like a senior engineer. Don't rewrite it unless I ask.",
  "- Use supply chain analogies when they help, and say where they break down.",
  "- Never put secrets in code or commits. Point it out if I try.",
  "- Before any code I'm learning from touches a database or a secret, show me the risk first.",
  "- End each session with a five-bullet summary I can paste into my learning journal."
].join("\n");
