export function StaticPage({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 md:px-6">
      <h1 className="font-[family-name:var(--font-display)] text-4xl">{title}</h1>
      <div className="prose prose-invert mt-6 max-w-none text-[var(--text-muted)]">
        {children}
      </div>
    </div>
  );
}
