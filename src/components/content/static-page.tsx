export function StaticPage({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="section-shell py-12 md:py-16">
      <div className="mx-auto max-w-3xl">
        <h1 className="section-title">{title}</h1>
        <div className="prose prose-invert mt-8 max-w-none space-y-4 text-base leading-relaxed text-[var(--text-muted)]">
          {children}
        </div>
      </div>
    </div>
  );
}
