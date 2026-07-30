import { Link } from 'react-router-dom';
import { PageHeader, Panel, StatTile, SecondaryButton, StatusBadge } from '@/components/ui';
import { useToast } from '@/components/Toast';

const pendingOrgs = [
  { name: 'Erode Weaving Cluster', type: 'Weaving Unit', status: 'Pending' },
  { name: 'Ludhiana Recyclers Guild', type: 'Recycler', status: 'Pending' },
];

const auditLog = [
  { actor: 'admin@valuecascade.demo', action: 'Approved organization', target: 'Surat Fibre Recovery', time: '2h ago' },
  { actor: 'system', action: 'Flagged listing for review', target: 'VC-LIST-118', time: '5h ago' },
];

export default function AdminPage() {
  const { show } = useToast();
  return (
    <div className="min-h-svh bg-background px-4 py-8 text-bone lg:px-10">
      <div className="mx-auto max-w-6xl">
        <div className="mb-6 flex items-center justify-between">
          <Link to="/app/dashboard" className="text-xs text-stone hover:text-amber">← Back to app</Link>
        </div>
        <PageHeader eyebrow="Platform Administration" title="Admin Console" />

        <div className="mb-4 grid grid-cols-2 gap-3.5 lg:grid-cols-4">
          <StatTile value="482" label="Active Organizations" />
          <StatTile value="18" label="Pending Verification" />
          <StatTile value="3" label="Open Disputes" />
          <StatTile value="99.9%" label="Uptime" />
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <Panel>
            <h3 className="mb-3.5 text-[15px]">Organization Verification</h3>
            <div className="space-y-2.5">
              {pendingOrgs.map((o) => (
                <div key={o.name} className="flex items-center justify-between gap-3 rounded-lg border border-line bg-white/[0.02] px-3.5 py-2.5">
                  <span>
                    <span className="block text-[13px] text-bone">{o.name}</span>
                    <span className="block text-[11px] text-stone">{o.type}</span>
                  </span>
                  <div className="flex items-center gap-2">
                    <StatusBadge status={o.status} />
                    <SecondaryButton onClick={() => show(`${o.name} approved.`)}>Approve</SecondaryButton>
                  </div>
                </div>
              ))}
            </div>
          </Panel>
          <Panel>
            <h3 className="mb-3.5 text-[15px]">Audit Log</h3>
            <div className="space-y-2.5">
              {auditLog.map((l, i) => (
                <div key={i} className="rounded-lg border border-line bg-white/[0.02] px-3.5 py-2.5 text-[12px]">
                  <span className="text-bone">{l.actor}</span> <span className="text-stone">{l.action}</span> <span className="text-amber">{l.target}</span>
                  <span className="float-right text-stone">{l.time}</span>
                </div>
              ))}
            </div>
          </Panel>
        </div>
      </div>
    </div>
  );
}
