import { createProject, createTask } from '../../lib/draftIds';
import type { SetupDraft } from '../../lib/types';
import styles from './ProjectTreeEditor.module.css';

interface ProjectTreeEditorProps {
  draft: SetupDraft;
  onChange: (draft: SetupDraft) => void;
  isStreaming?: boolean;
  onConfirm?: () => void;
  confirmDisabled?: boolean;
}

export function ProjectTreeEditor({
  draft,
  onChange,
  isStreaming,
  onConfirm,
  confirmDisabled,
}: ProjectTreeEditorProps) {
  const updateProjectName = (index: number, name: string) => {
    const projects = draft.projects.map((p, i) => (i === index ? { ...p, name } : p));
    onChange({ ...draft, projects });
  };

  const updateTaskName = (projectIndex: number, taskIndex: number, name: string) => {
    const projects = draft.projects.map((p, pi) =>
      pi === projectIndex
        ? {
            ...p,
            tasks: p.tasks.map((t, ti) => (ti === taskIndex ? { ...t, name } : t)),
          }
        : p,
    );
    onChange({ ...draft, projects });
  };

  const deleteProject = (index: number) => {
    onChange({ ...draft, projects: draft.projects.filter((_, i) => i !== index) });
  };

  const deleteTask = (projectIndex: number, taskIndex: number) => {
    const projects = draft.projects.map((p, pi) =>
      pi === projectIndex ? { ...p, tasks: p.tasks.filter((_, ti) => ti !== taskIndex) } : p,
    );
    onChange({ ...draft, projects });
  };

  const addTask = (projectIndex: number) => {
    const projects = draft.projects.map((p, pi) =>
      pi === projectIndex ? { ...p, tasks: [...p.tasks, createTask('New task')] } : p,
    );
    onChange({ ...draft, projects });
  };

  const addProject = () => {
    onChange({
      ...draft,
      projects: [...draft.projects, createProject('New project', ['New task'])],
    });
  };

  return (
    <div className={styles.editor}>
      {draft.projects.map((project, pi) => (
        <div key={project.id} className={styles.project}>
          <div className={styles.projectHeader}>
            <span className={styles.projectLabel}>Project</span>
            <input
              className={styles.projectNameInput}
              value={project.name}
              onChange={(e) => updateProjectName(pi, e.target.value)}
              disabled={isStreaming}
            />
            {!isStreaming && (
              <button
                type="button"
                className={styles.deleteProject}
                onClick={() => deleteProject(pi)}
                aria-label="Delete project"
              >
                ×
              </button>
            )}
          </div>
          <ul className={styles.taskList}>
            {project.tasks.map((task, ti) => (
              <li key={task.id} className={styles.taskRow}>
                <span className={styles.taskMarker} aria-hidden="true" />
                <input
                  className={styles.taskInput}
                  value={task.name}
                  onChange={(e) => updateTaskName(pi, ti, e.target.value)}
                  disabled={isStreaming}
                />
                {!isStreaming && (
                  <button
                    type="button"
                    className={styles.deleteTask}
                    onClick={() => deleteTask(pi, ti)}
                    aria-label="Delete task"
                  >
                    ×
                  </button>
                )}
              </li>
            ))}
            {!isStreaming && (
              <li className={styles.addTaskRow}>
                <button
                  type="button"
                  className={styles.addTaskBtn}
                  onClick={() => addTask(pi)}
                >
                  <span className={styles.addTaskPlus} aria-hidden="true">
                    +
                  </span>
                  <span>Add task</span>
                </button>
              </li>
            )}
          </ul>
        </div>
      ))}
      {isStreaming && <span className={styles.streamingCursor} />}
      {!isStreaming && (
        <div className={styles.editorActions}>
          <button type="button" className={styles.addProjectBtn} onClick={addProject}>
            + Add project
          </button>
          {onConfirm && (
            <button
              type="button"
              className={styles.confirmBtn}
              disabled={confirmDisabled}
              onClick={onConfirm}
            >
              Looks good, set me up
              <span className={styles.confirmIcon} aria-hidden="true">
                →
              </span>
            </button>
          )}
        </div>
      )}
    </div>
  );
}
