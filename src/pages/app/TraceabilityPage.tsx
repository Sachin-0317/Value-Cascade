import { useState } from 'react';
import { PageHeader, Panel } from '@/components/ui';
import { mockBatches } from '@/data/mockWorkflow';

const stages = ['Source', 'Collection', 'Analysis', 'Aggregation', 'Listing', 'Purchase', 'Shipment', 'Processing', 'Final Output'];

export default function TraceabilityPage() {
  const [batchId, setBatchId] = useState(mockBatches[0].id);
  const batch = mockBatches.find((b) => b.id === batchId)!;
  const completedIndex = Math.min(stages.length - 1, Math.floor((mockBatches.indexOf(batch) + 1) * 2));

  return (
    <div>
      <PageHeader eyebrow="Traceability" title="Material Provenance" />
      <div className="mb-5 flex flex-wrap gap-2">
        {mockBatches.map((b) => (
          <button
            key={b.id}
            onClick={() => setBatchId(b.id)}
            className={`rounded-full border px-3 py-1.5 text-[12px] ${b.id === batchId ? 'border-amber/50 bg-amber/10 text-amber' : 'border-line text-stone'}`}
          >
            {b.code}
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
              <span className={`absolute -left-[29px] top-0.5 h-3 w-3 rounded-full border-2 ${i <= completedIndex ? 'border-amber bg-amber' : 'border-line-strong bg-carbon'}`} />
              <div className={`text-[13px] ${i <= completedIndex ? 'text-bone' : 'text-stone'}`}>{stage}</div>
              {i <= completedIndex && <div className="text-[11px] text-stone">Recorded by {batch.location.split(',')[0]} operations</div>}
            </li>
          ))}
        </ol>
      </Panel>
    </div>
  );
}
