import { PageHeader, Panel, PrimaryButton, SecondaryButton, StatusBadge } from '@/components/ui';
import { useToast } from '@/components/Toast';
import { useBatches } from '@/store/BatchContext';

const shipments = [
  { id: 's1', order: 'VC-ORD-3034', carrier: 'VRL Logistics', status: 'Scheduled', pickup: '31 Jul 2026' },
  { id: 's2', order: 'VC-ORD-3021', carrier: 'Safe Express', status: 'Delivered', pickup: '17 Jul 2026' },
];

export default function LogisticsPage() {
  const { show } = useToast();
  const { batches } = useBatches();
  return (
    <div>
      <PageHeader
        eyebrow="Logistics"
        title="Pickups & Shipments"
        action={<PrimaryButton onClick={() => show('Pickup request logged.')}>+ Request Pickup</PrimaryButton>}
      />

      <h3 className="mb-3 mt-1 text-[15px] text-bone">Recovery Hub Routing</h3>
      {batches.length === 0 ? (
        <Panel className="mb-6 text-[13px] text-stone">No scanned batches yet. Routing suggestions appear here once a batch is analyzed and saved to inventory.</Panel>
      ) : (
        <div className="mb-6 space-y-3">
          {batches.map((b) => (
            <Panel key={b.id} className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <div className="text-[14px] text-bone">{b.code} <span className="text-stone">· {b.materialType || b.analysis.detectedFiber}</span></div>
                <div className="text-[12px] text-stone">
                  Grade {b.analysis.hfcf.finalGrade} · {b.analysis.hfcf.pathway} · {b.weightKg} kg
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                {b.analysis.hfcf.hubs.map((h) => (
                  <span key={h.name} className="rounded-full border border-line bg-white/[0.03] px-3 py-1 text-[12px] text-bone" title={h.keyFacts}>
                    {h.name} · {h.region}
                  </span>
                ))}
                <SecondaryButton onClick={() => show(`Pickup requested to ${b.analysis.hfcf.hubs[0]?.name ?? 'nearest hub'}.`)}>Request Pickup</SecondaryButton>
              </div>
            </Panel>
          ))}
        </div>
      )}

      <h3 className="mb-3 text-[15px] text-bone">Shipments</h3>
      <div className="space-y-3">
        {shipments.map((s) => (
          <Panel key={s.id} className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="text-[14px] text-bone">{s.order}</div>
              <div className="text-[12px] text-stone">{s.carrier} · Pickup {s.pickup}</div>
            </div>
            <div className="flex items-center gap-3">
              <StatusBadge status={s.status} />
              <SecondaryButton onClick={() => show('Tracking timeline opened.', 'info')}>Track</SecondaryButton>
              <SecondaryButton onClick={() => show('Proof of delivery uploaded.')}>Upload POD</SecondaryButton>
            </div>
          </Panel>
        ))}
      </div>
    </div>
  );
}
