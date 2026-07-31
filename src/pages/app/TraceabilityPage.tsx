import { useState } from 'react';
import { PageHeader, Panel } from '@/components/ui';
import { mockBatches } from '@/data/mockWorkflow';
import { useBatches } from '@/store/BatchContext';

const stages = ['Source', 'Collection', 'Analysis', 'Aggregation', 'Listing', 'Purchase', 'Shipment', 'Processing', 'Final Output'];

export default function TraceabilityPage() {
  const { batches: scanned } = useBatches();

  const combined = [
    ...scanned.map((b) => ({ id: b.id, code: b.code, materialType: b.materialType || b.analysis.detectedFiber, location: b.location || 'Unassigned', isScanned: true, statusIdx: b.status === 'Sold' ? 8 : b.status === 'Listed' ? 4 : 2 })),
    ...mockBatches.map((b, i) => ({ id: b.id, code: b.code, materialType: b.materialType, location: b.location, isScanned: false, statusIdx: Math.min(stages.length - 1, (i + 1) * 2) })),
  ];

  const [batchId, setBatchId] = useState(combined[0]?.id);
  const batch = combined.find((b) => b.id === batchId) ?? combined[0];

  if (!batch) {
    return (
      <div>
        <PageHeader eyebrow="Traceability" title="Material Provenance" />
        <Panel className="text-[13px] text-stone">No batches yet — scan one in AI Analysis to see its provenance trail here.</Panel>
      </div>
    );
  }

  return (
    <div>
      <PageHeader eyebrow="Traceability" title="Material Provenance" />
      <div className="mb-5 flex flex-wrap gap-2">
        {combined.map((b) => (
          <button
            key={b.id}
            onClick={() => setBatchId(b.id)}
            className={`rounded-full border px-3 py-1.5 text-[12px] ${b.id === batchId ? 'border-amber/50 bg-amber/10 text-amber' : 'border-line text-stone'}`}
          >
            {b.code}{b.isScanned ? ' (live)' : ''}
          </button>
        ))}
      </div>

      <Panel>
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="text-[15px] text-bone">{batch.materialType}</div>
            <div className="text-[12px] text-stone">{batch.code} · {batch.location}</div>
          </div>
          <div className="rounded-lg border border-line bg-white/[0.03] px-3 py-2 text-center text-[11px] text-stone">
            QR PLACEHOLDER
          </div>
        </div>

        <ol className="relative ml-3 space-y-6 border-l border-line pl-6">
          {stages.map((stage, i) => (
            <li key={stage} className="relative">
              <span className={`absolute -left-[29px] top-0.5 h-3 w-3 rounded-full border-2 ${i <= batch.statusIdx ? 'border-amber bg-amber' : 'border-line-strong bg-carbon'}`} />
              <div className={`text-[13px] ${i <= batch.statusIdx ? 'text-bone' : 'text-stone'}`}>{stage}</div>
              {i <= batch.statusIdx && <div className="text-[11px] text-stone">Recorded by {batch.location.split(',')[0]} operations</div>}
            </li>
          ))}
        </ol>
      </Panel>
    </div>
  );
}