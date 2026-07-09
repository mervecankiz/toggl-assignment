import type { ProjectDraft, TaskDraft } from './types';

let counter = 0;

export function draftId(prefix: 'project' | 'task'): string {
  counter += 1;
  return `${prefix}-${counter}`;
}

export function createTask(name: string): TaskDraft {
  return { id: draftId('task'), name };
}

export function createProject(name: string, taskNames: string[]): ProjectDraft {
  return {
    id: draftId('project'),
    name,
    tasks: taskNames.map(createTask),
  };
}
