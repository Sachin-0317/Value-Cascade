import type { Role } from '@/types';

export const roleLabels: Record<Role, string> = {
  manufacturer: 'Manufacturer',
  cooperative: 'Cooperative',
  recycler: 'Recycler',
  yarn_buyer: 'Yarn Buyer',
  fabric_buyer: 'Fabric Buyer',
  biomass_buyer: 'Biomass Buyer',
  brand: 'Apparel Brand',
  exporter: 'Exporter',
  logistics: 'Logistics Partner',
  government: 'Government Agency',
  ngo: 'NGO',
  research: 'Research Institution',
  admin: 'Administrator',
};

export const roleDescriptions: Record<Role, string> = {
  manufacturer: 'Scan waste, build inventory, and list recoverable material for sale.',
  cooperative: 'Aggregate member batches, verify quality, and manage bulk listings.',
  recycler: 'Source verified waste lots that match your recycling capability.',
  yarn_buyer: 'Source recovered yarn that meets your spec.',
  fabric_buyer: 'Source recovered fabric that meets your spec.',
  biomass_buyer: 'Procure non-respinnable textile waste for biomass conversion.',
  brand: 'Track supplier traceability and recycled-content sourcing.',
  exporter: 'Manage export-grade recovered material and documentation.',
  logistics: 'Schedule pickups and manage shipments between sellers and buyers.',
  government: 'Monitor regional recovery volumes and facility compliance.',
  ngo: 'Track programme impact and cooperative activity in your region.',
  research: 'Access anonymized recovery and material composition data.',
  admin: 'Full platform oversight across every organization and module.',
};

export type ModuleKey =
  | 'dashboard' | 'analysis' | 'inventory' | 'marketplace' | 'listings'
  | 'procurement' | 'orders' | 'logistics' | 'traceability' | 'analytics'
  | 'reports' | 'messages' | 'notifications' | 'profile' | 'settings' | 'feedback';

export const moduleLabels: Record<ModuleKey, string> = {
  dashboard: 'Dashboard',
  analysis: 'AI Analysis',
  inventory: 'Inventory',
  marketplace: 'Marketplace',
  listings: 'My Listings',
  procurement: 'Procurement',
  orders: 'Orders',
  logistics: 'Logistics',
  traceability: 'Traceability',
  analytics: 'Analytics',
  reports: 'Reports',
  messages: 'Messages',
  notifications: 'Notifications',
  profile: 'Profile',
  settings: 'Settings',
  feedback: 'Feedback',
};

// Which sidebar modules each role can access. Dashboard/messages/notifications/
// profile/settings are available to every role; this defines the extra ones.
const sellerModules: ModuleKey[] = ['analysis', 'inventory', 'marketplace', 'listings', 'orders', 'logistics', 'traceability', 'analytics', 'reports'];
const buyerModules: ModuleKey[] = ['marketplace', 'procurement', 'orders', 'logistics', 'traceability', 'analytics', 'reports'];

export const roleModules: Record<Role, ModuleKey[]> = {
  manufacturer: sellerModules,
  cooperative: sellerModules,
  recycler: buyerModules,
  yarn_buyer: buyerModules,
  fabric_buyer: buyerModules,
  biomass_buyer: buyerModules,
  brand: ['marketplace', 'traceability', 'analytics', 'reports'],
  exporter: [...sellerModules],
  logistics: ['orders', 'logistics', 'traceability', 'reports'],
  government: ['traceability', 'analytics', 'reports'],
  ngo: ['traceability', 'analytics', 'reports'],
  research: ['analytics', 'reports'],
  admin: ['analysis', 'inventory', 'marketplace', 'listings', 'procurement', 'orders', 'logistics', 'traceability', 'analytics', 'reports'],
};

const alwaysOn: ModuleKey[] = ['dashboard', 'messages', 'notifications', 'feedback', 'profile', 'settings'];

export function modulesForRole(role: Role): ModuleKey[] {
  return [alwaysOn[0], ...(roleModules[role] ?? []), ...alwaysOn.slice(1)];
}

export function isSellerRole(role: Role): boolean {
  return sellerModules === roleModules[role] || role === 'exporter';
}