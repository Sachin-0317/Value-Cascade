import { useMemo, useState } from 'react';
import { LayoutGrid, List, Search } from 'lucide-react';
import { PageHeader, Panel, StatusBadge, SecondaryButton, EmptyState } from '@/components/ui';
import { mockBatches, mockInventory } from '@/data/mockWorkflow';
import { useToast } from '@/components/Toast';
import type { InventoryStatus } from '@/types';

const statuses: (InventoryStatus | 'All')[] = ['All', 'Draft', 'Pending Analysis', 'Analyzed', 'Respinnable', 'Ready for Sale', 'Listed', 'Reserved', 'In Transit', 'Sold', 'Recycled', 'Rejected'];

export default function InventoryPage() {
  const { show } = useToast();
  const [view, setView] = useState<'card' | 'table'>('card');
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState<(typeof statuses)[number]>('All');

  const rows = useMemo(() => {
    return mockInventory
      .map((item) => ({ item, batch: mockBatches.find((b) => b.id === item.batchId)! }))
      .filter(({ batch }) => batch.materialType.toLowerCase().includes(query.toLowerCase()) || batch.code.toLowerCase().includes(query.toLowerCase()))
      .filter(({ item }) => status === 'All' || item.status === status);
  }, [query, status]);

  return (
    <div>
      <PageHeader eyebrow="Digital Inventory" title="Batch Inventory" />

      <div className="mb-4 flex flex-wrap items-center gap-2.5">
        <div className="relative flex-1 min-w-[220px]">
          <Search size={14} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-stone" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by material or batch code…"
            className="w-full rounded-lg border border-line bg-panel py-2.5 pl-8 pr-3 text-[13px] text-bone focus:border-amber/60 focus:outline-none"
          />
        </div>
        <select value={status} onChange={(e) => setStatus(e.target.value as typeof status)} className="rounded-lg border border-line bg-panel px-3 py-2.5 text-[13px] text-bone focus:border-amber/60 focus:outline-none">
          {statuses.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
        <div className="flex overflow-hidden rounded-lg border border-line">
          <button onClick={() => setView('card')} className={`p-2.5 ${view === 'card' ? 'bg-amber/10 text-amber' : 'text-stone'}`}><LayoutGrid size={15} /></button>
          <button onClick={() => setView('table')} className={`p-2.5 ${view === 'table' ? 'bg-amber/10 text-amber' : 'text-stone'}`}><List size={15} /></button>
        </div>
        <SecondaryButton onClick={() => show(`Bulk actions applied to ${rows.length} item(s).`)}>Bulk Actions</SecondaryButton>
      </div>

      {rows.length === 0 ? (
        <EmptyState title="No batches match your filters" description="Try clearing the search or status filter, or upload a new batch for analysis." />
      ) : view === 'card' ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {rows.map(({ item, batch }) => (
            <Panel key={item.id}>
              <img src={batch.imageUrl} alt={batch.materialType} className="mb-3 h-32 w-full rounded-lg object-cover" />
              <div className="mb-2 flex items-start justify-between gap-2">
                <div>
                  <div className="text-[13px] text-bone">{batch.materialType}</div>
                  <div className="text-[11px] text-stone">{batch.code}</div>
                </div>
                <StatusBadge status={item.status} />
              </div>
              <dl className="grid grid-cols-2 gap-y-1 text-[12px] text-stone">
                <dt>Quantity</dt><dd className="text-right text-bone">{item.quantityKg}kg</dd>
                <dt>Storage</dt><dd className="text-right text-bone">{item.storageLocation}</dd>
                <dt>Contamination</dt><dd className="text-right text-bone">{batch.contaminationPct}%</dd>
              </dl>
              <SecondaryButton className="mt-3 w-full" onClick={() => show(`Viewing lifecycle history for ${batch.code}.`, 'info')}>View Details</SecondaryButton>
            </Panel>
          ))}
        </div>
      ) : (
        <Panel className="overflow-x-auto p-0">
          <table className="w-full min-w-[720px] text-left text-[13px]">
            <thead>
              <tr className="border-b border-line text-[11px] uppercase tracking-wide text-stone">
                <th className="px-4 py-3">Batch</th>
                <th className="px-4 py-3">Material</th>
                <th className="px-4 py-3">Qty</th>
                <th className="px-4 py-3">Storage</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {rows.map(({ item, batch }) => (
                <tr key={item.id} className="border-b border-line last:border-0">
                  <td className="px-4 py-3 text-stone">{batch.code}</td>
                  <td className="px-4 py-3 text-bone">{batch.materialType}</td>
                  <td className="px-4 py-3">{item.quantityKg}kg</td>
                  <td className="px-4 py-3 text-stone">{item.storageLocation}</td>
                  <td className="px-4 py-3"><StatusBadge status={item.status} /></td>
                  <td className="px-4 py-3 text-right">
                    <button onClick={() => show(`Viewing lifecycle history for ${batch.code}.`, 'info')} className="text-amber">View</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Panel>
      )}
    </div>
  );
}
