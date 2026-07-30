import { Link } from 'react-router-dom';
import { useAuth } from '@/store/AuthContext';
import { roleLabels } from '@/data/roles';
import { PageHeader, Panel, StatTile, StatusBadge } from '@/components/ui';
import { mockBatches, mockListings, mockNotifications, mockOrders } from '@/data/mockWorkflow';
import type { Role } from '@/types';

interface DashboardConfig {
  banner: string;
  stats: [string, string][];
  primaryAction: { label: string; to: string };
}

const sellerConfig = (label: string): DashboardConfig => ({
  banner: '3 buyer inquiries awaiting response · 1 batch flagged for re-scan',
  stats: [['6', 'Batches Scanned'], ['2.4t', 'Recoverable'], ['₹4,120', 'Est. Value']],
  primaryAction: { label: `Upload Waste (${label})`, to: '/app/analysis' },
});

const buyerConfig: DashboardConfig = {
  banner: '6 new lots match your specs · 1 sample request pending',
  stats: [['9', 'Lots Reviewed'], ['2.8t', 'Sourced This Month'], ['₹14,200', 'Spent This Week']],
  primaryAction: { label: 'Browse Marketplace', to: '/app/marketplace' },
};

const dashboardByRole: Record<Role, DashboardConfig> = {
  manufacturer: sellerConfig('Manufacturer'),
  cooperative: { ...sellerConfig('Cooperative'), banner: '2 member batches awaiting review · 1 batch flagged for re-scan' },
  exporter: sellerConfig('Exporter'),
  recycler: { ...buyerConfig, banner: '4 new listings match your sourcing criteria · 1 order awaiting pickup confirmation' },
  yarn_buyer: buyerConfig,
  fabric_buyer: buyerConfig,
  biomass_buyer: { ...buyerConfig, banner: '5 biomass-grade lots available within 100km' },
  brand: { banner: '2 supplier certificates pending review · Q3 impact report ready', stats: [['14', 'Suppliers Tracked'], ['6.2t', 'Recycled Content Sourced'], ['92%', 'Traceability Coverage']], primaryAction: { label: 'Review Suppliers', to: '/app/traceability' } },
  logistics: { banner: '5 pickups scheduled today · 1 shipment delayed at customs', stats: [['11', 'Active Shipments'], ['3', 'Pickups Today'], ['97%', 'On-Time Rate']], primaryAction: { label: 'View Logistics Board', to: '/app/logistics' } },
  government: { banner: 'Quarterly compliance report due in 12 days', stats: [['186t', 'Waste Diverted (Region)'], ['42', 'Registered Facilities'], ['118K t', 'CO₂ Saved (Region)']], primaryAction: { label: 'Open Reports', to: '/app/reports' } },
  ngo: { banner: '3 cooperative programmes reporting this week', stats: [['28', 'Cooperatives Tracked'], ['312t', 'Waste Recovered'], ['64', 'Beneficiaries Reached']], primaryAction: { label: 'View Analytics', to: '/app/analytics' } },
  research: { banner: 'New anonymized dataset available for Q3', stats: [['1,204', 'Batches in Dataset'], ['18', 'Material Categories'], ['92%', 'Avg Confidence']], primaryAction: { label: 'View Analytics', to: '/app/analytics' } },
  admin: { banner: '18 new organizations pending verification · 3 support tickets open', stats: [['482', 'Active Organizations'], ['1,204t', 'Waste Processed'], ['₹1.2Cr', 'GMV This Month']], primaryAction: { label: 'Open Admin Console', to: '/admin' } },
};

export default function DashboardPage() {
  const { user, role, activeOrganization } = useAuth();
  if (!role) return null;
  const config = dashboardByRole[role];
  const unread = mockNotifications.filter((n) => !n.read);

  return (
    <div>
      <PageHeader
        eyebrow="Operations Platform"
        title={`Welcome back, ${user?.name.split(' ')[0]}`}
        action={<span className="rounded-full border border-line px-3 py-1.5 text-[11px] text-stone">{roleLabels[role]} · {activeOrganization?.location}</span>}
      />

      <div className="mb-5 flex items-center justify-between gap-3 rounded-xl border border-amber/25 bg-amber/[0.06] px-4 py-3 text-[13px]">
        <span>{config.banner}</span>
        <Link to="/app/notifications" className="shrink-0 text-amber">View all →</Link>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.2fr_.8fr]">
        <Panel>
          <h3 className="mb-3.5 text-[15px]">This Week</h3>
          <div className="grid grid-cols-3 gap-3.5">
            {config.stats.map(([v, l]) => <StatTile key={l} value={v} label={l} />)}
          </div>
        </Panel>
        <Panel>
          <h3 className="mb-1.5 text-[15px]">Quick Action</h3>
          <p className="mb-4 text-[13px] text-stone">Jump straight into your primary workflow.</p>
          <Link
            to={config.primaryAction.to}
            className="block rounded-lg border border-dashed border-line-strong px-5 py-6 text-center text-[13px] text-stone hover:border-amber/50 hover:text-amber"
          >
            {config.primaryAction.label} →
          </Link>
        </Panel>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <Panel>
          <h3 className="mb-3.5 text-[15px]">Recent Batches</h3>
          <div className="space-y-2.5">
            {mockBatches.slice(0, 4).map((b) => (
              <div key={b.id} className="flex items-center justify-between gap-3 rounded-lg border border-line bg-white/[0.02] px-3.5 py-2.5">
                <span className="min-w-0">
                  <span className="block truncate text-[13px] text-bone">{b.materialType}</span>
                  <span className="block text-[11px] text-stone">{b.code} · {b.weightKg}kg</span>
                </span>
                <StatusBadge status={b.status} />
              </div>
            ))}
          </div>
        </Panel>
        <Panel>
          <h3 className="mb-3.5 text-[15px]">Marketplace Activity</h3>
          <div className="space-y-2.5">
            {mockListings.slice(0, 4).map((l) => (
              <div key={l.id} className="flex items-center justify-between gap-3 rounded-lg border border-line bg-white/[0.02] px-3.5 py-2.5">
                <span className="min-w-0">
                  <span className="block truncate text-[13px] text-bone">{l.title}</span>
                  <span className="block text-[11px] text-stone">₹{l.pricePerKgInr}/kg · {l.location}</span>
                </span>
                <StatusBadge status={l.status} />
              </div>
            ))}
          </div>
        </Panel>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <Panel>
          <h3 className="mb-3.5 text-[15px]">Recent Orders</h3>
          <div className="space-y-2.5">
            {mockOrders.map((o) => (
              <div key={o.id} className="flex items-center justify-between gap-3 rounded-lg border border-line bg-white/[0.02] px-3.5 py-2.5">
                <span className="min-w-0">
                  <span className="block truncate text-[13px] text-bone">{o.code}</span>
                  <span className="block text-[11px] text-stone">{o.quantityKg}kg · ₹{o.totalInr.toLocaleString('en-IN')}</span>
                </span>
                <StatusBadge status={o.shipmentStatus} />
              </div>
            ))}
          </div>
        </Panel>
        <Panel>
          <h3 className="mb-3.5 text-[15px]">Unread Notifications</h3>
          <div className="space-y-2.5">
            {unread.length === 0 && <p className="text-[13px] text-stone">You're all caught up.</p>}
            {unread.map((n) => (
              <div key={n.id} className="rounded-lg border border-line bg-white/[0.02] px-3.5 py-2.5 text-[13px] text-bone">
                {n.message}
              </div>
            ))}
          </div>
        </Panel>
      </div>
    </div>
  );
}
