import type { DragEvent } from 'react';

export const BLOCK_DRAG_TYPE = 'application/x-calendar-block-id';
export const TASK_DRAG_TYPE = 'application/x-task-panel-id';

export const GRID_START = 0;
export const GRID_END = 24;
export const HOUR_HEIGHT = 60;

export function snapToQuarterHour(minutes: number): number {
  return Math.round(minutes / 15) * 15;
}

export function getScheduleRangeFromDrop(
  event: DragEvent<HTMLDivElement>,
  dayIndex: number,
  weekDays: Date[],
  durationMinutes: number,
): { start: Date; end: Date } | null {
  const column = event.currentTarget;
  const rect = column.getBoundingClientRect();
  const y = event.clientY - rect.top;
  const minutesFromGridStart = (y / HOUR_HEIGHT) * 60;

  let startMinutes = snapToQuarterHour(GRID_START * 60 + minutesFromGridStart);
  const maxStartMinutes = GRID_END * 60 - durationMinutes;
  startMinutes = Math.max(GRID_START * 60, Math.min(maxStartMinutes, startMinutes));

  const day = weekDays[dayIndex];
  if (!day) return null;

  const start = new Date(day);
  start.setHours(Math.floor(startMinutes / 60), startMinutes % 60, 0, 0);
  const end = new Date(start.getTime() + durationMinutes * 60_000);

  return { start, end };
}
