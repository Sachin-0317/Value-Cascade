import type { Organization, Role, User } from '@/types';
import { DEMO_PASSWORD, mockMemberships, mockOrganizations, mockUsers } from '@/data/mockOrganizations';
import { USE_MOCK_MODE } from '@/services/firebase';

export interface Session {
  user: User;
  organizations: Organization[];
  activeOrganizationId: string;
}

export interface AuthService {
  login(email: string, password: string): Promise<Session>;
  register(input: RegisterInput): Promise<{ pendingVerification: boolean }>;
  logout(): Promise<void>;
  restoreSession(): Promise<Session | null>;
}

export interface RegisterInput {
  userName: string;
  email: string;
  password: string;
  organizationName: string;
  organizationType: string;
  location: string;
  contactNumber: string;
}

const SESSION_KEY = 'vc_session_v1';
const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

class MockAuthService implements AuthService {
  async login(email: string, password: string): Promise<Session> {
    await delay(650);
    const user = mockUsers.find((u) => u.email.toLowerCase() === email.trim().toLowerCase());
    if (!user || password !== DEMO_PASSWORD) {
      throw new Error('Invalid email or password. Use a demo account and the password shown below the form.');
    }
    const memberships = mockMemberships.filter((m) => m.userId === user.id);
    const organizations = memberships
      .map((m) => mockOrganizations.find((o) => o.id === m.organizationId))
      .filter((o): o is Organization => Boolean(o));
    const primary = memberships.find((m) => m.isPrimary) ?? memberships[0];
    const session: Session = { user, organizations, activeOrganizationId: primary.organizationId };
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
    return session;
  }

  async register(_input: RegisterInput): Promise<{ pendingVerification: boolean }> {
    await delay(800);
    return { pendingVerification: true };
  }

  async logout(): Promise<void> {
    localStorage.removeItem(SESSION_KEY);
  }

  async restoreSession(): Promise<Session | null> {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as Session;
    } catch {
      return null;
    }
  }
}

// When USE_MOCK_MODE is false, a FirebaseAuthService implementing the same
// AuthService interface can be swapped in here without changing callers.
export const authService: AuthService = new MockAuthService();

export function roleForOrganization(org: Organization): Role {
  return org.role;
}

export { USE_MOCK_MODE };
