import { useAppState } from '../../hooks/useAppState';
import type { ScheduledBlock } from '../../lib/types';
import { formatTimeShort } from '../../lib/scheduleTasks';
import styles from './CalendarBlock.module.css';

interface CalendarBlockProps {
  block: ScheduledBlock;
  top: number;
  height: number;
  demo?: boolean;
}

function formatBlockDuration(start: Date, end: Date): string {
  const mins = Math.round((end.getTime() - start.getTime()) / 60000);
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  if (h > 0 && m > 0) return `${h}h ${m}m`;
  if (h > 0) return `${h}h`;
  return `${m}m`;
}

export function CalendarBlock({ block, top, height, demo = false }: CalendarBlockProps) {
  const { dispatch } = useAppState();
  const duration = formatBlockDuration(block.start, block.end);
  const isExplore = block.id === 'demo-explore';
  const isSuggested = block.status === 'suggested';

  if (demo) {
    return (
      <div
        className={`${styles.block} ${styles.demoBlock} ${isExplore ? styles.demoExplore : styles.demoSolid}`}
        style={{
          top,
          height,
          background: block.color,
        }}
      >
        <div className={styles.demoTaskName}>{block.task}</div>
        {!isExplore && <div className={styles.demoDuration}>{duration}</div>}
      </div>
    );
  }

  return (
    <div
      className={`${styles.block} ${isSuggested ? styles.suggested : styles.accepted}`}
      style={{
        top,
        height,
        borderColor: isSuggested ? undefined : block.color,
      }}
    >
      <div
        className={`${styles.colorStripe} ${isSuggested ? styles.suggestedStripe : ''}`}
        style={{ background: isSuggested ? undefined : block.color }}
      />

      {isSuggested && height >= 72 && (
        <span className={styles.suggestedBadge}>Suggested</span>
      )}

      <div className={styles.blockContent}>
        <div className={styles.taskName}>{block.task}</div>
        <div className={styles.projectName}>
          {block.project} · {formatTimeShort(block.start)}
        </div>
      </div>

      {isSuggested && (
        <div className={styles.actions}>
          <button
            type="button"
            className={`${styles.actionBtn} ${styles.acceptBtn}`}
            onClick={() => dispatch({ type: 'ACCEPT_BLOCK', payload: block.id })}
            aria-label="Accept suggestion"
            title="Add to calendar"
          >
            ✓
          </button>
          <button
            type="button"
            className={`${styles.actionBtn} ${styles.declineBtn}`}
            onClick={() => dispatch({ type: 'DECLINE_BLOCK', payload: block.id })}
            aria-label="Decline suggestion"
            title="Dismiss"
          >
            ×
          </button>
        </div>
      )}
    </div>
  );
}
