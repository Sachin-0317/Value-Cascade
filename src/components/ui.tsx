import type { ReactNode } from 'react';

export function Panel({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <div className={`rounded-[14px] border border-line bg-panel p-5 ${className}`}>{children}</div>;
}

export function StatTile({ value, label }: { value: string; label: string }) {
  return (
    <div className="rounded-[10px] border border-line bg-white/[0.03] p-4">
      <div className="text-2xl text-amber font-display">{value}</div>
      <div className="mt-1 text-[11px] uppercase tracking-wide text-stone">{label}</div>
    </div>
  );
}

const statusColors: Record<string, string> = {
  'Ready for Sale': 'text-sage border-sage/30 bg-sage/10',
  Listed: 'text-amber border-amber/30 bg-amber/10',
  Analyzed: 'text-stone border-line-strong bg-white/5',
  Sold: 'text-moss border-moss/30 bg-moss/10',
  Draft: 'text-stone border-line bg-white/[0.03]',
  'Pending Analysis': 'text-amber border-amber/30 bg-amber/10',
  Respinnable: 'text-sage border-sage/30 bg-sage/10',
  Reserved: 'text-amber border-amber/30 bg-amber/10',
  'In Transit': 'text-amber border-amber/30 bg-amber/10',
  Recycled: 'text-moss border-moss/30 bg-moss/10',
  Rejected: 'text-danger border-danger/30 bg-danger/10',
  Published: 'text-sage border-sage/30 bg-sage/10',
  Paused: 'text-stone border-line-strong bg-white/5',
  Closed: 'text-stone border-line bg-white/[0.03]',
  Pending: 'text-amber border-amber/30 bg-amber/10',
  Paid: 'text-sage border-sage/30 bg-sage/10',
  Delivered: 'text-sage border-sage/30 bg-sage/10',
  Scheduled: 'text-amber border-amber/30 bg-amber/10',
  Open: 'text-amber border-amber/30 bg-amber/10',
  Quoted: 'text-sage border-sage/30 bg-sage/10',
};

export function StatusBadge({ status }: { status: string }) {
  const cls = statusColors[status] ?? 'text-stone border-line bg-white/[0.03]';
  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] font-medium ${cls}`}>
      {status}
    </span>
  );
}

export function EmptyState({ title, description, action }: { title: string; description: string; action?: ReactNode }) {
  return (
    <div className="rounded-[14px] border border-dashed border-line-strong px-6 py-14 text-center">
      <h3 className="text-lg text-bone">{title}</h3>
      <p className="mx-auto mt-2 max-w-sm text-sm text-stone">{description}</p>
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

export function PageHeader({ eyebrow, title, action }: { eyebrow: string; title: string; action?: ReactNode }) {
  return (
    <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
      <div>
        <div className="text-[11px] uppercase tracking-[0.2em] text-amber">{eyebrow}</div>
        <h1 className="mt-1 text-2xl">{title}</h1>
      </div>
      {action}
    </div>
  );
}

export function PrimaryButton({ children, onClick, type = 'button', className = '' }: { children: ReactNode; onClick?: () => void; type?: 'button' | 'submit'; className?: string }) {
  return (
    <button
      type={type}
      onClick={onClick}
      className={`rounded-lg bg-amber px-4 py-2.5 text-[13px] font-semibold text-[#161311] transition-colors hover:bg-amber-soft ${className}`}
    >
      {children}
    </button>
  );
}

export function SecondaryButton({ children, onClick, className = '' }: { children: ReactNode; onClick?: () => void; className?: string }) {
  return (
    <button
      onClick={onClick}
      className={`rounded-lg border border-line-strong px-4 py-2.5 text-[13px] text-bone transition-colors hover:border-amber/60 hover:text-amber ${className}`}
    >
      {children}
    </button>
  );
}
