import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import type { Organization, Role, User } from '@/types';
import { authService, type Session } from '@/services/authService';

interface AuthContextValue {
  status: 'loading' | 'authenticated' | 'unauthenticated';
  user: User | null;
  organizations: Organization[];
  activeOrganization: Organization | null;
  role: Role | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  switchOrganization: (organizationId: string) => void;
  loginError: string | null;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [status, setStatus] = useState<'loading' | 'authenticated' | 'unauthenticated'>('loading');
  const [loginError, setLoginError] = useState<string | null>(null);

  useEffect(() => {
    authService.restoreSession().then((s) => {
      setSession(s);
      setStatus(s ? 'authenticated' : 'unauthenticated');
    });
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    setLoginError(null);
    try {
      const s = await authService.login(email, password);
      setSession(s);
      setStatus('authenticated');
    } catch (err) {
      setLoginError(err instanceof Error ? err.message : 'Unable to sign in.');
      throw err;
    }
  }, []);

  const logout = useCallback(async () => {
    await authService.logout();
    setSession(null);
    setStatus('unauthenticated');
  }, []);

  const switchOrganization = useCallback((organizationId: string) => {
    setSession((prev) => (prev ? { ...prev, activeOrganizationId: organizationId } : prev));
  }, []);

  const activeOrganization = useMemo(
    () => session?.organizations.find((o) => o.id === session.activeOrganizationId) ?? null,
    [session]
  );

  const value: AuthContextValue = {
    status,
    user: session?.user ?? null,
    organizations: session?.organizations ?? [],
    activeOrganization,
    role: activeOrganization?.role ?? null,
    login,
    logout,
    switchOrganization,
    loginError,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
