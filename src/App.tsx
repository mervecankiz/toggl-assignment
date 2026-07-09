import { AppProvider, useAppState } from './hooks/useAppState';
import { useRunningTimer } from './hooks/useRunningTimer';
import { AppShell } from './components/layout/AppShell';
import { InputScreen } from './components/onboarding/InputScreen';
import { DraftReviewScreen } from './components/onboarding/DraftReviewScreen';
import { TimerView } from './components/timer/TimerView';
import './styles/global.css';

function AppContent() {
  const { state } = useAppState();
  useRunningTimer();

  return (
    <AppShell showTimerHeader={state.step === 'timer'}>
      {state.step === 'input' && <InputScreen />}
      {state.step === 'draft' && <DraftReviewScreen />}
      {state.step === 'timer' && <TimerView />}
    </AppShell>
  );
}

function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}

export default App;
