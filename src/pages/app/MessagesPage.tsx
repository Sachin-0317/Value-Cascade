import { useState } from 'react';
import { Send } from 'lucide-react';
import { PageHeader, Panel } from '@/components/ui';
import { mockOrganizations } from '@/data/mockOrganizations';

const conversations = [
  { id: 'c1', orgId: 'org-buyer', last: 'Can you confirm the pickup window for Thursday?', unread: 2, order: 'VC-ORD-3034' },
  { id: 'c2', orgId: 'org-recycler', last: 'Sending over the RFQ for the selvedge lot.', unread: 0, order: undefined },
];

export default function MessagesPage() {
  const [activeId, setActiveId] = useState(conversations[0].id);
  const [draft, setDraft] = useState('');
  const active = conversations.find((c) => c.id === activeId)!;
  const org = mockOrganizations.find((o) => o.id === active.orgId);

  return (
    <div>
      <PageHeader eyebrow="Messages" title="Conversations" />
      <div className="grid gap-4 lg:grid-cols-[280px_1fr]">
        <Panel className="p-2">
          {conversations.map((c) => {
            const o = mockOrganizations.find((x) => x.id === c.orgId);
            return (
              <button key={c.id} onClick={() => setActiveId(c.id)} className={`block w-full rounded-lg px-3 py-2.5 text-left ${c.id === activeId ? 'bg-amber/10' : 'hover:bg-white/[0.03]'}`}>
                <div className="flex items-center justify-between">
                  <span className="text-[13px] text-bone">{o?.name}</span>
                  {c.unread > 0 && <span className="rounded-full bg-amber px-1.5 text-[10px] text-[#161311]">{c.unread}</span>}
                </div>
                <div className="truncate text-[11px] text-stone">{c.last}</div>
              </button>
            );
          })}
        </Panel>

        <Panel className="flex flex-col">
          <div className="border-b border-line pb-3">
            <div className="text-[14px] text-bone">{org?.name}</div>
            {active.order && <div className="text-[11px] text-stone">Linked to order {active.order}</div>}
          </div>
          <div className="flex-1 space-y-3 py-4">
            <div className="max-w-[75%] rounded-xl rounded-tl-sm bg-white/[0.04] px-3.5 py-2.5 text-[13px] text-bone">{active.last}</div>
          </div>
          <div className="flex items-center gap-2 border-t border-line pt-3">
            <input value={draft} onChange={(e) => setDraft(e.target.value)} placeholder="Type a message…" className="flex-1 rounded-lg border border-line bg-white/[0.03] px-3 py-2.5 text-[13px] text-bone focus:border-amber/60 focus:outline-none" />
            <button onClick={() => setDraft('')} className="rounded-lg bg-amber p-2.5 text-[#161311]"><Send size={15} /></button>
          </div>
        </Panel>
      </div>
    </div>
  );
}
