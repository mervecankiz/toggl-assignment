import type { ScheduledBlock } from './types';

export const DEMO_WEEK_LABEL = 'Jul 6 - 12 2026';
export const DEMO_WEEK_NUMBER = 'W28';
export const DEMO_LOGGED_TOTAL = '8h 56m';
export const DEMO_LOGGED_FILL = 88;
export const DEMO_LOGGED_RED = 12;

export const DEMO_TASKS = [
  'Analyze campaign results',
  'Adjust strategies as needed',
  'Monitor campaign performance',
  'Launch campaign',
  'Schedule campaign timeline',
  'Plan social media posts',
  'Design promotional content',
  'Select marketing channels',
  'Set campaign budget',
  'Create marketing materials',
];

export const DEMO_WEEK_DAYS = [
  { date: 6, name: 'Mon', logged: '– / –' },
  { date: 7, name: 'Tue', logged: '– / –' },
  { date: 8, name: 'Wed', logged: '– / –' },
  { date: 9, name: 'Thu', logged: '8h 56m / –', isLogged: true },
  { date: 10, name: 'Fri', logged: '– / –', isToday: true },
  { date: 11, name: 'Sat', logged: '– / –' },
];

function demoDate(day: number, hour: number, minute = 0): Date {
  return new Date(2026, 6, day, hour, minute, 0, 0);
}

export const DEMO_CALENDAR_BLOCKS: ScheduledBlock[] = [
  {
    id: 'demo-admin',
    taskId: 'demo-admin',
    project: 'Internal',
    task: 'Admin & meetings',
    start: demoDate(9, 13, 0),
    end: demoDate(9, 14, 30),
    status: 'accepted',
    color: '#8b4f3d',
  },
  {
    id: 'demo-explore',
    taskId: 'demo-explore',
    project: 'Internal projects',
    task: 'Explore Toggl',
    start: demoDate(9, 20, 0),
    end: demoDate(9, 23, 0),
    status: 'accepted',
    color: '#c8c6c8',
  },
];
