import { useState } from 'react';
import styles from './Sidebar.module.css';
import { WorkIcon } from './WorkIcon';

const ICONS = {
  toggl: '/sidebar/toggl-icon.svg',
  toggle: '/sidebar/toggle-icon.svg',
  feedback: '/sidebar/feedback-icon.svg',
  help: '/sidebar/help-icon.svg',
  chevron: '/sidebar/chevron-icon.svg',
  timer: '/sidebar/timer-icon.svg',
  reports: '/sidebar/reports-icon.svg',
  projects: '/sidebar/projects-icon.svg',
  tasks: '/sidebar/tasks-icon.svg',
  timeline: '/sidebar/timeline-icon.svg',
  star: '/sidebar/star-icon.svg',
  members: '/sidebar/members-icon.svg',
  timeoff: '/sidebar/timeoff-icon.svg',
  download: '/sidebar/download-icon.svg',
  settings: '/sidebar/settings-icon.svg',
  upgrade: '/sidebar/upgrade-icon.svg',
} as const;

const NAV_SECTIONS: {
  label: string;
  defaultOpen?: boolean;
  items: {
    label: string;
    icon: keyof typeof ICONS;
    active?: boolean;
    star?: boolean;
    pro?: boolean;
  }[];
}[] = [
  {
    label: 'Track',
    defaultOpen: true,
    items: [{ label: 'Timer', icon: 'timer', active: true }],
  },
  {
    label: 'Analyze',
    defaultOpen: true,
    items: [{ label: 'Reports', icon: 'reports' }],
  },
  {
    label: 'Plan',
    defaultOpen: true,
    items: [
      { label: 'Projects', icon: 'projects' },
      { label: 'Tasks', icon: 'tasks' },
      { label: 'Timeline', icon: 'timeline', star: true },
    ],
  },
  {
    label: 'Manage',
    defaultOpen: false,
    items: [
      { label: 'Members', icon: 'members' },
      { label: 'Time off', icon: 'timeoff', pro: true },
    ],
  },
];

export function Sidebar() {
  const [openSections, setOpenSections] = useState(() =>
    Object.fromEntries(
      NAV_SECTIONS.map((section) => [section.label, section.defaultOpen ?? true]),
    ),
  );

  const toggleSection = (label: string) => {
    setOpenSections((current) => ({ ...current, [label]: !current[label] }));
  };
  return (
    <aside className={styles.sidebar}>
      <div className={styles.toolbar}>
        <div className={styles.toolbarTop}>
          <div className={styles.logoWrap}>
            <div className={styles.logoIconWrap}>
              <img src={ICONS.toggl} alt="" className={styles.logoIcon} />
            </div>
            <span className={styles.badge20}>2.0</span>
          </div>
          <button type="button" className={styles.workLink} aria-label="Go to Work">
            <WorkIcon />
          </button>
        </div>

        <button type="button" className={styles.toggleBtn} aria-label="Toggle sidebar">
          <img src={ICONS.toggle} alt="" className={styles.toggleIcon} />
        </button>

        <div className={styles.toolbarBottom}>
          <div className={styles.avatarGroup}>
            <button type="button" className={styles.avatarBtn} aria-label="Account">
              <span className={styles.avatar}>MC</span>
            </button>
            <span className={styles.trialPill}>29d</span>
          </div>
          <button type="button" className={styles.iconBtn} aria-label="Share feedback">
            <img src={ICONS.feedback} alt="" />
          </button>
          <button type="button" className={styles.iconBtn} aria-label="Help">
            <img src={ICONS.help} alt="" />
          </button>
        </div>
      </div>

      <nav className={styles.navigation}>
        <button type="button" className={styles.workspaceBtn}>
          <div className={styles.workspaceNameWrap}>
            <span className={styles.workspaceName} title="Merve's Organization">
              Merve&apos;s Organization
            </span>
          </div>
          <img src={ICONS.chevron} alt="" className={styles.chevron} />
        </button>

        <div className={styles.sections}>
          {NAV_SECTIONS.map((section) => {
            const isOpen = openSections[section.label];

            return (
              <div key={section.label} className={styles.section}>
                <button
                  type="button"
                  className={styles.sectionToggle}
                  aria-expanded={isOpen}
                  onClick={() => toggleSection(section.label)}
                >
                  <span className={styles.sectionLabel}>{section.label}</span>
                  <img
                    src={ICONS.chevron}
                    alt=""
                    className={`${styles.sectionChevron} ${isOpen ? styles.sectionChevronOpen : ''}`}
                  />
                </button>
                {isOpen &&
                  section.items.map((item) => (
                    <div
                      key={item.label}
                      className={`${styles.navItem} ${item.active ? styles.navItemActive : ''}`}
                    >
                      <img src={ICONS[item.icon]} alt="" className={styles.navIcon} />
                      <span>{item.label}</span>
                      {item.star && (
                        <img src={ICONS.star} alt="Paid feature" className={styles.starIcon} />
                      )}
                      {item.pro && <span className={styles.proBadge}>Pro</span>}
                    </div>
                  ))}
              </div>
            );
          })}
        </div>

        <div className={styles.footer}>
          <div className={styles.footerBtn}>
            <img src={ICONS.download} alt="" className={styles.footerIcon} />
            Download apps
          </div>
          <div className={styles.footerBtn}>
            <img src={ICONS.settings} alt="" className={styles.footerIcon} />
            Settings
          </div>
          <div className={`${styles.footerBtn} ${styles.upgradeBtn}`}>
            <img src={ICONS.upgrade} alt="" className={`${styles.footerIcon} ${styles.upgradeIcon}`} />
            Upgrade
          </div>
        </div>
      </nav>
    </aside>
  );
}
