import {
  DEMO_LOGGED_FILL,
  DEMO_LOGGED_RED,
  DEMO_LOGGED_TOTAL,
} from '../../lib/demoTimerView';
import styles from './LoggedTimeBar.module.css';

export function LoggedTimeBar() {
  return (
    <div className={styles.bar}>
      <span className={styles.label}>Logged</span>
      <div className={styles.track}>
        <div className={styles.fillMain} style={{ width: `${DEMO_LOGGED_FILL}%` }} />
        <div className={styles.fillRed} style={{ width: `${DEMO_LOGGED_RED}%` }} />
      </div>
      <span className={styles.total}>{DEMO_LOGGED_TOTAL}</span>
      <a href="#" className={styles.link} onClick={(e) => e.preventDefault()}>
        View reports &gt;
      </a>
    </div>
  );
}
