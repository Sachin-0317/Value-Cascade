import { useState } from 'react';
import { PageHeader, Panel, PrimaryButton } from '@/components/ui';
import { useToast } from '@/components/Toast';

export default function SettingsPage() {
  const { show } = useToast();
  const [toggles, setToggles] = useState({ analysisAlerts: true, rfqAlerts: true, weeklyDigest: false });

  return (
    <div>
      <PageHeader eyebrow="Settings" title="Settings & Permissions" />
      <div className="grid gap-4 lg:grid-cols-2">
        <Panel>
          <h3 className="mb-3.5 text-[15px]">Notification Preferences</h3>
          <div className="space-y-3">
            {(Object.keys(toggles) as (keyof typeof toggles)[]).map((key) => (
              <label key={key} className="flex items-center justify-between text-[13px] text-bone">
                <span className="capitalize">{key.replace(/([A-Z])/g, ' $1')}</span>
                <input
                  type="checkbox"
                  checked={toggles[key]}
                  onChange={() => setToggles((t) => ({ ...t, [key]: !t[key] }))}
                  className="h-4 w-4 accent-amber"
                />
              </label>
            ))}
          </div>
          <PrimaryButton className="mt-4" onClick={() => show('Preferences saved.')}>Save Preferences</PrimaryButton>
        </Panel>
        <Panel>
          <h3 className="mb-3.5 text-[15px]">Team & Permissions</h3>
          <p className="mb-3 text-[13px] text-stone">Invite teammates to your organization workspace and assign module-level permissions.</p>
          <div className="rounded-lg border border-dashed border-line-strong px-4 py-6 text-center text-[12px] text-stone">
            No additional team members yet.
          </div>
          <PrimaryButton className="mt-4" onClick={() => show('Invite sent.')}>Invite Teammate</PrimaryButton>
        </Panel>
      </div>
    </div>
  );
}
