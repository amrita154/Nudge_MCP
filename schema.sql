-- ─────────────────────────────────────────────────────────────────
-- NUDGE MCP — Supabase Schema
-- Run this in: Supabase → SQL Editor → New Query → Run
-- ─────────────────────────────────────────────────────────────────

-- ── User Profile (single row per user) ───────────────────────────
create table if not exists profile (
  id            serial primary key,
  name          text,
  skills        text[]   default '{}',
  current_focus text,
  context       text,     -- freeform background Claude reads for context
  setup_complete boolean  default false,
  created_at    timestamptz default now(),
  updated_at    timestamptz default now()
);

-- ── Goals ────────────────────────────────────────────────────────
create table if not exists goals (
  id              serial primary key,
  title           text    not null,
  description     text,
  category        text    default 'career',  -- career, learning, health, finance, personal
  status          text    default 'active',  -- active, paused, completed, archived
  progress        integer default 0 check (progress >= 0 and progress <= 100),
  current_phase   integer default 1,         -- which phase number is active
  total_phases    integer default 1,
  target_date     date,
  sort_order      integer default 0,
  created_at      timestamptz default now(),
  updated_at      timestamptz default now()
);

-- ── Phases (stages within a goal) ────────────────────────────────
-- Each goal has N phases. Users progress through them sequentially.
create table if not exists phases (
  id              serial primary key,
  goal_id         integer references goals(id) on delete cascade,
  phase_number    integer not null,
  title           text    not null,
  description     text,                      -- goal/objective for this phase
  timeline        text,                      -- e.g. "Weeks 1–4"
  status          text    default 'not_started', -- not_started, in_progress, completed
  concepts        text[]  default '{}',      -- key concepts to learn
  projects        text[]  default '{}',      -- projects to ship
  interview_prep  text[]  default '{}',      -- interview / external goals
  resources       jsonb   default '[]',      -- [{title,url,time,type,note}]
  started_at      timestamptz,
  completed_at    timestamptz,
  created_at      timestamptz default now()
);

-- ── Milestones (concrete checkpoints within phases) ───────────────
create table if not exists milestones (
  id           serial primary key,
  goal_id      integer references goals(id)   on delete cascade,
  phase_id     integer references phases(id)  on delete cascade,
  title        text    not null,
  description  text,
  order_num    integer default 0,
  completed    boolean default false,
  completed_at timestamptz,
  created_at   timestamptz default now()
);

-- ── Daily Tasks ───────────────────────────────────────────────────
create table if not exists tasks (
  id            serial primary key,
  goal_id       integer references goals(id)      on delete set null,
  phase_id      integer references phases(id)     on delete set null,
  milestone_id  integer references milestones(id) on delete set null,
  title         text    not null,
  description   text,
  category      text    default 'learn',    -- learn, build, review, admin, health
  priority      text    default 'medium',   -- high, medium, low
  time_estimate text,                       -- e.g. "45min", "1hr"
  resources     jsonb   default '[]',       -- [{title,url,type,why}]
  task_date     date    not null default current_date,
  completed     boolean default false,
  completed_at  timestamptz,
  created_at    timestamptz default now()
);

-- ── Ideas ─────────────────────────────────────────────────────────
create table if not exists ideas (
  id               serial primary key,
  title            text    not null,
  description      text,
  verdict          text,    -- pursue_now, pursue_later, park, skip
  score            integer  check (score >= 0 and score <= 10),
  reasoning        text,
  integration_note text,    -- how to integrate if pursuing
  risk_note        text,    -- cost of chasing it now
  resources        jsonb    default '[]',
  related_goal_ids integer[] default '{}',
  created_at       timestamptz default now(),
  updated_at       timestamptz default now()
);

-- ── Daily Reflections ─────────────────────────────────────────────
create table if not exists reflections (
  id                    serial primary key,
  reflection_date       date    not null unique,
  score                 integer  check (score >= 1 and score <= 10),
  summary               text,
  wins                  text[]  default '{}',
  gaps                  text[]  default '{}',
  tomorrow_priority     text,
  notes                 text,
  goal_progress_deltas  jsonb   default '{}',  -- {goal_id: points_added}
  created_at            timestamptz default now()
);

-- ── Indexes ───────────────────────────────────────────────────────
create index if not exists idx_phases_goal      on phases(goal_id);
create index if not exists idx_milestones_goal  on milestones(goal_id);
create index if not exists idx_milestones_phase on milestones(phase_id);
create index if not exists idx_tasks_date       on tasks(task_date);
create index if not exists idx_tasks_goal       on tasks(goal_id);
create index if not exists idx_reflections_date on reflections(reflection_date);
