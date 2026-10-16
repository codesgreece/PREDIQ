import type { PerformanceMetrics } from "@/lib/metrics/performance";

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
    <div className="rounded-xl border border-[var(--border)] bg-[var(--card)]/70 p-5">
      <p className="text-xs uppercase tracking-[0.16em] text-[var(--text-muted)]">
        {label}
      </p>
      <p className="mt-3 font-[family-name:var(--font-display)] text-3xl text-[var(--text)]">
        {value}
      </p>
      {hint ? <p className="mt-2 text-xs text-[var(--text-muted)]">{hint}</p> : null}
    </div>
  );
}

export function PerformanceOverview({
  metrics,
  title = "Prediction performance",
}: {
  metrics: PerformanceMetrics;
  title?: string;
}) {
  if (metrics.totalPublished === 0) {
    return (
      <section className="rounded-2xl border border-dashed border-white/10 bg-[var(--card)]/40 p-8 text-center">
        <h2 className="font-[family-name:var(--font-display)] text-2xl text-[var(--text)]">
          {title}
        </h2>
        <p className="mt-3 text-sm text-[var(--text-muted)]">
          No published predictions yet. Performance metrics appear only from
          real published records.
        </p>
      </section>
    );
  }

  return (
    <section>
      <div className="mb-6">
        <h2 className="font-[family-name:var(--font-display)] text-3xl text-[var(--text)]">
          {title}
        </h2>
        <p className="mt-2 max-w-2xl text-sm text-[var(--text-muted)]">
          Hit rate excludes pending selections. ROI is shown only when every
          settled won/lost record includes valid stake and odds.
        </p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Metric label="Settled" value={String(metrics.settled)} />
        <Metric label="Won" value={String(metrics.won)} />
        <Metric label="Lost" value={String(metrics.lost)} />
        <Metric label="Pending" value={String(metrics.pending)} />
        <Metric
          label="Hit rate"
          value={
            metrics.hitRate == null ? "—" : `${metrics.hitRate.toFixed(1)}%`
          }
          hint="Won / (Won + Lost)"
        />
        <Metric
          label="ROI"
          value={metrics.roi == null ? "—" : `${metrics.roi.toFixed(1)}%`}
          hint={
            metrics.roi == null
              ? metrics.roiIncompleteCount > 0
                ? "Incomplete stake/odds data"
                : "Insufficient settled stake/odds data"
              : `P/L ${metrics.profitLoss?.toFixed(2)}`
          }
        />
      </div>
    </section>
  );
}
