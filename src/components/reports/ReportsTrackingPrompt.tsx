import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useAppState } from '../../hooks/useAppState';
import styles from './ReportsTrackingPrompt.module.css';

const PROMPT_DELAY_MS = 9_000;

export function ReportsTrackingPrompt() {
  const { state, dispatch } = useAppState();
  const [open, setOpen] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!state.reportsTrackingPromptPending || state.reportsTrackingPromptDismissed) {
      setOpen(false);
      return;
    }

    timerRef.current = setTimeout(() => {
      setOpen(true);
    }, PROMPT_DELAY_MS);

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [state.reportsTrackingPromptPending, state.reportsTrackingPromptDismissed]);

  const dismiss = () => {
    setOpen(false);
    dispatch({ type: 'DISMISS_REPORTS_TRACKING_PROMPT' });
  };

  const startTracking = () => {
    setOpen(false);
    dispatch({ type: 'DISMISS_REPORTS_TRACKING_PROMPT' });
    dispatch({ type: 'SET_ACTIVE_VIEW', payload: 'timer' });
  };

  if (typeof document === 'undefined') {
    return null;
  }

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.aside
          className={styles.prompt}
          role="dialog"
          aria-labelledby="reports-tracking-prompt-title"
          initial={{ opacity: 0, y: 32 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        >
          <button type="button" className={styles.closeBtn} aria-label="Close" onClick={dismiss}>
            ×
          </button>
          <h2 id="reports-tracking-prompt-title" className={styles.title}>
            This week, these become your real numbers
          </h2>
          <p className={styles.body}>Track your work and your reports fill with your own hours</p>
          <button type="button" className={styles.cta} onClick={startTracking}>
            Start tracking your week
          </button>
        </motion.aside>
      )}
    </AnimatePresence>,
    document.body,
  );
}
