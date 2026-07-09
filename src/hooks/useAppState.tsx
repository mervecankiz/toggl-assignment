import { useReducer, createContext, useContext, type ReactNode } from 'react';
import { scheduleTasks } from '../lib/scheduleTasks';
import { createTask, draftId } from '../lib/draftIds';
import type {
  AppAction,
  AppState,
  ExploreTimer,
  SetupDraft,
  StreamEvent,
  Task,
} from '../lib/types';

const emptyDraft = (): SetupDraft => ({
  projects: [],
  suggestedFirstTask: { project: '', task: '', reason: '' },
});

const EXPLORE_TIMER_DEMO_OFFSET_MS = 42_000;

function createExploreTimer(): ExploreTimer {
  const startedAt = Date.now() - EXPLORE_TIMER_DEMO_OFFSET_MS;
  return {
    running: true,
    startedAt,
    elapsed: EXPLORE_TIMER_DEMO_OFFSET_MS,
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
        exploreTimer: createExploreTimer(),
      };

    case 'SKIP':
      return {
        ...state,
        step: 'timer',
        confirmedTasks: [],
        scheduledBlocks: [],
        skippedOnboarding: true,
        exploreTimer: createExploreTimer(),
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
  inputText: '',
  draft: null,
  visibleDraft: null,
  isStreaming: false,
  confirmedTasks: [],
  scheduledBlocks: [],
  exploreTimer: { running: false, startedAt: 0, elapsed: 0 },
  skippedOnboarding: false,
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
    const blocks = scheduleTasks(state.draft);
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
