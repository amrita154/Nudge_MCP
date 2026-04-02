import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { CallToolRequestSchema, ListToolsRequestSchema } from "@modelcontextprotocol/sdk/types.js";
import * as db from "./db.js";

// ── Response helper ───────────────────────────────────────────────────────────
function ok(data: unknown) {
  return {
    content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }],
  };
}

function err(message: string) {
  return {
    content: [{ type: "text" as const, text: `Error: ${message}` }],
    isError: true,
  };
}

async function handle(fn: () => Promise<unknown>) {
  try {
    return ok(await fn());
  } catch (e) {
    return err((e as Error).message);
  }
}

// ── Tool definitions ──────────────────────────────────────────────────────────
const TOOLS = [
  // ── Onboarding ──────────────────────────────────────────────────────────────
  {
    name: "check_setup",
    description: "Check if the user has completed initial setup. Call this first in every new conversation to understand the current state. Returns profile info, setup_complete flag, and total goals/tasks count.",
    inputSchema: { type: "object", properties: {} },
  },
  {
    name: "setup_new_user",
    description: "Create a fresh profile for a brand new user with no prior data. Call this when check_setup shows setup_complete=false and the user wants to start fresh (not import career_agent data).",
    inputSchema: {
      type: "object",
      required: ["name"],
      properties: {
        name: { type: "string", description: "User's name" },
        skills: { type: "array", items: { type: "string" }, description: "Current skills/technologies the user knows" },
        current_focus: { type: "string", description: "What the user is currently focused on" },
        context: { type: "string", description: "Background context: role, experience, goals, constraints" },
      },
    },
  },
  {
    name: "import_career_agent",
    description: "Seed the database with all 10 goals and 6-phase roadmap from career_agent.html. Use this when the user says they want to import their career agent data or continue from where they left off. Creates all goals, phases, and milestones automatically.",
    inputSchema: {
      type: "object",
      required: ["name"],
      properties: {
        name: { type: "string", description: "User's name" },
        skills: { type: "array", items: { type: "string" }, description: "Current skills (e.g. ['React', 'Node.js', 'Python'])" },
        context: { type: "string", description: "Any additional context about current status, what phase they're on, etc." },
      },
    },
  },
  {
    name: "reset_all_data",
    description: "DESTRUCTIVE: Wipe all data (goals, phases, milestones, tasks, ideas, reflections, profile) and start fresh. Only call this when the user explicitly confirms they want to reset everything.",
    inputSchema: {
      type: "object",
      required: ["confirmed"],
      properties: {
        confirmed: { type: "boolean", description: "Must be true to proceed with reset" },
      },
    },
  },

  // ── Profile ─────────────────────────────────────────────────────────────────
  {
    name: "get_profile",
    description: "Get the user's profile: name, skills, current focus, and background context.",
    inputSchema: { type: "object", properties: {} },
  },
  {
    name: "update_profile",
    description: "Update user profile fields. Use when user shares new info about their skills, focus, or background.",
    inputSchema: {
      type: "object",
      properties: {
        name: { type: "string" },
        skills: { type: "array", items: { type: "string" }, description: "Full updated skills list" },
        current_focus: { type: "string" },
        context: { type: "string", description: "Background context Claude uses for all recommendations" },
      },
    },
  },

  // ── Dashboard ────────────────────────────────────────────────────────────────
  {
    name: "get_dashboard",
    description: "Get a full overview: all active goals with phase info, today's tasks, last 7 days of reflections, and recent ideas. Call this at the start of planning sessions or morning check-ins.",
    inputSchema: { type: "object", properties: {} },
  },

  // ── Goals ────────────────────────────────────────────────────────────────────
  {
    name: "list_goals",
    description: "List all goals. Optionally filter by status (active, paused, completed, archived).",
    inputSchema: {
      type: "object",
      properties: {
        status: { type: "string", enum: ["active", "paused", "completed", "archived"], description: "Filter by status. Omit to get all." },
      },
    },
  },
  {
    name: "add_goal",
    description: "Add a new goal. Use when user defines a new objective they want to track and make progress on.",
    inputSchema: {
      type: "object",
      required: ["title"],
      properties: {
        title: { type: "string", description: "Clear, specific goal title" },
        description: { type: "string", description: "What success looks like, why it matters" },
        category: { type: "string", enum: ["career", "learning", "projects", "health", "finance", "admin", "personal"], description: "Goal category" },
        total_phases: { type: "number", description: "How many phases/stages this goal has (default 1)" },
        target_date: { type: "string", description: "Target completion date YYYY-MM-DD" },
      },
    },
  },
  {
    name: "update_goal",
    description: "Update a goal's progress, status, description, or current phase. Use after completing milestones or when user's situation changes.",
    inputSchema: {
      type: "object",
      required: ["goal_id"],
      properties: {
        goal_id: { type: "number" },
        title: { type: "string" },
        description: { type: "string" },
        category: { type: "string" },
        status: { type: "string", enum: ["active", "paused", "completed", "archived"] },
        progress: { type: "number", minimum: 0, maximum: 100, description: "Progress percentage 0-100" },
        current_phase: { type: "number", description: "Which phase number is currently active" },
        target_date: { type: "string", description: "YYYY-MM-DD" },
      },
    },
  },

  // ── Phases ───────────────────────────────────────────────────────────────────
  {
    name: "list_phases",
    description: "Get all phases for a goal, including concepts to learn, projects to ship, and resources for each phase.",
    inputSchema: {
      type: "object",
      required: ["goal_id"],
      properties: {
        goal_id: { type: "number" },
      },
    },
  },
  {
    name: "add_phase",
    description: "Add a new phase/stage to a goal's roadmap. Use when building out a multi-phase plan.",
    inputSchema: {
      type: "object",
      required: ["goal_id", "phase_number", "title"],
      properties: {
        goal_id: { type: "number" },
        phase_number: { type: "number" },
        title: { type: "string" },
        description: { type: "string", description: "What this phase achieves" },
        timeline: { type: "string", description: "e.g. 'Weeks 1-4' or 'Month 2-3'" },
        concepts: { type: "array", items: { type: "string" }, description: "Key concepts to learn in this phase" },
        projects: { type: "array", items: { type: "string" }, description: "Projects to ship in this phase" },
        interview_prep: { type: "array", items: { type: "string" }, description: "Interview/external goals for this phase" },
        resources: {
          type: "array",
          description: "Learning resources for this phase",
          items: {
            type: "object",
            properties: {
              title: { type: "string" },
              url: { type: "string" },
              time: { type: "string" },
              type: { type: "string" },
              note: { type: "string" },
            },
          },
        },
      },
    },
  },
  {
    name: "update_phase_status",
    description: "Mark a phase as not_started, in_progress, or completed. When completing a phase, also update the goal's current_phase.",
    inputSchema: {
      type: "object",
      required: ["phase_id", "status"],
      properties: {
        phase_id: { type: "number" },
        status: { type: "string", enum: ["not_started", "in_progress", "completed"] },
      },
    },
  },

  // ── Milestones ───────────────────────────────────────────────────────────────
  {
    name: "list_milestones",
    description: "List all milestones for a goal, optionally filtered by phase. Shows which are completed.",
    inputSchema: {
      type: "object",
      required: ["goal_id"],
      properties: {
        goal_id: { type: "number" },
        phase_id: { type: "number", description: "Filter to a specific phase" },
      },
    },
  },
  {
    name: "add_milestone",
    description: "Add a concrete checkpoint/milestone to a goal or phase. Milestones are verifiable deliverables, not vague activities.",
    inputSchema: {
      type: "object",
      required: ["goal_id", "title"],
      properties: {
        goal_id: { type: "number" },
        phase_id: { type: "number" },
        title: { type: "string", description: "Specific, verifiable deliverable (e.g. 'Travel Planner deployed on Vercel with public URL')" },
        description: { type: "string" },
        order_num: { type: "number" },
      },
    },
  },
  {
    name: "complete_milestone",
    description: "Mark a milestone as completed or uncompleted. After completing milestones, consider updating goal progress.",
    inputSchema: {
      type: "object",
      required: ["milestone_id"],
      properties: {
        milestone_id: { type: "number" },
        completed: { type: "boolean", description: "true to complete, false to undo" },
      },
    },
  },

  // ── Tasks ────────────────────────────────────────────────────────────────────
  {
    name: "list_tasks",
    description: "List tasks for a specific date (default: today). Shows completion status, goal link, category, and resources.",
    inputSchema: {
      type: "object",
      properties: {
        date: { type: "string", description: "YYYY-MM-DD. Defaults to today." },
        goal_id: { type: "number", description: "Filter to tasks for a specific goal" },
      },
    },
  },
  {
    name: "add_task",
    description: "Add a daily task. Always include concrete resources (real URLs) and a time estimate. Link to a goal. Use after generating a day plan.",
    inputSchema: {
      type: "object",
      required: ["title"],
      properties: {
        title: { type: "string", description: "Specific, concrete task title — not vague. 'Watch Karpathy LLM video ch1-3' not 'Learn AI'" },
        description: { type: "string", description: "What exactly to do and why it matters" },
        goal_id: { type: "number" },
        phase_id: { type: "number" },
        milestone_id: { type: "number" },
        category: { type: "string", enum: ["learn", "build", "review", "admin", "health"] },
        priority: { type: "string", enum: ["high", "medium", "low"] },
        time_estimate: { type: "string", description: "e.g. '45min', '1hr', '2hr'" },
        task_date: { type: "string", description: "YYYY-MM-DD. Defaults to today." },
        resources: {
          type: "array",
          items: {
            type: "object",
            properties: {
              title: { type: "string" },
              url: { type: "string" },
              type: { type: "string", enum: ["video", "article", "docs", "tool", "repo", "course"] },
              why: { type: "string", description: "One line: why this resource for this task" },
            },
          },
        },
      },
    },
  },
  {
    name: "complete_task",
    description: "Mark a task as completed or uncompleted.",
    inputSchema: {
      type: "object",
      required: ["task_id"],
      properties: {
        task_id: { type: "number" },
        completed: { type: "boolean", description: "true to complete, false to undo. Defaults to true." },
      },
    },
  },
  {
    name: "delete_task",
    description: "Delete a task. Use when a task is no longer relevant or was added by mistake.",
    inputSchema: {
      type: "object",
      required: ["task_id"],
      properties: {
        task_id: { type: "number" },
      },
    },
  },

  // ── Ideas ────────────────────────────────────────────────────────────────────
  {
    name: "list_ideas",
    description: "List all ideas, optionally filtered by verdict (pursue_now, pursue_later, park, skip).",
    inputSchema: {
      type: "object",
      properties: {
        verdict: { type: "string", enum: ["pursue_now", "pursue_later", "park", "skip"], description: "Filter by verdict" },
      },
    },
  },
  {
    name: "add_idea",
    description: "Save a new idea before evaluating it. Call this first, then evaluate and call update_idea with the assessment.",
    inputSchema: {
      type: "object",
      required: ["title"],
      properties: {
        title: { type: "string" },
        description: { type: "string", description: "What the idea is about" },
      },
    },
  },
  {
    name: "update_idea",
    description: "Save evaluation results for an idea. Call after analyzing the idea against the user's goals. Be honest — most ideas are distractions.",
    inputSchema: {
      type: "object",
      required: ["idea_id"],
      properties: {
        idea_id: { type: "number" },
        verdict: { type: "string", enum: ["pursue_now", "pursue_later", "park", "skip"] },
        score: { type: "number", minimum: 0, maximum: 10, description: "0-10 alignment score with current goals" },
        reasoning: { type: "string", description: "3-4 honest sentences on alignment, conflicts, opportunity cost" },
        integration_note: { type: "string", description: "If pursuing: how to integrate. If skipping: when/why to revisit." },
        risk_note: { type: "string", description: "Cost of chasing this now" },
        related_goal_ids: { type: "array", items: { type: "number" }, description: "Goal IDs this idea aligns with" },
        resources: {
          type: "array",
          items: {
            type: "object",
            properties: {
              title: { type: "string" },
              url: { type: "string" },
              type: { type: "string" },
              why: { type: "string" },
            },
          },
        },
      },
    },
  },
  {
    name: "delete_idea",
    description: "Delete an idea permanently.",
    inputSchema: {
      type: "object",
      required: ["idea_id"],
      properties: {
        idea_id: { type: "number" },
      },
    },
  },

  // ── Reflections ──────────────────────────────────────────────────────────────
  {
    name: "log_reflection",
    description: "Save end-of-day reflection. Scores 9-10: real goal progress. 7-8: solid, most done. 5-6: partial. 3-4: minimal. 1-2: nothing meaningful. Also updates goal progress based on what was actually done.",
    inputSchema: {
      type: "object",
      required: ["score"],
      properties: {
        score: { type: "number", minimum: 1, maximum: 10 },
        summary: { type: "string", description: "2-3 honest sentences about the day" },
        wins: { type: "array", items: { type: "string" }, description: "Specific wins, not vague ('Completed PyTorch ch3' not 'Learned stuff')" },
        gaps: { type: "array", items: { type: "string" }, description: "Specific gaps or missed tasks" },
        tomorrow_priority: { type: "string", description: "Single most important task for tomorrow" },
        notes: { type: "string", description: "Any other observations, patterns noticed" },
        reflection_date: { type: "string", description: "YYYY-MM-DD. Defaults to today." },
        goal_progress_deltas: {
          type: "object",
          description: "Points to add to each goal's progress. e.g. {'1': 3, '2': 1} adds 3% to goal 1, 1% to goal 2. Be conservative — only for real concrete progress.",
          additionalProperties: { type: "number" },
        },
      },
    },
  },
  {
    name: "get_reflections",
    description: "Get recent daily reflections to spot patterns in productivity, consistency, and progress.",
    inputSchema: {
      type: "object",
      properties: {
        limit: { type: "number", description: "Number of recent days to return. Default 14." },
      },
    },
  },
];

// ── Tool handlers ─────────────────────────────────────────────────────────────
async function callTool(name: string, args: Record<string, unknown>) {
  switch (name) {
    // Onboarding
    case "check_setup": return handle(async () => {
      const profile = await db.getProfile();
      const goals = await db.listGoals();
      return {
        setup_complete: profile?.setup_complete ?? false,
        profile: profile ?? null,
        total_goals: ((goals as unknown[]) ?? []).length,
        message: profile?.setup_complete
          ? "User is set up. Use get_dashboard to see current state."
          : "New user — ask if they want to (A) import career_agent goals or (B) start fresh with setup_new_user.",
      };
    });

    case "setup_new_user": return handle(() =>
      db.upsertProfile({
        name: args.name as string,
        skills: (args.skills as string[]) ?? [],
        current_focus: args.current_focus as string,
        context: args.context as string,
        setup_complete: true,
      })
    );

    case "import_career_agent": return handle(() =>
      db.seedFromCareerAgent(
        args.name as string,
        (args.skills as string[]) ?? [],
        (args.context as string) ?? ""
      )
    );

    case "reset_all_data": return handle(async () => {
      if (!args.confirmed) return { skipped: true, reason: "confirmed must be true" };
      return db.resetAllData();
    });

    // Profile
    case "get_profile": return handle(db.getProfile);

    case "update_profile": return handle(() =>
      db.upsertProfile({
        name: args.name as string | undefined,
        skills: args.skills as string[] | undefined,
        current_focus: args.current_focus as string | undefined,
        context: args.context as string | undefined,
      })
    );

    // Dashboard
    case "get_dashboard": return handle(db.getDashboard);

    // Goals
    case "list_goals": return handle(() => db.listGoals(args.status as string | undefined));

    case "add_goal": return handle(() => db.addGoal({
      title: args.title as string,
      description: args.description as string | undefined,
      category: args.category as string | undefined,
      total_phases: args.total_phases as number | undefined,
      target_date: args.target_date as string | undefined,
    }));

    case "update_goal": return handle(async () => {
      const updated = await db.updateGoal(args.goal_id as number, {
        title: args.title as string | undefined,
        description: args.description as string | undefined,
        category: args.category as string | undefined,
        status: args.status as string | undefined,
        progress: args.progress as number | undefined,
        current_phase: args.current_phase as number | undefined,
        target_date: args.target_date as string | undefined,
      });
      return updated;
    });

    // Phases
    case "list_phases": return handle(() => db.listPhases(args.goal_id as number));

    case "add_phase": return handle(() => db.addPhase({
      goal_id: args.goal_id as number,
      phase_number: args.phase_number as number,
      title: args.title as string,
      description: args.description as string | undefined,
      timeline: args.timeline as string | undefined,
      concepts: args.concepts as string[] | undefined,
      projects: args.projects as string[] | undefined,
      interview_prep: args.interview_prep as string[] | undefined,
      resources: args.resources as object[] | undefined,
    }));

    case "update_phase_status": return handle(() =>
      db.updatePhaseStatus(
        args.phase_id as number,
        args.status as "not_started" | "in_progress" | "completed"
      )
    );

    // Milestones
    case "list_milestones": return handle(() =>
      db.listMilestones(args.goal_id as number, args.phase_id as number | undefined)
    );

    case "add_milestone": return handle(() => db.addMilestone({
      goal_id: args.goal_id as number,
      phase_id: args.phase_id as number | undefined,
      title: args.title as string,
      description: args.description as string | undefined,
      order_num: args.order_num as number | undefined,
    }));

    case "complete_milestone": return handle(() =>
      db.completeMilestone(args.milestone_id as number, (args.completed as boolean) ?? true)
    );

    // Tasks
    case "list_tasks": return handle(() =>
      db.listTasks(args.date as string | undefined, args.goal_id as number | undefined)
    );

    case "add_task": return handle(() => db.addTask({
      title: args.title as string,
      description: args.description as string | undefined,
      goal_id: args.goal_id as number | undefined,
      phase_id: args.phase_id as number | undefined,
      milestone_id: args.milestone_id as number | undefined,
      category: args.category as string | undefined,
      priority: args.priority as string | undefined,
      time_estimate: args.time_estimate as string | undefined,
      task_date: args.task_date as string | undefined,
      resources: args.resources as object[] | undefined,
    }));

    case "complete_task": return handle(() =>
      db.completeTask(args.task_id as number, (args.completed as boolean) ?? true)
    );

    case "delete_task": return handle(() => db.deleteTask(args.task_id as number));

    // Ideas
    case "list_ideas": return handle(() => db.listIdeas(args.verdict as string | undefined));

    case "add_idea": return handle(() => db.addIdea({
      title: args.title as string,
      description: args.description as string | undefined,
    }));

    case "update_idea": return handle(() => db.updateIdea(args.idea_id as number, {
      verdict: args.verdict as string | undefined,
      score: args.score as number | undefined,
      reasoning: args.reasoning as string | undefined,
      integration_note: args.integration_note as string | undefined,
      risk_note: args.risk_note as string | undefined,
      resources: args.resources as object[] | undefined,
      related_goal_ids: args.related_goal_ids as number[] | undefined,
    }));

    case "delete_idea": return handle(() => db.deleteIdea(args.idea_id as number));

    // Reflections
    case "log_reflection": return handle(async () => {
      const result = await db.logReflection({
        score: args.score as number,
        summary: args.summary as string | undefined,
        wins: args.wins as string[] | undefined,
        gaps: args.gaps as string[] | undefined,
        tomorrow_priority: args.tomorrow_priority as string | undefined,
        notes: args.notes as string | undefined,
        reflection_date: args.reflection_date as string | undefined,
        goal_progress_deltas: args.goal_progress_deltas as Record<string, number> | undefined,
      });

      // Apply progress deltas to goals
      if (args.goal_progress_deltas) {
        const deltas = args.goal_progress_deltas as Record<string, number>;
        for (const [goalId, delta] of Object.entries(deltas)) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const goal = (await db.getGoal(Number(goalId))) as any;
          if (goal) {
            const newProgress = Math.min(100, Math.max(0, (goal.progress ?? 0) + delta));
            await db.updateGoal(Number(goalId), { progress: newProgress });
          }
        }
      }

      return result;
    });

    case "get_reflections": return handle(() => db.getReflections(args.limit as number | undefined));

    default:
      return err(`Unknown tool: ${name}`);
  }
}

// ── Build and return the MCP Server ──────────────────────────────────────────
export function createServer() {
  const server = new Server(
    { name: "nudge-mcp", version: "1.0.0" },
    { capabilities: { tools: {} } }
  );

  server.setRequestHandler(ListToolsRequestSchema, async () => ({ tools: TOOLS }));

  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args = {} } = request.params;
    return callTool(name, args as Record<string, unknown>);
  });

  return server;
}
