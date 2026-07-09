import { useCallback, useEffect, useMemo, useRef, useState, type DragEvent } from 'react';
import { useAppState } from '../../hooks/useAppState';
import {
  BLOCK_DRAG_TYPE,
  getScheduleRangeFromDrop,
  GRID_END,
  GRID_START,
  HOUR_HEIGHT,
  TASK_DRAG_TYPE,
} from '../../lib/calendarDrag';
import { estimateTaskDurationMinutes } from '../../lib/scheduleTasks';
import { DEMO_TASKS } from '../../lib/demoTimerView';
import type { ScheduledBlock } from '../../lib/types';
import { PROJECT_COLORS } from '../../lib/types';
import { CalendarBlock } from './CalendarBlock';
import { CurrentTimeIndicator } from './CurrentTimeIndicator';
import styles from './CalendarGrid.module.css';

const EXPLORE_BLOCK_ID = 'explore-running';
const DEMO_PROJECT = 'Marketing campaign';

let panelBlockCounter = 0;

function formatHourLabel(hour: number): string {
  return `${String(hour).padStart(2, '0')}:00`;
}

function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function getCenteredDaysAroundToday(): Date[] {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return Array.from({ length: 5 }, (_, i) => {
    const day = new Date(today);
    day.setDate(today.getDate() + (i - 2));
    return day;
  });
}

function getDayName(date: Date): string {
  return date.toLocaleDateString('en-US', { weekday: 'short' });
}

function createExploreBlock(
  startedAt: number,
  elapsed: number,
  description: string,
): ScheduledBlock {
  const start = new Date(startedAt);
  const end = new Date(startedAt + Math.max(elapsed, 1000));

  return {
    id: EXPLORE_BLOCK_ID,
    taskId: 'running-timer',
    project: 'Without project',
    task: description,
    start,
    end,
    status: 'accepted',
    color: '#c8c6c8',
  };
}

function projectColor(project: string, projects: string[]): string {
  const index = projects.indexOf(project);
  return PROJECT_COLORS[(index >= 0 ? index : 0) % PROJECT_COLORS.length];
}

export function CalendarGrid() {
  const { state, dispatch } = useAppState();
  const { scheduledBlocks, exploreTimer, confirmedTasks, skippedOnboarding } = state;
  const scrollRef = useRef<HTMLDivElement>(null);
  const [draggingBlockId, setDraggingBlockId] = useState<string | null>(null);
  const [dropDayIndex, setDropDayIndex] = useState<number | null>(null);

  const weekDays = useMemo(() => getCenteredDaysAroundToday(), []);

  const projectNames = useMemo(
    () => [...new Set(confirmedTasks.map((task) => task.project))],
    [confirmedTasks],
  );

  const hours = Array.from(
    { length: GRID_END - GRID_START },
    (_, i) => GRID_START + i,
  );

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    const focusHour = Math.max(
      GRID_START,
      Math.min(GRID_END - 1, new Date().getHours() - 2),
    );
    el.scrollTop = focusHour * HOUR_HEIGHT;
  }, []);

  const blocks = useMemo(() => {
    const list = [...scheduledBlocks];
    if (exploreTimer.running) {
      list.push(
        createExploreBlock(
          exploreTimer.startedAt,
          exploreTimer.elapsed,
          exploreTimer.description,
        ),
      );
    }
    return list;
  }, [
    scheduledBlocks,
    exploreTimer.running,
    exploreTimer.startedAt,
    exploreTimer.elapsed,
    exploreTimer.description,
  ]);

  const blocksByDay = useMemo(() => {
    const map = new Map<number, ScheduledBlock[]>();
    for (const block of blocks) {
      const dayIndex = weekDays.findIndex((d) => isSameDay(d, block.start));
      if (dayIndex >= 0) {
        const list = map.get(dayIndex) ?? [];
        list.push(block);
        map.set(dayIndex, list);
      }
    }
    return map;
  }, [blocks, weekDays]);

  const handleDragOver = useCallback((event: DragEvent<HTMLDivElement>, dayIndex: number) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = event.dataTransfer.types.includes(TASK_DRAG_TYPE)
      ? 'copy'
      : 'move';
    setDropDayIndex(dayIndex);
  }, []);

  const resolvePanelTask = useCallback(
    (taskId: string) => {
      const confirmed = confirmedTasks.find((item) => item.id === taskId);
      if (confirmed) return confirmed;

      if (skippedOnboarding && taskId.startsWith('demo-')) {
        const index = Number.parseInt(taskId.replace('demo-', ''), 10);
        const name = DEMO_TASKS[index];
        if (name) {
          return { id: taskId, name, project: DEMO_PROJECT };
        }
      }

      return null;
    },
    [confirmedTasks, skippedOnboarding],
  );

  const handleDrop = useCallback(
    (event: DragEvent<HTMLDivElement>, dayIndex: number) => {
      event.preventDefault();
      setDropDayIndex(null);
      setDraggingBlockId(null);

      const taskId = event.dataTransfer.getData(TASK_DRAG_TYPE);
      if (taskId) {
        const task = resolvePanelTask(taskId);
        if (!task) return;

        const durationMinutes = estimateTaskDurationMinutes(task.name);
        const range = getScheduleRangeFromDrop(event, dayIndex, weekDays, durationMinutes);
        if (!range) return;

        const existing = scheduledBlocks.find((block) => block.taskId === task.id);
        if (existing) {
          dispatch({
            type: 'RESCHEDULE_BLOCK',
            payload: { id: existing.id, start: range.start, end: range.end },
          });
          return;
        }

        dispatch({
          type: 'ADD_SCHEDULED_BLOCK',
          payload: {
            id: `block-panel-${++panelBlockCounter}`,
            taskId: task.id,
            project: task.project,
            task: task.name,
            start: range.start,
            end: range.end,
            status: 'accepted',
            color: projectColor(task.project, projectNames),
          },
        });
        return;
      }

      const blockId = event.dataTransfer.getData(BLOCK_DRAG_TYPE);
      if (!blockId || blockId === EXPLORE_BLOCK_ID) return;

      const block = scheduledBlocks.find((item) => item.id === blockId);
      if (!block) return;

      const durationMinutes = Math.max(
        15,
        Math.round((block.end.getTime() - block.start.getTime()) / 60_000),
      );
      const range = getScheduleRangeFromDrop(event, dayIndex, weekDays, durationMinutes);
      if (!range) return;

      dispatch({
        type: 'RESCHEDULE_BLOCK',
        payload: { id: blockId, start: range.start, end: range.end },
      });
    },
    [dispatch, projectNames, resolvePanelTask, scheduledBlocks, weekDays],
  );

  const handleDragLeave = useCallback((event: DragEvent<HTMLDivElement>) => {
    if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
      setDropDayIndex(null);
    }
  }, []);

  const today = new Date();
  const todayColumnIndex = weekDays.findIndex((day) => isSameDay(day, today));

  return (
    <div className={styles.gridWrap}>
      <div className={styles.gridScroll} ref={scrollRef}>
        <div className={styles.headerRow}>
          <div className={styles.headerGutter}>
            <button type="button" className={styles.zoomBtn} aria-label="Zoom out">
              −
            </button>
            <button type="button" className={styles.zoomBtn} aria-label="Zoom in">
              +
            </button>
          </div>
          <div className={styles.headerDays}>
            {weekDays.map((day) => {
              const isToday = isSameDay(day, today);
              return (
                <div key={day.toDateString()} className={styles.headerDay}>
                  <div
                    className={`${styles.dayNumber} ${isToday ? styles.dayNumberToday : ''}`}
                  >
                    {day.getDate()}
                  </div>
                  <div className={styles.dayName}>{getDayName(day)}</div>
                </div>
              );
            })}
          </div>
        </div>

        <div className={styles.grid}>
          <div className={styles.timeGutter}>
            {hours.map((h) => (
              <div key={h} className={styles.timeLabel}>
                {formatHourLabel(h)}
              </div>
            ))}
          </div>

          <div className={styles.dayColumns}>
            {weekDays.map((_day, dayIndex) => (
              <div
                key={dayIndex}
                className={`${styles.dayColumn} ${dropDayIndex === dayIndex ? styles.dayColumnDropTarget : ''}`}
                onDragOver={(event) => handleDragOver(event, dayIndex)}
                onDragLeave={handleDragLeave}
                onDrop={(event) => handleDrop(event, dayIndex)}
              >
                {hours.map((h) => (
                  <div key={h} className={styles.hourCell} />
                ))}

                {dayIndex === todayColumnIndex && !exploreTimer.running && (
                  <CurrentTimeIndicator />
                )}

                {(blocksByDay.get(dayIndex) ?? []).map((block) => {
                  const startHour =
                    block.start.getHours() + block.start.getMinutes() / 60;
                  const endHour =
                    block.end.getHours() + block.end.getMinutes() / 60;
                  const top = (startHour - GRID_START) * HOUR_HEIGHT;
                  const height = Math.max((endHour - startHour) * HOUR_HEIGHT, 28);
                  const isExploreRunning = block.id === EXPLORE_BLOCK_ID;

                  return (
                    <CalendarBlock
                      key={block.id}
                      block={block}
                      top={top}
                      height={isExploreRunning ? 32 : height}
                      runningExplore={isExploreRunning}
                      elapsedMs={isExploreRunning ? exploreTimer.elapsed : undefined}
                      draggable={!isExploreRunning}
                      isDragging={draggingBlockId === block.id}
                      dragType={BLOCK_DRAG_TYPE}
                      onDragStart={() => setDraggingBlockId(block.id)}
                      onDragEnd={() => {
                        setDraggingBlockId(null);
                        setDropDayIndex(null);
                      }}
                    />
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
