import { useEffect } from 'react';
import { useAppState } from './useAppState';

export function useRunningTimer() {
  const { state, dispatch } = useAppState();
  const { exploreTimer } = state;

  useEffect(() => {
    if (!exploreTimer.running) return;

    const tick = () => {
      dispatch({
        type: 'TICK_TIMER',
        payload: Date.now() - exploreTimer.startedAt,
      });
    };

    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [exploreTimer.running, exploreTimer.startedAt, dispatch]);
}
