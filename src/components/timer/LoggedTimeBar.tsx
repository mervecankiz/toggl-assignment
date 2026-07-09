import { useMemo } from 'react';
import { useAppState } from '../../hooks/useAppState';
import { buildLoggedTimeBarData } from '../../lib/loggedTimeBarData';
import styles from './LoggedTimeBar.module.css';

export function LoggedTimeBar() {
  const { state, dispatch } = useAppState();
  const barData = useMemo(() => buildLoggedTimeBarData(state), [state]);

  return (
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
      <button
        type="button"
        className={styles.link}
        onClick={() => dispatch({ type: 'SET_ACTIVE_VIEW', payload: 'reports' })}
      >
        View reports &gt;
      </button>
    </div>
  );
}
