import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { SEED_GOALS, SEED_PHASES } from "./seed.js";

// ── Supabase client (singleton) ───────────────────────────────────────────────
let _supabase: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient {
  if (!_supabase) {
    const url = process.env.SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_KEY;
    if (!url || !key) {
      throw new Error(
        "Missing SUPABASE_URL or SUPABASE_SERVICE_KEY environment variables.\n" +
        "Copy .env.example to .env and fill in your Supabase credentials."
      );
    }
    _supabase = createClient(url, key);
  }
  return _supabase;
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function today(): string {
  return new Date().toISOString().split("T")[0];
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function q<T = any>(
  builder: PromiseLike<{ data: T | null; error: { message?: string } | null }>
): Promise<T> {
  const { data, error } = await builder;
  if (error) throw new Error(error?.message ?? String(error));
  return data as T;
}

// ── Profile ───────────────────────────────────────────────────────────────────
export async function getProfile() {
  const sb = getSupabase();
  const { data } = await sb.from("profile").select("*").limit(1).single();
  return data;
}

export async function upsertProfile(fields: {
  name?: string;
  skills?: string[];
  current_focus?: string;
  context?: string;
  setup_complete?: boolean;
}) {
  const sb = getSupabase();
  const existing = await getProfile();
  if (existing) {
    return q(sb.from("profile").update({ ...fields, updated_at: new Date().toISOString() }).eq("id", existing.id).select().single());
  }
  return q(sb.from("profile").insert({ ...fields, setup_complete: fields.setup_complete ?? false }).select().single());
}

// ── Goals ─────────────────────────────────────────────────────────────────────
export async function listGoals(status?: string) {
  const sb = getSupabase();
  let query = sb.from("goals").select("*").order("sort_order").order("created_at");
  if (status) query = query.eq("status", status);
  return q(query);
}

export async function getGoal(id: number) {
  return q(getSupabase().from("goals").select("*").eq("id", id).single());
}

export async function addGoal(fields: {
  title: string;
  description?: string;
  category?: string;
  total_phases?: number;
  target_date?: string;
  sort_order?: number;
}) {
  return q(getSupabase().from("goals").insert(fields).select().single());
}

export async function updateGoal(id: number, fields: {
  title?: string;
  description?: string;
  category?: string;
  status?: string;
  progress?: number;
  current_phase?: number;
  target_date?: string;
}) {
  return q(getSupabase().from("goals").update({ ...fields, updated_at: new Date().toISOString() }).eq("id", id).select().single());
}

// ── Phases ────────────────────────────────────────────────────────────────────
export async function listPhases(goalId: number) {
  return q(getSupabase().from("phases").select("*").eq("goal_id", goalId).order("phase_number"));
}

export async function getPhase(id: number) {
  return q(getSupabase().from("phases").select("*").eq("id", id).single());
}

export async function addPhase(fields: {
  goal_id: number;
  phase_number: number;
  title: string;
  description?: string;
  timeline?: string;
  concepts?: string[];
  projects?: string[];
  interview_prep?: string[];
  resources?: object[];
}) {
  return q(getSupabase().from("phases").insert(fields).select().single());
}

export async function updatePhaseStatus(id: number, status: "not_started" | "in_progress" | "completed") {
  const fields: Record<string, unknown> = { status };
  if (status === "in_progress") fields.started_at = new Date().toISOString();
  if (status === "completed") fields.completed_at = new Date().toISOString();
  return q(getSupabase().from("phases").update(fields).eq("id", id).select().single());
}

// ── Milestones ────────────────────────────────────────────────────────────────
export async function listMilestones(goalId: number, phaseId?: number) {
  const sb = getSupabase();
  let query = sb.from("milestones").select("*").eq("goal_id", goalId).order("order_num");
  if (phaseId) query = query.eq("phase_id", phaseId);
  return q(query);
}

export async function addMilestone(fields: {
  goal_id: number;
  phase_id?: number;
  title: string;
  description?: string;
  order_num?: number;
}) {
  return q(getSupabase().from("milestones").insert(fields).select().single());
}

export async function completeMilestone(id: number, completed: boolean) {
  const fields: Record<string, unknown> = { completed };
  if (completed) fields.completed_at = new Date().toISOString();
  else fields.completed_at = null;
  return q(getSupabase().from("milestones").update(fields).eq("id", id).select().single());
}

// ── Tasks ─────────────────────────────────────────────────────────────────────
export async function listTasks(date?: string, goalId?: number) {
  const sb = getSupabase();
  let query = sb.from("tasks").select("*, goals(title)").order("priority").order("created_at");
  query = query.eq("task_date", date ?? today());
  if (goalId) query = query.eq("goal_id", goalId);
  return q(query);
}

export async function addTask(fields: {
  title: string;
  description?: string;
  goal_id?: number;
  phase_id?: number;
  milestone_id?: number;
  category?: string;
  priority?: string;
  time_estimate?: string;
  resources?: object[];
  task_date?: string;
}) {
  return q(getSupabase().from("tasks").insert({ ...fields, task_date: fields.task_date ?? today() }).select().single());
}

export async function completeTask(id: number, completed: boolean) {
  const fields: Record<string, unknown> = { completed };
  if (completed) fields.completed_at = new Date().toISOString();
  else fields.completed_at = null;
  return q(getSupabase().from("tasks").update(fields).eq("id", id).select().single());
}

export async function deleteTask(id: number) {
  return q(getSupabase().from("tasks").delete().eq("id", id).select().single());
}

// ── Ideas ─────────────────────────────────────────────────────────────────────
export async function listIdeas(verdict?: string) {
  const sb = getSupabase();
  let query = sb.from("ideas").select("*").order("created_at", { ascending: false });
  if (verdict) query = query.eq("verdict", verdict);
  return q(query);
}

export async function addIdea(fields: {
  title: string;
  description?: string;
}) {
  return q(getSupabase().from("ideas").insert(fields).select().single());
}

export async function updateIdea(id: number, fields: {
  verdict?: string;
  score?: number;
  reasoning?: string;
  integration_note?: string;
  risk_note?: string;
  resources?: object[];
  related_goal_ids?: number[];
}) {
  return q(getSupabase().from("ideas").update({ ...fields, updated_at: new Date().toISOString() }).eq("id", id).select().single());
}

export async function deleteIdea(id: number) {
  return q(getSupabase().from("ideas").delete().eq("id", id).select().single());
}

// ── Reflections ───────────────────────────────────────────────────────────────
export async function logReflection(fields: {
  reflection_date?: string;
  score: number;
  summary?: string;
  wins?: string[];
  gaps?: string[];
  tomorrow_priority?: string;
  notes?: string;
  goal_progress_deltas?: Record<string, number>;
}) {
  const date = fields.reflection_date ?? today();
  const sb = getSupabase();
  // Upsert by date
  const { data: existing } = await sb.from("reflections").select("id").eq("reflection_date", date).single();
  if (existing) {
    return q(sb.from("reflections").update({ ...fields, reflection_date: date }).eq("id", existing.id).select().single());
  }
  return q(sb.from("reflections").insert({ ...fields, reflection_date: date }).select().single());
}

export async function getReflections(limit = 14) {
  return q(getSupabase().from("reflections").select("*").order("reflection_date", { ascending: false }).limit(limit));
}

// ── Dashboard ─────────────────────────────────────────────────────────────────
export async function getDashboard() {
  const sb = getSupabase();

  const [profile, goals, todayTasks, recentReflections, ideas] = await Promise.all([
    getProfile(),
    listGoals("active"),
    listTasks(today()),
    getReflections(7),
    sb.from("ideas").select("id, title, verdict, score").order("created_at", { ascending: false }).limit(5),
  ]);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const tasksArr: any[] = (todayTasks as any[]) ?? [];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const goalsArr: any[] = (goals as any[]) ?? [];

  // Per-goal phase summary
  const goalSummaries = await Promise.all(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    goalsArr.map(async (g: any) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const phases: any[] = ((await listPhases(g.id)) as any[]) ?? [];
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const milestones: any[] = ((await listMilestones(g.id)) as any[]) ?? [];
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const activePhase = phases.find((p: any) => p.phase_number === g.current_phase);
      return {
        id: g.id,
        title: g.title,
        progress: g.progress,
        status: g.status,
        category: g.category,
        current_phase: g.current_phase,
        total_phases: g.total_phases,
        active_phase_title: activePhase?.title ?? null,
        active_phase_timeline: activePhase?.timeline ?? null,
        milestones_total: milestones.length,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        milestones_done: milestones.filter((m: any) => m.completed).length,
      };
    })
  );

  return {
    date: today(),
    profile: profile ?? { name: "Unknown", setup_complete: false },
    goals: goalSummaries,
    today_tasks: {
      total: tasksArr.length,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      completed: tasksArr.filter((t: any) => t.completed).length,
      tasks: tasksArr,
    },
    recent_reflections: recentReflections ?? [],
    recent_ideas: ideas.data ?? [],
  };
}

// ── Seed from career_agent ────────────────────────────────────────────────────
export async function seedFromCareerAgent(userName: string, userSkills: string[], userContext: string) {
  // 1. Set up profile
  await upsertProfile({
    name: userName,
    skills: userSkills,
    context: userContext,
    current_focus: "Phase 1: Foundation + Travel Planner (Weeks 1–4)",
    setup_complete: true,
  });

  // 2. Insert goals
  const goalIds: number[] = [];
  for (const g of SEED_GOALS) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const created = (await addGoal(g)) as any;
    goalIds.push(created.id);
  }

  // 3. Insert phases for goal 0 (primary career goal)
  const primaryGoalId = goalIds[0];
  for (const phase of SEED_PHASES) {
    const phaseGoalId = goalIds[phase.goal_index];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const created = (await addPhase({
      goal_id: phaseGoalId,
      phase_number: phase.phase_number,
      title: phase.title,
      description: phase.description,
      timeline: phase.timeline,
      concepts: phase.concepts,
      projects: phase.projects,
      interview_prep: phase.interview_prep,
      resources: phase.resources,
    })) as any;

    // Set phase 1 as in_progress for primary goal
    if (phase.phase_number === 1 && phaseGoalId === primaryGoalId) {
      await updatePhaseStatus(created.id, "in_progress");
      await updateGoal(primaryGoalId, { current_phase: 1 });
    }

    // 4. Add milestones for each phase
    for (let i = 0; i < phase.milestones.length; i++) {
      await addMilestone({
        goal_id: phaseGoalId,
        phase_id: created.id,
        title: phase.milestones[i],
        order_num: i + 1,
      });
    }
  }

  return {
    goals_created: goalIds.length,
    phases_created: SEED_PHASES.length,
    primary_goal_id: primaryGoalId,
  };
}

// ── Reset all data ────────────────────────────────────────────────────────────
export async function resetAllData() {
  const sb = getSupabase();
  // Order matters — respect foreign keys
  await sb.from("reflections").delete().neq("id", 0);
  await sb.from("ideas").delete().neq("id", 0);
  await sb.from("tasks").delete().neq("id", 0);
  await sb.from("milestones").delete().neq("id", 0);
  await sb.from("phases").delete().neq("id", 0);
  await sb.from("goals").delete().neq("id", 0);
  await sb.from("profile").delete().neq("id", 0);
  return { reset: true };
}
