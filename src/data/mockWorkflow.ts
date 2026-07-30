import type {
  WasteBatch, AnalysisResult, InventoryItem, Listing, Order,
  Notification, ImpactMetric, RFQ,
} from '@/types';

const IMG = 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&q=60';

export const mockBatches: WasteBatch[] = [
  { id: 'b1', code: 'VC-BATCH-1042', organizationId: 'org-manufacturer', imageUrl: IMG, materialType: 'Cotton Cutting Scrap', wasteCategory: 'Cutting Scrap', weightKg: 420, sourceUnit: 'Cutting Floor 2', color: 'Indigo Mix', moisturePct: 6, contaminationPct: 4, fiberLengthMm: 24, location: 'Coimbatore, TN', status: 'Ready for Sale', createdAt: '2026-07-24T09:12:00Z' },
  { id: 'b2', code: 'VC-BATCH-1041', organizationId: 'org-manufacturer', imageUrl: IMG, materialType: 'Poly-Cotton Selvedge', wasteCategory: 'Selvedge', weightKg: 180, sourceUnit: 'Weaving Unit A', color: 'Assorted', moisturePct: 8, contaminationPct: 11, fiberLengthMm: 18, location: 'Coimbatore, TN', status: 'Listed', createdAt: '2026-07-22T14:40:00Z' },
  { id: 'b3', code: 'VC-BATCH-1039', organizationId: 'org-manufacturer', imageUrl: IMG, materialType: 'Yarn Waste', wasteCategory: 'Yarn Waste', weightKg: 95, sourceUnit: 'Spinning Line 4', color: 'Natural White', moisturePct: 5, contaminationPct: 2, fiberLengthMm: 30, location: 'Coimbatore, TN', status: 'Analyzed', createdAt: '2026-07-20T10:05:00Z' },
  { id: 'b4', code: 'VC-BATCH-1036', organizationId: 'org-manufacturer', imageUrl: IMG, materialType: 'Fabric Rejects', wasteCategory: 'Fabric Rejects', weightKg: 260, sourceUnit: 'QC Bay', color: 'Navy', moisturePct: 7, contaminationPct: 6, fiberLengthMm: 22, location: 'Coimbatore, TN', status: 'Sold', createdAt: '2026-07-15T08:30:00Z' },
];

export const mockAnalysisResults: AnalysisResult[] = [
  { id: 'a1', batchId: 'b1', detectedFiber: 'Cotton', composition: [{ fiber: 'Cotton', pct: 92 }, { fiber: 'Elastane', pct: 8 }], confidencePct: 94, recoverabilityPct: 88, contaminationGrade: 'Low', moisturePct: 6, estimatedYarnLengthM: 3100, estimatedPriceInr: 18900, recommendedRoute: 'Respin', reasoning: 'High cotton purity and low contamination make this batch suitable for open-end respinning at 88% recoverability.', suggestedBuyerIds: ['org-buyer', 'org-recycler'], co2SavedKg: 340, waterSavedL: 5200, createdAt: '2026-07-24T09:20:00Z' },
  { id: 'a2', batchId: 'b3', detectedFiber: 'Cotton', composition: [{ fiber: 'Cotton', pct: 100 }], confidencePct: 97, recoverabilityPct: 95, contaminationGrade: 'Low', moisturePct: 5, estimatedYarnLengthM: 780, estimatedPriceInr: 6200, recommendedRoute: 'Reuse', reasoning: 'Near-pure cotton yarn waste with minimal contamination — ideal for direct reuse in blended yarns.', suggestedBuyerIds: ['org-buyer'], co2SavedKg: 110, waterSavedL: 1600, createdAt: '2026-07-20T10:18:00Z' },
];

export const mockInventory: InventoryItem[] = mockBatches.map((b, i) => ({
  id: `inv-${b.id}`, batchId: b.id, status: b.status, storageLocation: `Warehouse ${String.fromCharCode(65 + (i % 3))} · Bay ${i + 1}`, quantityKg: b.weightKg, updatedAt: b.createdAt,
}));

export const mockListings: Listing[] = [
  { id: 'l1', inventoryItemId: 'inv-b1', sellerOrgId: 'org-manufacturer', title: 'Indigo Cotton Cutting Scrap — 420kg', material: 'Cotton (92%) / Elastane (8%)', quantityKg: 420, pricePerKgInr: 45, qualityScore: 88, matchScore: 91, location: 'Coimbatore, TN', certifications: ['GRS Ready'], status: 'Published', publishedAt: '2026-07-24T12:00:00Z' },
  { id: 'l2', inventoryItemId: 'inv-b2', sellerOrgId: 'org-manufacturer', title: 'Poly-Cotton Selvedge — 180kg', material: 'Poly-Cotton Blend', quantityKg: 180, pricePerKgInr: 28, qualityScore: 71, matchScore: 74, location: 'Coimbatore, TN', certifications: [], status: 'Published', publishedAt: '2026-07-22T16:10:00Z' },
  { id: 'l3', inventoryItemId: 'inv-b3', sellerOrgId: 'org-cooperative', title: 'Natural White Yarn Waste — 640kg', material: 'Cotton 100%', quantityKg: 640, pricePerKgInr: 52, qualityScore: 95, matchScore: 88, location: 'Panipat, HR', certifications: ['GOTS'], status: 'Published', publishedAt: '2026-07-19T09:00:00Z' },
  { id: 'l4', inventoryItemId: 'inv-b4', sellerOrgId: 'org-manufacturer', title: 'Navy Fabric Rejects — 260kg', material: 'Cotton (85%) / Polyester (15%)', quantityKg: 260, pricePerKgInr: 33, qualityScore: 79, matchScore: 69, location: 'Coimbatore, TN', certifications: [], status: 'Closed' },
];

export const mockOrders: Order[] = [
  { id: 'o1', code: 'VC-ORD-3021', listingId: 'l4', buyerOrgId: 'org-buyer', sellerOrgId: 'org-manufacturer', quantityKg: 260, totalInr: 8580, paymentStatus: 'Paid', shipmentStatus: 'Delivered', createdAt: '2026-07-16T11:00:00Z' },
  { id: 'o2', code: 'VC-ORD-3034', listingId: 'l2', buyerOrgId: 'org-recycler', sellerOrgId: 'org-manufacturer', quantityKg: 180, totalInr: 5040, paymentStatus: 'Pending', shipmentStatus: 'Scheduled', createdAt: '2026-07-23T08:15:00Z' },
];

export const mockRFQs: RFQ[] = [
  { id: 'r1', buyerOrgId: 'org-buyer', listingId: 'l1', quantityKg: 200, targetPriceInr: 42, deliveryLocation: 'Tirupur, TN', qualityNotes: 'Need contamination under 5%.', status: 'Open', createdAt: '2026-07-27T10:00:00Z' },
  { id: 'r2', buyerOrgId: 'org-recycler', quantityKg: 500, targetPriceInr: 30, deliveryLocation: 'Surat, GJ', qualityNotes: 'Bulk poly-cotton, any color.', status: 'Quoted', createdAt: '2026-07-26T15:30:00Z' },
];

export const mockNotifications: Notification[] = [
  { id: 'n1', userId: 'u-manufacturer', type: 'match', message: 'New buyer match: Tirupur Fabric Traders wants your Indigo Cotton Scrap.', read: false, createdAt: '2026-07-29T09:00:00Z' },
  { id: 'n2', userId: 'u-manufacturer', type: 'rfq', message: 'RFQ received for 200kg at ₹42/kg from Tirupur Fabric Traders.', read: false, createdAt: '2026-07-28T17:22:00Z' },
  { id: 'n3', userId: 'u-manufacturer', type: 'analysis', message: 'AI analysis completed for VC-BATCH-1042 — 88% recoverable.', read: true, createdAt: '2026-07-24T09:21:00Z' },
  { id: 'n4', userId: 'u-manufacturer', type: 'shipment', message: 'Shipment for order VC-ORD-3034 has been scheduled.', read: true, createdAt: '2026-07-23T09:00:00Z' },
];

export const mockImpactSeries: ImpactMetric[] = [
  { period: 'Q1', wasteRecoveredT: 6.2, co2SavedT: 14, waterSavedM3: 380, revenueInr: 410000 },
  { period: 'Q2', wasteRecoveredT: 8.9, co2SavedT: 21, waterSavedM3: 540, revenueInr: 620000 },
  { period: 'Q3', wasteRecoveredT: 11.4, co2SavedT: 28, waterSavedM3: 710, revenueInr: 890000 },
  { period: 'Q4', wasteRecoveredT: 15.8, co2SavedT: 39, waterSavedM3: 980, revenueInr: 1240000 },
];
