import { useMemo, useState } from 'react';
import { LayoutGrid, List, Search } from 'lucide-react';
import { PageHeader, Panel, StatusBadge, SecondaryButton, PrimaryButton, EmptyState } from '@/components/ui';
import { mockBatches, mockInventory } from '@/data/mockWorkflow';
import { useBatches, type BatchStatus } from '@/store/BatchContext';
import { useToast } from '@/components/Toast';
import type { InventoryStatus } from '@/types';
import { NewListingModal } from './ListingsPage';

const statuses: (InventoryStatus | 'All')[] = ['All', 'Draft', 'Pending Analysis', 'Analyzed', 'Respinnable', 'Ready for Sale', 'Listed', 'Reserved', 'In Transit', 'Sold', 'Recycled', 'Rejected'];
const LISTABLE: BatchStatus[] = ['Ready for Sale'];

interface InventoryRow {
  id: string;
  code: string;
  materialType: string;
  imageUrl: string | null;
  quantityKg: number;
  storageLocation: string;
  status: InventoryStatus;
  contaminationLabel: string;
  scannedBatchId: string | null;
}

export default function InventoryPage() {
  const { show } = useToast();
  const { batches } = useBatches();
  const [view, setView] = useState<'card' | 'table'>('card');
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState<(typeof statuses)[number]>('All');
  const [listingBatchId, setListingBatchId] = useState<string | null>(null);

  const rows = useMemo<InventoryRow[]>(() => {
    const scannedRows: InventoryRow[] = batches.map((b) => ({
      id: b.id,
      code: b.code,
      materialType: b.materialType || b.analysis.detectedFiber,
      imageUrl: b.imageUrl,
      quantityKg: b.weightKg,
      storageLocation: b.location || 'Unassigned',
      status: b.status,
      contaminationLabel: `${b.analysis.contaminationGrade} (Grade ${b.analysis.hfcf.finalGrade})`,
      scannedBatchId: b.id,
    }));

    const mockRows: InventoryRow[] = mockInventory.map((item) => {
      const batch = mockBatches.find((b) => b.id === item.batchId)!;
      return {
        id: item.id,
        code: batch.code,
        materialType: batch.materialType,
        imageUrl: batch.imageUrl,
        quantityKg: item.quantityKg,
        storageLocation: item.storageLocation,
        status: item.status,
        contaminationLabel: `${batch.contaminationPct}%`,
        scannedBatchId: null,
      };
    });

    return [...scannedRows, ...mockRows]
      .filter((r) => r.materialType.toLowerCase().includes(query.toLowerCase()) || r.code.toLowerCase().includes(query.toLowerCase()))
      .filter((r) => status === 'All' || r.status === status);
  }, [batches, query, status]);

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
          {rows.map((row) => (
            <Panel key={row.id}>
              {row.imageUrl ? (
                <img src={row.imageUrl} alt={row.materialType} className="mb-3 h-32 w-full rounded-lg object-cover" />
              ) : (
                <div className="mb-3 flex h-32 w-full items-center justify-center rounded-lg border border-dashed border-line-strong text-[11px] text-stone">No photo</div>
              )}
              <div className="mb-2 flex items-start justify-between gap-2">
                <div>
                  <div className="text-[13px] text-bone">{row.materialType}</div>
                  <div className="text-[11px] text-stone">{row.code}</div>
                </div>
                <StatusBadge status={row.status} />
              </div>
              <dl className="grid grid-cols-2 gap-y-1 text-[12px] text-stone">
                <dt>Quantity</dt><dd className="text-right text-bone">{row.quantityKg}kg</dd>
                <dt>Storage</dt><dd className="text-right text-bone">{row.storageLocation}</dd>
                <dt>Contamination</dt><dd className="text-right text-bone">{row.contaminationLabel}</dd>
              </dl>
              <div className="mt-3 flex gap-2">
                <SecondaryButton className="flex-1" onClick={() => show(`Viewing lifecycle history for ${row.code}.`, 'info')}>View Details</SecondaryButton>
                {row.scannedBatchId && LISTABLE.includes(row.status as BatchStatus) && (
                  <PrimaryButton className="flex-1" onClick={() => setListingBatchId(row.scannedBatchId)}>List for Sale</PrimaryButton>
                )}
              </div>
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
              {rows.map((row) => (
                <tr key={row.id} className="border-b border-line last:border-0">
                  <td className="px-4 py-3 text-stone">{row.code}</td>
                  <td className="px-4 py-3 text-bone">{row.materialType}</td>
                  <td className="px-4 py-3">{row.quantityKg}kg</td>
                  <td className="px-4 py-3 text-stone">{row.storageLocation}</td>
                  <td className="px-4 py-3"><StatusBadge status={row.status} /></td>
                  <td className="px-4 py-3 text-right space-x-3">
                    {row.scannedBatchId && LISTABLE.includes(row.status as BatchStatus) && (
                      <button onClick={() => setListingBatchId(row.scannedBatchId)} className="text-amber">List</button>
                    )}
                    <button onClick={() => show(`Viewing lifecycle history for ${row.code}.`, 'info')} className="text-stone hover:text-amber">View</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Panel>
      )}

      {listingBatchId && <NewListingModal batchId={listingBatchId} onClose={() => setListingBatchId(null)} />}
    </div>
  );
}