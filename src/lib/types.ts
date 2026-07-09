export interface TaskDraft {
  id: string;
  name: string;
}

export interface ProjectDraft {
  id: string;
  name: string;
  tasks: TaskDraft[];
}

export interface SuggestedFirstTask {
  project: string;
  task: string;
  reason: string;
  isNeutral?: boolean;
}

export interface SetupDraft {
  projects: ProjectDraft[];
  suggestedFirstTask: SuggestedFirstTask;
}

export interface Task {
  id: string;
  project: string;
  name: string;
}

export interface ScheduledBlock {
  id: string;
  taskId: string;
  project: string;
  task: string;
  start: Date;
  end: Date;
  status: 'suggested' | 'accepted';
  color: string;
}

export type FlowStep = 'input' | 'draft' | 'timer';

export interface ExploreTimer {
  running: boolean;
  startedAt: number;
  elapsed: number;
}

export interface AppState {
  step: FlowStep;
  inputText: string;
  draft: SetupDraft | null;
  visibleDraft: SetupDraft | null;
  isStreaming: boolean;
  confirmedTasks: Task[];
  scheduledBlocks: ScheduledBlock[];
  exploreTimer: ExploreTimer;
  skippedOnboarding: boolean;
}

export type StreamEvent =
  | { type: 'suggested'; data: SuggestedFirstTask }
  | { type: 'project'; data: string }
  | { type: 'task'; data: { project: string; task: string } }
  | { type: 'complete'; data: SetupDraft };

export type AppAction =
  | { type: 'SET_INPUT'; payload: string }
  | { type: 'START_DRAFT'; payload: string }
  | { type: 'APPEND_STREAMED_ITEM'; payload: StreamEvent }
  | { type: 'FINISH_STREAMING'; payload: SetupDraft }
  | { type: 'UPDATE_DRAFT'; payload: SetupDraft }
  | { type: 'CONFIRM_DRAFT'; payload: { tasks: Task[]; blocks: ScheduledBlock[] } }
  | { type: 'SKIP' }
  | { type: 'ACCEPT_BLOCK'; payload: string }
  | { type: 'DECLINE_BLOCK'; payload: string }
  | { type: 'TICK_TIMER'; payload: number };

export const PROJECT_COLORS = [
  '#a84c9d',
  '#5b9bd5',
  '#e8a838',
  '#6bbf8a',
  '#e07a7a',
];
