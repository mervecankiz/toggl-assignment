import type { ReactNode } from 'react';
import { Sidebar } from './Sidebar';
import { TimerHeader } from './TimerHeader';
import styles from './AppShell.module.css';

interface AppShellProps {
  children: ReactNode;
  showTimerHeader?: boolean;
}

export function AppShell({ children, showTimerHeader = true }: AppShellProps) {
  return (
    <div className={styles.shell}>
      <Sidebar />
      <div className={styles.main}>
        {showTimerHeader && <TimerHeader />}
        <div className={styles.content}>{children}</div>
      </div>
    </div>
  );
}
