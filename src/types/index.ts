export type Role =
  | 'manufacturer'
  | 'cooperative'
  | 'recycler'
  | 'yarn_buyer'
  | 'fabric_buyer'
  | 'biomass_buyer'
  | 'brand'
  | 'exporter'
  | 'logistics'
  | 'government'
  | 'ngo'
  | 'research'
  | 'admin';

export type OrganizationType =
  | 'Spinning Mill'
  | 'Weaving Unit'
  | 'Knitting Unit'
  | 'Dyeing Unit'
  | 'Garment Factory'
  | 'Cooperative'
  | 'Collection Center'
  | 'Recycler'
  | 'Yarn Buyer'
  | 'Fabric Buyer'
  | 'Biomass Buyer'
  | 'Apparel Brand'
  | 'Exporter'
  | 'Logistics Provider'
  | 'Government Agency'
  | 'NGO'
  | 'Research Institution'
  | 'Platform Administrator';

export interface User {
  id: string;
  name: string;
  email: string;
  avatarInitials: string;
}

export interface Organization {
  id: string;
  name: string;
  type: OrganizationType;
  role: Role;
  location: string;
  verified: boolean;
}

export interface Membership {
  userId: string;
  organizationId: string;
  role: Role;
  isPrimary: boolean;
}

export type WasteCategory =
  | 'Cutting Scrap' | 'Selvedge' | 'Yarn Waste' | 'Fabric Rejects'
  | 'Sludge' | 'Dust & Fly' | 'Rags' | 'Post-Consumer';

export interface WasteBatch {
  id: string;
  code: string;
  organizationId: string;
  imageUrl: string;
  materialType: string;
  wasteCategory: WasteCategory;
  weightKg: number;
  sourceUnit: string;
  threadCount?: number;
  color: string;
  moisturePct: number;
  contaminationPct: number;
  fiberLengthMm?: number;
  location: string;
  notes?: string;
  status: InventoryStatus;
  createdAt: string;
}

export interface AnalysisResult {
  id: string;
  batchId: string;
  detectedFiber: string;
  composition: { fiber: string; pct: number }[];
  confidencePct: number;
  recoverabilityPct: number;
  contaminationGrade: 'Low' | 'Medium' | 'High';
  moisturePct: number;
  estimatedYarnLengthM: number;
  estimatedPriceInr: number;
  recommendedRoute: 'Respin' | 'Reuse' | 'Recycle' | 'Sell' | 'Store' | 'Discard';
  reasoning: string;
  suggestedBuyerIds: string[];
  co2SavedKg: number;
  waterSavedL: number;
  createdAt: string;
}

export type InventoryStatus =
  | 'Draft' | 'Pending Analysis' | 'Analyzed' | 'Respinnable' | 'Ready for Sale'
  | 'Listed' | 'Reserved' | 'In Transit' | 'Sold' | 'Recycled' | 'Rejected';

export interface InventoryItem {
  id: string;
  batchId: string;
  status: InventoryStatus;
  storageLocation: string;
  quantityKg: number;
  updatedAt: string;
}

export interface Listing {
  id: string;
  inventoryItemId: string;
  sellerOrgId: string;
  title: string;
  material: string;
  quantityKg: number;
  pricePerKgInr: number;
  qualityScore: number;
  matchScore?: number;
  location: string;
  certifications: string[];
  status: 'Draft' | 'Published' | 'Paused' | 'Closed';
  publishedAt?: string;
}

export interface BuyerRequirement {
  id: string;
  buyerOrgId: string;
  fiber: string;
  minQuantityKg: number;
  maxContaminationPct: number;
  targetPriceInr: number;
  location: string;
}

export interface RFQ {
  id: string;
  buyerOrgId: string;
  listingId?: string;
  quantityKg: number;
  targetPriceInr: number;
  deliveryLocation: string;
  qualityNotes: string;
  status: 'Open' | 'Quoted' | 'Negotiating' | 'Accepted' | 'Closed';
  createdAt: string;
}

export interface Quote {
  id: string;
  rfqId: string;
  sellerOrgId: string;
  pricePerKgInr: number;
  quantityKg: number;
  notes: string;
  status: 'Pending' | 'Accepted' | 'Rejected';
}

export interface Order {
  id: string;
  code: string;
  listingId: string;
  buyerOrgId: string;
  sellerOrgId: string;
  quantityKg: number;
  totalInr: number;
  paymentStatus: 'Pending' | 'Paid' | 'Refunded';
  shipmentStatus: 'Not Scheduled' | 'Scheduled' | 'In Transit' | 'Delivered';
  createdAt: string;
}

export interface Shipment {
  id: string;
  orderId: string;
  carrier: string;
  pickupDate: string;
  status: 'Requested' | 'Scheduled' | 'Picked Up' | 'In Transit' | 'Delivered';
  trackingEvents: { label: string; timestamp: string }[];
}

export interface TraceabilityEvent {
  id: string;
  batchId: string;
  stage: 'Source' | 'Collection' | 'Analysis' | 'Aggregation' | 'Listing' | 'Purchase' | 'Shipment' | 'Processing' | 'Final Output';
  actorOrgId: string;
  timestamp: string;
  details: string;
}

export interface Certificate {
  id: string;
  organizationId: string;
  name: string;
  issuer: string;
  validUntil: string;
}

export interface Notification {
  id: string;
  userId: string;
  type: 'analysis' | 'match' | 'rfq' | 'sold' | 'shipment' | 'payment' | 'compliance' | 'inventory';
  message: string;
  read: boolean;
  createdAt: string;
}

export interface Message {
  id: string;
  conversationId: string;
  senderOrgId: string;
  body: string;
  timestamp: string;
}

export interface Conversation {
  id: string;
  participantOrgIds: string[];
  orderId?: string;
  lastMessage: string;
  lastTimestamp: string;
  unread: number;
}

export interface ImpactMetric {
  period: string;
  wasteRecoveredT: number;
  co2SavedT: number;
  waterSavedM3: number;
  revenueInr: number;
}

export interface Report {
  id: string;
  title: string;
  type: 'AI Analysis' | 'Inventory' | 'Sales' | 'Procurement' | 'Traceability' | 'Sustainability' | 'Regional' | 'Cooperative';
  generatedAt: string;
}

export interface AuditLog {
  id: string;
  actor: string;
  action: string;
  target: string;
  timestamp: string;
}
