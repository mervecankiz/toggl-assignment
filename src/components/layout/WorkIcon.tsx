import styles from './Sidebar.module.css';

/** Go to Work — two-person team icon per Figma sidebar node 1:1462 */
export function WorkIcon() {
  return (
    <svg
      className={styles.workIcon}
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="12" fill="#FFFFFF" />
      <g fill="#575456">
        {/* Back-right person */}
        <circle cx="15.4" cy="9.6" r="1.95" />
        <path d="M12.6 16.6c0-1.85 1.3-2.95 2.8-2.95s2.8 1.1 2.8 2.95H12.6z" />
        {/* Front-left person */}
        <circle cx="8.6" cy="10" r="2.15" />
        <path d="M4.7 17.1c0-2.15 1.65-3.55 3.9-3.55s3.9 1.4 3.9 3.55H4.7z" />
      </g>
    </svg>
  );
}
