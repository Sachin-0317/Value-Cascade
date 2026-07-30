import type { Organization, User, Membership } from '@/types';

export const DEMO_PASSWORD = 'valuecascade2026';

export const mockUsers: User[] = [
  { id: 'u-manufacturer', name: 'Arjun Mehta', email: 'manufacturer@valuecascade.demo', avatarInitials: 'AM' },
  { id: 'u-buyer', name: 'Priya Nair', email: 'buyer@valuecascade.demo', avatarInitials: 'PN' },
  { id: 'u-cooperative', name: 'Lakshmi Devi', email: 'cooperative@valuecascade.demo', avatarInitials: 'LD' },
  { id: 'u-recycler', name: 'Suresh Kumar', email: 'recycler@valuecascade.demo', avatarInitials: 'SK' },
  { id: 'u-government', name: 'Rekha Iyer', email: 'government@valuecascade.demo', avatarInitials: 'RI' },
  { id: 'u-admin', name: 'Value Cascade Ops', email: 'admin@valuecascade.demo', avatarInitials: 'VC' },
];

export const mockOrganizations: Organization[] = [
  { id: 'org-manufacturer', name: 'Coimbatore Spinning Mills', type: 'Spinning Mill', role: 'manufacturer', location: 'Coimbatore, Tamil Nadu', verified: true },
  { id: 'org-buyer', name: 'Tirupur Fabric Traders', type: 'Fabric Buyer', role: 'fabric_buyer', location: 'Tirupur, Tamil Nadu', verified: true },
  { id: 'org-cooperative', name: 'Panipat Weavers Cooperative', type: 'Cooperative', role: 'cooperative', location: 'Panipat, Haryana', verified: true },
  { id: 'org-recycler', name: 'Surat Fibre Recovery', type: 'Recycler', role: 'recycler', location: 'Surat, Gujarat', verified: true },
  { id: 'org-government', name: 'Tamil Nadu Pollution Control Board', type: 'Government Agency', role: 'government', location: 'Chennai, Tamil Nadu', verified: true },
  { id: 'org-admin', name: 'Value Cascade Platform', type: 'Platform Administrator', role: 'admin', location: 'Bengaluru, Karnataka', verified: true },
];

export const mockMemberships: Membership[] = [
  { userId: 'u-manufacturer', organizationId: 'org-manufacturer', role: 'manufacturer', isPrimary: true },
  { userId: 'u-buyer', organizationId: 'org-buyer', role: 'fabric_buyer', isPrimary: true },
  { userId: 'u-cooperative', organizationId: 'org-cooperative', role: 'cooperative', isPrimary: true },
  { userId: 'u-recycler', organizationId: 'org-recycler', role: 'recycler', isPrimary: true },
  { userId: 'u-government', organizationId: 'org-government', role: 'government', isPrimary: true },
  { userId: 'u-admin', organizationId: 'org-admin', role: 'admin', isPrimary: true },
];

export const demoAccounts = mockUsers.map((u) => ({
  email: u.email,
  role: mockMemberships.find((m) => m.userId === u.id)!.role,
  orgName: mockOrganizations.find((o) => o.id === mockMemberships.find((m) => m.userId === u.id)!.organizationId)!.name,
}));
