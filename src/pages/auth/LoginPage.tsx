import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/store/AuthContext';
import { demoAccounts, DEMO_PASSWORD } from '@/data/mockOrganizations';
import { roleLabels } from '@/data/roles';

export default function LoginPage() {
  const { login, loginError } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState(demoAccounts[0].email);
  const [password, setPassword] = useState(DEMO_PASSWORD);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      await login(email, password);
      const from = (location.state as { from?: string })?.from;
      navigate(from && from !== '/login' ? from : '/app/dashboard');
    } catch {
      // error surfaced via loginError
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="grid min-h-svh place-items-center bg-background px-4 py-16">
      <div className="w-full max-w-[420px] rounded-2xl border border-line bg-carbon p-9">
        <Link to="/" className="mb-8 inline-flex items-center gap-2.5">
          <span className="grid h-8 w-8 place-items-center rounded-full border border-amber/60 text-amber font-display text-sm">V</span>
          <span className="text-xs font-semibold tracking-[0.18em]">VALUE CASCADE</span>
        </Link>
        <h2 className="text-xl">Welcome back</h2>
        <p className="mt-1 text-[13px] text-stone">Log in to your organization workspace.</p>

        <form onSubmit={handleSubmit} className="mt-7 space-y-4">
          <div>
            <label className="mb-1.5 block text-xs text-stone">Work email</label>
            <select
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg border border-line bg-white/[0.03] px-3 py-2.5 text-sm text-bone focus:border-amber/60 focus:outline-none"
            >
              {demoAccounts.map((a) => (
                <option key={a.email} value={a.email}>
                  {a.email} — {roleLabels[a.role]}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1.5 block text-xs text-stone">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-lg border border-line bg-white/[0.03] px-3 py-2.5 text-sm text-bone focus:border-amber/60 focus:outline-none"
            />
          </div>
          <label className="flex items-center gap-2 text-xs text-stone">
            <input type="checkbox" className="accent-amber" defaultChecked /> Remember me
          </label>

          {loginError && <p className="rounded-lg border border-danger/30 bg-danger/10 px-3 py-2 text-xs text-danger">{loginError}</p>}

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-lg bg-amber py-2.5 text-[13px] font-semibold text-[#161311] transition-colors hover:bg-amber-soft disabled:opacity-60"
          >
            {submitting ? 'Signing in…' : 'Sign In'}
          </button>

          <div className="grid grid-cols-2 gap-2 pt-1">
            <button type="button" className="rounded-lg border border-line-strong py-2 text-xs text-stone" disabled>
              Continue with Google
            </button>
            <button type="button" className="rounded-lg border border-line-strong py-2 text-xs text-stone" disabled>
              Continue with Microsoft
            </button>
          </div>
        </form>

        <p className="mt-5 text-center text-[11px] text-stone">
          Demo password for every account: <code className="rounded bg-white/5 px-1.5 py-0.5 text-amber">{DEMO_PASSWORD}</code>
        </p>
        <p className="mt-4 text-center text-xs text-stone">
          No account?{' '}
          <Link to="/register" className="text-amber">
            Register your organization
          </Link>
        </p>
      </div>
    </div>
  );
}
