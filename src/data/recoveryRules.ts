/**
 * HFCF (Handloom & Fiber Circularity Framework) rules config.
 *
 * Single source of truth for the domain-expert data behind the AI scan
 * engine's grading and routing logic. Plain data only — no functions here.
 * Edit these tables to update the rules; do not touch scan/matching logic
 * to change a number.
 */

// ---------------------------------------------------------------------------
// 1. Fiber acceptance — which recovery pathways a fiber type is even
//    eligible for. This is the FIRST filter the scan engine applies, before
//    contamination/provenance grading decides among eligible pathways.
// ---------------------------------------------------------------------------

export type AcceptanceLevel = 'yes' | 'limited' | 'no';

export interface FiberAcceptance {
  fiberType: string;
  respinning: AcceptanceLevel;
  textileRecycling: AcceptanceLevel;
  briquetting: AcceptanceLevel;
  notes: string;
}

export const FIBER_ACCEPTANCE: FiberAcceptance[] = [
  { fiberType: 'Cotton Waste', respinning: 'yes', textileRecycling: 'yes', briquetting: 'yes', notes: 'Highest demand; ideal for respinning' },
  { fiberType: 'Cotton Yarn Waste', respinning: 'yes', textileRecycling: 'yes', briquetting: 'yes', notes: 'Thread ends, cone waste, yarn clips' },
  { fiberType: 'Cotton Fabric Scraps', respinning: 'limited', textileRecycling: 'yes', briquetting: 'yes', notes: 'Only if clean; large offcuts can be mechanically processed' },
  { fiberType: 'Comber Noil', respinning: 'yes', textileRecycling: 'no', briquetting: 'no', notes: 'Premium short cotton fibre for OE spinning' },
  { fiberType: 'Flat Strips / Roving Waste', respinning: 'yes', textileRecycling: 'yes', briquetting: 'no', notes: 'Used in fibre recovery' },
  { fiberType: 'Wool Waste', respinning: 'yes', textileRecycling: 'yes', briquetting: 'yes', notes: "Panipat's shoddy industry mainly uses this" },
  { fiberType: 'Wool Yarn Waste', respinning: 'yes', textileRecycling: 'yes', briquetting: 'yes', notes: 'Suitable for recycled wool yarn' },
  { fiberType: 'Silk Waste', respinning: 'limited', textileRecycling: 'yes', briquetting: 'no', notes: 'High-value specialty fibre' },
  { fiberType: 'Tussar Silk Waste', respinning: 'limited', textileRecycling: 'yes', briquetting: 'no', notes: 'Used in niche silk recycling' },
  { fiberType: 'Linen Waste', respinning: 'limited', textileRecycling: 'yes', briquetting: 'yes', notes: 'Lower availability in India' },
  { fiberType: 'Jute Waste', respinning: 'no', textileRecycling: 'yes', briquetting: 'yes', notes: 'Mostly nonwoven or biomass applications' },
  { fiberType: 'Hemp Fibre Waste', respinning: 'no', textileRecycling: 'limited', briquetting: 'yes', notes: 'Emerging sustainable fibre' },
  { fiberType: 'Banana Fibre Waste', respinning: 'no', textileRecycling: 'limited', briquetting: 'yes', notes: 'Natural fibre recovery applications' },
  { fiberType: 'Bamboo Fibre Waste', respinning: 'no', textileRecycling: 'limited', briquetting: 'yes', notes: 'Limited commercial use currently' },
  { fiberType: 'Polyester-Cotton Blend', respinning: 'no', textileRecycling: 'limited', briquetting: 'limited', notes: 'Difficult to separate mechanically' },
  { fiberType: 'Mixed Textile Waste', respinning: 'no', textileRecycling: 'limited', briquetting: 'yes', notes: 'Only if contamination is low' },
  { fiberType: 'Cotton Dust / Lint', respinning: 'no', textileRecycling: 'no', briquetting: 'yes', notes: 'Briquetting or energy recovery' },
];

// ---------------------------------------------------------------------------
// 2. Contamination bands — the real grading rubric. Replaces arbitrary
//    percentage thresholds in the mock analysis service.
// ---------------------------------------------------------------------------

export type ContaminationLevel = 'Very Low' | 'Low' | 'Moderate' | 'High' | 'Severe';
export type GradeLetter = 'Excellent' | 'High' | 'Moderate' | 'Low' | 'Fail';

export interface ContaminationBand {
  level: ContaminationLevel;
  description: string;
  examples: string;
  gradeImpact: GradeLetter;
  respinningSuitability: 'Highly Suitable' | 'Suitable' | 'Requires Cleaning' | 'Generally Not Suitable' | 'Compliant Disposal';
  /** Inclusive upper bound (%) of contamination for this band, used to look up a band from a raw contaminationPct. */
  maxPct: number;
}

export const CONTAMINATION_BANDS: ContaminationBand[] = [
  { level: 'Very Low', description: 'Clean, almost no foreign material', examples: 'Fresh cotton yarn waste, clean fabric offcuts', gradeImpact: 'Excellent', respinningSuitability: 'Highly Suitable', maxPct: 3 },
  { level: 'Low', description: 'Minor dust or loose fibers', examples: 'Light dust, small thread knots', gradeImpact: 'High', respinningSuitability: 'Suitable', maxPct: 8 },
  { level: 'Moderate', description: 'Noticeable impurities', examples: 'Mixed colors, small labels, minor oil stains', gradeImpact: 'Moderate', respinningSuitability: 'Requires Cleaning', maxPct: 20 },
  { level: 'High', description: 'Significant contamination', examples: 'Plastic pieces, paper, dirt, excessive dyes', gradeImpact: 'Low', respinningSuitability: 'Generally Not Suitable', maxPct: 40 },
  { level: 'Severe', description: 'Heavily contaminated', examples: 'Wet waste, mold, chemicals, grease, sludge', gradeImpact: 'Fail', respinningSuitability: 'Compliant Disposal', maxPct: 100 },
];

// ---------------------------------------------------------------------------
// 3. Provenance levels — second scoring axis. Final grade = contamination
//    grade combined with provenance grade, not contamination alone.
// ---------------------------------------------------------------------------

export type ProvenanceLevel =
  | 'GI Certified Cluster'
  | 'Registered Cooperative'
  | 'Recognized Handloom Cluster'
  | 'Independent Weaver Group'
  | 'Unknown Source';

export interface ProvenanceRating {
  level: ProvenanceLevel;
  description: string;
  examples: string;
  stars: 1 | 2 | 3 | 4 | 5;
  gradeImpact: 'Positive' | 'Neutral' | 'Negative';
}

export const PROVENANCE_LEVELS: ProvenanceRating[] = [
  { level: 'GI Certified Cluster', description: 'Waste from a recognized GI handloom cluster', examples: 'Kanchipuram Silk, Chanderi, Pochampally', stars: 5, gradeImpact: 'Positive' },
  { level: 'Registered Cooperative', description: 'Waste from a registered handloom cooperative', examples: 'Co-optex Society, APCO Society', stars: 4, gradeImpact: 'Positive' },
  { level: 'Recognized Handloom Cluster', description: 'Known cluster without GI certification', examples: 'Erode Cotton, Salem Cotton', stars: 3, gradeImpact: 'Neutral' },
  { level: 'Independent Weaver Group', description: 'Organized SHGs or artisan groups', examples: 'Local weaving SHGs', stars: 2, gradeImpact: 'Neutral' },
  { level: 'Unknown Source', description: 'Origin cannot be verified', examples: 'Mixed collection, unknown supplier', stars: 1, gradeImpact: 'Negative' },
];

// ---------------------------------------------------------------------------
// 4. Recovery pathway → hub mapping. Final grade drives where a batch is
//    routed and which real-world hub logistics suggests — not a random
//    distance hash.
// ---------------------------------------------------------------------------

export type FinalGrade = 'A' | 'B' | 'C' | 'Fail';

export interface RecoveryHub {
  name: string;
  region: string;
  keyFacts: string;
}

export interface RecoveryPathwayRule {
  grade: FinalGrade;
  pathway: string;
  hubs: RecoveryHub[];
}

export const RECOVERY_PATHWAYS: RecoveryPathwayRule[] = [
  {
    grade: 'A',
    pathway: 'Respinning (premium)',
    hubs: [
      { name: 'Panipat', region: 'Haryana', keyFacts: '~300 tonnes/day processed; ~150 mills; India\'s largest shoddy/recycled-yarn hub' },
      { name: 'Ichalkaranji', region: 'Maharashtra', keyFacts: 'Regional cotton respinning cluster' },
    ],
  },
  {
    grade: 'B',
    pathway: 'Respinning / textile recycling',
    hubs: [
      { name: 'Panipat', region: 'Haryana', keyFacts: '~300 tonnes/day processed; ~150 mills' },
      { name: 'Bhiwandi', region: 'Maharashtra', keyFacts: 'Regional textile recycling and blending hub' },
    ],
  },
  {
    grade: 'C',
    pathway: 'Briquetting / local recovery',
    hubs: [
      { name: 'Local briquetting unit', region: 'Nearest collection center', keyFacts: 'Fiber unsuitable for respinning; converted to briquettes for energy recovery' },
    ],
  },
  {
    grade: 'Fail',
    pathway: 'Compliant disposal',
    hubs: [
      { name: 'Compliant disposal facility', region: 'Nearest licensed facility', keyFacts: 'Severe contamination (wet waste, mold, chemicals) — not recoverable' },
    ],
  },
];

// ---------------------------------------------------------------------------
// 5a. Product yield — by WEIGHT (kg range). Primary batch → product
//     estimator, since real batches are measured in weight.
// ---------------------------------------------------------------------------

export interface ProductWeightYield {
  product: string;
  minGrams: number;
  maxGrams: number;
  suitableFibers: string[];
}

export const PRODUCT_WEIGHT_YIELD: ProductWeightYield[] = [
  { product: 'Coin Pouch', minGrams: 50, maxGrams: 80, suitableFibers: ['Cotton', 'Denim'] },
  { product: 'Wallet', minGrams: 80, maxGrams: 120, suitableFibers: ['Cotton Canvas', 'Denim'] },
  { product: 'Pencil Case', minGrams: 100, maxGrams: 150, suitableFibers: ['Cotton'] },
  { product: 'Tote Bag', minGrams: 250, maxGrams: 400, suitableFibers: ['Cotton', 'Jute'] },
  { product: 'Shopping Bag', minGrams: 300, maxGrams: 500, suitableFibers: ['Cotton', 'Jute'] },
  { product: 'Cushion Cover', minGrams: 200, maxGrams: 350, suitableFibers: ['Cotton'] },
  { product: 'Table Runner', minGrams: 250, maxGrams: 450, suitableFibers: ['Cotton', 'Linen'] },
  { product: 'Scarf / Stole', minGrams: 180, maxGrams: 300, suitableFibers: ['Cotton', 'Silk'] },
  { product: 'Hand Towel', minGrams: 150, maxGrams: 250, suitableFibers: ['Cotton'] },
  { product: 'Floor Mat', minGrams: 600, maxGrams: 1200, suitableFibers: ['Cotton', 'Jute'] },
  { product: 'Handmade Paper Sheet (A3)', minGrams: 20, maxGrams: 40, suitableFibers: ['Cotton Waste'] },
  { product: 'Decorative Basket', minGrams: 300, maxGrams: 600, suitableFibers: ['Jute', 'Cotton Rope'] },
];

// ---------------------------------------------------------------------------
// 5b. Product yield — by LENGTH (fiber/yarn required). Cross-checked
//     against a batch's fiberLengthMm to validate which products its
//     fiber length actually supports (e.g. short comber noil can't make
//     a long scarf even if weight matches).
// ---------------------------------------------------------------------------

export interface ProductLengthYield {
  product: string;
  minGrams: number;
  maxGrams: number;
  suitableFibers: string[];
}

export const PRODUCT_LENGTH_YIELD: ProductLengthYield[] = [
  { product: 'Coin Pouch', minGrams: 50, maxGrams: 80, suitableFibers: ['Cotton', 'Denim'] },
  { product: 'Pencil Case', minGrams: 100, maxGrams: 150, suitableFibers: ['Cotton'] },
  { product: 'Cushion Cover', minGrams: 200, maxGrams: 350, suitableFibers: ['Cotton'] },
  { product: 'Table Cloth', minGrams: 250, maxGrams: 450, suitableFibers: ['Cotton', 'Linen'] },
  { product: 'Scarf / Stole', minGrams: 180, maxGrams: 300, suitableFibers: ['Cotton', 'Silk'] },
  { product: 'Hand Towel', minGrams: 150, maxGrams: 250, suitableFibers: ['Cotton'] },
];