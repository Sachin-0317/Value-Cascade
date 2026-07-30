import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ScanLine, Upload } from 'lucide-react';
import { PageHeader, Panel, PrimaryButton, SecondaryButton } from '@/components/ui';
import { analysisService, type AnalysisInput } from '@/services/analysisService';
import type { AnalysisResult } from '@/types';
import { useToast } from '@/components/Toast';

const wasteCategories = ['Cutting Scrap', 'Selvedge', 'Yarn Waste', 'Fabric Rejects', 'Sludge', 'Dust & Fly', 'Rags', 'Post-Consumer'];

const scanSteps = ['Reading image metadata', 'Segmenting material regions', 'Classifying fiber composition', 'Scoring contamination & moisture', 'Estimating recoverable value'];

export default function AnalysisPage() {
  const { show } = useToast();
  const navigate = useNavigate();
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [form, setForm] = useState<AnalysisInput & { sourceUnit: string; threadCount: string; fiberLength: string; location: string; notes: string }>({
    materialType: '', wasteCategory: wasteCategories[0], weightKg: 100, color: '', moisturePct: 6,
    contaminationPct: 5, sourceUnit: '', threadCount: '', fiberLength: '', location: '', notes: '',
  });
  const [status, setStatus] = useState<'idle' | 'scanning' | 'done'>('idle');
  const [scanStep, setScanStep] = useState(0);
  const [result, setResult] = useState<AnalysisResult | null>(null);

  function update<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setImagePreview(URL.createObjectURL(file));
  }

  async function runAnalysis(e: React.FormEvent) {
    e.preventDefault();
    if (!form.materialType || !imagePreview) {
      show('Add a batch photo and material type before scanning.', 'info');
      return;
    }
    setStatus('scanning');
    setScanStep(0);
    const stepTimer = setInterval(() => setScanStep((s) => Math.min(s + 1, scanSteps.length - 1)), 420);
    const res = await analysisService.analyze(form);
    clearInterval(stepTimer);
    setResult(res);
    setStatus('done');
  }

  function reset() {
    setStatus('idle');
    setResult(null);
    setImagePreview(null);
    setForm((f) => ({ ...f, materialType: '', notes: '' }));
  }

  return (
    <div>
      <PageHeader eyebrow="AI Material Analysis" title="Scan a Batch" />

      {status !== 'done' && (
        <div className="grid gap-4 lg:grid-cols-[1fr_1.2fr]">
          <Panel>
            <h3 className="mb-3.5 text-[15px]">Batch Photo</h3>
            <label className="flex aspect-[4/3] w-full cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-line-strong bg-white/[0.02] text-stone hover:border-amber/50">
              {imagePreview ? (
                <img src={imagePreview} alt="Batch preview" className="h-full w-full rounded-xl object-cover" />
              ) : (
                <>
                  <Upload size={22} />
                  <span className="text-xs">Drag & drop or click to upload a batch photo</span>
                </>
              )}
              <input type="file" accept="image/*" className="hidden" onChange={handleFile} />
            </label>
            {status === 'scanning' && (
              <div className="mt-4 space-y-2 rounded-lg border border-amber/25 bg-amber/[0.06] p-3.5">
                <div className="flex items-center gap-2 text-[13px] text-amber"><ScanLine size={15} className="animate-pulse" /> {scanSteps[scanStep]}…</div>
                <div className="h-1.5 overflow-hidden rounded-full bg-white/10">
                  <div className="h-full rounded-full bg-amber transition-all duration-500" style={{ width: `${((scanStep + 1) / scanSteps.length) * 100}%` }} />
                </div>
              </div>
            )}
          </Panel>

          <Panel>
            <h3 className="mb-3.5 text-[15px]">Batch Metadata</h3>
            <form onSubmit={runAnalysis} className="grid grid-cols-2 gap-3.5">
              <TextField label="Material type" value={form.materialType} onChange={(v) => update('materialType', v)} placeholder="e.g. Cotton Cutting Scrap" full />
              <SelectField label="Waste category" value={form.wasteCategory} onChange={(v) => update('wasteCategory', v)} options={wasteCategories} />
              <NumberField label="Weight (kg)" value={form.weightKg} onChange={(v) => update('weightKg', v)} />
              <TextField label="Source unit" value={form.sourceUnit} onChange={(v) => update('sourceUnit', v)} placeholder="Cutting Floor 2" />
              <TextField label="Color" value={form.color} onChange={(v) => update('color', v)} placeholder="Indigo Mix" />
              <NumberField label="Thread count" value={Number(form.threadCount) || 0} onChange={(v) => update('threadCount', String(v))} />
              <NumberField label="Moisture (%)" value={form.moisturePct} onChange={(v) => update('moisturePct', v)} />
              <NumberField label="Contamination (%)" value={form.contaminationPct} onChange={(v) => update('contaminationPct', v)} />
              <NumberField label="Fiber length (mm)" value={Number(form.fiberLength) || 0} onChange={(v) => update('fiberLength', String(v))} />
              <TextField label="Location" value={form.location} onChange={(v) => update('location', v)} placeholder="Coimbatore, TN" />
              <div className="col-span-2">
                <label className="mb-1.5 block text-xs text-stone">Notes</label>
                <textarea
                  value={form.notes}
                  onChange={(e) => update('notes', e.target.value)}
                  rows={2}
                  className="w-full rounded-lg border border-line bg-white/[0.03] px-3 py-2.5 text-sm text-bone focus:border-amber/60 focus:outline-none"
                />
              </div>
              <div className="col-span-2 mt-1">
                <PrimaryButton type="submit" className="w-full">
                  {status === 'scanning' ? 'Scanning…' : 'Run AI Analysis'}
                </PrimaryButton>
              </div>
            </form>
          </Panel>
        </div>
      )}

      {status === 'done' && result && (
        <div className="grid gap-4 lg:grid-cols-[1fr_1.2fr]">
          <Panel>
            {imagePreview && <img src={imagePreview} alt="Analyzed batch" className="mb-4 aspect-[4/3] w-full rounded-xl object-cover" />}
            <div className="grid grid-cols-2 gap-3">
              <ResultTile label="Detected Fiber" value={result.detectedFiber} />
              <ResultTile label="Confidence" value={`${result.confidencePct}%`} />
              <ResultTile label="Recoverability" value={`${result.recoverabilityPct}%`} />
              <ResultTile label="Contamination" value={result.contaminationGrade} />
              <ResultTile label="Est. Yarn Length" value={`${result.estimatedYarnLengthM.toLocaleString('en-IN')} m`} />
              <ResultTile label="Est. Value" value={`₹${result.estimatedPriceInr.toLocaleString('en-IN')}`} />
            </div>
          </Panel>

          <Panel>
            <div className="mb-1 inline-flex items-center rounded-full border border-amber/30 bg-amber/10 px-3 py-1 text-xs font-medium text-amber">
              Recommended: {result.recommendedRoute}
            </div>
            <p className="mt-3 text-[13px] leading-relaxed text-stone">{result.reasoning}</p>

            <div className="mt-4 grid grid-cols-2 gap-3">
              <ResultTile label="CO₂ Saved" value={`${result.co2SavedKg} kg`} />
              <ResultTile label="Water Saved" value={`${result.waterSavedL.toLocaleString('en-IN')} L`} />
            </div>

            <h4 className="mb-2 mt-5 text-[13px] text-stone">Composition</h4>
            <div className="space-y-2">
              {result.composition.map((c) => (
                <div key={c.fiber}>
                  <div className="mb-1 flex justify-between text-[12px]"><span>{c.fiber}</span><span className="text-amber">{c.pct}%</span></div>
                  <div className="h-1.5 overflow-hidden rounded-full bg-white/10"><div className="h-full rounded-full bg-amber" style={{ width: `${c.pct}%` }} /></div>
                </div>
              ))}
            </div>

            <div className="mt-6 flex flex-wrap gap-2">
              <PrimaryButton onClick={() => { show('Batch saved to inventory as Ready for Sale.'); navigate('/app/inventory'); }}>Save to Inventory</PrimaryButton>
              <SecondaryButton onClick={() => { show('Listing draft created from this batch.'); navigate('/app/listings'); }}>Create Listing</SecondaryButton>
              <SecondaryButton onClick={() => show('Report generated — available in Reports.')}>Generate Report</SecondaryButton>
              <SecondaryButton onClick={reset}>Scan Another Batch</SecondaryButton>
            </div>
          </Panel>
        </div>
      )}
    </div>
  );
}

function ResultTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-line bg-white/[0.03] px-3.5 py-3">
      <div className="text-[11px] uppercase tracking-wide text-stone">{label}</div>
      <div className="mt-1 text-[15px] text-bone">{value}</div>
    </div>
  );
}

function TextField({ label, value, onChange, placeholder, full }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string; full?: boolean }) {
  return (
    <div className={full ? 'col-span-2' : ''}>
      <label className="mb-1.5 block text-xs text-stone">{label}</label>
      <input value={value} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} className="w-full rounded-lg border border-line bg-white/[0.03] px-3 py-2.5 text-sm text-bone focus:border-amber/60 focus:outline-none" />
    </div>
  );
}

function NumberField({ label, value, onChange }: { label: string; value: number; onChange: (v: number) => void }) {
  return (
    <div>
      <label className="mb-1.5 block text-xs text-stone">{label}</label>
      <input type="number" value={value} onChange={(e) => onChange(Number(e.target.value))} className="w-full rounded-lg border border-line bg-white/[0.03] px-3 py-2.5 text-sm text-bone focus:border-amber/60 focus:outline-none" />
    </div>
  );
}

function SelectField({ label, value, onChange, options }: { label: string; value: string; onChange: (v: string) => void; options: string[] }) {
  return (
    <div>
      <label className="mb-1.5 block text-xs text-stone">{label}</label>
      <select value={value} onChange={(e) => onChange(e.target.value)} className="w-full rounded-lg border border-line bg-white/[0.03] px-3 py-2.5 text-sm text-bone focus:border-amber/60 focus:outline-none">
        {options.map((o) => <option key={o} value={o}>{o}</option>)}
      </select>
    </div>
  );
}
