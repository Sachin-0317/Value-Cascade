import { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, ScanLine, Boxes, Store, Tags, ClipboardList, Package,
  Truck, GitBranch, BarChart3, FileText, MessageSquare, Bell, User as UserIcon,
  Settings, LogOut, Menu, X, ChevronDown, Star,
} from 'lucide-react';
import { useAuth } from '@/store/AuthContext';
import { moduleLabels, modulesForRole, roleLabels, type ModuleKey } from '@/data/roles';

const moduleIcons: Record<ModuleKey, React.ComponentType<{ size?: number }>> = {
  dashboard: LayoutDashboard,
  analysis: ScanLine,
  inventory: Boxes,
  marketplace: Store,
  listings: Tags,
  procurement: ClipboardList,
  orders: Package,
  logistics: Truck,
  traceability: GitBranch,
  analytics: BarChart3,
  reports: FileText,
  messages: MessageSquare,
  notifications: Bell,
  profile: UserIcon,
  settings: Settings,
  feedback: Star,
};

export function AppShellLayout() {
  const { user, role, organizations, activeOrganization, switchOrganization, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [workspaceOpen, setWorkspaceOpen] = useState(false);

  if (!role) return null;
  const modules = modulesForRole(role);

  async function handleLogout() {
    await logout();
    navigate('/');
  }

  const SidebarContent = (
    <>
      <div className="flex items-center gap-2.5 px-2 pb-6">
        <span className="grid h-8 w-8 place-items-center rounded-full border border-amber/60 text-amber font-display text-sm">V</span>
        <span className="font-semibold tracking-[0.18em] text-xs">VALUE CASCADE</span>
      </div>

      <div className="relative mb-4 px-1">
        <button
          onClick={() => setWorkspaceOpen((v) => !v)}
          className="flex w-full items-center justify-between gap-2 rounded-lg border border-line bg-panel-raised px-3 py-2.5 text-left"
        >
          <span className="min-w-0">
            <span className="block truncate text-xs font-medium text-bone">{activeOrganization?.name}</span>
            <span className="block truncate text-[11px] text-stone">{role ? roleLabels[role] : ''}</span>
          </span>
          <ChevronDown size={14} className="shrink-0 text-stone" />
        </button>
        {workspaceOpen && organizations.length > 0 && (
          <div className="absolute left-1 right-1 top-full z-20 mt-1 rounded-lg border border-line bg-carbon p-1 shadow-xl">
            {organizations.map((org) => (
              <button
                key={org.id}
                onClick={() => { switchOrganization(org.id); setWorkspaceOpen(false); }}
                className="block w-full truncate rounded-md px-3 py-2 text-left text-xs text-bone hover:bg-panel-raised"
              >
                {org.name}
              </button>
            ))}
          </div>
        )}
      </div>

      <nav className="flex-1 space-y-0.5 overflow-y-auto">
        {modules.map((mod) => {
          const Icon = moduleIcons[mod];
          return (
            <NavLink
              key={mod}
              to={mod === 'dashboard' ? '/app/dashboard' : `/app/${mod}`}
              onClick={() => setMobileNavOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-[13.5px] transition-colors ${
                  isActive ? 'bg-amber/10 text-amber' : 'text-stone hover:bg-panel-raised hover:text-bone'
                }`
              }
            >
              <Icon size={16} />
              {moduleLabels[mod]}
            </NavLink>
          );
        })}
      </nav>

      <div className="mt-2 border-t border-line pt-3">
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-[13.5px] text-stone hover:bg-panel-raised hover:text-bone"
        >
          <LogOut size={16} /> Log Out
        </button>
      </div>
    </>
  );

  return (
    <div className="min-h-svh bg-background text-bone">
      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 hidden w-[220px] flex-col border-r border-line bg-carbon px-3 py-5 lg:flex">
        {SidebarContent}
      </aside>

      {/* Mobile sidebar */}
      {mobileNavOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-black/60" onClick={() => setMobileNavOpen(false)} />
          <aside className="absolute inset-y-0 left-0 flex w-[260px] flex-col border-r border-line bg-carbon px-3 py-5">
            <button className="absolute right-3 top-4 text-stone" onClick={() => setMobileNavOpen(false)}>
              <X size={18} />
            </button>
            {SidebarContent}
          </aside>
        </div>
      )}

      <div className="lg:pl-[220px]">
        <header className="sticky top-0 z-30 flex items-center justify-between gap-3 border-b border-line bg-background/90 px-4 py-3 backdrop-blur lg:px-8">
          <div className="flex items-center gap-3">
            <button className="text-stone lg:hidden" onClick={() => setMobileNavOpen(true)}>
              <Menu size={20} />
            </button>
            <input
              type="search"
              placeholder="Search batches, listings, orders…"
              className="hidden w-72 rounded-full border border-line bg-panel px-4 py-2 text-xs text-bone placeholder:text-stone focus:border-amber/60 focus:outline-none sm:block"
            />
          </div>
          <div className="flex items-center gap-3">
            <NavLink to="/app/notifications" className="relative text-stone hover:text-amber">
              <Bell size={18} />
              <span className="absolute -right-1 -top-1 h-2 w-2 rounded-full bg-amber" />
            </NavLink>
            <NavLink to="/app/messages" className="text-stone hover:text-amber">
              <MessageSquare size={18} />
            </NavLink>
            <NavLink
              to="/app/profile"
              className="grid h-8 w-8 place-items-center rounded-full border border-line-strong bg-panel text-[11px] font-medium text-bone"
            >
              {user?.avatarInitials}
            </NavLink>
          </div>
        </header>

        <main className="px-4 py-6 lg:px-8 lg:py-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
