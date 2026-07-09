import { formatTimeShort } from '../../lib/scheduleTasks';
import styles from './RunningTaskHoverCard.module.css';

interface RunningTaskHoverCardProps {
  task: string;
  start: Date;
  elapsedMs: number;
  showDescriptionPlaceholder?: boolean;
  onClose: () => void;
  onStop?: () => void;
}

function formatShortElapsed(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  if (totalSeconds < 60) return `${totalSeconds}s`;

  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  if (minutes < 60) {
    return seconds > 0 ? `${minutes}m ${seconds}s` : `${minutes}m`;
  }

  const hours = Math.floor(minutes / 60);
  const remMinutes = minutes % 60;
  return remMinutes > 0 ? `${hours}h ${remMinutes}m` : `${hours}h`;
}

function formatCardDate(date: Date): string {
  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
}

export function RunningTaskHoverCard({
  task,
  start,
  elapsedMs,
  showDescriptionPlaceholder = false,
  onClose,
  onStop,
}: RunningTaskHoverCardProps) {
  const now = new Date(start.getTime() + elapsedMs);

  return (
    <div className={styles.card} onMouseDown={(e) => e.stopPropagation()}>
      <div className={styles.header}>
        <span className={styles.runningLabel}>Running</span>
        <div className={styles.headerActions}>
          <button
            type="button"
            className={styles.stopBtn}
            aria-label="Stop timer"
            onClick={onStop}
          >
            ■
          </button>
          <button type="button" className={styles.iconBtn} aria-label="Open entry">
            ↗
          </button>
          <button type="button" className={styles.iconBtn} aria-label="More options">
            ⋯
          </button>
          <button type="button" className={styles.iconBtn} aria-label="Close" onClick={onClose}>
            ×
          </button>
        </div>
      </div>

      {showDescriptionPlaceholder ? (
        <p className={styles.descriptionPlaceholder}>Add description</p>
      ) : (
        <h3 className={styles.title}>{task}</h3>
      )}

      <div className={styles.pills}>
        <span className={styles.pill}>Task</span>
        <span className={styles.pill}>Project</span>
        <span className={styles.pill}>$</span>
      </div>

      <div className={styles.meta}>
        <span>{formatCardDate(start)}</span>
        <span className={styles.metaDot}>·</span>
        <span>
          {formatTimeShort(start)} → {formatTimeShort(now)}
        </span>
        <span className={styles.elapsed}>
          <span className={styles.elapsedIcon}>◷</span>
          {formatShortElapsed(elapsedMs)}
        </span>
      </div>

      <div className={styles.footer}>
        <button type="button" className={styles.saveBtn}>
          Save <span className={styles.saveKbd}>↵</span>
        </button>
      </div>
    </div>
  );
}
