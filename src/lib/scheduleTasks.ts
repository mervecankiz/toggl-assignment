import type { ProjectDraft, ScheduledBlock, SetupDraft, SuggestedFirstTask } from './types';
import { PROJECT_COLORS } from './types';

const WORK_START = 9;
const WORK_END = 18;

function isWeekend(date: Date): boolean {
  const day = date.getDay();
  return day === 0 || day === 6;
}

function nextWorkingDay(date: Date): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + 1);
  while (isWeekend(result)) {
    result.setDate(result.getDate() + 1);
  }
  result.setHours(WORK_START, 0, 0, 0);
  return result;
}

function addMinutes(date: Date, minutes: number): Date {
  return new Date(date.getTime() + minutes * 60_000);
}

function workDayStart(date: Date): Date {
  const start = new Date(date);
  start.setHours(WORK_START, 0, 0, 0);
  return start;
}

function workDayEnd(date: Date): Date {
  const end = new Date(date);
  end.setHours(WORK_END, 0, 0, 0);
  return end;
}

function normalizeToWorkingHours(cursor: Date): Date {
  let slot = new Date(cursor);

  if (isWeekend(slot)) {
    return nextWorkingDay(slot);
  }

  const dayStart = workDayStart(slot);
  if (slot < dayStart) {
    return dayStart;
  }

  if (slot >= workDayEnd(slot)) {
    return nextWorkingDay(slot);
  }

  return slot;
}

function getInitialScheduleCursor(): Date {
  const now = new Date();
  let slot = normalizeToWorkingHours(now);

  if (slot.getTime() === now.getTime() || slot <= now) {
    const remainder = now.getMinutes() % 15;
    if (remainder !== 0 || now.getSeconds() > 0 || now.getMilliseconds() > 0) {
      slot = addMinutes(now, 15 - remainder);
      slot.setSeconds(0, 0);
    } else {
      slot = new Date(now);
      slot.setSeconds(0, 0);
    }
    slot = normalizeToWorkingHours(slot);
  }

  return slot;
}

export function estimateTaskDurationMinutes(task: string): number {
  const name = task.toLowerCase();

  if (/\b(call|kickoff|sync|meeting)\b/.test(name)) return 45;
  if (/\b(review|triage|audit|bug)\b/.test(name)) return 60;
  if (/\b(wireframe|design|draft|homepage|content|promotional|materials)\b/.test(name)) {
    return 90;
  }
  if (/\b(report|writeup|documentation|deck|analysis|analyze)\b/.test(name)) return 75;
  if (/\b(planning|migration|script|launch|campaign|schedule|timeline)\b/.test(name)) {
    return 90;
  }

  return 60;
}

function gapAfterTaskMinutes(task: string, durationMinutes: number): number {
  const name = task.toLowerCase();

  if (durationMinutes >= 90) return 30;
  if (/\b(call|kickoff|sync|meeting)\b/.test(name)) return 15;
  return 20;
}

function collectTasks(
  projects: ProjectDraft[],
  suggested: SuggestedFirstTask,
): { project: string; task: string }[] {
  const all: { project: string; task: string }[] = [];
  const seen = new Set<string>();

  const add = (project: string, task: string) => {
    const key = `${project}::${task}`;
    if (!seen.has(key)) {
      seen.add(key);
      all.push({ project, task });
    }
  };

  add(suggested.project, suggested.task);

  for (const p of projects) {
    for (const t of p.tasks) {
      add(p.name, t.name);
    }
  }

  return all;
}

let blockIdCounter = 0;

export function scheduleTasks(
  draft: SetupDraft,
  options?: { reserveRunningTimerMinutes?: number },
): ScheduledBlock[] {
  const tasks = collectTasks(draft.projects, draft.suggestedFirstTask);
  const colorMap = new Map<string, string>();
  draft.projects.forEach((p, i) => {
    colorMap.set(p.name, PROJECT_COLORS[i % PROJECT_COLORS.length]);
  });

  const blocks: ScheduledBlock[] = [];
  let cursor = getInitialScheduleCursor();

  if (options?.reserveRunningTimerMinutes) {
    cursor = addMinutes(cursor, options.reserveRunningTimerMinutes);
    cursor = normalizeToWorkingHours(cursor);
  }

  for (const { project, task } of tasks) {
    const durationMinutes = estimateTaskDurationMinutes(task);
    let start = normalizeToWorkingHours(cursor);
    let end = addMinutes(start, durationMinutes);

    if (end > workDayEnd(start)) {
      start = nextWorkingDay(start);
      end = addMinutes(start, durationMinutes);
    }

    blocks.push({
      id: `block-${++blockIdCounter}`,
      taskId: `${project}::${task}`,
      project,
      task,
      start,
      end,
      status: 'suggested',
      color: colorMap.get(project) ?? PROJECT_COLORS[0],
    });

    cursor = addMinutes(end, gapAfterTaskMinutes(task, durationMinutes));
    cursor = normalizeToWorkingHours(cursor);
  }

  return blocks;
}

export function formatDuration(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return `${hours}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

export function formatTimeShort(date: Date): string {
  return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
}

export function formatBlockDuration(start: Date, end: Date): string {
  const mins = Math.round((end.getTime() - start.getTime()) / 60000);
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  if (h > 0 && m > 0) return `${h}h ${m}m`;
  if (h > 0) return `${h}h`;
  return `${m}m`;
}
