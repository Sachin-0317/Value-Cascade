import { PageHeader, Panel, PrimaryButton } from '@/components/ui';
import { useAuth } from '@/store/AuthContext';
import { roleLabels } from '@/data/roles';
import { useToast } from '@/components/Toast';

export default function ProfilePage() {
  const { activeOrganization, user, role } = useAuth();
  const { show } = useToast();
  if (!activeOrganization || !role) return null;

  return (
    <div>
      <PageHeader eyebrow="Organization Profile" title={activeOrganization.name} />
      <div className="grid gap-4 lg:grid-cols-[1fr_1fr]">
        <Panel>
          <h3 className="mb-3.5 text-[15px]">Organization Details</h3>
          <dl className="space-y-2.5 text-[13px]">
            <Row label="Type" value={activeOrganization.type} />
            <Row label="Role" value={roleLabels[role]} />
            <Row label="Location" value={activeOrganization.location} />
            <Row label="Verification" value={activeOrganization.verified ? 'Verified' : 'Pending'} />
          </dl>
          <PrimaryButton className="mt-4" onClick={() => show('Organization details updated.')}>Edit Details</PrimaryButton>
        </Panel>
        <Panel>
          <h3 className="mb-3.5 text-[15px]">Primary Contact</h3>
          <dl className="space-y-2.5 text-[13px]">
            <Row label="Name" value={user?.name ?? ''} />
            <Row label="Email" value={user?.email ?? ''} />
          </dl>
          <h3 className="mb-3 mt-6 text-[15px]">Certificates</h3>
          <div className="rounded-lg border border-dashed border-line-strong px-4 py-6 text-center text-[12px] text-stone">
            No certificates uploaded yet — add a GRS, GOTS or Oeko-Tex certificate.
          </div>
        </Panel>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between border-b border-line pb-2">
      <dt className="text-stone">{label}</dt>
      <dd className="text-bone">{value}</dd>
    </div>
  );
}
