import type { AppState } from './types';
import { PROJECT_COLORS } from './types';
import { buildSampleReportsSummary, mergeReportsSummaries } from './reportsSampleData';

export interface ReportsDayProjectSegment {
  project: string;
  loggedMs: number;
  color: string;
}

export interface ReportsDayPoint {
  label: string;
  shortLabel: string;
  loggedMs: number;
  segments: ReportsDayProjectSegment[];
}

export interface ReportsProjectRow {
  id: string;
  name: string;
  client: string;
  loggedMs: number;
  billable: boolean;
  taskCount: number;
  amount: number;
}

export interface ReportsSummary {
  weekLabel: string;
  weekNumber: string;
  loggedMs: number;
  billableMs: number;
  billablePercent: number;
  amount: number;
  averageDailyMs: number;
  dailyPoints: ReportsDayPoint[];
  projectRows: ReportsProjectRow[];
  includesSampleData: boolean;
}

function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

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

export function getProjectChartColor(project: string, projectNames: string[]): string {
  if (project.toLowerCase().includes('without project')) {
    return '#c8c6c8';
  }

  const index = projectNames.indexOf(project);
  return PROJECT_COLORS[(index >= 0 ? index : 0) % PROJECT_COLORS.length];
}

function mergeDaySegments(
  segments: ReportsDayProjectSegment[],
): ReportsDayProjectSegment[] {
  const map = new Map<string, ReportsDayProjectSegment>();

  for (const segment of segments) {
    const existing = map.get(segment.project);
    if (existing) {
      existing.loggedMs += segment.loggedMs;
      continue;
    }
    map.set(segment.project, { ...segment });
  }

  return Array.from(map.values())
    .filter((segment) => segment.loggedMs > 0)
    .sort((a, b) => b.loggedMs - a.loggedMs);
}

function distributeProjectSegments(
  dayTotalMs: number,
  projects: { name: string; loggedMs: number; color: string }[],
): ReportsDayProjectSegment[] {
  if (dayTotalMs <= 0 || projects.length === 0) {
    return [];
  }

  const totalProjectMs = projects.reduce((sum, project) => sum + project.loggedMs, 0);
  if (totalProjectMs <= 0) {
    return [];
  }

  let allocated = 0;

  return projects
    .map((project, index) => {
      const isLast = index === projects.length - 1;
      const loggedMs = isLast
        ? Math.max(dayTotalMs - allocated, 0)
        : Math.round((project.loggedMs / totalProjectMs) * dayTotalMs);

      allocated += loggedMs;

      return {
        project: project.name,
        loggedMs,
        color: project.color,
      };
    })
    .filter((segment) => segment.loggedMs > 0);
}

export { distributeProjectSegments };

export function mergeDayPoints(
  samplePoint: ReportsDayPoint,
  livePoint?: ReportsDayPoint,
): ReportsDayPoint {
  const segments = mergeDaySegments([
    ...samplePoint.segments,
    ...(livePoint?.segments ?? []),
  ]);

  return {
    label: samplePoint.label,
    shortLabel: samplePoint.shortLabel,
    loggedMs: samplePoint.loggedMs + (livePoint?.loggedMs ?? 0),
    segments,
  };
}

function isBillableProject(project: string): boolean {
  const name = project.toLowerCase();
  return !name.includes('internal') && !name.includes('without project');
}

function clientForProject(project: string): string {
  if (project.toLowerCase().includes('without')) return '—';
  if (project === 'Client work') return 'client2';
  if (project === 'Acme Rebrand') return 'Acme Corp';
  if (project === 'Harlow Maintenance') return 'Harlow';
  if (project === 'Northwind Contract') return 'Northwind Ltd';
  if (project === 'Marketing campaign') return '—';
  return '—';
}

export function formatReportDuration(ms: number, precise = false): string {
  if (ms <= 0) return precise ? '0s' : '0m';

  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  if (hours > 0 && minutes > 0) return `${hours}h ${minutes}m`;
  if (hours > 0) return `${hours}h`;
  if (minutes > 0 && seconds > 0 && precise) return `${minutes}m ${seconds}s`;
  if (minutes > 0) return `${minutes}m`;
  return `${seconds}s`;
}

export function formatReportAmount(amount: number): string {
  return `$${amount.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export function getChartMaxHours(dailyPoints: { loggedMs: number }[]): number {
  const maxMs = Math.max(...dailyPoints.map((point) => point.loggedMs), 0);
  const maxHours = maxMs / 3_600_000;

  if (maxHours <= 2.5) return 2.5;
  if (maxHours <= 4) return 4;
  if (maxHours <= 6) return 6;
  if (maxHours <= 8) return 8;
  return Math.ceil(maxHours / 2) * 2;
}

export function getChartYTicks(maxHours: number): number[] {
  const step = maxHours <= 2.5 ? 0.5 : maxHours <= 4 ? 1 : 2;
  const ticks: number[] = [];
  for (let hour = 0; hour <= maxHours; hour += step) {
    ticks.push(Number(hour.toFixed(1)));
  }
  return ticks;
}

export function buildLiveReportsSummary(state: AppState): ReportsSummary {
  const weekDays = getWeekDays();
  const { weekLabel, weekNumber } = getWeekMeta();

  const acceptedBlocks = state.scheduledBlocks.filter((block) => block.status === 'accepted');
  const exploreMs =
    state.exploreTimer.running || state.exploreTimer.elapsed > 0
      ? state.exploreTimer.elapsed
      : 0;

  let loggedMs = exploreMs;
  let billableMs = 0;

  for (const block of acceptedBlocks) {
    const blockMs = block.end.getTime() - block.start.getTime();
    loggedMs += blockMs;
    if (isBillableProject(block.project)) {
      billableMs += blockMs;
    }
  }

  const dailyPoints: ReportsDayPoint[] = weekDays.map((day) => {
    const segmentsMap = new Map<string, ReportsDayProjectSegment>();

    if (
      exploreMs > 0 &&
      state.exploreTimer.startedAt > 0 &&
      isSameDay(day, new Date(state.exploreTimer.startedAt))
    ) {
      segmentsMap.set('Without project', {
        project: 'Without project',
        loggedMs: exploreMs,
        color: '#c8c6c8',
      });
    }

    for (const block of acceptedBlocks) {
      if (!isSameDay(block.start, day)) continue;

      const blockMs = block.end.getTime() - block.start.getTime();
      const existing = segmentsMap.get(block.project);

      if (existing) {
        existing.loggedMs += blockMs;
      } else {
        segmentsMap.set(block.project, {
          project: block.project,
          loggedMs: blockMs,
          color: block.color,
        });
      }
    }

    const segments = Array.from(segmentsMap.values()).sort((a, b) => b.loggedMs - a.loggedMs);
    const dayMs = segments.reduce((sum, segment) => sum + segment.loggedMs, 0);

    const weekday = day.toLocaleDateString('en-US', { weekday: 'long' });
    const short = day.toLocaleDateString('en-US', { weekday: 'short' });
    const date = `${day.getMonth() + 1}/${day.getDate()}`;

    return {
      label: `${weekday} ${date}`,
      shortLabel: `${short} ${date}`,
      loggedMs: dayMs,
      segments,
    };
  });

  const projectMap = new Map<string, { loggedMs: number; taskCount: number }>();

  if (exploreMs > 0) {
    const key = 'Without project';
    projectMap.set(key, { loggedMs: exploreMs, taskCount: 1 });
  }

  for (const block of acceptedBlocks) {
    const key = block.project;
    const current = projectMap.get(key) ?? { loggedMs: 0, taskCount: 0 };
    current.loggedMs += block.end.getTime() - block.start.getTime();
    current.taskCount += 1;
    projectMap.set(key, current);
  }

  const projectRows: ReportsProjectRow[] = Array.from(projectMap.entries()).map(
    ([name, data], index) => ({
      id: `project-row-${index}`,
      name,
      client: clientForProject(name),
      loggedMs: data.loggedMs,
      billable: isBillableProject(name),
      taskCount: data.taskCount,
      amount: 0,
    }),
  );

  projectRows.sort((a, b) => b.loggedMs - a.loggedMs);

  const daysWithData = dailyPoints.filter((point) => point.loggedMs > 0).length || 1;
  const billablePercent = loggedMs > 0 ? (billableMs / loggedMs) * 100 : 0;

  return {
    weekLabel,
    weekNumber,
    loggedMs,
    billableMs,
    billablePercent,
    amount: 0,
    averageDailyMs: loggedMs / daysWithData,
    dailyPoints,
    projectRows,
    includesSampleData: false,
  };
}

export function buildReportsSummary(state: AppState): ReportsSummary {
  const live = buildLiveReportsSummary(state);

  if (!state.reportsSampleDataEnabled) {
    return live;
  }

  const sample = buildSampleReportsSummary();

  if (live.loggedMs === 0) {
    return sample;
  }

  return mergeReportsSummaries(sample, live);
}
