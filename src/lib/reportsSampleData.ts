import type { ReportsDayPoint, ReportsProjectRow, ReportsSummary } from './reportsData';

const MINUTE = 60_000;
const HOUR = 60 * MINUTE;

/** Mon–Fri logged time for a typical freelance week (~28.5h total). */
const SAMPLE_DAILY_MS = [
  5.5 * HOUR, // Mon  5h 30m
  6.25 * HOUR, // Tue  6h 15m
  5.75 * HOUR, // Wed  5h 45m
  (7 * HOUR + 20 * MINUTE), // Thu  7h 20m
  (3 * HOUR + 40 * MINUTE), // Fri  3h 40m
];

interface SampleProjectRow extends Omit<ReportsProjectRow, 'id'> {
  hourlyRate: number;
}

const SAMPLE_PROJECT_ROWS: SampleProjectRow[] = [
  {
    name: 'Acme Rebrand',
    client: 'Acme Corp',
    loggedMs: 12.5 * HOUR,
    billable: true,
    taskCount: 4,
    hourlyRate: 85,
    amount: 0,
  },
  {
    name: 'Northwind Contract',
    client: 'Northwind Ltd',
    loggedMs: 11.75 * HOUR,
    billable: true,
    taskCount: 5,
    hourlyRate: 95,
    amount: 0,
  },
  {
    name: 'Website maintenance',
    client: 'Harlow',
    loggedMs: 2.75 * HOUR,
    billable: true,
    taskCount: 2,
    hourlyRate: 75,
    amount: 0,
  },
  {
    name: 'Without project',
    client: '—',
    loggedMs: 1.5 * HOUR,
    billable: false,
    taskCount: 2,
    hourlyRate: 0,
    amount: 0,
  },
];

function getWeekDays(): Date[] {
  const now = new Date();
  const monday = new Date(now);
  const day = monday.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  monday.setDate(monday.getDate() + diff);
  monday.setHours(0, 0, 0, 0);

  return Array.from({ length: 5 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return d;
  });
}

function getWeekMeta(): { weekLabel: string; weekNumber: string } {
  const now = new Date();
  const monday = new Date(now);
  const day = monday.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  monday.setDate(monday.getDate() + diff);

  const weekNum = Math.ceil(
    ((monday.getTime() - new Date(monday.getFullYear(), 0, 1).getTime()) / 86_400_000 + 1) / 7,
  );

  return {
    weekLabel: 'This week',
    weekNumber: `W${weekNum}`,
  };
}

function projectAmount(loggedMs: number, hourlyRate: number, billable: boolean): number {
  if (!billable || hourlyRate <= 0) return 0;
  return (loggedMs / HOUR) * hourlyRate;
}

export function buildSampleReportsSummary(): ReportsSummary {
  const weekDays = getWeekDays();
  const { weekLabel, weekNumber } = getWeekMeta();

  const dailyPoints: ReportsDayPoint[] = weekDays.map((day, index) => {
    const weekday = day.toLocaleDateString('en-US', { weekday: 'long' });
    const short = day.toLocaleDateString('en-US', { weekday: 'short' });
    const date = `${day.getMonth() + 1}/${day.getDate()}`;

    return {
      label: `${weekday} ${date}`,
      shortLabel: `${short} ${date}`,
      loggedMs: SAMPLE_DAILY_MS[index] ?? 0,
    };
  });

  const projectRows: ReportsProjectRow[] = SAMPLE_PROJECT_ROWS.map((row, index) => ({
    id: `sample-project-row-${index}`,
    name: row.name,
    client: row.client,
    loggedMs: row.loggedMs,
    billable: row.billable,
    taskCount: row.taskCount,
    amount: projectAmount(row.loggedMs, row.hourlyRate, row.billable),
  }));

  const loggedMs = SAMPLE_DAILY_MS.reduce((sum, ms) => sum + ms, 0);
  const billableMs = projectRows
    .filter((row) => row.billable)
    .reduce((sum, row) => sum + row.loggedMs, 0);
  const amount = projectRows.reduce((sum, row) => sum + row.amount, 0);
  const daysWithData = dailyPoints.filter((point) => point.loggedMs > 0).length || 1;

  return {
    weekLabel,
    weekNumber,
    loggedMs,
    billableMs,
    billablePercent: loggedMs > 0 ? (billableMs / loggedMs) * 100 : 0,
    amount,
    averageDailyMs: loggedMs / daysWithData,
    dailyPoints,
    projectRows,
    includesSampleData: true,
  };
}

export function mergeReportsSummaries(
  sample: ReportsSummary,
  live: ReportsSummary,
): ReportsSummary {
  const dailyPoints = sample.dailyPoints.map((point, index) => ({
    ...point,
    loggedMs: point.loggedMs + (live.dailyPoints[index]?.loggedMs ?? 0),
  }));

  const projectMap = new Map<string, ReportsProjectRow>();

  for (const row of [...sample.projectRows, ...live.projectRows]) {
    const existing = projectMap.get(row.name);
    if (existing) {
      existing.loggedMs += row.loggedMs;
      existing.taskCount += row.taskCount;
      existing.amount += row.amount;
      continue;
    }
    projectMap.set(row.name, { ...row, id: `merged-${row.id}` });
  }

  const projectRows = Array.from(projectMap.values()).sort((a, b) => b.loggedMs - a.loggedMs);
  const loggedMs = sample.loggedMs + live.loggedMs;
  const billableMs = sample.billableMs + live.billableMs;
  const amount = sample.amount + live.amount;
  const daysWithData = dailyPoints.filter((point) => point.loggedMs > 0).length || 1;

  return {
    weekLabel: live.weekLabel,
    weekNumber: live.weekNumber,
    loggedMs,
    billableMs,
    billablePercent: loggedMs > 0 ? (billableMs / loggedMs) * 100 : 0,
    amount,
    averageDailyMs: loggedMs / daysWithData,
    dailyPoints,
    projectRows,
    includesSampleData: true,
  };
}
