import { useMemo, useState } from 'react';
import { useAppState } from '../../hooks/useAppState';
import { buildReportsSummary, formatReportAmount, formatReportDuration, getChartMaxHours, getChartYTicks } from '../../lib/reportsData';
import styles from './ReportsView.module.css';

const CHART_HEIGHT = 220;

function ReportsChart({ dailyPoints }: { dailyPoints: { shortLabel: string; loggedMs: number }[] }) {
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

  const bars = dailyPoints.map((point, index) => {
    const ratio = Math.min(point.loggedMs / maxMs, 1);
    const barHeight = ratio * innerHeight;
    const x = padding.left + index * slotWidth + (slotWidth - barWidth) / 2;
    const y = padding.top + innerHeight - barHeight;

    return {
      x,
      y,
      width: barWidth,
      height: point.loggedMs > 0 ? Math.max(barHeight, 3) : 0,
      label: point.shortLabel,
    };
  });

  return (
    <div className={styles.chartWrap}>
      <svg viewBox={`0 0 ${width} ${CHART_HEIGHT}`} className={styles.chartSvg} aria-hidden="true">
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

        {bars.map((bar) => (
          <rect
            key={bar.label}
            x={bar.x}
            y={bar.y}
            width={bar.width}
            height={bar.height}
            rx={4}
            className={styles.chartBar}
          />
        ))}

        {bars.map((bar) => (
          <text
            key={`${bar.label}-x`}
            x={bar.x + bar.width / 2}
            y={CHART_HEIGHT - 6}
            className={styles.chartXLabel}
            textAnchor="middle"
          >
            {bar.label}
          </text>
        ))}
      </svg>
      <div className={styles.chartLegend}>
        <span className={styles.chartLegendBar} />
        Logged time
      </div>
    </div>
  );
}

export function ReportsView() {
  const { state, dispatch } = useAppState();
  const [activeTab, setActiveTab] = useState<'summary' | 'timelogs'>('summary');
  const summary = useMemo(() => buildReportsSummary(state), [state]);

  const dismissSampleData = () => dispatch({ type: 'DISMISS_REPORTS_SAMPLE_DATA' });

  return (
    <div className={styles.view}>
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
          <span className={styles.filterIcon}>⛃</span> Filters
        </button>
      </div>

      {activeTab === 'summary' ? (
        <div className={summary.includesSampleData ? styles.samplePanel : undefined}>
          {summary.includesSampleData && (
            <div className={styles.sampleBanner} role="status">
              <div className={styles.sampleBannerContent}>
                <span className={styles.sampleBadge}>Sample</span>
                <span className={styles.sampleBannerText}>
                  Preview data for this week — not from your actual time entries.
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
                Logged time ▾
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
                  Project ▾
                </button>
                <span className={styles.tableControlLabel}>and:</span>
                <button type="button" className={styles.tableSelect}>
                  Task ▾
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
                            <span className={styles.expandIcon}>›</span>
                            {row.name}{' '}
                            <span className={styles.rowCount}>({row.taskCount})</span>
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
                  Preview data for this week — not from your actual time entries.
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
