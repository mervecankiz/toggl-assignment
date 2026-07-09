import {
  DEMO_WEEK_LABEL,
  DEMO_WEEK_NUMBER,
} from '../../lib/demoTimerView';
import styles from './CalendarToolbar.module.css';

function CalendarIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <rect x="2" y="3" width="12" height="11" rx="1.5" stroke="currentColor" strokeWidth="1.2" />
      <path d="M2 6.5h12" stroke="currentColor" strokeWidth="1.2" />
      <path d="M5 2v2M11 2v2" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  );
}

function SplitViewIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <rect x="2" y="3" width="5" height="10" rx="1" stroke="currentColor" strokeWidth="1.2" />
      <rect x="9" y="3" width="5" height="10" rx="1" stroke="currentColor" strokeWidth="1.2" />
    </svg>
  );
}

function ListViewIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M3 5h10M3 8h10M3 11h10" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  );
}

function GridViewIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <rect x="2" y="2" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.2" />
      <rect x="9" y="2" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.2" />
      <rect x="2" y="9" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.2" />
      <rect x="9" y="9" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.2" />
    </svg>
  );
}

function SettingsIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path
        d="M8 10a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z"
        stroke="currentColor"
        strokeWidth="1.2"
      />
      <path
        d="M8 1.5v1.5M8 13v1.5M1.5 8h1.5M13 8h1.5M3.2 3.2l1.06 1.06M11.74 11.74l1.06 1.06M3.2 12.8l1.06-1.06M11.74 4.26l1.06-1.06"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
      />
    </svg>
  );
}

function ExpandIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path
        d="M9 2h5v5M7 14H2V9M14 2L9 7M2 14l5-5"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function CalendarToolbar() {
  return (
    <div className={styles.toolbar}>
      <div className={styles.weekNav}>
        <button type="button" className={styles.navBtn} aria-label="Previous week">
          ‹
        </button>
        <div className={styles.weekLabel}>
          <CalendarIcon />
          <span>{DEMO_WEEK_LABEL}</span>
          <span className={styles.weekDot}>•</span>
          <span>{DEMO_WEEK_NUMBER}</span>
        </div>
        <button type="button" className={styles.navBtn} aria-label="Next week">
          ›
        </button>
      </div>

      <div className={styles.rightControls}>
        <button type="button" className={styles.daysBtn}>
          5 Days <span className={styles.chevron}>▾</span>
        </button>
        <div className={styles.viewBtns}>
          <button type="button" className={styles.viewBtn} aria-label="Calendar view">
            <CalendarIcon />
          </button>
          <button
            type="button"
            className={`${styles.viewBtn} ${styles.viewBtnActive}`}
            aria-label="Split view"
          >
            <SplitViewIcon />
          </button>
          <button type="button" className={styles.viewBtn} aria-label="List view">
            <ListViewIcon />
          </button>
          <button type="button" className={styles.viewBtn} aria-label="Grid view">
            <GridViewIcon />
          </button>
        </div>
        <button type="button" className={styles.iconBtn} aria-label="Settings">
          <SettingsIcon />
        </button>
        <button type="button" className={styles.iconBtn} aria-label="Expand panel">
          <ExpandIcon />
        </button>
      </div>
    </div>
  );
}
