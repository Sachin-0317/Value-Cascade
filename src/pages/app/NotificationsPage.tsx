import { useState } from 'react';
import { Bell, ScanLine, Handshake, FileText, Truck, CreditCard, AlertTriangle, Package } from 'lucide-react';
import { PageHeader, Panel, SecondaryButton } from '@/components/ui';
import { mockNotifications } from '@/data/mockWorkflow';
import type { Notification } from '@/types';

const icons: Record<Notification['type'], React.ComponentType<{ size?: number; className?: string }>> = {
  analysis: ScanLine, match: Handshake, rfq: FileText, sold: Package,
  shipment: Truck, payment: CreditCard, compliance: AlertTriangle, inventory: Bell,
};

export default function NotificationsPage() {
  const [items, setItems] = useState(mockNotifications);

  return (
    <div>
      <PageHeader
        eyebrow="Activity Center"
        title="Notifications"
        action={<SecondaryButton onClick={() => setItems((it) => it.map((n) => ({ ...n, read: true })))}>Mark all read</SecondaryButton>}
      />
      <div className="space-y-2.5">
        {items.map((n) => {
          const Icon = icons[n.type];
          return (
            <Panel key={n.id} className={`flex items-start gap-3 ${n.read ? 'opacity-70' : ''}`}>
              <Icon size={16} className="mt-0.5 shrink-0 text-amber" />
              <div className="min-w-0 flex-1">
                <p className="text-[13px] text-bone">{n.message}</p>
                <p className="mt-0.5 text-[11px] text-stone">{new Date(n.createdAt).toLocaleString('en-IN')}</p>
              </div>
              {!n.read && <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-amber" />}
            </Panel>
          );
        })}
      </div>
    </div>
  );
}
