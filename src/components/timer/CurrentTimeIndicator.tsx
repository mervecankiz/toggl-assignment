import { useEffect, useState } from 'react';
import { useAppState } from '../../hooks/useAppState';
import { GRID_START, HOUR_HEIGHT } from '../../lib/calendarDrag';
import styles from './CurrentTimeIndicator.module.css';

function getNowTop(): number {
  const now = new Date();
  const hour = now.getHours() + now.getMinutes() / 60 + now.getSeconds() / 3600;
  return (hour - GRID_START) * HOUR_HEIGHT;
}

export function CurrentTimeIndicator() {
  const { state, dispatch } = useAppState();
  const { exploreTimer } = state;
  const [top, setTop] = useState(getNowTop);
  const [hovered, setHovered] = useState(false);

  useEffect(() => {
    setTop(getNowTop());
    const interval = setInterval(() => setTop(getNowTop()), 1000);
    return () => clearInterval(interval);
  }, []);

  if (exploreTimer.running) return null;

  const handleStart = () => {
    dispatch({ type: 'START_EXPLORE_TIMER', payload: { showCard: true } });
  };

  return (
    <div
      className={styles.wrap}
      style={{ top }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <button
        type="button"
        className={styles.playBtn}
        aria-label="Start timer"
        onClick={handleStart}
      >
        <span className={styles.playIcon} aria-hidden="true">
          ▶
        </span>
      </button>
      <div className={styles.line} aria-hidden="true" />

      {hovered && (
        <div className={styles.tooltip}>Start timer</div>
      )}
    </div>
  );
}
