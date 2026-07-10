import { useMemo, useRef, useState } from 'react';
import { useAppState } from '../../hooks/useAppState';
import { buildReportsSummary, formatReportAmount, formatReportDuration, getChartMaxHours, getChartYTicks, getProjectChartColor } from '../../lib/reportsData';
import type { ReportsDayPoint } from '../../lib/reportsData';
import { ReportsTrackingPrompt } from './ReportsTrackingPrompt';
import styles from './ReportsView.module.css';

const CHART_HEIGHT = 220;
const SEGMENT_GAP = 2;
const SEGMENT_RADIUS = 4;

function FilterIcon() {
  return (
    <svg
      className={styles.filterIcon}
      width="14"
      height="14"
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M2.5 3.5h11L10 9.25v4.75l-4 1v-5.75L2.5 3.5z"
        stroke="currentColor"
        strokeWidth="1.25"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function SelectChevron() {
  return (
    <svg
      className={styles.selectChevron}
      width="12"
      height="12"
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden="true"
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M3.293 6.792C3.12082 6.61981 3.01739 6.39071 3.00211 6.14768C2.98683 5.90466 3.06075 5.6644 3.21 5.472L3.293 5.378C3.48053 5.19053 3.73484 5.08521 4 5.08521C4.26516 5.08521 4.51947 5.19053 4.707 5.378L8 8.67L11.293 5.378C11.4652 5.20582 11.6943 5.10239 11.9373 5.08711C12.1803 5.07183 12.4206 5.14575 12.613 5.295L12.707 5.378C12.8945 5.56553 12.9998 5.81984 12.9998 6.085C12.9998 6.35016 12.8945 6.60447 12.707 6.792L8.707 10.793C8.51947 10.9805 8.26516 11.0858 8 11.0858C7.73484 11.0858 7.48053 10.9805 7.293 10.793L3.293 6.792Z"
        fill="currentColor"
      />
    </svg>
  );
}

function ReportsChart({ dailyPoints }: { dailyPoints: ReportsDayPoint[] }) {
  const chartWrapRef = useRef<HTMLDivElement>(null);
  const chartSvgRef = useRef<SVGSVGElement>(null);
  const [hoveredSegment, setHoveredSegment] = useState<{
    dayLabel: string;
    project: string;
    color: string;
    segmentMs: number;
    dayTotalMs: number;
    x: number;
    y: number;
  } | null>(null);

  const chartMaxHours = getChartMaxHours(dailyPoints);
  const yTicks = getChartYTicks(chartMaxHours);
  const width = 720;
  const padding = { top: 16, right: 16, bottom: 28, left: 40 };
  const innerWidth = width - padding.left - padding.right;
  const innerHeight = CHART_HEIGHT - padding.top - padding.bottom;
  const maxMs = chartMaxHours * 3_600_000;
  const barCount = dailyPoints.length || 1;
  const slotWidth = innerWidth / barCount;
  const barWidth = Math.min(44, slotWidth * 0.55);

  const legendItems = useMemo(() => {
    const map = new Map<string, { project: string; color: string; loggedMs: number }>();

    for (const point of dailyPoints) {
      for (const segment of point.segments) {
        const existing = map.get(segment.project);
        if (existing) {
          existing.loggedMs += segment.loggedMs;
          continue;
        }
        map.set(segment.project, {
          project: segment.project,
          color: segment.color,
          loggedMs: segment.loggedMs,
        });
      }
    }

    return Array.from(map.values()).sort((a, b) => b.loggedMs - a.loggedMs);
  }, [dailyPoints]);

  const bars = dailyPoints.map((point, index) => {
    const x = padding.left + index * slotWidth + (slotWidth - barWidth) / 2;
    const totalRatio = Math.min(point.loggedMs / maxMs, 1);
    const totalHeight = point.loggedMs > 0 ? Math.max(totalRatio * innerHeight, 3) : 0;
    const baseY = padding.top + innerHeight - totalHeight;

    const segmentCount = point.segments.length;
    const totalGap = segmentCount > 1 ? (segmentCount - 1) * SEGMENT_GAP : 0;
    const segmentsHeight = Math.max(totalHeight - totalGap, 0);

    let cursorY = baseY + totalHeight;
    const segments = point.segments.map((segment, segmentIndex) => {
      const segmentHeight =
        point.loggedMs > 0 && segmentsHeight > 0
          ? Math.max(
              (segment.loggedMs / point.loggedMs) * segmentsHeight,
              segment.loggedMs > 0 ? 4 : 0,
            )
          : 0;

      cursorY -= segmentHeight;
      const y = cursorY;

      if (segmentIndex < point.segments.length - 1) {
        cursorY -= SEGMENT_GAP;
      }

      return {
        key: `${point.shortLabel}-${segment.project}`,
        x,
        y,
        width: barWidth,
        height: segmentHeight,
        color: segment.color,
        project: segment.project,
        loggedMs: segment.loggedMs,
      };
    });

    return {
      label: point.shortLabel,
      dayTotalMs: point.loggedMs,
      x,
      segments,
    };
  });

  const showSegmentTooltip = (
    bar: (typeof bars)[number],
    segment: (typeof bars)[number]['segments'][number],
  ) => {
    const svg = chartSvgRef.current;
    const wrap = chartWrapRef.current;
    if (!svg || !wrap) return;

    const svgRect = svg.getBoundingClientRect();
    const wrapRect = wrap.getBoundingClientRect();
    const scaleX = svgRect.width / width;
    const scaleY = svgRect.height / CHART_HEIGHT;

    setHoveredSegment({
      dayLabel: bar.label,
      project: segment.project,
      color: segment.color,
      segmentMs: segment.loggedMs,
      dayTotalMs: bar.dayTotalMs,
      x: (segment.x + segment.width / 2) * scaleX + svgRect.left - wrapRect.left,
      y: segment.y * scaleY + svgRect.top - wrapRect.top,
    });
  };

  return (
    <div className={styles.chartWrap} ref={chartWrapRef}>
      <svg
        ref={chartSvgRef}
        viewBox={`0 0 ${width} ${CHART_HEIGHT}`}
        className={styles.chartSvg}
        aria-hidden="true"
      >
        {yTicks.map((hours) => {
          const y = padding.top + innerHeight - (hours / chartMaxHours) * innerHeight;
          return (
            <g key={hours}>
              <line
                x1={padding.left}
                y1={y}
                x2={width - padding.right}
                y2={y}
                className={styles.chartGridLine}
              />
              <text x={padding.left - 8} y={y + 4} className={styles.chartAxisLabel}>
                {hours === 0 ? '0h' : Number.isInteger(hours) ? `${hours}h` : `${hours}h`}
              </text>
            </g>
          );
        })}

        {bars.flatMap((bar) =>
          bar.segments.map((segment) => (
            <rect
              key={segment.key}
              x={segment.x}
              y={segment.y}
              width={segment.width}
              height={segment.height}
              rx={SEGMENT_RADIUS}
              ry={SEGMENT_RADIUS}
              fill={segment.color}
              className={styles.chartBar}
              onMouseEnter={() => showSegmentTooltip(bar, segment)}
              onMouseLeave={() => setHoveredSegment(null)}
            />
          )),
        )}

        {bars.map((bar) => (
          <text
            key={`${bar.label}-x`}
            x={bar.x + barWidth / 2}
            y={CHART_HEIGHT - 6}
            className={styles.chartXLabel}
            textAnchor="middle"
          >
            {bar.label}
          </text>
        ))}
      </svg>
      {hoveredSegment && (
        <div
          className={styles.chartTooltip}
          style={{ left: hoveredSegment.x, top: hoveredSegment.y }}
          role="tooltip"
        >
          <span className={styles.chartTooltipDay}>{hoveredSegment.dayLabel}</span>
          <div className={styles.chartTooltipRow}>
            <span
              className={styles.chartTooltipSwatch}
              style={{ backgroundColor: hoveredSegment.color }}
              aria-hidden="true"
            />
            <span className={styles.chartTooltipProject}>{hoveredSegment.project}</span>
            <span className={styles.chartTooltipValue}>
              {formatReportDuration(hoveredSegment.segmentMs, true)}
            </span>
          </div>
          <div className={styles.chartTooltipTotal}>
            <span>Total</span>
            <span>{formatReportDuration(hoveredSegment.dayTotalMs, true)}</span>
          </div>
        </div>
      )}
      {legendItems.length > 0 && (
        <div className={styles.chartLegend}>
          {legendItems.map((item) => (
            <span key={item.project} className={styles.chartLegendItem}>
              <span
                className={styles.chartLegendSwatch}
                style={{ backgroundColor: item.color }}
                aria-hidden="true"
              />
              {item.project}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

export function ReportsView() {
  const { state, dispatch } = useAppState();
  const [activeTab, setActiveTab] = useState<'summary' | 'timelogs'>('summary');
  const summary = useMemo(() => buildReportsSummary(state), [state]);
  const projectNames = useMemo(
    () => summary.projectRows.map((row) => row.name),
    [summary.projectRows],
  );

  const dismissSampleData = () => dispatch({ type: 'DISMISS_REPORTS_SAMPLE_DATA' });

  return (
    <div className={styles.view}>
      <ReportsTrackingPrompt />
      <div className={styles.header}>
        <h1 className={styles.title}>Reports</h1>
        <div className={styles.headerActions}>
          <button type="button" className={styles.exportBtn}>
            Export CSV <span className={styles.star}>★</span>
          </button>
        </div>
      </div>

      <div className={styles.tabs}>
        <button
          type="button"
          className={`${styles.tab} ${activeTab === 'summary' ? styles.tabActive : ''}`}
          onClick={() => setActiveTab('summary')}
        >
          Summary
        </button>
        <button type="button" className={styles.tab} disabled>
          Utilization <span className={styles.star}>★</span>
        </button>
        <button type="button" className={styles.tab} disabled>
          Workload <span className={styles.star}>★</span>
        </button>
        <button type="button" className={styles.tab} disabled>
          Profitability <span className={styles.star}>★</span>
        </button>
        <button
          type="button"
          className={`${styles.tab} ${activeTab === 'timelogs' ? styles.tabActive : ''}`}
          onClick={() => setActiveTab('timelogs')}
        >
          Time logs
        </button>
      </div>

      <div className={styles.toolbar}>
        <div className={styles.weekNav}>
          <button type="button" className={styles.navBtn} aria-label="Previous week">
            ‹
          </button>
          <div className={styles.weekLabel}>
            <span>{summary.weekLabel}</span>
            <span className={styles.weekDot}>•</span>
            <span>{summary.weekNumber}</span>
          </div>
          <button type="button" className={styles.navBtn} aria-label="Next week">
            ›
          </button>
        </div>
        <button type="button" className={styles.filtersBtn}>
          <FilterIcon />
          Filters
        </button>
      </div>

      {activeTab === 'summary' ? (
        <div className={summary.includesSampleData ? styles.samplePanel : undefined}>
          {summary.includesSampleData && (
            <div className={styles.sampleBanner} role="status">
              <div className={styles.sampleBannerContent}>
                <span className={styles.sampleBadge}>Sample</span>
                <span className={styles.sampleBannerText}>
                  Sample preview. Start tracking to see your own week here.
                </span>
              </div>
              <button type="button" className={styles.sampleBannerAction} onClick={dismissSampleData}>
                Remove sample data
              </button>
            </div>
          )}

          <div className={summary.includesSampleData ? styles.samplePanelBody : undefined}>
          <div className={styles.metrics}>
            <div className={styles.metricCard}>
              <span className={styles.metricLabel}>Logged time</span>
              <span className={styles.metricValue}>{formatReportDuration(summary.loggedMs)}</span>
            </div>
            <div className={styles.metricCard}>
              <span className={styles.metricLabel}>Billable time</span>
              <span className={styles.metricValue}>
                {formatReportDuration(summary.billableMs)}
                {summary.loggedMs > 0 && (
                  <span className={styles.metricSub}>
                    {' '}
                    ({summary.billablePercent.toFixed(2)}%)
                  </span>
                )}
              </span>
            </div>
            <div className={styles.metricCard}>
              <span className={styles.metricLabel}>Amount</span>
              <span className={styles.metricValue}>{formatReportAmount(summary.amount)}</span>
            </div>
            <div className={styles.metricCard}>
              <span className={styles.metricLabel}>Average daily hours</span>
              <span className={styles.metricValue}>
                {formatReportDuration(summary.averageDailyMs)}
              </span>
            </div>
          </div>

          <section className={styles.chartSection}>
            <div className={styles.chartHeader}>
              <h2 className={styles.sectionTitle}>Logged time</h2>
              <button type="button" className={styles.chartSelect}>
                Logged time
                <SelectChevron />
              </button>
            </div>
            <ReportsChart dailyPoints={summary.dailyPoints} />
          </section>

          <section className={styles.tableSection}>
            <div className={styles.tableHeader}>
              <h2 className={styles.sectionTitle}>Project and task breakdown</h2>
              <div className={styles.tableControls}>
                <span className={styles.tableControlLabel}>Breakdown by:</span>
                <button type="button" className={styles.tableSelect}>
                  Project
                  <SelectChevron />
                </button>
                <span className={styles.tableControlLabel}>and:</span>
                <button type="button" className={styles.tableSelect}>
                  Task
                  <SelectChevron />
                </button>
              </div>
            </div>

            <div className={styles.tableWrap}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Project | Task</th>
                    <th>Client</th>
                    <th>Logged Time</th>
                    <th>Estimated Time</th>
                    <th className={styles.centerCell}>Billable</th>
                    <th>Amount</th>
                    <th>Billable %</th>
                  </tr>
                </thead>
                <tbody>
                  {summary.projectRows.length === 0 ? (
                    <tr>
                      <td colSpan={7} className={styles.emptyRow}>
                        No logged time yet this week. Start tracking from the Timer view.
                      </td>
                    </tr>
                  ) : (
                    summary.projectRows.map((row) => {
                      const billablePercent = row.billable
                        ? summary.loggedMs > 0
                          ? ((row.loggedMs / summary.loggedMs) * 100).toFixed(2)
                          : '100.00'
                        : '0.00';

                      return (
                        <tr key={row.id}>
                          <td>
                            <span className={styles.projectNameCell}>
                              <span className={styles.expandIcon}>›</span>
                              <span
                                className={styles.projectColorSwatch}
                                style={{
                                  backgroundColor: getProjectChartColor(row.name, projectNames),
                                }}
                                aria-hidden="true"
                              />
                              {row.name}{' '}
                              <span className={styles.rowCount}>({row.taskCount})</span>
                            </span>
                          </td>
                          <td>{row.client}</td>
                          <td>{formatReportDuration(row.loggedMs, true)}</td>
                          <td>—</td>
                          <td className={styles.centerCell}>
                            {row.billable ? '$' : '—'}
                          </td>
                          <td>{formatReportAmount(row.amount)}</td>
                          <td>{billablePercent}%</td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            <div className={styles.tableFooter}>
              <span>1 of 1</span>
              <div className={styles.pagination}>
                <button type="button" disabled>
                  ‹
                </button>
                <button type="button" disabled>
                  ›
                </button>
              </div>
            </div>
          </section>
          </div>
        </div>
      ) : (
        <div className={summary.includesSampleData ? styles.samplePanel : undefined}>
          {summary.includesSampleData && (
            <div className={styles.sampleBanner} role="status">
              <div className={styles.sampleBannerContent}>
                <span className={styles.sampleBadge}>Sample</span>
                <span className={styles.sampleBannerText}>
                  Sample preview. Start tracking to see your own week here.
                </span>
              </div>
              <button type="button" className={styles.sampleBannerAction} onClick={dismissSampleData}>
                Remove sample data
              </button>
            </div>
          )}

          <section
            className={`${styles.timeLogsPlaceholder} ${summary.includesSampleData ? styles.samplePanelBody : ''}`}
          >
          <h2 className={styles.sectionTitle}>Time logs</h2>
          <p className={styles.placeholderText}>
            A detailed log of your entries for the week — optimized for solo tracking without
            team member columns.
          </p>
          {summary.projectRows.length === 0 ? (
            <p className={styles.placeholderText}>
              No logged time yet this week. Start tracking from the Timer view.
            </p>
          ) : (
            summary.projectRows.map((row) => (
              <div key={row.id} className={styles.timeLogRow}>
                <div>
                  <strong>{row.name}</strong>
                  <span className={styles.timeLogClient}>{row.client}</span>
                </div>
                <div className={styles.timeLogMeta}>
                  <span>{formatReportDuration(row.loggedMs, true)}</span>
                  {row.amount > 0 && (
                    <span className={styles.timeLogAmount}>{formatReportAmount(row.amount)}</span>
                  )}
                </div>
              </div>
            ))
          )}
          </section>
        </div>
      )}
    </div>
  );
}
