import { useMemo, useState } from 'react';
import { LayoutGrid, List, Search } from 'lucide-react';
import { PageHeader, Panel, StatusBadge, SecondaryButton, PrimaryButton, EmptyState, Modal } from '@/components/ui';
import { mockBatches, mockInventory } from '@/data/mockWorkflow';
import { useBatches, type BatchStatus, type ScannedBatch } from '@/store/BatchContext';
import { useToast } from '@/components/Toast';
import type { InventoryStatus, WasteBatch } from '@/types';
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
  mockBatch: WasteBatch | null;
}

export default function InventoryPage() {
  const { show } = useToast();
  const { batches, getBatch } = useBatches();
  const [view, setView] = useState<'card' | 'table'>('card');
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState<(typeof statuses)[number]>('All');
  const [listingBatchId, setListingBatchId] = useState<string | null>(null);
  const [viewingRow, setViewingRow] = useState<InventoryRow | null>(null);

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
      mockBatch: null,
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
        mockBatch: batch,
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
                <SecondaryButton className="flex-1" onClick={() => setViewingRow(row)}>View Details</SecondaryButton>
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
                    <button onClick={() => setViewingRow(row)} className="text-stone hover:text-amber">View</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Panel>
      )}

      {listingBatchId && <NewListingModal batchId={listingBatchId} onClose={() => setListingBatchId(null)} />}
      {viewingRow && (
        <DetailModal
          row={viewingRow}
          scannedBatch={viewingRow.scannedBatchId ? getBatch(viewingRow.scannedBatchId) : undefined}
          onClose={() => setViewingRow(null)}
        />
      )}
    </div>
  );
}

function DetailModal({ row, scannedBatch, onClose }: { row: InventoryRow; scannedBatch?: ScannedBatch; onClose: () => void }) {
  return (
    <Modal title={`${row.code} — Batch Details`} onClose={onClose}>
      <dl className="grid grid-cols-2 gap-y-2 text-[13px]">
        <dt className="text-stone">Material</dt><dd className="text-right text-bone">{row.materialType}</dd>
        <dt className="text-stone">Quantity</dt><dd className="text-right text-bone">{row.quantityKg}kg</dd>
        <dt className="text-stone">Storage / Location</dt><dd className="text-right text-bone">{row.storageLocation}</dd>
        <dt className="text-stone">Status</dt><dd className="text-right text-bone">{row.status}</dd>
      </dl>

      {scannedBatch ? (
        <div className="space-y-3 border-t border-line pt-4">
          <dl className="grid grid-cols-2 gap-y-2 text-[13px]">
            <dt className="text-stone">Detected Fiber</dt><dd className="text-right text-bone">{scannedBatch.analysis.detectedFiber}</dd>
            <dt className="text-stone">Final Grade</dt><dd className="text-right text-amber">{scannedBatch.analysis.hfcf.finalGrade}</dd>
            <dt className="text-stone">Contamination Level</dt><dd className="text-right text-bone">{scannedBatch.analysis.hfcf.contaminationLevel}</dd>
            <dt className="text-stone">Provenance</dt><dd className="text-right text-bone">{scannedBatch.analysis.hfcf.provenanceLevel} ({scannedBatch.analysis.hfcf.provenanceStars}★)</dd>
            <dt className="text-stone">Recoverability</dt><dd className="text-right text-bone">{scannedBatch.analysis.recoverabilityPct}%</dd>
            <dt className="text-stone">Confidence</dt><dd className="text-right text-bone">{scannedBatch.analysis.confidencePct}%</dd>
            <dt className="text-stone">Recommended Route</dt><dd className="text-right text-bone">{scannedBatch.analysis.recommendedRoute}</dd>
            <dt className="text-stone">Recovery Pathway</dt><dd className="text-right text-bone">{scannedBatch.analysis.hfcf.pathway}</dd>
            <dt className="text-stone">Est. Yarn Length</dt><dd className="text-right text-bone">{scannedBatch.analysis.estimatedYarnLengthM}m</dd>
            <dt className="text-stone">Est. Price</dt><dd className="text-right text-bone">₹{scannedBatch.analysis.estimatedPriceInr}</dd>
            <dt className="text-stone">CO₂ Saved</dt><dd className="text-right text-bone">{scannedBatch.analysis.co2SavedKg}kg</dd>
            <dt className="text-stone">Water Saved</dt><dd className="text-right text-bone">{scannedBatch.analysis.waterSavedL}L</dd>
          </dl>

          {scannedBatch.analysis.hfcf.hubs.length > 0 && (
            <div>
              <div className="mb-1.5 text-[11px] uppercase tracking-wide text-stone">Recommended Hubs</div>
              <ul className="space-y-1 text-[12px] text-bone">
                {scannedBatch.analysis.hfcf.hubs.map((h) => (
                  <li key={h.name}>• {h.name} ({h.region}) — {h.keyFacts}</li>
                ))}
              </ul>
            </div>
          )}

          {scannedBatch.analysis.hfcf.productSuggestions.length > 0 && (
            <div>
              <div className="mb-1.5 text-[11px] uppercase tracking-wide text-stone">Suggested Products</div>
              <ul className="space-y-1 text-[12px] text-bone">
                {scannedBatch.analysis.hfcf.productSuggestions.map((p) => (
                  <li key={p.product}>• {p.product}</li>
                ))}
              </ul>
            </div>
          )}

          <p className="text-[12px] text-stone">{scannedBatch.analysis.reasoning}</p>
        </div>
      ) : row.mockBatch ? (
        <div className="space-y-2 border-t border-line pt-4 text-[13px]">
          <dl className="grid grid-cols-2 gap-y-2">
            <dt className="text-stone">Source Unit</dt><dd className="text-right text-bone">{row.mockBatch.sourceUnit}</dd>
            <dt className="text-stone">Color</dt><dd className="text-right text-bone">{row.mockBatch.color}</dd>
            <dt className="text-stone">Moisture</dt><dd className="text-right text-bone">{row.mockBatch.moisturePct}%</dd>
            <dt className="text-stone">Contamination</dt><dd className="text-right text-bone">{row.mockBatch.contaminationPct}%</dd>
            {row.mockBatch.fiberLengthMm && (<><dt className="text-stone">Fiber Length</dt><dd className="text-right text-bone">{row.mockBatch.fiberLengthMm}mm</dd></>)}
          </dl>
          {row.mockBatch.notes && <p className="text-[12px] text-stone">{row.mockBatch.notes}</p>}
        </div>
      ) : (
        <p className="text-[12px] text-stone border-t border-line pt-4">No further detail recorded for this batch.</p>
      )}
    </Modal>
  );
}