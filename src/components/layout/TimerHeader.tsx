import { formatDuration } from '../../lib/scheduleTasks';
import { useAppState } from '../../hooks/useAppState';
import styles from './TimerHeader.module.css';

export function TimerHeader() {
  const { state, dispatch } = useAppState();
  const { exploreTimer, step } = state;
  const isRunning = exploreTimer.running && step === 'timer';

  const handleTimerToggle = () => {
    if (isRunning) {
      dispatch({ type: 'STOP_EXPLORE_TIMER' });
      return;
    }
    dispatch({ type: 'START_EXPLORE_TIMER' });
  };

  return (
    <header className={styles.header}>
      <div className={styles.inputArea}>
        <input
          type="text"
          className={`${styles.descriptionInput} ${isRunning ? styles.descriptionInputRunning : ''}`}
          placeholder="What are you working on?"
          value={isRunning ? exploreTimer.description : ''}
          readOnly
        />
        <div className={styles.pills}>
          <span className={styles.pill}>
            <span className={styles.pillKbd}>@</span> Task
          </span>
          <span className={styles.pill}>
            <span className={styles.pillKbd}>+</span> Project
          </span>
          <span className={styles.pill}>
            <span className={styles.pillKbd}>#</span> Tags
          </span>
        </div>
      </div>

      <span className={styles.billableBtn} aria-hidden="true">
        $
      </span>

      <div className={styles.timerArea}>
        <span
          className={`${styles.timerDisplay} ${isRunning ? styles.timerDisplayRunning : ''}`}
        >
          {isRunning ? formatDuration(exploreTimer.elapsed) : '0:00:00'}
        </span>
        <button
          type="button"
          className={`${styles.playBtn} ${isRunning ? styles.playBtnRunning : ''}`}
          aria-label={isRunning ? 'Stop timer' : 'Start timer'}
          onClick={handleTimerToggle}
        >
          {isRunning ? '■' : '▶'}
        </button>
      </div>
    </header>
  );
}
