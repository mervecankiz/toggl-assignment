import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useAppState } from '../../hooks/useAppState';
import {
  buildLoggedTimeBarData,
  hasLoggedCalendarBlocks,
} from '../../lib/loggedTimeBarData';
import styles from './LoggedTimeBar.module.css';

const POPOVER_DELAY_MS = 2000;
const POPOVER_WIDTH = 420;

export function LoggedTimeBar() {
  const { state, dispatch } = useAppState();
  const hasLoggedBlocks = useMemo(() => hasLoggedCalendarBlocks(state), [state]);
  const barData = useMemo(() => buildLoggedTimeBarData(state), [state]);
  const [barExpanded, setBarExpanded] = useState(false);
  const [popoverOpen, setPopoverOpen] = useState(false);
  const [popoverPosition, setPopoverPosition] = useState({ top: 0, left: 0 });
  const linkRef = useRef<HTMLButtonElement>(null);
  const popoverTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const updatePopoverPosition = () => {
    const button = linkRef.current;
    if (!button) return;

    const rect = button.getBoundingClientRect();
    const width = Math.min(POPOVER_WIDTH, window.innerWidth - 24);
    const left = Math.max(12, Math.min(rect.right - width, window.innerWidth - width - 12));

    setPopoverPosition({
      top: rect.bottom + 10,
      left,
    });
  };

  useEffect(() => {
    if (!hasLoggedBlocks || state.reportsPreviewPopoverDismissed) {
      setBarExpanded(false);
      setPopoverOpen(false);
      return;
    }

    popoverTimerRef.current = setTimeout(() => {
      updatePopoverPosition();
      setPopoverOpen(true);
    }, POPOVER_DELAY_MS);

    return () => {
      if (popoverTimerRef.current) {
        clearTimeout(popoverTimerRef.current);
      }
    };
  }, [hasLoggedBlocks, state.reportsPreviewPopoverDismissed]);

  useEffect(() => {
    if (!popoverOpen) return;

    updatePopoverPosition();
    window.addEventListener('resize', updatePopoverPosition);
    window.addEventListener('scroll', updatePopoverPosition, true);

    return () => {
      window.removeEventListener('resize', updatePopoverPosition);
      window.removeEventListener('scroll', updatePopoverPosition, true);
    };
  }, [popoverOpen]);

  const dismissPopover = () => {
    setPopoverOpen(false);
    dispatch({ type: 'DISMISS_REPORTS_PREVIEW_POPOVER' });
  };

  const goToReports = () => {
    setPopoverOpen(false);
    dispatch({ type: 'SET_ACTIVE_VIEW', payload: 'reports' });
  };

  const goToReportsFromCta = () => {
    dismissPopover();
    dispatch({ type: 'SCHEDULE_REPORTS_TRACKING_PROMPT' });
    dispatch({ type: 'SET_ACTIVE_VIEW', payload: 'reports' });
  };

  const popover =
    typeof document !== 'undefined' ? (
      <AnimatePresence>
        {popoverOpen && (
          <motion.div
            className={styles.popover}
            style={{
              top: popoverPosition.top,
              left: popoverPosition.left,
              width: Math.min(POPOVER_WIDTH, window.innerWidth - 24),
            }}
            initial={{ opacity: 0, y: -6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.98 }}
            transition={{ duration: 0.25, ease: [0.32, 0.72, 0, 1] }}
          >
            <button
              type="button"
              className={styles.popoverCloseBtn}
              aria-label="Close"
              onClick={dismissPopover}
            >
              ×
            </button>
            <p className={styles.popoverText}>
              🔮 One week from now, your time could look like this
            </p>
            <img
              className={styles.popoverImage}
              src="/reports-preview-popover.png"
              alt="Sample weekly reports dashboard with logged time chart"
            />
            <button type="button" className={styles.popoverCta} onClick={goToReportsFromCta}>
              See the full picture
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    ) : null;

  return (
    <>
      <AnimatePresence initial={false}>
        {hasLoggedBlocks && (
          <motion.div
            key="logged-time-bar"
            className={styles.barWrapper}
            style={{ overflow: barExpanded ? 'visible' : 'hidden' }}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.35, ease: [0.32, 0.72, 0, 1] }}
            onAnimationComplete={() => setBarExpanded(true)}
          >
            <div className={styles.bar}>
              <span className={styles.label}>Logged</span>
              <div className={styles.track}>
                {barData.segments.map((segment) => (
                  <div
                    key={segment.color}
                    className={styles.fillSegment}
                    style={{
                      width: `${segment.widthPercent}%`,
                      backgroundColor: segment.color,
                    }}
                  />
                ))}
              </div>
              <span className={styles.total}>{barData.totalLabel}</span>
              <div className={styles.linkWrap}>
                <button
                  ref={linkRef}
                  type="button"
                  className={styles.link}
                  onClick={goToReports}
                >
                  View reports &gt;
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {popover && createPortal(popover, document.body)}
    </>
  );
}
