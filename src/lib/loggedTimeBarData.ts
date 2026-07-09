import type { AppState, ScheduledBlock } from './types';
import { formatReportDuration } from './reportsData';

export interface LoggedTimeSegment {
  color: string;
  ms: number;
  widthPercent: number;
}

export interface LoggedTimeBarData {
  totalMs: number;
  totalLabel: string;
  segments: LoggedTimeSegment[];
}

function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

export function getCenteredDaysAroundToday(): Date[] {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return Array.from({ length: 5 }, (_, i) => {
    const day = new Date(today);
    day.setDate(today.getDate() + (i - 2));
    return day;
  });
}

function blockDurationMs(block: ScheduledBlock): number {
  return Math.max(block.end.getTime() - block.start.getTime(), 0);
}

function getLoggedBlocks(state: AppState): ScheduledBlock[] {
  const accepted = state.scheduledBlocks.filter((block) => block.status === 'accepted');

  if (!state.exploreTimer.running) {
    return accepted;
  }

  const start = new Date(state.exploreTimer.startedAt);
  const end = new Date(state.exploreTimer.startedAt + Math.max(state.exploreTimer.elapsed, 1000));

  return [
    ...accepted,
    {
      id: 'logged-bar-running-timer',
      taskId: 'running-timer',
      project: 'Without project',
      task: state.exploreTimer.description,
      start,
      end,
      status: 'accepted',
      color: '#c8c6c8',
    },
  ];
}

export function buildLoggedTimeBarData(state: AppState): LoggedTimeBarData {
  const weekDays = getCenteredDaysAroundToday();
  const blocks = getLoggedBlocks(state).filter((block) =>
    weekDays.some((day) => isSameDay(day, block.start)),
  );

  const colorTotals = new Map<string, number>();

  for (const block of blocks) {
    colorTotals.set(block.color, (colorTotals.get(block.color) ?? 0) + blockDurationMs(block));
  }

  const totalMs = Array.from(colorTotals.values()).reduce((sum, ms) => sum + ms, 0);

  const segments = Array.from(colorTotals.entries())
    .map(([color, ms]) => ({
      color,
      ms,
      widthPercent: totalMs > 0 ? (ms / totalMs) * 100 : 0,
    }))
    .sort((a, b) => b.ms - a.ms);

  return {
    totalMs,
    totalLabel: totalMs > 0 ? formatReportDuration(totalMs) : '0m',
    segments,
  };
}
