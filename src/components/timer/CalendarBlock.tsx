import { useRef, useState, type CSSProperties, type DragEvent, type MouseEvent } from 'react';
import { useAppState } from '../../hooks/useAppState';
import type { ScheduledBlock } from '../../lib/types';
import { formatBlockDuration, formatTimeShort } from '../../lib/scheduleTasks';
import { RunningTaskHoverCard } from './RunningTaskHoverCard';
import styles from './CalendarBlock.module.css';

interface CalendarBlockProps {
  block: ScheduledBlock;
  top: number;
  height: number;
  runningExplore?: boolean;
  elapsedMs?: number;
  draggable?: boolean;
  isDragging?: boolean;
  dragType?: string;
  onDragStart?: () => void;
  onDragEnd?: () => void;
}

function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const normalized = hex.replace('#', '');
  if (normalized.length !== 6) return null;

  return {
    r: Number.parseInt(normalized.slice(0, 2), 16),
    g: Number.parseInt(normalized.slice(2, 4), 16),
    b: Number.parseInt(normalized.slice(4, 6), 16),
  };
}

function getSuggestedBlockStyles(color: string): CSSProperties {
  const rgb = hexToRgb(color);
  if (!rgb) return {};

  const { r, g, b } = rgb;

  return {
    ['--suggested-color' as string]: color,
    ['--suggested-bg' as string]: `rgba(${r}, ${g}, ${b}, 0.12)`,
    ['--suggested-bg-hover' as string]: `rgba(${r}, ${g}, ${b}, 0.2)`,
    ['--suggested-stripe' as string]: `rgba(${r}, ${g}, ${b}, 0.07)`,
    ['--suggested-inset' as string]: `rgba(${r}, ${g}, ${b}, 0.12)`,
  };
}

export function CalendarBlock({
  block,
  top,
  height,
  runningExplore = false,
  elapsedMs = 0,
  draggable = false,
  isDragging = false,
  dragType = 'application/x-calendar-block-id',
  onDragStart,
  onDragEnd,
}: CalendarBlockProps) {
  const { state, dispatch } = useAppState();
  const { exploreTimer } = state;
  const duration = formatBlockDuration(block.start, block.end);
  const isSuggested = block.status === 'suggested';
  const [hoverOpen, setHoverOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  const cardOpen = runningExplore && (exploreTimer.showCard || hoverOpen);

  const closeCard = () => {
    setHoverOpen(false);
    dispatch({ type: 'SET_EXPLORE_TIMER_CARD', payload: false });
  };

  const openCard = () => {
    dispatch({ type: 'SET_EXPLORE_TIMER_CARD', payload: true });
  };

  const handleDragStart = (event: DragEvent<HTMLDivElement>) => {
    if (!draggable || runningExplore) {
      event.preventDefault();
      return;
    }

    if ((event.target as HTMLElement).closest('button')) {
      event.preventDefault();
      return;
    }

    event.dataTransfer.setData(dragType, block.id);
    event.dataTransfer.effectAllowed = 'move';
    onDragStart?.();
  };

  const handleMouseLeave = (event: MouseEvent) => {
    const next = event.relatedTarget as Node | null;
    if (!wrapRef.current?.contains(next)) {
      setHoverOpen(false);
    }
  };

  if (runningExplore) {
    return (
      <div
        ref={wrapRef}
        className={styles.runningExploreWrap}
        style={{ top }}
        onMouseEnter={() => setHoverOpen(true)}
        onMouseLeave={handleMouseLeave}
      >
        <div className={styles.runningNowLine} aria-hidden="true" />
        <button
          type="button"
          className={styles.runningExploreBar}
          onClick={openCard}
          aria-label="Open running timer"
        >
          <span className={styles.runningPlayIcon} aria-hidden="true">
            ▶
          </span>
          <span className={styles.runningExploreName}>{block.task}</span>
        </button>

        {cardOpen && (
          <RunningTaskHoverCard
            task={block.task}
            start={block.start}
            elapsedMs={elapsedMs}
            showDescriptionPlaceholder
            onClose={closeCard}
            onStop={() => dispatch({ type: 'STOP_EXPLORE_TIMER' })}
          />
        )}
      </div>
    );
  }

  return (
    <div
      className={`${styles.block} ${isSuggested ? styles.suggested : styles.logged} ${draggable ? styles.draggable : ''} ${isDragging ? styles.dragging : ''}`}
      style={{
        top,
        height,
        ...(isSuggested
          ? getSuggestedBlockStyles(block.color)
          : { backgroundColor: block.color, borderColor: block.color }),
      }}
      draggable={draggable}
      onDragStart={handleDragStart}
      onDragEnd={onDragEnd}
    >
      {isSuggested ? (
        <>
          <div className={styles.colorStripe} style={{ backgroundColor: block.color, width: 5 }} />

          <div className={styles.blockContent}>
            <div className={styles.taskName}>{block.task}</div>
            <div className={styles.projectName}>
              {block.project} · {formatTimeShort(block.start)}
            </div>
            {height >= 54 && <div className={styles.blockDuration}>{duration}</div>}
          </div>

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
        </>
      ) : (
        <>
          <div className={styles.loggedContent}>
            <div className={styles.loggedTaskName}>{block.task}</div>
            <div className={styles.loggedProject}>{block.project}</div>
          </div>
          {height >= 44 && (
            <div className={styles.loggedDuration}>
              <span className={styles.loggedClockIcon} aria-hidden="true">
                ◷
              </span>
              {duration}
            </div>
          )}
        </>
      )}
    </div>
  );
}
