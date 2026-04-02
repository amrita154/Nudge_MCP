// ─────────────────────────────────────────────────────────────────────────────
// NUDGE MCP — Seed data extracted from career_agent.html
// Imported when user chooses "import career agent goals" during onboarding
// ─────────────────────────────────────────────────────────────────────────────

export interface SeedGoal {
  title: string;
  description: string;
  category: string;
  total_phases: number;
  sort_order: number;
}

export interface SeedPhase {
  goal_index: number;  // 0-based index into SEED_GOALS
  phase_number: number;
  title: string;
  description: string;
  timeline: string;
  concepts: string[];
  projects: string[];
  interview_prep: string[];
  resources: Array<{ title: string; url: string; time: string; type: string; note: string }>;
  milestones: string[];
}

// ── 10 Goals from career_agent.html ──────────────────────────────────────────
export const SEED_GOALS: SeedGoal[] = [
  {
    title: "AI Application Engineering → Applied ML Engineering",
    description: "Primary career track: AI Application Engineering now, progressing to Applied ML Engineering on the job (Phase 5). 6-phase roadmap over 12–18 months.",
    category: "career",
    total_phases: 6,
    sort_order: 1,
  },
  {
    title: "Ship 6 side projects",
    description: "Travel Planner → Second Brain → Slack Bot → Meeting Intel → Dev Observability → Email Agent (MCP). Each project tied to a career phase.",
    category: "projects",
    total_phases: 6,
    sort_order: 2,
  },
  {
    title: "Agentic AI deep-dive",
    description: "OpenClaw plugin for ClawHub, LangGraph, CrewAI, agent security + prompt injection write-up. Highest-demand niche in India and international differentiator.",
    category: "learning",
    total_phases: 1,
    sort_order: 3,
  },
  {
    title: "DSA + Interview Prep",
    description: "Neetcode 150 + AI system design patterns + behavioral STAR interview prep. Consistent 30min/day, 4x/week.",
    category: "career",
    total_phases: 1,
    sort_order: 4,
  },
  {
    title: "Deep concept learning",
    description: "Understand every mechanism, not just APIs. Test same day. Never just watch — always build alongside.",
    category: "learning",
    total_phases: 1,
    sort_order: 5,
  },
  {
    title: "India job switch",
    description: "Sarvam AI, Krutrim, Juspay, Razorpay, CRED or Series A AI startup. Target: week 14–18 of roadmap.",
    category: "career",
    total_phases: 1,
    sort_order: 6,
  },
  {
    title: "International relocation",
    description: "Netherlands (HSM visa) → Singapore (EP) → Canada (Express Entry) → Germany (EU Blue Card). 12–18 months timeline.",
    category: "career",
    total_phases: 1,
    sort_order: 7,
  },
  {
    title: "Go AI skills as international differentiator",
    description: "Build Go AI skills — Weaviate + Ollama are Go-based. Go + AI engineering is globally rare. Direct pipeline to Amsterdam (Weaviate) and other international roles.",
    category: "learning",
    total_phases: 1,
    sort_order: 8,
  },
  {
    title: "Visa documents",
    description: "IELTS 7.5+ (mandatory CA/AU), degree apostille at mea.gov.in, passport 3yr+ validity, experience letters.",
    category: "admin",
    total_phases: 1,
    sort_order: 9,
  },
  {
    title: "Build in public",
    description: "1 post/week LinkedIn + Twitter/X, OSS contribution to Go/AI projects, ship at 70% — always. Consistent output builds inbound hiring.",
    category: "personal",
    total_phases: 1,
    sort_order: 10,
  },
];

// ── 6 Career Phases (for Goal 0 — primary career goal) ───────────────────────
export const SEED_PHASES: SeedPhase[] = [
  {
    goal_index: 0,
    phase_number: 1,
    title: "Foundation + Travel Planner",
    timeline: "Weeks 1–4",
    description: "Iron-clad mental models before any serious code. Ship Travel Planner. Test every concept same day. Never just watch.",
    concepts: [
      "Tokens & tokenization — byte-pair encoding, why Hindi/Indic costs more tokens",
      "Context window — token budget, not word count; cost = tokens × price per call",
      "Attention mechanism — Q/K/V matrices, multi-head, lost-in-the-middle problem",
      "Temperature + sampling — 0 for structured JSON output, ~1 for creative tasks",
      "Why hallucinations happen — prediction without grounding; RAG as the fix",
      "System vs user prompt — clean separation, XML tag discipline",
      "Chain of thought (CoT) — when it helps, when it's overkill and adds latency",
      "Structured outputs via tool use — JSON schema definition, Zod validation",
      "Streaming APIs — SSE mechanics, ReadableStream, AbortController stop button",
      "Embeddings — vectors as geometry, cosine similarity intuition",
      "RAG: indexing pipeline vs query pipeline — two completely separate flows",
      "pgvector on Supabase — storing + querying vectors in SQL, no separate DB needed",
    ],
    projects: ["AI Travel Planner — Next.js + Claude + pgvector + Vercel (deployed, public URL)"],
    interview_prep: [
      "Neetcode: Arrays + Hashing — understand HashMap patterns",
      "Neetcode: Two Pointers — covers 70% of string/array questions",
      "Prep answer: Explain RAG end-to-end without notes in 2 minutes",
      "Prep answer: Why do LLMs hallucinate? How does RAG fix it?",
      "Update LinkedIn headline: 'AI Engineer | Open to NL · SG · CA · IN'",
      "List 20 India target companies + 10 international — read their eng blogs",
    ],
    resources: [
      { title: "Karpathy — Intro to LLMs (1hr)", url: "https://www.youtube.com/watch?v=zjkBMFhNj_g", time: "1 hr", type: "video", note: "Day 1. Non-negotiable starting point." },
      { title: "3Blue1Brown — Attention in Transformers", url: "https://www.youtube.com/watch?v=7xTGNNLPyMI", time: "27 min", type: "video", note: "Best visual. Watch right after Karpathy." },
      { title: "Anthropic Prompt Engineering Guide", url: "https://docs.anthropic.com/en/docs/build-with-claude/prompt-engineering/overview", time: "2 hr", type: "read", note: "Official. Test every technique in Workbench immediately." },
      { title: "Vicki Boykis — What Are Embeddings?", url: "https://vickiboykis.com/what_are_embeddings/", time: "1 hr", type: "read", note: "Read before writing any vector code." },
      { title: "Pinecone — RAG Guide", url: "https://www.pinecone.io/learn/retrieval-augmented-generation/", time: "45 min", type: "read", note: "Read before building RAG. Chunking decisions matter most." },
      { title: "OpenAI Tokenizer Playground", url: "https://platform.openai.com/tokenizer", time: "10 min", type: "tool", note: "Paste your own prompts. See what tokens cost." },
      { title: "Anthropic Workbench", url: "https://console.anthropic.com/workbench", time: "ongoing", type: "tool", note: "Test every technique as you read it." },
      { title: "Supabase pgvector Guide", url: "https://supabase.com/docs/guides/ai/vector-columns", time: "30 min", type: "read", note: "No separate vector DB needed." },
      { title: "Vercel AI SDK — useChat + streaming", url: "https://sdk.vercel.ai/docs/ai-sdk-core/overview", time: "1 hr", type: "read", note: "Learn useChat and useCompletion deeply." },
      { title: "Anthropic Tool Use Docs", url: "https://docs.anthropic.com/en/docs/build-with-claude/tool-use", time: "1 hr", type: "read", note: "Base primitive for all structured output + agents. Read twice." },
    ],
    milestones: [
      "Travel Planner live on Vercel — public URL you can paste in a LinkedIn post",
      "Can explain RAG pipeline from memory without notes in 2 minutes",
      "Can calculate the token cost of your own prompts accurately",
      "Neetcode Arrays + Two Pointers complete",
    ],
  },
  {
    goal_index: 0,
    phase_number: 2,
    title: "Advanced RAG + Agents + Real Users",
    timeline: "Weeks 5–9",
    description: "Master RAG failure modes until they're boring. Build Second Brain on your own messy notes. Get Slack bot into your actual team. First startup applications.",
    concepts: [
      "Hybrid search — BM25 keyword + vector semantic, when each outperforms",
      "Reranking — Cohere reranker, why approximate ANN search needs a second pass",
      "Parent-child chunking — small chunks for retrieval, large for context window",
      "HyDE — Hypothetical Document Embeddings, closing short-query vs long-doc gap",
      "Metadata filtering — scoping search to folders, dates, document types",
      "Tool use API mechanics — message structure, tool_use blocks, tool_result format",
      "Agent loop deeply — while(model returns tool_use): execute → append → re-call",
      "ReAct framework — Reason then Act, why it improves reliability vs raw loops",
      "Agent failure modes — vague tool descriptions, missing error handling, infinite loops",
      "Workflow vs agent — hard-coded steps vs letting model decide (prefer workflow first)",
      "Webhook-driven architecture — event-triggered agent execution at scale",
      "Slack OAuth + Bolt SDK (Node.js) — workspace install flow, slash commands, DMs",
    ],
    projects: [
      "AI Second Brain — RAG over your own Markdown + PDFs with hybrid search",
      "Slack Thread Analyzer — thread summary + todo agent, real team users",
    ],
    interview_prep: [
      "Neetcode: Sliding Window + Stack (medium problems now)",
      "Neetcode: Trees + Binary Search",
      "Prep: Diagnose a RAG system giving wrong answers — retrieval vs generation layer",
      "Prep: Design an AI agent — walk through loop, failure modes, observability",
      "Prep: RAG vs fine-tuning — when to use each (most common AI interview question)",
      "Apply to 5 India startup roles — early reps are practice not judgment",
    ],
    resources: [
      { title: "Advanced RAG Techniques — illustrated overview", url: "https://medium.com/towards-data-science/advanced-rag-techniques-an-illustrated-overview-04d193d8fec6", time: "40 min", type: "read", note: "Reranking, HyDE, query decomposition — the interview-impressive parts." },
      { title: "Lilian Weng — LLM Powered Autonomous Agents", url: "https://lilianweng.github.io/posts/2023-06-23-agent/", time: "1.5 hr", type: "read", note: "Definitive piece on agents. Written by OpenAI head of safety." },
      { title: "Anthropic — Building Effective Agents", url: "https://www.anthropic.com/research/building-effective-agents", time: "45 min", type: "read", note: "Workflow vs agent patterns. Honest about reliability tradeoffs." },
      { title: "LangChain.js — RAG Tutorial", url: "https://js.langchain.com/docs/tutorials/rag/", time: "2 hr", type: "build", note: "JS/TS hands-on. Follow after reading the Pinecone article." },
      { title: "Slack Bolt SDK — Node.js", url: "https://slack.dev/bolt-js/", time: "1 hr", type: "read", note: "Event handling, slash commands, OAuth for workspace installs." },
      { title: "Vercel AI SDK — Agents", url: "https://sdk.vercel.ai/docs/ai-sdk-core/agents", time: "45 min", type: "read", note: "Agent loop boilerplate — study what it does under the hood." },
      { title: "Cohere Rerank API", url: "https://docs.cohere.com/reference/rerank", time: "30 min", type: "tool", note: "Add reranking to Second Brain. Noticeable quality jump." },
      { title: "Neetcode 150 Roadmap", url: "https://neetcode.io/roadmap", time: "ongoing", type: "tool", note: "30 min/day, 4×/week. Consistency beats marathons." },
    ],
    milestones: [
      "Slack bot installed in your actual team — real colleagues using it",
      "Second Brain with hybrid search + parent-child chunking on your own notes",
      "Can diagnose a RAG failure without guessing — instrument first, then fix",
      "5 India startup applications sent, first interview reps done",
    ],
  },
  {
    goal_index: 0,
    phase_number: 3,
    title: "Agentic AI + OpenClaw + Multi-Agent",
    timeline: "Weeks 9–13",
    description: "Go deep on agentic AI stack. Build OpenClaw plugin. Learn agent security (prompt injection, OWASP LLM Top 10). Highest-demand niche in India + international differentiator.",
    concepts: [
      "Multi-agent systems — orchestrator + specialist agent patterns",
      "LangGraph — stateful graph-based workflows, nodes + edges, checkpointing",
      "CrewAI — agents with roles, goals, tools collaborating on tasks",
      "AutoGen (Microsoft) — agents that critique and refine each other's work",
      "Agent memory types — short-term (context window), long-term (vector DB), episodic",
      "OpenClaw architecture — SKILL.md plugin format, ClawHub marketplace, sub-agents",
      "Prompt injection — attacker embeds instructions in untrusted web content or docs",
      "ClawJacked vulnerability (CVSS 8.8) — remote takeover via malicious WebSocket",
      "OWASP LLM Top 10 — industry standard attack surface for LLM applications",
      "Agentic threat modeling — adapting STRIDE and zero-trust to agent systems",
      "Shadow AI detection — finding rogue agents deployed inside corporate networks",
      "MCP (Model Context Protocol) — how Claude accesses Gmail, Calendar, Slack etc.",
      "Agent observability — tracing every tool call, decision chain, and token cost",
    ],
    projects: [
      "OpenClaw skill/plugin — SKILL.md for ClawHub (Indian: GST lookup, UPI, or Zoho integration)",
      "Meeting Intelligence — audio → Whisper API → Claude → Slack digest",
      "Agent security write-up — reproduce prompt injection in sandbox, publish Medium/dev.to",
    ],
    interview_prep: [
      "Neetcode: Graphs + connected components + shortest path",
      "Prep: What is prompt injection and how do you defend against it?",
      "Prep: Design a multi-agent research system — orchestrator + tools + memory",
      "Prep: How do you add observability to an agent pipeline in production?",
      "Scale India applications to 10–12. Use Slack bot as B2B signal.",
      "Research target companies: Leena AI, Observe.AI, Sarvam AI, Krutrim, Juspay",
    ],
    resources: [
      { title: "LangGraph — stateful agent workflows", url: "https://python.langchain.com/docs/langgraph", time: "3 hr", type: "build", note: "Best for stateful multi-step agents. Python-first but concepts transfer to JS." },
      { title: "CrewAI — multi-agent framework", url: "https://docs.crewai.com", time: "2 hr", type: "read", note: "Good mental model for orchestrator + specialist patterns." },
      { title: "DeepLearning.AI — AI Agents in LangGraph (free)", url: "https://www.deeplearning.ai/short-courses/ai-agents-in-langgraph/", time: "3 hr", type: "course", note: "Short course by LangChain founder. Stateful multi-step done properly." },
      { title: "OWASP LLM Top 10 — security risks", url: "https://owasp.org/www-project-top-10-for-large-language-model-applications/", time: "1 hr", type: "read", note: "Read before writing the security post. Industry standard." },
      { title: "Prompt Injection — Simon Willison", url: "https://simonwillison.net/2023/Apr/14/prompt-injection/", time: "30 min", type: "read", note: "Best written explanation. Simon is the definitive voice here." },
      { title: "Anthropic MCP Documentation", url: "https://docs.anthropic.com/en/docs/mcp", time: "1 hr", type: "read", note: "How Claude accesses external services. Critical for Email Agent." },
      { title: "OpenAI Whisper API Docs", url: "https://platform.openai.com/docs/guides/speech-to-text", time: "30 min", type: "read", note: "For Meeting Intelligence. Chunk files > 25MB before sending." },
      { title: "DeepLearning.AI — Multi AI Agent with CrewAI (free)", url: "https://www.deeplearning.ai/short-courses/multi-ai-agent-systems-with-crewai/", time: "2 hr", type: "course", note: "Hands-on multi-agent. Build after reading the concepts." },
    ],
    milestones: [
      "OpenClaw plugin published on ClawHub with clean README",
      "Security write-up published on Medium/dev.to — your inbound channel for consulting",
      "Meeting Intelligence deployed with async transcription + Slack digest",
      "Can explain prompt injection attack + defense confidently in an interview",
    ],
  },
  {
    goal_index: 0,
    phase_number: 4,
    title: "Evals + Dev Observability + India Job Switch",
    timeline: "Weeks 13–18",
    description: "Add evals to everything. Ship flagship Dev Observability project. Get hired. The engineers who measure quality own AI in any org.",
    concepts: [
      "Evals — what to measure: faithfulness, relevance, groundedness, latency",
      "Golden datasets — 20-50 (input, expected_output) pairs, version controlled, CI-run",
      "LLM-as-judge — scoring outputs 1-5 for faithfulness + relevance, calibration",
      "Prompt versioning — treat prompts like code, regression test on every change",
      "LLMOps observability — every call: timestamp, model, tokens, latency, cost",
      "Embedding-based clustering — grouping similar review comments by meaning",
      "GitHub API + Webhooks — PR events, diff analysis, review comment patterns",
      "AI code quality heuristics — what makes AI-generated PRs different from human ones",
      "Time-series data patterns — tracking quality drift over weeks/sprints",
      "Cost optimisation — caching frequent queries, prompt compression, model routing",
    ],
    projects: [
      "Dev Lifecycle Observability — GitHub App + PR analysis agent + quality dashboard (flagship)",
      "Email Agent (MCP + Gmail API) — natural language email triage + action agent",
      "Add evals + Helicone logging to Travel Planner and Second Brain",
    ],
    interview_prep: [
      "Neetcode: DP basics + remaining patterns",
      "Mock interviews via Pramp — minimum 3 rounds back-to-back",
      "Prep: How do you evaluate an AI feature? Golden dataset → LLM-as-judge → prod monitoring",
      "Prep: Design GitHub Copilot observability system at scale",
      "Scale to 20+ India applications. Save top 5 companies for after 10+ interview reps.",
      "Negotiate — two competing offers dramatically increases leverage",
    ],
    resources: [
      { title: "Hamel Husain — Your AI Product Needs Evals", url: "https://hamel.dev/blog/posts/evals/", time: "30 min", type: "read", note: "Most practical evals piece. Read before building any eval system." },
      { title: "What We Learned From a Year of Building with LLMs", url: "https://applied-llms.org", time: "1.5 hr", type: "read", note: "Most honest production LLM guide. Re-read monthly." },
      { title: "Helicone — LLM observability (1-line setup)", url: "https://docs.helicone.ai/getting-started/quick-start", time: "30 min", type: "tool", note: "Add to every project. You want logs before you need them." },
      { title: "Braintrust — prompt regression testing", url: "https://www.braintrustdata.com/docs/guides/evals", time: "45 min", type: "tool", note: "Run evals in CI. Catch regressions before users do." },
      { title: "LangSmith — evaluation tutorial", url: "https://docs.smith.langchain.com/tutorials/Developers/evaluation", time: "1 hr", type: "build", note: "In almost every AI engineer job description. Learn it." },
      { title: "GitHub Apps — Creating a GitHub App", url: "https://docs.github.com/en/apps/creating-github-apps", time: "1 hr", type: "read", note: "PR webhook setup for Dev Observability flagship project." },
      { title: "Tech Interview Handbook — full guide", url: "https://www.techinterviewhandbook.org", time: "3 hr", type: "read", note: "Resume, apply, negotiate. Written by ex-Meta engineer." },
      { title: "Hello Interview — System Design in a Hurry", url: "https://www.hellointerview.com/learn/system-design/in-a-hurry/introduction", time: "4 hr", type: "read", note: "Interview-focused design framework. Do before mock interviews." },
    ],
    milestones: [
      "Dev Observability GitHub App live — open source or ProductHunt launch",
      "Email Agent with MCP live — natural language over Gmail working",
      "Evals + observability on 3+ projects",
      "INDIA JOB OFFER SIGNED — switch complete",
    ],
  },
  {
    goal_index: 0,
    phase_number: 5,
    title: "Applied ML + Go AI Systems + International Portfolio",
    timeline: "Month 5–12",
    description: "Two parallel tracks: (A) Applied ML on the job — fine-tuning, PyTorch, model evals. (B) Build the Go AI portfolio that unlocks international opportunities — Weaviate, Ollama are Go-based and Go is globally rare.",
    concepts: [
      "PyTorch — tensors, autograd, training loop from scratch",
      "Fine-tuning — LoRA and QLoRA, parameter-efficient, runs on consumer hardware",
      "Loss functions — cross-entropy, what minimizing it means intuitively",
      "Backpropagation — chain rule, gradient flow (intuition not derivation)",
      "Overfitting + regularization + early stopping signals",
      "Model evaluation — precision, recall, F1, AUC-ROC, confusion matrix reading",
      "Hugging Face ecosystem — transformers, datasets, PEFT, Trainer API",
      "Go for AI systems — goroutines for concurrent inference, streaming HTTP in Go",
      "LLM inference optimisation — quantisation (GGUF), KV cache, batching, throughput",
      "AI API gateway in Go — multi-LLM routing, rate limiting, streaming, cost tracking",
      "Weaviate + Ollama internals — reading Go source code as learning + contribution path",
      "OpenClaw SMB SaaS lane — managed hosting, Indian integrations (GST, Zoho, Tally)",
    ],
    projects: [
      "AI API Gateway in Go — streaming, rate limiting, multi-LLM routing (international signal)",
      "Fine-tune Llama/Mistral 7B on domain data via QLoRA",
      "OSS contribution: Weaviate or Ollama (Go) — your direct pipeline to Amsterdam",
      "OpenClaw SMB SaaS MVP or agentic security audit ₹50k–2L per engagement",
    ],
    interview_prep: [
      "Target: Applied ML Engineer / Senior AI Engineer titles",
      "India: Sarvam AI, Krutrim, Neysa, Leena AI, Observe.AI",
      "International applications begin: Netherlands (Weaviate + techleap.nl), Singapore (Sea Group, Grab, Stripe)",
      "Build Twitter/X + LinkedIn presence — 1 technical post per week",
      "Start informational interviews: 5 engineers per target country via LinkedIn DM",
      "Draft international resume — ATS format, no photo (CA/AU/SG), 'Seeking visa sponsorship' explicit",
    ],
    resources: [
      { title: "fast.ai — Practical Deep Learning (free)", url: "https://course.fast.ai", time: "20 hr course", type: "course", note: "Best applied ML course. Practical-first, no math gatekeeping." },
      { title: "Karpathy — Build GPT from Scratch", url: "https://www.youtube.com/watch?v=kCc8FmEb1nY", time: "2 hr", type: "video", note: "45 min of this teaches more than any article on transformers." },
      { title: "Go by Example", url: "https://gobyexample.com", time: "5 hr", type: "read", note: "Learn Go fast. Goroutines + HTTP streaming are what you need first." },
      { title: "Weaviate Academy — vector DB (Go-based)", url: "https://weaviate.io/developers/academy", time: "3 hr", type: "course", note: "Weaviate is Go. Contributing here = direct hiring pipeline to Amsterdam." },
      { title: "Hugging Face PEFT — LoRA fine-tuning", url: "https://huggingface.co/docs/peft/en/index", time: "2 hr", type: "read", note: "QLoRA makes 7B fine-tuning feasible on consumer hardware." },
      { title: "ByteByteGo — system design visual guides", url: "https://www.youtube.com/@ByteByteGo", time: "ongoing", type: "video", note: "Best YouTube for system design. Watch before international interviews." },
      { title: "relocate.me — visa-sponsored roles", url: "https://relocate.me", time: "ongoing", type: "tool", note: "Pre-filtered visa sponsorship. Check weekly once applications start." },
    ],
    milestones: [
      "Go AI API gateway live on GitHub — streaming, rate limiting, clean README",
      "Fine-tuned model deployed — can explain tradeoffs vs RAG in any interview",
      "OSS contribution merged to Weaviate or Ollama (Go codebase)",
      "First international informational interviews done — 5 per target country",
    ],
  },
  {
    goal_index: 0,
    phase_number: 6,
    title: "International Applications + Relocation",
    timeline: "Month 8–18+",
    description: "Turn the portfolio into international offers. Netherlands first (fastest visa), Singapore second, Canada third. Your Go + AI engineering combination is globally rare — 90% of AI engineers are Python-only.",
    concepts: [
      "Netherlands HSM visa — 2-4 month processing, €65-95k salary range, easiest path",
      "Singapore EP + COMPASS — points-based, need 40+, S$8k+ salary target, AI on shortage list",
      "Canada Express Entry — CRS score, Global Talent Stream (2 week processing!), LMIA",
      "Germany EU Blue Card — €65-100k, English-friendly companies, Aleph Alpha, DeepL",
      "5-touch application method — apply → connect HM → engage post → follow up D7 → share D14",
      "Cover note formula — 3 sentences: I built X + Y reference to their specific tech + ask",
      "Referral conversion — 3-5× higher than cold apply. Informational interviews = warm referrals.",
      "COMPASS C3 Indian diversity risk — target European MNCs or startups under 25 PMETs in SG",
      "Salary negotiation — never accept first offer; competing offers = leverage; get visa in writing",
    ],
    projects: [
      "No new projects — focus on polishing GitHub + deploying all existing projects",
      "Write 1 international-focused technical article per month for visibility",
    ],
    interview_prep: [
      "Complete mock interview loop: DSA + system design + behavioral back-to-back",
      "Prep in Go, not just Python — signals seniority to international interviewers",
      "AI system design: RAG at 1M queries/day, LLM inference API in Go, agent orchestration",
      "Behavioral: learn fast story, Go AI project story, failure + lesson story",
      "Research every company before interview: eng blog + recent tech decisions",
      "Salary targets: NL €65-80k · SG S$8-10k/mo · CA C$110-140k · DE €65-90k",
    ],
    resources: [
      { title: "relocate.me — visa-sponsored AI roles", url: "https://relocate.me", time: "ongoing", type: "tool", note: "Check daily during application blitz phase." },
      { title: "ai-jobs.net — AI-specific job board", url: "https://ai-jobs.net", time: "ongoing", type: "tool", note: "AI-specific roles globally. Good for NL + CA + SG." },
      { title: "techleap.nl — Netherlands tech jobs", url: "https://techleap.nl", time: "ongoing", type: "tool", note: "Netherlands-specific. Weaviate jobs appear here." },
      { title: "LinkedIn — 'Open to Work' international settings", url: "https://linkedin.com", time: "30 min setup", type: "tool", note: "Set location preferences: Amsterdam, Singapore, Toronto, Berlin." },
      { title: "Levels.fyi — international salary benchmarks", url: "https://www.levels.fyi", time: "ongoing", type: "tool", note: "Know your number before every negotiation conversation." },
    ],
    milestones: [
      "First-round international interview scheduled",
      "Visa sponsorship offer received in writing",
      "Relocation destination confirmed + visa application filed",
      "RELOCATED — new country, new chapter",
    ],
  },
];
