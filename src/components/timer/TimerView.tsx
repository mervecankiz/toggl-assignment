import { CalendarGrid } from './CalendarGrid';
import { CalendarToolbar } from './CalendarToolbar';
import { LoggedTimeBar } from './LoggedTimeBar';
import { TasksPanel } from './TasksPanel';
import styles from './TimerView.module.css';

export function TimerView() {
  return (
    <div className={styles.view}>
      <CalendarToolbar />
      <LoggedTimeBar />
      <div className={styles.mainArea}>
        <div className={styles.calendarSection}>
          <CalendarGrid />
        </div>
        <TasksPanel />
      </div>
    </div>
  );
}
