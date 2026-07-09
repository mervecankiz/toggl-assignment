import { useMemo } from 'react';
import { useAppState } from '../../hooks/useAppState';
import {
  DEMO_CALENDAR_BLOCKS,
  DEMO_WEEK_DAYS,
} from '../../lib/demoTimerView';
import { CalendarBlock } from './CalendarBlock';
import styles from './CalendarGrid.module.css';

const DEMO_GRID_START = 13;
const DEMO_GRID_END = 24;
const LIVE_GRID_START = 6;
const LIVE_GRID_END = 19;
const HOUR_HEIGHT = 60;

function formatHourLabel(hour: number): string {
  const period = hour >= 12 ? 'PM' : 'AM';
  const h = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
  return `${h}:00 ${period}`;
}

function formatHourLabel24(hour: number): string {
  return `${String(hour).padStart(2, '0')}:00`;
}

function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function getCurrentWeekDays(count: number): Date[] {
  const now = new Date();
  const monday = new Date(now);
  const day = monday.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  monday.setDate(monday.getDate() + diff);
  monday.setHours(0, 0, 0, 0);

  return Array.from({ length: count }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return d;
  });
}

const LIVE_DAY_NAMES = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];

export function CalendarGrid() {
  const { state } = useAppState();
  const useLiveBlocks = state.scheduledBlocks.length > 0;

  const weekDays = useMemo(
    () =>
      useLiveBlocks
        ? getCurrentWeekDays(5)
        : DEMO_WEEK_DAYS.map((day) => new Date(2026, 6, day.date)),
    [useLiveBlocks],
  );

  const gridStart = useLiveBlocks ? LIVE_GRID_START : DEMO_GRID_START;
  const gridEnd = useLiveBlocks ? LIVE_GRID_END : DEMO_GRID_END;

  const hours = Array.from(
    { length: gridEnd - gridStart },
    (_, i) => gridStart + i,
  );

  const blocks = useLiveBlocks ? state.scheduledBlocks : DEMO_CALENDAR_BLOCKS;

  const blocksByDay = useMemo(() => {
    const map = new Map<number, typeof blocks>();
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

  const today = new Date();

  return (
    <div className={styles.gridWrap}>
      <div className={styles.gridScroll}>
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
            {useLiveBlocks
              ? weekDays.map((day, i) => {
                  const isToday = isSameDay(day, today);
                  return (
                    <div key={i} className={styles.headerDay}>
                      <div
                        className={`${styles.dayNumber} ${isToday ? styles.dayNumberToday : ''}`}
                      >
                        {day.getDate()}
                      </div>
                      <div className={styles.dayName}>{LIVE_DAY_NAMES[i]}</div>
                      <div className={styles.dayLogged}>– / –</div>
                    </div>
                  );
                })
              : DEMO_WEEK_DAYS.map((day) => (
                  <div key={day.date} className={styles.headerDay}>
                    <div
                      className={`${styles.dayNumber} ${day.isToday ? styles.dayNumberToday : ''}`}
                    >
                      {day.date}
                    </div>
                    <div className={styles.dayName}>{day.name}</div>
                    <div
                      className={`${styles.dayLogged} ${day.isLogged ? styles.dayLoggedActive : ''}`}
                    >
                      {day.logged}
                    </div>
                  </div>
                ))}
          </div>
        </div>

        <div className={styles.grid}>
          <div className={styles.timeGutter}>
            {hours.map((h) => (
              <div key={h} className={styles.timeLabel}>
                {useLiveBlocks ? formatHourLabel24(h) : formatHourLabel(h)}
              </div>
            ))}
          </div>

          <div className={styles.dayColumns}>
            {weekDays.map((_day, dayIndex) => (
              <div key={dayIndex} className={styles.dayColumn}>
                {hours.map((h) => (
                  <div key={h} className={styles.hourCell} />
                ))}

                {(blocksByDay.get(dayIndex) ?? []).map((block) => {
                  const startHour =
                    block.start.getHours() + block.start.getMinutes() / 60;
                  const endHour =
                    block.end.getHours() + block.end.getMinutes() / 60;
                  const top = (startHour - gridStart) * HOUR_HEIGHT;
                  const height = (endHour - startHour) * HOUR_HEIGHT;

                  return (
                    <CalendarBlock
                      key={block.id}
                      block={block}
                      top={top}
                      height={height}
                      demo={!useLiveBlocks}
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
