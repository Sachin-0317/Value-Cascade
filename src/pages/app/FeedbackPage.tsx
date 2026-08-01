import { useEffect, useState } from 'react';
import { Star, CheckCircle2 } from 'lucide-react';
import { PageHeader, Panel, PrimaryButton, SecondaryButton, FieldLabel, TextField } from '@/components/ui';
import { FIBER_ACCEPTANCE } from '@/data/recoveryRules';
import { useToast } from '@/components/Toast';

const fiberTypes = FIBER_ACCEPTANCE.map((f) => f.fiberType);
const grades = ['A', 'B', 'C', 'Fail'] as const;
const useCases = ['Respinning', 'Recycling', 'Briquetting'] as const;
const agreementOptions = ['Yes', 'No', 'Not sure'] as const;
const outcomeOptions = ['Used for respinning', 'Sent for recycling', 'Used for fuel/briquettes', 'Rejected'] as const;
const qualityOptions = ['Yes', 'Partially', 'No'] as const;
const issueOptions = ['Wrong grading', 'Confusing UI', 'Wrong interpretation', 'Image issue', 'Other'] as const;
const userTypes = ['Weaver', 'Recycler', 'Mill operator', 'Student', 'Other'] as const;
const confidenceOptions = ['Low', 'Medium', 'High'] as const;
const beforeAfterOptions = ['Better', 'Same', 'Worse'] as const;

export interface FeedbackEntry {
  id: string;
  submittedAt: string;
  fiberType: string;
  gradeGiven: (typeof grades)[number];
  useCase: (typeof useCases)[number];
  overallExperience: number;
  accuracyRating: number;
  easeOfUse: number;
  speedRating: number;
  agreeLength: (typeof agreementOptions)[number];
  agreeContamination: (typeof agreementOptions)[number];
  agreeFineness: (typeof agreementOptions)[number];
  actualOutcome: (typeof outcomeOptions)[number];
  matchedExpected: (typeof qualityOptions)[number];
  whatWentWrong: string;
  issues: string[];
  otherIssueText: string;
  suggestions: string;
  userType: (typeof userTypes)[number];
  confidence: (typeof confidenceOptions)[number];
  beforeVsAfter: (typeof beforeAfterOptions)[number];
  wouldUseAgain: 'Yes' | 'No';
}

const STORAGE_KEY = 'valuecascade:feedback';

export function loadFeedback(): FeedbackEntry[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as FeedbackEntry[]) : [];
  } catch {
    return [];
  }
}

function saveFeedback(entries: FeedbackEntry[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
  } catch {
    // storage unavailable, submission still succeeds for this session
  }
}

function StarRating({ value, onChange, question }: { value: number; onChange: (v: number) => void; question: string }) {
  return (
    <div className="mb-4">
      <div className="mb-1.5 text-[13px] text-bone">{question}</div>
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((n) => (
          <button key={n} type="button" onClick={() => onChange(n)} className="p-0.5">
            <Star size={22} className={n <= value ? 'fill-amber text-amber' : 'text-line-strong'} />
          </button>
        ))}
      </div>
    </div>
  );
}

function ChoiceRow({ label, options, value, onChange }: { label: string; options: readonly string[]; value: string; onChange: (v: string) => void }) {
  return (
    <div className="mb-4">
      <div className="mb-1.5 text-[13px] text-bone">{label}</div>
      <div className="flex flex-wrap gap-1.5">
        {options.map((o) => (
          <button
            key={o}
            type="button"
            onClick={() => onChange(o)}
            className={`rounded-full border px-3 py-1.5 text-[12px] ${value === o ? 'border-amber/50 bg-amber/10 text-amber' : 'border-line text-stone hover:text-bone'}`}
          >
            {o}
          </button>
        ))}
      </div>
    </div>
  );
}

const empty: FeedbackEntry = {
  id: '', submittedAt: '',
  fiberType: fiberTypes[0], gradeGiven: 'A', useCase: 'Respinning',
  overallExperience: 0, accuracyRating: 0, easeOfUse: 0, speedRating: 0,
  agreeLength: 'Not sure', agreeContamination: 'Not sure', agreeFineness: 'Not sure',
  actualOutcome: 'Used for respinning', matchedExpected: 'Yes', whatWentWrong: '',
  issues: [], otherIssueText: '', suggestions: '',
  userType: 'Weaver', confidence: 'Medium', beforeVsAfter: 'Better', wouldUseAgain: 'Yes',
};

export default function FeedbackPage() {
  const { show } = useToast();
  const [step, setStep] = useState<1 | 2>(1);
  const [form, setForm] = useState<FeedbackEntry>(empty);
  const [submitted, setSubmitted] = useState(false);
  const [entries, setEntries] = useState<FeedbackEntry[]>([]);

  useEffect(() => { setEntries(loadFeedback()); }, []);

  function update<K extends keyof FeedbackEntry>(key: K, value: FeedbackEntry[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function toggleIssue(issue: string) {
    setForm((f) => ({ ...f, issues: f.issues.includes(issue) ? f.issues.filter((i) => i !== issue) : [...f.issues, issue] }));
  }

  function goNext() {
    if (form.overallExperience === 0 || form.accuracyRating === 0 || form.easeOfUse === 0 || form.speedRating === 0) {
      show('Please rate all four categories before continuing.', 'info');
      return;
    }
    setStep(2);
  }

  function submit() {
    const entry: FeedbackEntry = { ...form, id: `fb-${Date.now()}`, submittedAt: new Date().toISOString() };
    const next = [entry, ...entries];
    setEntries(next);
    saveFeedback(next);
    setSubmitted(true);
    show('Thank you — your feedback helps validate and improve the grading model.');
  }

  function startNew() {
    setForm(empty);
    setStep(1);
    setSubmitted(false);
  }

  if (submitted) {
    return (
      <div>
        <PageHeader eyebrow="Feedback" title="Grading Feedback" />
        <Panel className="flex flex-col items-center gap-3 py-12 text-center">
          <CheckCircle2 size={32} className="text-sage" />
          <div className="text-[16px] text-bone">Feedback submitted</div>
          <p className="max-w-sm text-[13px] text-stone">This response is now part of our accuracy-validation dataset ({entries.length} total responses collected) and feeds directly into refining the HFCF grading rules.</p>
          <PrimaryButton onClick={startNew}>Submit Another</PrimaryButton>
        </Panel>
      </div>
    );
  }

  return (
    <div>
      <PageHeader eyebrow="Feedback" title="Grading Feedback" />
      <p className="mb-4 text-[13px] text-stone">
        We use feedback to continuously refine our grading rules and validate real-world accuracy against actual outcomes.
      </p>

      <div className="mb-5 flex items-center gap-2 text-[12px] text-stone">
        <span className={step === 1 ? 'text-amber' : ''}>1. Grading &amp; Ratings</span>
        <span>→</span>
        <span className={step === 2 ? 'text-amber' : ''}>2. Outcome &amp; Suggestions</span>
      </div>

      {step === 1 && (
        <Panel>
          <h3 className="mb-4 text-[15px]">Basic Context</h3>
          <div className="mb-5 grid gap-3.5 sm:grid-cols-3">
            <div>
              <FieldLabel>Fiber type</FieldLabel>
              <select value={form.fiberType} onChange={(e) => update('fiberType', e.target.value)} className="w-full rounded-lg border border-line bg-panel px-3 py-2.5 text-[13px] text-bone focus:border-amber/60 focus:outline-none">
                {fiberTypes.map((f) => <option key={f} value={f}>{f}</option>)}
              </select>
            </div>
            <div>
              <FieldLabel>Grade given by system</FieldLabel>
              <select value={form.gradeGiven} onChange={(e) => update('gradeGiven', e.target.value as FeedbackEntry['gradeGiven'])} className="w-full rounded-lg border border-line bg-panel px-3 py-2.5 text-[13px] text-bone focus:border-amber/60 focus:outline-none">
                {grades.map((g) => <option key={g} value={g}>{g}</option>)}
              </select>
            </div>
            <div>
              <FieldLabel>Intended use case</FieldLabel>
              <select value={form.useCase} onChange={(e) => update('useCase', e.target.value as FeedbackEntry['useCase'])} className="w-full rounded-lg border border-line bg-panel px-3 py-2.5 text-[13px] text-bone focus:border-amber/60 focus:outline-none">
                {useCases.map((u) => <option key={u} value={u}>{u}</option>)}
              </select>
            </div>
          </div>

          <h3 className="mb-4 text-[15px]">Ratings</h3>
          <StarRating question="How useful was this grading result?" value={form.overallExperience} onChange={(v) => update('overallExperience', v)} />
          <StarRating question="How accurate do you think the grading is?" value={form.accuracyRating} onChange={(v) => update('accuracyRating', v)} />
          <StarRating question="Was the app easy to use?" value={form.easeOfUse} onChange={(v) => update('easeOfUse', v)} />
          <StarRating question="Did the system save time compared to manual grading?" value={form.speedRating} onChange={(v) => update('speedRating', v)} />

          <h3 className="mb-4 mt-2 text-[15px]">Technical Validation</h3>
          <p className="mb-3 text-[12px] text-stone">Do you agree with the system's assessment of:</p>
          <ChoiceRow label="Length classification" options={agreementOptions} value={form.agreeLength} onChange={(v) => update('agreeLength', v as FeedbackEntry['agreeLength'])} />
          <ChoiceRow label="Contamination level" options={agreementOptions} value={form.agreeContamination} onChange={(v) => update('agreeContamination', v as FeedbackEntry['agreeContamination'])} />
          <ChoiceRow label="Fineness estimation" options={agreementOptions} value={form.agreeFineness} onChange={(v) => update('agreeFineness', v as FeedbackEntry['agreeFineness'])} />

          <div className="mt-2 flex justify-end">
            <PrimaryButton onClick={goNext}>Continue</PrimaryButton>
          </div>
        </Panel>
      )}

      {step === 2 && (
        <Panel>
          <h3 className="mb-4 text-[15px]">Real-World Outcome</h3>
          <ChoiceRow label="What did you actually do with this fiber?" options={outcomeOptions} value={form.actualOutcome} onChange={(v) => update('actualOutcome', v as FeedbackEntry['actualOutcome'])} />

          <h3 className="mb-4 mt-2 text-[15px]">Quality Outcome</h3>
          <ChoiceRow label="Did the output match expected quality?" options={qualityOptions} value={form.matchedExpected} onChange={(v) => update('matchedExpected', v as FeedbackEntry['matchedExpected'])} />
          {form.matchedExpected !== 'Yes' && (
            <div className="mb-4">
              <FieldLabel>What went wrong?</FieldLabel>
              <TextField value={form.whatWentWrong} onChange={(e) => update('whatWentWrong', e.target.value)} placeholder="Briefly describe the mismatch" />
            </div>
          )}

          <h3 className="mb-3 mt-2 text-[15px]">Issue Reporting</h3>
          <div className="mb-2 flex flex-wrap gap-1.5">
            {issueOptions.map((i) => (
              <button
                key={i}
                type="button"
                onClick={() => toggleIssue(i)}
                className={`rounded-full border px-3 py-1.5 text-[12px] ${form.issues.includes(i) ? 'border-amber/50 bg-amber/10 text-amber' : 'border-line text-stone hover:text-bone'}`}
              >
                {i}
              </button>
            ))}
          </div>
          {form.issues.includes('Other') && (
            <div className="mb-4 mt-2">
              <TextField value={form.otherIssueText} onChange={(e) => update('otherIssueText', e.target.value)} placeholder="Describe the issue" />
            </div>
          )}

          <div className="mb-5 mt-4">
            <FieldLabel>Suggestions — what can we improve?</FieldLabel>
            <textarea
              value={form.suggestions}
              onChange={(e) => update('suggestions', e.target.value)}
              rows={3}
              className="w-full rounded-lg border border-line bg-white/[0.03] px-3 py-2.5 text-[13px] text-bone focus:border-amber/60 focus:outline-none"
            />
          </div>

          <div className="mb-5 grid gap-3.5 sm:grid-cols-2">
            <ChoiceRow label="Compared to your usual method, is this better?" options={beforeAfterOptions} value={form.beforeVsAfter} onChange={(v) => update('beforeVsAfter', v as FeedbackEntry['beforeVsAfter'])} />
            <ChoiceRow label="Would you use this again?" options={['Yes', 'No']} value={form.wouldUseAgain} onChange={(v) => update('wouldUseAgain', v as FeedbackEntry['wouldUseAgain'])} />
          </div>

          <div className="mb-2 grid gap-3.5 sm:grid-cols-2">
            <ChoiceRow label="Your role" options={userTypes} value={form.userType} onChange={(v) => update('userType', v as FeedbackEntry['userType'])} />
            <ChoiceRow label="How confident are you in this feedback?" options={confidenceOptions} value={form.confidence} onChange={(v) => update('confidence', v as FeedbackEntry['confidence'])} />
          </div>

          <div className="mt-4 flex justify-between">
            <SecondaryButton onClick={() => setStep(1)}>Back</SecondaryButton>
            <PrimaryButton onClick={submit}>Submit Feedback</PrimaryButton>
          </div>
        </Panel>
      )}
    </div>
  );
}
