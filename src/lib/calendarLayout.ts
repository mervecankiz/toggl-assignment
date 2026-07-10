import { GRID_START, HOUR_HEIGHT } from './calendarDrag';
import type { ScheduledBlock } from './types';

export const EXPLORE_BLOCK_ID = 'explore-running';
export const RUNNING_EXPLORE_HEIGHT = 31;
const BLOCK_GAP = 6;

function getBlockMetrics(block: ScheduledBlock, isExploreRunning: boolean) {
  const startHour = block.start.getHours() + block.start.getMinutes() / 60;
  const endHour = block.end.getHours() + block.end.getMinutes() / 60;
  const top = (startHour - GRID_START) * HOUR_HEIGHT;
  const height = isExploreRunning
    ? RUNNING_EXPLORE_HEIGHT
    : Math.max((endHour - startHour) * HOUR_HEIGHT, 28);

  return { top, height };
}

function rangesOverlap(
  aTop: number,
  aHeight: number,
  bTop: number,
  bHeight: number,
): boolean {
  return aTop < bTop + bHeight && bTop < aTop + aHeight;
}

export function layoutCalendarBlocks(
  blocks: ScheduledBlock[],
): Map<string, { top: number; height: number }> {
  const layout = new Map<string, { top: number; height: number }>();

  const explore = blocks.find((block) => block.id === EXPLORE_BLOCK_ID);
  const exploreLayout = explore ? getBlockMetrics(explore, true) : null;

  if (explore && exploreLayout) {
    layout.set(explore.id, exploreLayout);
  }

  const explorePlaced = exploreLayout
    ? [{ top: exploreLayout.top - RUNNING_EXPLORE_HEIGHT, height: RUNNING_EXPLORE_HEIGHT }]
    : [];

  const others = blocks
    .filter((block) => block.id !== EXPLORE_BLOCK_ID)
    .map((block) => ({
      block,
      ...getBlockMetrics(block, false),
    }))
    .sort((a, b) => a.top - b.top || a.block.start.getTime() - b.block.start.getTime());

  const placed: { top: number; height: number }[] = explorePlaced;

  for (const item of others) {
    let top = item.top;

    for (const positioned of placed) {
      if (rangesOverlap(top, item.height, positioned.top, positioned.height)) {
        top = Math.max(top, positioned.top + positioned.height + BLOCK_GAP);
      }
    }

    const next = { top, height: item.height };
    layout.set(item.block.id, next);
    placed.push(next);
    placed.sort((a, b) => a.top - b.top);
  }

  return layout;
}
