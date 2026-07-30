import { FileText, Download } from 'lucide-react';
import { PageHeader, Panel, SecondaryButton } from '@/components/ui';
import { useToast } from '@/components/Toast';

const reportTypes = ['AI Analysis', 'Inventory', 'Sales', 'Procurement', 'Traceability', 'Sustainability', 'Regional', 'Cooperative Contribution'];

export default function ReportsPage() {
  const { show } = useToast();
  return (
    <div>
      <PageHeader eyebrow="Reports" title="Reports & Exports" />
      <div className="grid gap-3.5 sm:grid-cols-2 lg:grid-cols-3">
        {reportTypes.map((t) => (
          <Panel key={t} className="flex items-center justify-between gap-3">
            <span className="flex items-center gap-2.5 text-[13px] text-bone"><FileText size={16} className="text-amber" /> {t} Report</span>
            <div className="flex gap-1.5">
              <SecondaryButton onClick={() => show(`${t} report opened as printable HTML.`, 'info')}>View</SecondaryButton>
              <button onClick={() => show(`${t} report exported as CSV.`)} className="rounded-lg border border-line-strong p-2 text-stone hover:text-amber"><Download size={14} /></button>
            </div>
          </Panel>
        ))}
      </div>
    </div>
  );
}
