import { PageHeader, Panel, PrimaryButton, SecondaryButton, StatusBadge } from '@/components/ui';
import { mockRFQs } from '@/data/mockWorkflow';
import { useToast } from '@/components/Toast';

export default function ProcurementPage() {
  const { show } = useToast();
  return (
    <div>
      <PageHeader
        eyebrow="Procurement"
        title="RFQs & Sourcing"
        action={<PrimaryButton onClick={() => show('RFQ draft created — set quantity and target price.')}>+ New RFQ</PrimaryButton>}
      />
      <div className="space-y-3">
        {mockRFQs.map((r) => (
          <Panel key={r.id} className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="text-[14px] text-bone">{r.quantityKg}kg requested · ₹{r.targetPriceInr}/kg target</div>
              <div className="text-[12px] text-stone">Delivery to {r.deliveryLocation} · {r.qualityNotes}</div>
            </div>
            <div className="flex items-center gap-3">
              <StatusBadge status={r.status} />
              <SecondaryButton onClick={() => show('Viewing supplier responses.', 'info')}>View Offers</SecondaryButton>
            </div>
          </Panel>
        ))}
      </div>
    </div>
  );
}
