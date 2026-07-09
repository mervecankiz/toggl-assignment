import { useMemo, useState, type DragEvent } from 'react';
import { useAppState } from '../../hooks/useAppState';
import { TASK_DRAG_TYPE } from '../../lib/calendarDrag';
import { DEMO_TASKS } from '../../lib/demoTimerView';
import styles from './TasksPanel.module.css';

const DEMO_PROJECT = 'Marketing campaign';

export function TasksPanel() {
  const { state } = useAppState();
  const { confirmedTasks, skippedOnboarding } = state;
  const [draggingTaskId, setDraggingTaskId] = useState<string | null>(null);

  const tasks = useMemo(() => {
    if (confirmedTasks.length > 0) {
      return confirmedTasks.map((task) => ({
        id: task.id,
        name: task.name,
        project: task.project,
      }));
    }
    if (skippedOnboarding) {
      return DEMO_TASKS.map((name, index) => ({
        id: `demo-${index}`,
        name,
        project: DEMO_PROJECT,
      }));
    }
    return [];
  }, [confirmedTasks, skippedOnboarding]);

  const handleDragStart = (event: DragEvent<HTMLDivElement>, taskId: string) => {
    event.dataTransfer.setData(TASK_DRAG_TYPE, taskId);
    event.dataTransfer.effectAllowed = 'copyMove';
    setDraggingTaskId(taskId);
  };

  const handleDragEnd = () => {
    setDraggingTaskId(null);
  };

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
          <div
            key={task.id}
            className={`${styles.taskCard} ${draggingTaskId === task.id ? styles.taskCardDragging : ''}`}
            draggable
            onDragStart={(event) => handleDragStart(event, task.id)}
            onDragEnd={handleDragEnd}
          >
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
