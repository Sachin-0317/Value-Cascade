import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/store/AuthContext';
import { roleLabels } from '@/data/roles';

export default function SelectWorkspacePage() {
  const { organizations, switchOrganization } = useAuth();
  const navigate = useNavigate();

  function choose(id: string) {
    switchOrganization(id);
    navigate('/app/dashboard');
  }

  return (
    <div className="grid min-h-svh place-items-center bg-background px-4">
      <div className="w-full max-w-lg">
        <h2 className="text-center text-xl">Choose a workspace</h2>
        <p className="mt-1 text-center text-[13px] text-stone">Select the organization you want to work in.</p>
        <div className="mt-7 space-y-2">
          {organizations.map((org) => (
            <button
              key={org.id}
              onClick={() => choose(org.id)}
              className="flex w-full items-center justify-between rounded-xl border border-line bg-carbon px-5 py-4 text-left hover:border-amber/50"
            >
              <span>
                <span className="block text-sm text-bone">{org.name}</span>
                <span className="block text-xs text-stone">{roleLabels[org.role]} · {org.location}</span>
              </span>
              <span className="text-amber text-xs">Enter →</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
