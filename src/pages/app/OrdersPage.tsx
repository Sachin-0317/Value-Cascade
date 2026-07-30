import { useState } from 'react';
import { PageHeader, Panel, StatusBadge, SecondaryButton } from '@/components/ui';
import { mockOrders, mockListings } from '@/data/mockWorkflow';
import { mockOrganizations } from '@/data/mockOrganizations';
import { useToast } from '@/components/Toast';

export default function OrdersPage() {
  const { show } = useToast();
  const [openId, setOpenId] = useState<string | null>(mockOrders[0]?.id ?? null);

  return (
    <div>
      <PageHeader eyebrow="Orders & Transactions" title="Orders" />
      <div className="space-y-3">
        {mockOrders.map((o) => {
          const listing = mockListings.find((l) => l.id === o.listingId);
          const buyer = mockOrganizations.find((x) => x.id === o.buyerOrgId);
          const seller = mockOrganizations.find((x) => x.id === o.sellerOrgId);
          const open = openId === o.id;
          return (
            <Panel key={o.id}>
              <button className="flex w-full flex-wrap items-center justify-between gap-4 text-left" onClick={() => setOpenId(open ? null : o.id)}>
                <div>
                  <div className="text-[14px] text-bone">{o.code}</div>
                  <div className="text-[12px] text-stone">{listing?.title} · {o.quantityKg}kg</div>
                </div>
                <div className="flex items-center gap-2.5">
                  <StatusBadge status={o.paymentStatus} />
                  <StatusBadge status={o.shipmentStatus} />
                  <span className="text-[13px] text-amber">₹{o.totalInr.toLocaleString('en-IN')}</span>
                </div>
              </button>
              {open && (
                <div className="mt-4 border-t border-line pt-4 text-[13px]">
                  <div className="mb-3 grid grid-cols-2 gap-3 text-stone sm:grid-cols-4">
                    <div><div className="text-[11px] uppercase">Buyer</div><div className="text-bone">{buyer?.name}</div></div>
                    <div><div className="text-[11px] uppercase">Seller</div><div className="text-bone">{seller?.name}</div></div>
                    <div><div className="text-[11px] uppercase">Payment</div><div className="text-bone">{o.paymentStatus}</div></div>
                    <div><div className="text-[11px] uppercase">Shipment</div><div className="text-bone">{o.shipmentStatus}</div></div>
                  </div>
                  <ol className="mb-4 flex flex-wrap gap-2 text-[11px] text-stone">
                    {['Order Placed', 'Payment', 'Pickup Scheduled', 'In Transit', 'Delivered'].map((step, i) => (
                      <li key={step} className={`rounded-full border px-2.5 py-1 ${i <= 2 ? 'border-amber/30 bg-amber/10 text-amber' : 'border-line'}`}>{step}</li>
                    ))}
                  </ol>
                  <div className="flex flex-wrap gap-2">
                    <SecondaryButton onClick={() => show('Invoice placeholder generated.', 'info')}>View Invoice</SecondaryButton>
                    <SecondaryButton onClick={() => show('Delivery confirmed by buyer.')}>Confirm Delivery</SecondaryButton>
                    <SecondaryButton onClick={() => show('Dispute flagged for review.', 'info')}>Raise Dispute</SecondaryButton>
                  </div>
                </div>
              )}
            </Panel>
          );
        })}
      </div>
    </div>
  );
}
