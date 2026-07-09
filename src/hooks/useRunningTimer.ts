import { useEffect } from 'react';
import { useAppState } from './useAppState';

export function useRunningTimer() {
  const { state, dispatch } = useAppState();
  const { exploreTimer } = state;

  useEffect(() => {
    if (!exploreTimer.running) return;

    const interval = setInterval(() => {
      dispatch({
        type: 'TICK_TIMER',
        payload: Date.now() - exploreTimer.startedAt,
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [exploreTimer.running, exploreTimer.startedAt, dispatch]);
}
