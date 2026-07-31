import { FileText, Download } from 'lucide-react';
import { PageHeader, Panel, SecondaryButton } from '@/components/ui';
import { useToast } from '@/components/Toast';
import { useBatches } from '@/store/BatchContext';
import { useListings } from '@/store/ListingContext';
import { mockOrders } from '@/data/mockWorkflow';

const reportTypes = ['AI Analysis', 'Inventory', 'Sales', 'Procurement', 'Traceability', 'Sustainability', 'Regional', 'Cooperative Contribution'] as const;

function getRows(type: string, batches: ReturnType<typeof useBatches>['batches'], listings: ReturnType<typeof useListings>['listings']) {
  switch (type) {
    case 'AI Analysis':
      return batches.map((b) => ({ Code: b.code, Material: b.materialType || b.analysis.detectedFiber, Grade: b.analysis.hfcf.finalGrade, Confidence: `${b.analysis.confidencePct}%`, Recoverability: `${b.analysis.recoverabilityPct}%`, Route: b.analysis.recommendedRoute }));
    case 'Inventory':
      return batches.map((b) => ({ Code: b.code, Material: b.materialType, WeightKg: b.weightKg, Status: b.status, Location: b.location }));
    case 'Sales':
      return listings.map((l) => ({ Title: l.title, Material: l.material, QtyKg: l.quantityKg, PricePerKg: l.pricePerKgInr, Status: l.status }));
    case 'Procurement':
      return mockOrders.map((o) => ({ Order: o.code, QtyKg: o.quantityKg, TotalInr: o.totalInr, Status: o.shipmentStatus }));
    case 'Sustainability':
      return batches.map((b) => ({ Code: b.code, CO2SavedKg: b.analysis.co2SavedKg, WaterSavedL: b.analysis.waterSavedL }));
    case 'Traceability':
      return batches.map((b) => ({ Code: b.code, Material: b.materialType, Location: b.location, CreatedAt: b.createdAt }));
    default:
      return batches.map((b) => ({ Code: b.code, Location: b.location, Status: b.status }));
  }
}

function toCsv(rows: Record<string, unknown>[]): string {
  if (rows.length === 0) return 'No data available for this report yet.';
  const headers = Object.keys(rows[0]);
  const lines = [headers.join(','), ...rows.map((r) => headers.map((h) => JSON.stringify(r[h] ?? '')).join(','))];
  return lines.join('\n');
}

export default function ReportsPage() {
  const { show } = useToast();
  const { batches } = useBatches();
  const { listings } = useListings();

  function handleView(type: string) {
    const rows = getRows(type, batches, listings);
    const win = window.open('', '_blank');
    if (!win) { show('Pop-up blocked — allow pop-ups to view reports.', 'info'); return; }
    const headers = rows.length ? Object.keys(rows[0]) : [];
    win.document.write(`
      <html><head><title>${type} Report</title>
      <style>
        body{font-family:sans-serif;background:#0b0d0c;color:#eee8d1;padding:32px;}
        h1{font-size:20px;} table{width:100%;border-collapse:collapse;margin-top:16px;}
        th,td{border:1px solid rgba(238,232,209,.15);padding:8px 12px;font-size:13px;text-align:left;}
        th{color:#e5a437;}
      </style></head><body>
      <h1>${type} Report</h1>
      <p style="color:#9c948a;font-size:12px;">Generated ${new Date().toLocaleString('en-IN')} · ${rows.length} record(s)</p>
      ${rows.length === 0 ? '<p>No data recorded yet for this report.</p>' : `
      <table><thead><tr>${headers.map((h) => `<th>${h}</th>`).join('')}</tr></thead>
      <tbody>${rows.map((r) => `<tr>${headers.map((h) => `<td>${String((r as Record<string, unknown>)[h] ?? '')}</td>`).join('')}</tr>`).join('')}</tbody></table>`}
      </body></html>
    `);
    win.document.close();
  }

  function handleDownload(type: string) {
    const rows = getRows(type, batches, listings);
    const csv = toCsv(rows);
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${type.replace(/\s+/g, '-').toLowerCase()}-report.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    show(`${type} report downloaded as CSV.`);
  }

  return (
    <div>
      <PageHeader eyebrow="Reports" title="Reports & Exports" />
      <div className="grid gap-3.5 sm:grid-cols-2 lg:grid-cols-3">
        {reportTypes.map((t) => (
          <Panel key={t} className="flex items-center justify-between gap-3">
            <span className="flex items-center gap-2.5 text-[13px] text-bone"><FileText size={16} className="text-amber" /> {t} Report</span>
            <div className="flex gap-1.5">
              <SecondaryButton onClick={() => handleView(t)}>View</SecondaryButton>
              <button onClick={() => handleDownload(t)} className="rounded-lg border border-line-strong p-2 text-stone hover:text-amber"><Download size={14} /></button>
            </div>
          </Panel>
        ))}
      </div>
    </div>
  );
}