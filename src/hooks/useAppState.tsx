import { useReducer, createContext, useContext, type ReactNode } from 'react';
import { scheduleTasks } from '../lib/scheduleTasks';
import { createTask, draftId } from '../lib/draftIds';
import {
  DEFAULT_RUNNING_TASK,
  EXPLORE_TOGGL_TASK,
  type AppAction,
  type AppState,
  type ExploreTimer,
  type SetupDraft,
  type StreamEvent,
  type Task,
} from '../lib/types';

const emptyDraft = (): SetupDraft => ({
  projects: [],
  suggestedFirstTask: { project: '', task: '', reason: '' },
});

const EXPLORE_TIMER_DEMO_OFFSET_MS = 0;

function createExploreTimer(options: { showCard?: boolean; description?: string } = {}): ExploreTimer {
  const startedAt = Date.now();
  return {
    running: true,
    startedAt,
    elapsed: EXPLORE_TIMER_DEMO_OFFSET_MS,
    showCard: options.showCard ?? false,
    description: options.description ?? DEFAULT_RUNNING_TASK,
  };
}

function tasksFromDraft(draft: SetupDraft): Task[] {
  const tasks: Task[] = [];
  let id = 0;
  for (const project of draft.projects) {
    for (const name of project.tasks) {
      tasks.push({ id: `task-${++id}`, project: project.name, name: name.name });
    }
  }
  return tasks;
}

function applyStreamEvent(visible: SetupDraft | null, event: StreamEvent): SetupDraft {
  const base = visible ?? emptyDraft();

  switch (event.type) {
    case 'suggested':
      return { ...base, suggestedFirstTask: event.data };
    case 'project':
      return {
        ...base,
        projects: [...base.projects, { id: draftId('project'), name: event.data, tasks: [] }],
      };
    case 'task': {
      const task = createTask(event.data.task);
      const projects = base.projects.map((p) =>
        p.name === event.data.project ? { ...p, tasks: [...p.tasks, task] } : p,
      );
      if (!projects.some((p) => p.name === event.data.project)) {
        projects.push({ id: draftId('project'), name: event.data.project, tasks: [task] });
      }
      return { ...base, projects };
    }
    case 'complete':
      return event.data;
    default:
      return base;
  }
}

function reducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'SET_INPUT':
      return { ...state, inputText: action.payload };

    case 'START_DRAFT':
      return {
        ...state,
        step: 'draft',
        inputText: action.payload,
        draft: null,
        visibleDraft: emptyDraft(),
        isStreaming: true,
      };

    case 'APPEND_STREAMED_ITEM':
      return {
        ...state,
        visibleDraft: applyStreamEvent(state.visibleDraft, action.payload),
      };

    case 'FINISH_STREAMING':
      return {
        ...state,
        draft: action.payload,
        visibleDraft: action.payload,
        isStreaming: false,
      };

    case 'UPDATE_DRAFT':
      return { ...state, draft: action.payload, visibleDraft: action.payload };

    case 'CONFIRM_DRAFT':
      return {
        ...state,
        step: 'timer',
        confirmedTasks: action.payload.tasks,
        scheduledBlocks: action.payload.blocks,
        skippedOnboarding: false,
        exploreTimer: createExploreTimer({ description: EXPLORE_TOGGL_TASK }),
      };

    case 'SKIP':
      return {
        ...state,
        step: 'timer',
        confirmedTasks: [],
        scheduledBlocks: [],
        skippedOnboarding: true,
        exploreTimer: createExploreTimer({ description: EXPLORE_TOGGL_TASK }),
      };

    case 'ACCEPT_BLOCK':
      return {
        ...state,
        scheduledBlocks: state.scheduledBlocks.map((b) =>
          b.id === action.payload ? { ...b, status: 'accepted' as const } : b,
        ),
      };

    case 'DECLINE_BLOCK':
      return {
        ...state,
        scheduledBlocks: state.scheduledBlocks.filter((b) => b.id !== action.payload),
      };

    case 'RESCHEDULE_BLOCK':
      return {
        ...state,
        scheduledBlocks: state.scheduledBlocks.map((b) =>
          b.id === action.payload.id
            ? {
                ...b,
                start: action.payload.start,
                end: action.payload.end,
                status: 'accepted' as const,
              }
            : b,
        ),
      };

    case 'ADD_SCHEDULED_BLOCK':
      return {
        ...state,
        scheduledBlocks: [...state.scheduledBlocks, action.payload],
      };

    case 'SET_ACTIVE_VIEW':
      return { ...state, activeView: action.payload };

    case 'START_EXPLORE_TIMER':
      return {
        ...state,
        exploreTimer: createExploreTimer({
          showCard: action.payload?.showCard ?? false,
          description: action.payload?.description ?? DEFAULT_RUNNING_TASK,
        }),
      };

    case 'STOP_EXPLORE_TIMER':
      return {
        ...state,
        exploreTimer: {
          running: false,
          startedAt: 0,
          elapsed: 0,
          showCard: false,
          description: '',
        },
      };

    case 'SET_EXPLORE_TIMER_CARD':
      return {
        ...state,
        exploreTimer: { ...state.exploreTimer, showCard: action.payload },
      };

    case 'DISMISS_REPORTS_SAMPLE_DATA':
      return { ...state, reportsSampleDataEnabled: false };

    case 'DISMISS_REPORTS_PREVIEW_POPOVER':
      return { ...state, reportsPreviewPopoverDismissed: true };

    case 'SCHEDULE_REPORTS_TRACKING_PROMPT':
      return { ...state, reportsTrackingPromptPending: true };

    case 'DISMISS_REPORTS_TRACKING_PROMPT':
      return {
        ...state,
        reportsTrackingPromptPending: false,
        reportsTrackingPromptDismissed: true,
      };

    case 'TICK_TIMER':
      return {
        ...state,
        exploreTimer: { ...state.exploreTimer, elapsed: action.payload },
      };

    default:
      return state;
  }
}

const initialState: AppState = {
  step: 'input',
  activeView: 'timer',
  inputText: '',
  draft: null,
  visibleDraft: null,
  isStreaming: false,
  confirmedTasks: [],
  scheduledBlocks: [],
  exploreTimer: { running: false, startedAt: 0, elapsed: 0, showCard: false, description: '' },
  skippedOnboarding: false,
  reportsSampleDataEnabled: true,
  reportsPreviewPopoverDismissed: false,
  reportsTrackingPromptPending: false,
  reportsTrackingPromptDismissed: false,
};

interface AppContextValue {
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
  confirmDraft: () => void;
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  const confirmDraft = () => {
    if (!state.draft) return;
    const tasks = tasksFromDraft(state.draft);
    const blocks = scheduleTasks(state.draft, { reserveRunningTimerMinutes: 45 });
    dispatch({ type: 'CONFIRM_DRAFT', payload: { tasks, blocks } });
  };

  return (
    <AppContext.Provider value={{ state, dispatch, confirmDraft }}>
      {children}
    </AppContext.Provider>
  );
}

export function useAppState() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useAppState must be used within AppProvider');
  return ctx;
}

export { tasksFromDraft };
