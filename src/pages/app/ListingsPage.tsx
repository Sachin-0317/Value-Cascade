import { PageHeader, Panel, PrimaryButton, SecondaryButton, StatusBadge } from '@/components/ui';
import { mockListings } from '@/data/mockWorkflow';
import { useToast } from '@/components/Toast';

export default function ListingsPage() {
  const { show } = useToast();
  return (
    <div>
      <PageHeader
        eyebrow="Seller Listings"
        title="My Listings"
        action={<PrimaryButton onClick={() => show('Listing created from inventory selection.')}>+ New Listing</PrimaryButton>}
      />
      <div className="space-y-3">
        {mockListings.map((l) => (
          <Panel key={l.id} className="flex flex-wrap items-center justify-between gap-4">
            <div className="min-w-0">
              <div className="text-[14px] text-bone">{l.title}</div>
              <div className="text-[12px] text-stone">{l.material} · {l.quantityKg}kg · ₹{l.pricePerKgInr}/kg</div>
            </div>
            <div className="flex items-center gap-3">
              <StatusBadge status={l.status} />
              <SecondaryButton onClick={() => show(`Editing ${l.title}.`, 'info')}>Edit</SecondaryButton>
              {l.status === 'Published' ? (
                <SecondaryButton onClick={() => show(`${l.title} paused.`)}>Pause</SecondaryButton>
              ) : l.status === 'Paused' || l.status === 'Draft' ? (
                <PrimaryButton onClick={() => show(`${l.title} published to marketplace.`)}>Publish</PrimaryButton>
              ) : null}
            </div>
          </Panel>
        ))}
      </div>
    </div>
  );
}
