import { useMemo } from 'react';
import { useAppState } from '../../hooks/useAppState';
import { DEMO_TASKS } from '../../lib/demoTimerView';
import styles from './TasksPanel.module.css';

export function TasksPanel() {
  const { state } = useAppState();
  const { confirmedTasks, skippedOnboarding } = state;

  const tasks = useMemo(() => {
    if (confirmedTasks.length > 0) {
      return confirmedTasks.map((task) => ({
        id: task.id,
        name: task.name,
      }));
    }
    if (skippedOnboarding) {
      return DEMO_TASKS.map((name, index) => ({
        id: `demo-${index}`,
        name,
      }));
    }
    return [];
  }, [confirmedTasks, skippedOnboarding]);

  return (
    <aside className={styles.panel}>
      <div className={styles.header}>
        <span className={styles.title}>Tasks</span>
        <div className={styles.headerActions}>
          <button type="button" className={styles.headerBtn} aria-label="Add task">
            +
          </button>
          <button type="button" className={styles.headerBtn} aria-label="Task list options">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
              <rect x="1" y="2" width="12" height="2" rx="0.5" fill="currentColor" />
              <rect x="1" y="6" width="12" height="2" rx="0.5" fill="currentColor" />
              <rect x="1" y="10" width="12" height="2" rx="0.5" fill="currentColor" />
            </svg>
          </button>
        </div>
      </div>

      <div className={styles.body}>
        {tasks.map((task) => (
          <div key={task.id} className={styles.taskCard}>
            {task.name}
          </div>
        ))}
      </div>

      <button type="button" className={styles.addTaskBtn}>
        + Add task
      </button>
    </aside>
  );
}
