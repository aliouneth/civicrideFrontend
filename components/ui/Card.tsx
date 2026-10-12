export function Card({ className = "", children }: { className?: string; children: React.ReactNode }) {
  return (
    <section className={`rounded-xl border border-line bg-card p-4 shadow-sm transition-transform duration-200 ease-out ${className}`}>
      {children}
    </section>
  );
}
