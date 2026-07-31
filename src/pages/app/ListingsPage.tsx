import { useState } from 'react';
import { PageHeader, Panel, PrimaryButton, SecondaryButton, StatusBadge, Modal, FieldLabel, TextField } from '@/components/ui';
import { useListings, type NewListingInput } from '@/store/ListingContext';
import { useBatches, type BatchStatus } from '@/store/BatchContext';
import { useToast } from '@/components/Toast';

const LISTABLE: BatchStatus[] = ['Ready for Sale'];

export default function ListingsPage() {
  const { show } = useToast();
  const { listings, setListingStatus } = useListings();
  const { batches } = useBatches();
  const [creating, setCreating] = useState(false);

  const listableBatches = batches.filter((b) => LISTABLE.includes(b.status));

  return (
    <div>
      <PageHeader
        eyebrow="Seller Listings"
        title="My Listings"
        action={
          <PrimaryButton onClick={() => setCreating(true)} disabled={listableBatches.length === 0}>
            + New Listing
          </PrimaryButton>
        }
      />
      {listableBatches.length === 0 && (
        <p className="mb-4 text-[12px] text-stone">
          No batches are currently eligible for a new listing — scan and analyze a batch first in AI Analysis.
        </p>
      )}
      <div className="space-y-3">
        {listings.map((l) => (
          <Panel key={l.id} className="flex flex-wrap items-center justify-between gap-4">
            <div className="min-w-0">
              <div className="text-[14px] text-bone">{l.title}</div>
              <div className="text-[12px] text-stone">{l.material} · {l.quantityKg}kg · ₹{l.pricePerKgInr}/kg</div>
            </div>
            <div className="flex items-center gap-3">
              <StatusBadge status={l.status} />
              <SecondaryButton onClick={() => show(`Editing ${l.title}.`, 'info')}>Edit</SecondaryButton>
              {l.status === 'Published' ? (
                <SecondaryButton onClick={() => { setListingStatus(l.id, 'Paused'); show(`${l.title} paused.`); }}>Pause</SecondaryButton>
              ) : l.status === 'Paused' || l.status === 'Draft' ? (
                <PrimaryButton onClick={() => { setListingStatus(l.id, 'Published'); show(`${l.title} published to marketplace.`); }}>Publish</PrimaryButton>
              ) : null}
            </div>
          </Panel>
        ))}
      </div>

      {creating && <NewListingModal onClose={() => setCreating(false)} />}
    </div>
  );
}

/** Shared create-listing modal — used from InventoryPage (batchId pre-picked) and here (pick from dropdown). */
export function NewListingModal({ batchId, onClose }: { batchId?: string; onClose: () => void }) {
  const { show } = useToast();
  const { createListing } = useListings();
  const { batches } = useBatches();

  const listableBatches = batches.filter((b) => LISTABLE.includes(b.status));
  const [selectedId, setSelectedId] = useState(batchId ?? listableBatches[0]?.id ?? '');
  const selected = batches.find((b) => b.id === selectedId);

  const [title, setTitle] = useState(selected ? `${selected.materialType} — ${selected.weightKg}kg` : '');
  const [price, setPrice] = useState(35);
  const [certs, setCerts] = useState('');

  if (listableBatches.length === 0) {
    return (
      <Modal title="New Listing" onClose={onClose}>
        <p className="text-[13px] text-stone">No batches are currently eligible for listing.</p>
      </Modal>
    );
  }

  const handleSelect = (id: string) => {
    setSelectedId(id);
    const b = batches.find((x) => x.id === id);
    if (b) setTitle(`${b.materialType} — ${b.weightKg}kg`);
  };

  const submit = () => {
    if (!selected) return;
    const input: NewListingInput = {
      batchId: selected.id,
      title: title.trim() || `${selected.materialType} — ${selected.weightKg}kg`,
      pricePerKgInr: Math.max(1, price),
      certifications: certs.split(',').map((c) => c.trim()).filter(Boolean),
    };
    createListing(input);
    show(`Listing created from ${selected.code}. Publish it to make it live on the marketplace.`);
    onClose();
  };

  return (
    <Modal
      title="New Listing"
      onClose={onClose}
      footer={
        <>
          <SecondaryButton onClick={onClose}>Cancel</SecondaryButton>
          <PrimaryButton onClick={submit}>Create Listing</PrimaryButton>
        </>
      }
    >
      <div>
        <FieldLabel>Batch</FieldLabel>
        <select
          value={selectedId}
          onChange={(e) => handleSelect(e.target.value)}
          disabled={!!batchId}
          className="w-full rounded-lg border border-line bg-panel px-3 py-2.5 text-[13px] text-bone focus:border-amber/60 focus:outline-none disabled:opacity-60"
        >
          {listableBatches.map((b) => (
            <option key={b.id} value={b.id}>{b.code} · {b.materialType} · {b.weightKg}kg</option>
          ))}
        </select>
      </div>
      <div>
        <FieldLabel>Listing title</FieldLabel>
        <TextField value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Indigo Cotton Cutting Scrap — 420kg" />
      </div>
      <div>
        <FieldLabel>Price per kg (₹)</FieldLabel>
        <TextField type="number" min={1} value={price} onChange={(e) => setPrice(Number(e.target.value))} />
      </div>
      <div>
        <FieldLabel>Certifications (comma separated, optional)</FieldLabel>
        <TextField value={certs} onChange={(e) => setCerts(e.target.value)} placeholder="GRS Ready, GOTS" />
      </div>
      {selected && (
        <p className="text-[11px] text-stone">
          From batch {selected.code} · {selected.analysis.contaminationGrade} contamination · {selected.location}
        </p>
      )}
    </Modal>
  );
}