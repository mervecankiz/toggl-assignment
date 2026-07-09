import styles from './TimerHeader.module.css';

export function TimerHeader() {
  return (
    <header className={styles.header}>
      <div className={styles.inputArea}>
        <input
          type="text"
          className={styles.descriptionInput}
          placeholder="What are you working on?"
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
        <span className={styles.timerDisplay}>0:00:00</span>
        <button type="button" className={styles.playBtn} aria-label="Start timer">
          ▶
        </button>
      </div>
    </header>
  );
}
