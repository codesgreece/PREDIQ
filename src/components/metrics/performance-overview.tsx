import type { PerformanceMetrics } from "@/lib/metrics/performance";
import { el } from "@/lib/i18n/el";

function Metric({
  label,
  value,
  hint,
}: {
  label: string;
  value: string;
  hint?: string;
}) {
  return (
    <div className="surface-card p-3.5 md:p-4">
      <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--text-muted)]">
        {label}
      </p>
      <p className="mt-1.5 font-[family-name:var(--font-display)] text-2xl tracking-tight text-[var(--text)]">
        {value}
      </p>
      {hint ? <p className="mt-1 text-xs text-[var(--text-muted)]">{hint}</p> : null}
    </div>
  );
}

export function PerformanceOverview({
  metrics,
  title = el.performance.title,
}: {
  metrics: PerformanceMetrics;
  title?: string;
}) {
  if (metrics.totalPublished === 0) {
    return (
      <section className="empty-state">
        <h2 className="section-title mb-1">{title}</h2>
        <p>{el.performance.empty}</p>
      </section>
    );
  }

  return (
    <section>
      <div className="mb-3">
        <h2 className="section-title">{title}</h2>
        <p className="section-subtitle">{el.performance.subtitle}</p>
      </div>
      <div className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
        <Metric label={el.performance.settled} value={String(metrics.settled)} />
        <Metric label={el.performance.won} value={String(metrics.won)} />
        <Metric label={el.performance.lost} value={String(metrics.lost)} />
        <Metric label={el.performance.pending} value={String(metrics.pending)} />
        <Metric
          label={el.performance.hitRate}
          value={
            metrics.hitRate == null ? "—" : `${metrics.hitRate.toFixed(1)}%`
          }
          hint={el.performance.hitRateHint}
        />
        <Metric
          label={el.performance.roi}
          value={metrics.roi == null ? "—" : `${metrics.roi.toFixed(1)}%`}
          hint={
            metrics.roi == null
              ? metrics.roiIncompleteCount > 0
                ? el.performance.roiIncomplete
                : el.performance.roiInsufficient
              : `P/L ${metrics.profitLoss?.toFixed(2)}`
          }
        />
      </div>
    </section>
  );
}
