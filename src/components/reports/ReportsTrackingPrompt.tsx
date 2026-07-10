import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useAppState } from '../../hooks/useAppState';
import styles from './ReportsTrackingPrompt.module.css';

const PROMPT_DELAY_MS = 9_000;

const PROMPT_FEATURES = [
  'See logged hours build up day by day',
  'Track billable vs non-billable time',
  'Watch amounts and averages update live',
  'Break down your week by project and task',
];

function CheckIcon() {
  return (
    <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden="true">
      <path
        d="M2 5.2L4.2 7.4L8 3.2"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

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
            Your real hours start now
          </h2>
          <p className={styles.body}>
            This is sample data. Track your work this week and it turns into your own real numbers.
          </p>
          <ul className={styles.featureList}>
            {PROMPT_FEATURES.map((feature) => (
              <li key={feature} className={styles.featureItem}>
                <span className={styles.checkIconWrap}>
                  <CheckIcon />
                </span>
                <span>{feature}</span>
              </li>
            ))}
          </ul>
          <button type="button" className={styles.cta} onClick={startTracking}>
            Continue tracking your week
          </button>
        </motion.aside>
      )}
    </AnimatePresence>,
    document.body,
  );
}
