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

export type AppView = 'timer' | 'reports';

export type FlowStep = 'input' | 'draft' | 'timer';

export interface ExploreTimer {
  running: boolean;
  startedAt: number;
  elapsed: number;
  showCard: boolean;
  description: string;
}

export const DEFAULT_RUNNING_TASK = 'Untitled task';

export interface AppState {
  step: FlowStep;
  activeView: AppView;
  inputText: string;
  draft: SetupDraft | null;
  visibleDraft: SetupDraft | null;
  isStreaming: boolean;
  confirmedTasks: Task[];
  scheduledBlocks: ScheduledBlock[];
  exploreTimer: ExploreTimer;
  skippedOnboarding: boolean;
  reportsSampleDataEnabled: boolean;
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
  | { type: 'RESCHEDULE_BLOCK'; payload: { id: string; start: Date; end: Date } }
  | { type: 'ADD_SCHEDULED_BLOCK'; payload: ScheduledBlock }
  | { type: 'SET_ACTIVE_VIEW'; payload: AppView }
  | { type: 'START_EXPLORE_TIMER'; payload?: { showCard?: boolean } }
  | { type: 'STOP_EXPLORE_TIMER' }
  | { type: 'SET_EXPLORE_TIMER_CARD'; payload: boolean }
  | { type: 'DISMISS_REPORTS_SAMPLE_DATA' }
  | { type: 'TICK_TIMER'; payload: number };

export const PROJECT_COLORS = [
  '#a84c9d',
  '#5b9bd5',
  '#e8a838',
  '#6bbf8a',
  '#e07a7a',
];
