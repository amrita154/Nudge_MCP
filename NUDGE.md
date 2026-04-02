# NUDGE MCP — Personal Life OS

> MCP server for goal tracking, roadmaps, daily tasks, idea evaluation, and progress reflection.
> Connects to Claude Desktop (local) and Claude.ai (remote). Data stored in Supabase.

---

## Architecture

```
You ──── Claude Desktop / Claude.ai
              │
              │  MCP tools (reads + writes)
              ▼
       nudge-mcp server
         (Node.js)
              │
              │  Supabase JS client
              ▼
       Supabase (PostgreSQL)
       goals · phases · milestones
       tasks · ideas · reflections
```

**Claude is the brain.** The MCP server is pure storage + retrieval.
Claude reads your data, reasons about it, and writes results back via tools.

---

## Database Tables

| Table | Purpose |
|---|---|
| `profile` | Name, skills, context, focus |
| `goals` | 10 goals with progress % and current phase |
| `phases` | 6-phase roadmap per goal (concepts, projects, resources) |
| `milestones` | Concrete checkpoints within each phase |
| `tasks` | Daily tasks with resources, category, priority |
| `ideas` | Ideas with AI evaluation/verdict |
| `reflections` | Daily score, wins, gaps, tomorrow plan |

---

## Setup

### 1. Supabase (free)

1. Go to [supabase.com](https://supabase.com) → New project
2. Open **SQL Editor** → paste contents of `schema.sql` → Run
3. Go to **Project Settings → API**
4. Copy **Project URL** and **service_role key** (not anon key)

### 2. Install dependencies

```bash
cd nudge-mcp
npm install
npm run build
```

### 3. Environment variables

```bash
cp .env.example .env
# Fill in SUPABASE_URL and SUPABASE_SERVICE_KEY
```

### 4. Claude Desktop config

Open: `~/Library/Application Support/Claude/claude_desktop_config.json`

```json
{
  "mcpServers": {
    "nudge": {
      "command": "node",
      "args": ["/Users/YOUR_NAME/personal-project/nudge-mcp/dist/index.js"],
      "env": {
        "SUPABASE_URL": "https://your-project.supabase.co",
        "SUPABASE_SERVICE_KEY": "your-service-role-key"
      }
    }
  }
}
```

Restart Claude Desktop. You should see "nudge" in the tools list.

### 5. Remote MCP for Claude.ai (Railway)

```bash
# Deploy to Railway
railway login
railway init
railway add
railway up

# Set env vars in Railway dashboard:
# SUPABASE_URL, SUPABASE_SERVICE_KEY, PORT=3333

# Your MCP URL will be:
# https://nudge-mcp-xxx.railway.app/mcp
```

Add this URL in Claude.ai → Settings → MCP Servers.

---

## First Conversation

When you open Claude Desktop for the first time, say:

```
"Set up my Nudge system"
```

Claude will:
1. Call `check_setup` → sees you're a new user
2. Ask: **import career agent goals** or **start fresh**?

**Option A — Import career agent:**
```
"Import my career agent goals. My name is [name].
My current skills are [React, Node.js, Python basics].
I'm at the beginning of Phase 1."
```
Claude calls `import_career_agent` → seeds 10 goals + 6 phases + all milestones.

**Option B — Fresh start:**
```
"Start fresh. My name is [name].
I'm a [role] focused on [goals].
My skills are [skills]."
```
Claude calls `setup_new_user` then you add goals manually.

---

## All MCP Tools

### Onboarding

| Tool | When Claude uses it |
|---|---|
| `check_setup` | First thing in every new conversation |
| `setup_new_user` | Fresh user with no prior data |
| `import_career_agent` | Seeds 10 goals + 6 phases from career_agent |
| `reset_all_data` | Full wipe and restart |

### Profile

| Tool | When Claude uses it |
|---|---|
| `get_profile` | Reading your skills/context for recommendations |
| `update_profile` | When you share new info about yourself |

### Dashboard & Goals

| Tool | When Claude uses it |
|---|---|
| `get_dashboard` | Morning planning, check-ins, weekly reviews |
| `list_goals` | Listing goals, goal selection |
| `add_goal` | When you define a new objective |
| `update_goal` | Progress updates, status changes, phase advances |

### Phases (Roadmap)

| Tool | When Claude uses it |
|---|---|
| `list_phases` | Viewing the roadmap for a goal |
| `add_phase` | Building a multi-phase plan |
| `update_phase_status` | Moving between phases |

### Milestones

| Tool | When Claude uses it |
|---|---|
| `list_milestones` | Checking what's done vs pending |
| `add_milestone` | Adding checkpoints to a phase |
| `complete_milestone` | Marking a deliverable done |

### Daily Tasks

| Tool | When Claude uses it |
|---|---|
| `list_tasks` | Showing today's task list |
| `add_task` | Saving generated tasks |
| `complete_task` | Marking tasks done from conversation |
| `delete_task` | Removing irrelevant tasks |

### Ideas

| Tool | When Claude uses it |
|---|---|
| `list_ideas` | Reviewing your idea backlog |
| `add_idea` | Saving a new idea before evaluating |
| `update_idea` | Saving evaluation/verdict |
| `delete_idea` | Removing an idea |

### Reflections

| Tool | When Claude uses it |
|---|---|
| `log_reflection` | End-of-day review, saves score + updates goal % |
| `get_reflections` | Spotting patterns over 7-14 days |

---

## Example Prompts

### Morning Planning
```
"Good morning. Plan my day."
```
Claude: reads dashboard → sees goals + progress + roadmap → generates 3-5 concrete
tasks with real resources → saves them via `add_task`.

```
"What should I focus on this week for my ML goal?"
```
Claude: reads goal + current phase + milestones → suggests week plan.

---

### Idea Evaluation
```
"I want to start a YouTube channel about AI. Worth it?"
```
Claude: reads your goals via `list_goals` → evaluates alignment → calls `add_idea`
then `update_idea` with score, verdict, reasoning.

```
"Should I learn Rust right now?"
```
Claude: honest assessment against your current goals and bandwidth.

```
"Show me all my parked ideas"
```
Claude: calls `list_ideas` with verdict=park → shows idea backlog.

---

### Roadmap & Phases
```
"Show me my Phase 1 roadmap"
```
Claude: calls `list_phases` + `list_milestones` → shows timeline, concepts,
projects, and milestone completion status.

```
"I've completed Phase 1. Move me to Phase 2."
```
Claude: calls `update_phase_status` (Phase 1 → completed), `update_phase_status`
(Phase 2 → in_progress), `update_goal` (current_phase → 2).

```
"Build me a 4-week roadmap for my DSA goal"
```
Claude: creates 4 phases via `add_phase` with week-by-week milestones.

---

### Progress Tracking
```
"I finished the Karpathy video and built the tokenizer demo. Skip the pgvector part."
```
Claude: calls `complete_task` × 2, `delete_task` × 1.

```
"Mark the Travel Planner milestone as done and update my ML goal to 15%"
```
Claude: calls `complete_milestone` + `update_goal`.

---

### Evening Reflection
```
"End of day. I finished tasks 1 and 2, skipped task 3 (ran out of time).
Overall a decent day. Tomorrow I'll prioritize the portfolio work."
```
Claude: calls `complete_task` × 2, `log_reflection` with score, wins, gaps,
and applies progress delta to relevant goals.

```
"Give me a weekly review"
```
Claude: calls `get_reflections` → spots patterns in scores, consistency,
recurring gaps → gives honest assessment.

---

### Skill-Based Goal Setting
```
"Based on my current skills (React, Node.js, Python basics),
what goals should I be working on and in what order?"
```
Claude: reads `get_profile` + existing goals → advises prioritization.

```
"I just learned LangChain. Update my profile and tell me what this unlocks."
```
Claude: calls `update_profile` with new skill → maps to relevant phases/milestones.

---

## How Goal Phases Work

Each goal can have multiple phases. The primary career goal has 6:

```
Phase 1: Foundation + Travel Planner     (Weeks 1–4)     ← start here
Phase 2: Advanced RAG + Agents           (Weeks 5–9)
Phase 3: Agentic AI + OpenClaw           (Weeks 9–13)
Phase 4: Evals + Dev Observability       (Weeks 13–18)   ← India job switch
Phase 5: Applied ML + Go AI Systems      (Month 5–12)
Phase 6: International Applications      (Month 8–18+)
```

Each phase stores:
- **concepts** — what to learn and understand deeply
- **projects** — what to ship
- **interview_prep** — DSA + system design + applications
- **resources** — curated real URLs with time estimates and notes
- **milestones** — concrete, verifiable deliverables

Claude uses all of this when generating daily tasks, answering "what should I do",
and when evaluating ideas against where you are in the roadmap.

---

## Scoring Guide (for Reflections)

| Score | Meaning |
|---|---|
| 9–10 | Meaningful goal progress. Did what was planned or more. |
| 7–8 | Solid day. Most important things done. |
| 5–6 | Partial. Some right items, some missed. |
| 3–4 | Minimal goal-relevant work. |
| 1–2 | Nothing meaningful done, or 2+ days missed in a row. |

---

## Verdict Guide (for Ideas)

| Verdict | Meaning |
|---|---|
| `pursue_now` | Strong alignment. Integrate into current goals/tasks. |
| `pursue_later` | Good idea but wrong timing. Revisit after Phase N. |
| `park` | Interesting but not aligned. Keep for future reference. |
| `skip` | Distraction. Not worth the opportunity cost. |

---

## Development

```bash
# Run in dev mode (stdio, no build needed)
npm run dev

# Build for production
npm run build

# Run built version (stdio — for Claude Desktop)
npm start

# Run HTTP server (for Claude.ai remote)
PORT=3333 npm start
# or
npm run start:http
```

---

## Reset & Restart

To wipe everything and start fresh:
```
"Reset all my Nudge data and start fresh"
```
Claude will confirm before calling `reset_all_data`.

To re-import career agent after a reset:
```
"Re-import my career agent goals. I'm starting Phase 1."
```
