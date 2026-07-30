import { PageHeader, Panel, PrimaryButton, SecondaryButton, StatusBadge } from '@/components/ui';
import { useToast } from '@/components/Toast';

const shipments = [
  { id: 's1', order: 'VC-ORD-3034', carrier: 'VRL Logistics', status: 'Scheduled', pickup: '31 Jul 2026' },
  { id: 's2', order: 'VC-ORD-3021', carrier: 'Safe Express', status: 'Delivered', pickup: '17 Jul 2026' },
];

export default function LogisticsPage() {
  const { show } = useToast();
  return (
    <div>
      <PageHeader
        eyebrow="Logistics"
        title="Pickups & Shipments"
        action={<PrimaryButton onClick={() => show('Pickup request logged.')}>+ Request Pickup</PrimaryButton>}
      />
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
