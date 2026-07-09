import type { ProjectDraft, ScheduledBlock, SetupDraft, SuggestedFirstTask } from './types';
import { PROJECT_COLORS } from './types';

const WORK_START = 9;
const WORK_END = 18;
const BLOCK_HOURS = 1;

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

function getNextWorkingSlot(from: Date = new Date()): Date {
  const slot = new Date(from);

  if (isWeekend(slot)) {
    return nextWorkingDay(slot);
  }

  const hour = slot.getHours();
  const minute = slot.getMinutes();

  if (hour >= WORK_END || (hour < WORK_START)) {
    if (hour >= WORK_END) {
      return nextWorkingDay(slot);
    }
    slot.setHours(WORK_START, 0, 0, 0);
    return slot;
  }

  if (minute > 0) {
    slot.setHours(hour + 1, 0, 0, 0);
  } else {
    slot.setMinutes(0, 0, 0);
  }

  if (slot.getHours() >= WORK_END) {
    return nextWorkingDay(slot);
  }

  return slot;
}

function advanceSlot(current: Date): Date {
  const next = new Date(current);
  next.setHours(next.getHours() + BLOCK_HOURS);

  if (next.getHours() >= WORK_END) {
    return nextWorkingDay(next);
  }

  return next;
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

export function scheduleTasks(draft: SetupDraft): ScheduledBlock[] {
  const tasks = collectTasks(draft.projects, draft.suggestedFirstTask);
  const colorMap = new Map<string, string>();
  draft.projects.forEach((p, i) => {
    colorMap.set(p.name, PROJECT_COLORS[i % PROJECT_COLORS.length]);
  });

  const blocks: ScheduledBlock[] = [];
  let slot = getNextWorkingSlot();

  for (const { project, task } of tasks) {
    const start = new Date(slot);
    const end = new Date(slot);
    end.setHours(end.getHours() + BLOCK_HOURS);

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

    slot = advanceSlot(slot);
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
