import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authService } from '@/services/authService';

const orgTypes = [
  'Spinning Mill', 'Weaving Unit', 'Knitting Unit', 'Dyeing Unit', 'Garment Factory',
  'Cooperative', 'Collection Center', 'Recycler', 'Yarn Buyer', 'Fabric Buyer',
  'Biomass Buyer', 'Apparel Brand', 'Exporter', 'Logistics Provider',
  'Government Agency', 'NGO', 'Research Institution',
];

export default function RegisterPage() {
  const navigate = useNavigate();
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    userName: '', email: '', password: '', organizationName: '',
    organizationType: orgTypes[0], location: '', contactNumber: '',
  });

  function update<K extends keyof typeof form>(key: K, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    await authService.register(form);
    setSubmitting(false);
    setSubmitted(true);
  }

  if (submitted) {
    return (
      <div className="grid min-h-svh place-items-center bg-background px-4">
        <div className="w-full max-w-md rounded-2xl border border-line bg-carbon p-9 text-center">
          <h2 className="text-xl">Registration received</h2>
          <p className="mt-3 text-sm text-stone">
            {form.organizationName || 'Your organization'} has been submitted for verification. An administrator
            will review your documents and approve workspace access — this usually takes 1–2 business days in production.
          </p>
          <button
            onClick={() => navigate('/login')}
            className="mt-6 rounded-lg bg-amber px-5 py-2.5 text-[13px] font-semibold text-[#161311] hover:bg-amber-soft"
          >
            Back to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="grid min-h-svh place-items-center bg-background px-4 py-16">
      <div className="w-full max-w-[480px] rounded-2xl border border-line bg-carbon p-9">
        <Link to="/" className="mb-8 inline-flex items-center gap-2.5">
          <span className="grid h-8 w-8 place-items-center rounded-full border border-amber/60 text-amber font-display text-sm">V</span>
          <span className="text-xs font-semibold tracking-[0.18em]">VALUE CASCADE</span>
        </Link>
        <h2 className="text-xl">Register your organization</h2>
        <p className="mt-1 text-[13px] text-stone">Account details, then organization details.</p>

        <form onSubmit={handleSubmit} className="mt-7 space-y-4">
          <Field label="Your name" value={form.userName} onChange={(v) => update('userName', v)} required />
          <Field label="Work email" type="email" value={form.email} onChange={(v) => update('email', v)} required />
          <Field label="Password" type="password" value={form.password} onChange={(v) => update('password', v)} required />
          <div className="h-px bg-line" />
          <Field label="Organization name" value={form.organizationName} onChange={(v) => update('organizationName', v)} required />
          <div>
            <label className="mb-1.5 block text-xs text-stone">Organization type</label>
            <select
              value={form.organizationType}
              onChange={(e) => update('organizationType', e.target.value)}
              className="w-full rounded-lg border border-line bg-white/[0.03] px-3 py-2.5 text-sm text-bone focus:border-amber/60 focus:outline-none"
            >
              {orgTypes.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <Field label="Location (city, state)" value={form.location} onChange={(v) => update('location', v)} required />
          <Field label="Contact number" value={form.contactNumber} onChange={(v) => update('contactNumber', v)} required />
          <div>
            <label className="mb-1.5 block text-xs text-stone">Verification document</label>
            <div className="rounded-lg border border-dashed border-line-strong px-4 py-6 text-center text-xs text-stone">
              GST certificate, factory license, or equivalent — drag & drop or click to upload
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-lg bg-amber py-2.5 text-[13px] font-semibold text-[#161311] transition-colors hover:bg-amber-soft disabled:opacity-60"
          >
            {submitting ? 'Submitting…' : 'Submit for Verification'}
          </button>
        </form>

        <p className="mt-5 text-center text-xs text-stone">
          Already have an account?{' '}
          <Link to="/login" className="text-amber">Sign in</Link>
        </p>
      </div>
    </div>
  );
}

function Field({ label, value, onChange, type = 'text', required }: { label: string; value: string; onChange: (v: string) => void; type?: string; required?: boolean }) {
  return (
    <div>
      <label className="mb-1.5 block text-xs text-stone">{label}</label>
      <input
        type={type}
        value={value}
        required={required}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-lg border border-line bg-white/[0.03] px-3 py-2.5 text-sm text-bone focus:border-amber/60 focus:outline-none"
      />
    </div>
  );
}
