export function StaticPage({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="section-shell page-stack">
      <div className="mx-auto max-w-2xl">
        <h1 className="page-title">{title}</h1>
        <div className="prose prose-invert mt-4 max-w-none space-y-3 text-sm leading-relaxed text-[var(--text-muted)]">
          {children}
        </div>
      </div>
    </div>
  );
}
