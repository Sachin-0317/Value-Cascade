import { useMemo, useState } from 'react';
import { Search, MapPin, ShieldCheck } from 'lucide-react';
import { PageHeader, Panel, PrimaryButton, SecondaryButton, EmptyState } from '@/components/ui';
import { useListings } from '@/store/ListingContext';
import { useToast } from '@/components/Toast';

export default function MarketplacePage() {
  const { show } = useToast();
  const { listings: allListings } = useListings();
  const [query, setQuery] = useState('');
  const [maxPrice, setMaxPrice] = useState(100);
  const [minQuality, setMinQuality] = useState(0);

  const listings = useMemo(
    () =>
      allListings
        .filter((l) => l.status === 'Published')
        .filter((l) => l.title.toLowerCase().includes(query.toLowerCase()) || l.material.toLowerCase().includes(query.toLowerCase()))
        .filter((l) => l.pricePerKgInr <= maxPrice && l.qualityScore >= minQuality),
    [allListings, query, maxPrice, minQuality]
  );

  return (
    <div>
      <PageHeader eyebrow="Circular Marketplace" title="Source Recovered Material" />

      <div className="grid gap-4 lg:grid-cols-[240px_1fr]">
        <Panel className="h-fit lg:sticky lg:top-20">
          <h3 className="mb-3 text-[13px] text-stone">Filters</h3>
          <div className="relative mb-3.5">
            <Search size={14} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-stone" />
            <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Fiber, waste type…" className="w-full rounded-lg border border-line bg-white/[0.03] py-2.5 pl-8 pr-3 text-[13px] text-bone focus:border-amber/60 focus:outline-none" />
          </div>
          <label className="mb-1 block text-[11px] text-stone">Max price ₹{maxPrice}/kg</label>
          <input type="range" min={10} max={100} value={maxPrice} onChange={(e) => setMaxPrice(Number(e.target.value))} className="mb-3.5 w-full accent-amber" />
          <label className="mb-1 block text-[11px] text-stone">Min quality score {minQuality}</label>
          <input type="range" min={0} max={100} value={minQuality} onChange={(e) => setMinQuality(Number(e.target.value))} className="w-full accent-amber" />
          <div className="mt-4 space-y-1.5 border-t border-line pt-4 text-[12px] text-stone">
            <p>Composition, contamination, quantity, location and certification filters apply automatically to matched listings.</p>
          </div>
        </Panel>

        {listings.length === 0 ? (
          <EmptyState title="No listings match your filters" description="Widen your price or quality range to see more recovered material." />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {listings.map((l) => (
              <Panel key={l.id} className="flex flex-col">
                <div className="mb-2 flex items-start justify-between gap-2">
                  <h3 className="text-[14px] leading-snug text-bone">{l.title}</h3>
                </div>
                <p className="text-[12px] text-stone">{l.material}</p>
                <div className="my-3 flex items-center gap-3 text-[11px] text-stone">
                  <span className="inline-flex items-center gap-1"><MapPin size={12} /> {l.location}</span>
                  {l.certifications.length > 0 && <span className="inline-flex items-center gap-1 text-sage"><ShieldCheck size={12} /> {l.certifications.join(', ')}</span>}
                </div>
                <div className="mb-3 grid grid-cols-3 gap-2 text-center">
                  <MiniStat label="Price" value={`₹${l.pricePerKgInr}/kg`} />
                  <MiniStat label="Qty" value={`${l.quantityKg}kg`} />
                  <MiniStat label="Quality" value={`${l.qualityScore}`} />
                </div>
                <div className="mt-auto flex gap-2">
                  <PrimaryButton className="flex-1" onClick={() => show(`Quote requested for ${l.title}.`)}>Request Quote</PrimaryButton>
                  <SecondaryButton onClick={() => show('Saved to your watchlist.', 'info')}>Save</SecondaryButton>
                </div>
              </Panel>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-line bg-white/[0.03] py-1.5">
      <div className="text-[12px] text-amber">{value}</div>
      <div className="text-[10px] uppercase text-stone">{label}</div>
    </div>
  );
}