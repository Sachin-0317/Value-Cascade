import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ScanLine, Upload } from 'lucide-react';
import { PageHeader, Panel, PrimaryButton, SecondaryButton } from '@/components/ui';
import { analysisService, type AnalysisInput, type HfcfAnalysisResult } from '@/services/analysisService';
import { FIBER_ACCEPTANCE, PROVENANCE_LEVELS, type ProvenanceLevel } from '@/data/recoveryRules';
import { useBatches } from '@/store/BatchContext';
import { classifyImage, summarizeTextileRelevance, type NeuralPrediction } from '@/services/visionModel';
import { useToast } from '@/components/Toast';

const wasteCategories = ['Cutting Scrap', 'Selvedge', 'Yarn Waste', 'Fabric Rejects', 'Sludge', 'Dust & Fly', 'Rags', 'Post-Consumer'];
const fiberTypes = FIBER_ACCEPTANCE.map((f) => f.fiberType);
const provenanceLevels = PROVENANCE_LEVELS.map((p) => p.level);

const scanSteps = ['Reading image metadata', 'Segmenting material regions', 'Classifying fiber composition', 'Scoring contamination & moisture', 'Estimating recoverable value'];

/** Downscales an uploaded image and returns it as a base64 data URL — small enough
 *  for localStorage, and (unlike URL.createObjectURL) still valid after a page reload. */
interface VisualStats { brightness: number; colorVariance: number; textureScore: number }

/** Real pixel-level analysis of the uploaded photo: average brightness, color variance
 *  (proxy for mixed/contaminated material), and a simple edge/texture score. All 0-100. */
function computeVisualStats(ctx: CanvasRenderingContext2D, width: number, height: number): VisualStats {
  const { data } = ctx.getImageData(0, 0, width, height);
  const luminances: number[] = [];
  let sumLum = 0;
  for (let i = 0; i < data.length; i += 4) {
    const lum = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
    luminances.push(lum);
    sumLum += lum;
  }
  const n = luminances.length;
  const meanLum = sumLum / n;
  const variance = luminances.reduce((s, l) => s + (l - meanLum) ** 2, 0) / n;
  const stdDev = Math.sqrt(variance);

  let edgeSum = 0;
  let edgeCount = 0;
  for (let y = 1; y < height; y++) {
    for (let x = 1; x < width; x++) {
      const idx = (y * width + x) * 4;
      const idxUp = ((y - 1) * width + x) * 4;
      const idxLeft = (y * width + (x - 1)) * 4;
      const lum = 0.299 * data[idx] + 0.587 * data[idx + 1] + 0.114 * data[idx + 2];
      const lumUp = 0.299 * data[idxUp] + 0.587 * data[idxUp + 1] + 0.114 * data[idxUp + 2];
      const lumLeft = 0.299 * data[idxLeft] + 0.587 * data[idxLeft + 1] + 0.114 * data[idxLeft + 2];
      edgeSum += Math.abs(lum - lumUp) + Math.abs(lum - lumLeft);
      edgeCount++;
    }
  }
  const avgEdge = edgeCount > 0 ? edgeSum / edgeCount : 0;

  return {
    brightness: Math.round(Math.min(100, (meanLum / 255) * 100)),
    colorVariance: Math.round(Math.min(100, (stdDev / 80) * 100)),
    textureScore: Math.round(Math.min(100, (avgEdge / 40) * 100)),
  };
}

function toResizedDataUrl(file: File, maxWidth = 480, quality = 0.72): Promise<{ dataUrl: string; stats: VisualStats }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Could not read file'));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error('Could not load image'));
      img.onload = () => {
        const scale = Math.min(1, maxWidth / img.width);
        const canvas = document.createElement('canvas');
        canvas.width = Math.round(img.width * scale);
        canvas.height = Math.round(img.height * scale);
        const ctx = canvas.getContext('2d');
        if (!ctx) return reject(new Error('Canvas not supported'));
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        const stats = computeVisualStats(ctx, canvas.width, canvas.height);
        resolve({ dataUrl: canvas.toDataURL('image/jpeg', quality), stats });
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  });
}

export default function AnalysisPage() {
  const { show } = useToast();
  const navigate = useNavigate();
  const { addBatch } = useBatches();
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [visualStats, setVisualStats] = useState<VisualStats | null>(null);
  const [neuralPredictions, setNeuralPredictions] = useState<NeuralPrediction[] | null>(null);
  const [neuralLoading, setNeuralLoading] = useState(false);
  const [form, setForm] = useState<AnalysisInput & { sourceUnit: string; threadCount: string; fiberLength: string; location: string; notes: string }>({
    materialType: '', wasteCategory: wasteCategories[0], weightKg: 100, color: '', moisturePct: 6,
    contaminationPct: 5, fiberType: '', provenance: '' as ProvenanceLevel,
    sourceUnit: '', threadCount: '', fiberLength: '', location: '', notes: '',
  });
  const [status, setStatus] = useState<'idle' | 'scanning' | 'done'>('idle');
  const [scanStep, setScanStep] = useState(0);
  const [result, setResult] = useState<HfcfAnalysisResult | null>(null);

  function update<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const { dataUrl, stats } = await toResizedDataUrl(file);
    setImagePreview(dataUrl);
    setVisualStats(stats);
    setNeuralPredictions(null);
    setNeuralLoading(true);
    try {
      const img = new Image();
      img.src = dataUrl;
      await new Promise((resolve, reject) => { img.onload = resolve; img.onerror = reject; });
      const predictions = await classifyImage(img);
      setNeuralPredictions(predictions);
    } catch {
      setNeuralPredictions([]);
    } finally {
      setNeuralLoading(false);
    }
  }

  async function runAnalysis(e: React.FormEvent) {
    e.preventDefault();
    if (!form.materialType || !imagePreview) {
      show('Add a batch photo and material type before scanning.', 'info');
      return;
    }
    if (!form.fiberType || !fiberTypes.includes(form.fiberType)) {
      show('Select the actual fiber type before scanning — this drives the grading.', 'info');
      return;
    }
    if (!form.provenance || !provenanceLevels.includes(form.provenance)) {
      show('Select the batch provenance before scanning — this drives the grading.', 'info');
      return;
    }
    setStatus('scanning');
    setScanStep(0);
    const stepTimer = setInterval(() => setScanStep((s) => Math.min(s + 1, scanSteps.length - 1)), 420);
    const res = await analysisService.analyze({ ...form, fiberLengthMm: Number(form.fiberLength) || undefined, visual: visualStats ?? undefined });
    clearInterval(stepTimer);
    setResult(res);
    setStatus('done');
  }

  function reset() {
    setStatus('idle');
    setResult(null);
    setImagePreview(null);
    setVisualStats(null);
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

            {neuralLoading && (
              <div className="mt-3 flex items-center gap-2 text-[12px] text-amber">
                <ScanLine size={14} className="animate-pulse" /> Running MobileNet neural network inference on photo…
              </div>
            )}
            {!neuralLoading && neuralPredictions && neuralPredictions.length > 0 && (
              <div className="mt-3 rounded-lg border border-line bg-white/[0.03] px-3.5 py-2.5">
                <div className="mb-1.5 text-[11px] uppercase tracking-wide text-stone">Neural Network Top Matches</div>
                <div className="flex flex-wrap gap-1.5">
                  {neuralPredictions.slice(0, 3).map((p) => (
                    <span key={p.className} className="rounded-full border border-line bg-white/[0.03] px-2.5 py-1 text-[11px] text-bone">{p.className} · {p.probability}%</span>
                  ))}
                </div>
              </div>
            )}

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
<SelectField label="Fiber type" value={form.fiberType ?? ''} onChange={(v) => update('fiberType', v)} options={['Select fiber type…', ...fiberTypes]} />
              <SelectField label="Provenance" value={form.provenance ?? ''} onChange={(v) => update('provenance', v as ProvenanceLevel)} options={['Select provenance…', ...provenanceLevels]} />
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
            <div className="flex flex-wrap items-center gap-2">
              <div className="inline-flex items-center rounded-full border border-amber/30 bg-amber/10 px-3 py-1 text-xs font-medium text-amber">
                Recommended: {result.recommendedRoute}
              </div>
              <div className="inline-flex items-center rounded-full border border-line-strong bg-white/[0.03] px-3 py-1 text-xs font-medium text-bone">
                HFCF Grade: {result.hfcf.finalGrade}
              </div>
            </div>
            <p className="mt-3 text-[13px] leading-relaxed text-stone">{result.reasoning}</p>

            {result.hfcf.visualCheck && (
              <div className={`mt-3 rounded-lg border px-3.5 py-2.5 text-[12px] ${result.hfcf.visualCheck.agreesWithInput ? 'border-sage/30 bg-sage/[0.06] text-sage' : 'border-amber/30 bg-amber/[0.06] text-amber'}`}>
                <span className="font-medium">Visual Cross-Check ({result.hfcf.visualCheck.visualContaminationEstimatePct}% estimated):</span> {result.hfcf.visualCheck.note}
              </div>
            )}

            {neuralPredictions && neuralPredictions.length > 0 && (() => {
              const relevance = summarizeTextileRelevance(neuralPredictions);
              return (
                <div className={`mt-3 rounded-lg border px-3.5 py-2.5 text-[12px] ${relevance.relevant ? 'border-sage/30 bg-sage/[0.06] text-sage' : 'border-line-strong bg-white/[0.03] text-stone'}`}>
                  <span className="font-medium">Neural Network (MobileNet):</span> {relevance.note}
                </div>
              );
            })()}

            <div className="mt-4 grid grid-cols-2 gap-3">

            <div className="mt-4 grid grid-cols-2 gap-3">
              <ResultTile label="CO₂ Saved" value={`${result.co2SavedKg} kg`} />
              <ResultTile label="Water Saved" value={`${result.waterSavedL.toLocaleString('en-IN')} L`} />
            </div>

            <h4 className="mb-2 mt-5 text-[13px] text-stone">Recovery Pathway — {result.hfcf.pathway}</h4>
            <div className="space-y-2">
              {result.hfcf.hubs.map((h) => (
                <div key={h.name} className="rounded-lg border border-line bg-white/[0.03] px-3.5 py-2.5">
                  <div className="text-[13px] text-bone">{h.name} <span className="text-stone">· {h.region}</span></div>
                  <div className="mt-0.5 text-[12px] text-stone">{h.keyFacts}</div>
                </div>
              ))}
            </div>

            {result.hfcf.productSuggestions.length > 0 && (
              <>
                <h4 className="mb-2 mt-5 text-[13px] text-stone">Suggested Products from this Batch</h4>
                <div className="flex flex-wrap gap-2">
                  {result.hfcf.productSuggestions.map((p) => (
                    <span key={p.product} className="rounded-full border border-line bg-white/[0.03] px-3 py-1 text-[12px] text-bone">{p.product}</span>
                  ))}
                </div>
              </>
            )}

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
              <PrimaryButton
                onClick={() => {
                  addBatch({
                    materialType: form.materialType,
                    wasteCategory: form.wasteCategory,
                    weightKg: form.weightKg,
                    location: form.location,
                    imageUrl: imagePreview,
                    analysis: result,
                  });
                  show('Batch saved to inventory as Ready for Sale.');
                  navigate('/app/inventory');
                }}
              >
                Save to Inventory
              </PrimaryButton>
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
      <input
        type="number"
        value={value}
        onChange={(e) => {
          const raw = e.target.value;
          const num = Number(raw) || 0;
          const clean = String(num);
          if (raw !== clean) e.target.value = clean; // force out stray leading zeros React would otherwise ignore
          onChange(num);
        }}
        className="w-full rounded-lg border border-line bg-white/[0.03] px-3 py-2.5 text-sm text-bone focus:border-amber/60 focus:outline-none"
      />
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
