import type { AnalysisResult } from '@/types';
import {
  FIBER_ACCEPTANCE,
  CONTAMINATION_BANDS,
  PROVENANCE_LEVELS,
  RECOVERY_PATHWAYS,
  PRODUCT_WEIGHT_YIELD,
  PRODUCT_LENGTH_YIELD,
  type FinalGrade,
  type ProvenanceLevel,
} from '@/data/recoveryRules';

export interface AnalysisInput {
  materialType: string;
  wasteCategory: string;
  weightKg: number;
  color: string;
  moisturePct: number;
  contaminationPct: number;
  /** Must match a `fiberType` in FIBER_ACCEPTANCE. Falls back to wasteCategory lookup if omitted. */
  fiberType?: string;
  /** Must match a `level` in PROVENANCE_LEVELS. Defaults to 'Unknown Source'. */
  provenance?: ProvenanceLevel;
  fiberLengthMm?: number;
  /** Real pixel-level signals extracted from the uploaded photo (0-100 scale). Optional so the service still works without a photo. */
  visual?: { brightness: number; colorVariance: number; textureScore: number };
}

/** Extra HFCF-derived detail, additive to AnalysisResult so existing UI code keeps working untouched. */
export interface HfcfDetail {
  finalGrade: FinalGrade;
  contaminationLevel: string;
  provenanceLevel: ProvenanceLevel;
  provenanceStars: number;
  eligiblePathways: { respinning: boolean; textileRecycling: boolean; briquetting: boolean };
  pathway: string;
  hubs: { name: string; region: string; keyFacts: string }[];
  productSuggestions: { product: string; suitableFibers: string[] }[];
  /** Result of cross-checking the photo's real pixel signals against the entered contamination %. */
  visualCheck?: { visualContaminationEstimatePct: number; agreesWithInput: boolean; note: string };
}

export type HfcfAnalysisResult = AnalysisResult & { hfcf: HfcfDetail };

export interface AnalysisService {
  analyze(input: AnalysisInput): Promise<HfcfAnalysisResult>;
}

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

// Fallback fiber composition guesses, used only when no fiberType match is found.
const fiberProfiles: Record<string, { fiber: string; composition: { fiber: string; pct: number }[] }> = {
  'Cutting Scrap': { fiber: 'Cotton', composition: [{ fiber: 'Cotton', pct: 88 }, { fiber: 'Elastane', pct: 12 }] },
  Selvedge: { fiber: 'Poly-Cotton', composition: [{ fiber: 'Cotton', pct: 55 }, { fiber: 'Polyester', pct: 45 }] },
  'Yarn Waste': { fiber: 'Cotton', composition: [{ fiber: 'Cotton', pct: 97 }, { fiber: 'Other', pct: 3 }] },
  'Fabric Rejects': { fiber: 'Cotton-Poly', composition: [{ fiber: 'Cotton', pct: 70 }, { fiber: 'Polyester', pct: 30 }] },
  Sludge: { fiber: 'Mixed Fiber', composition: [{ fiber: 'Mixed', pct: 100 }] },
  'Dust & Fly': { fiber: 'Cotton Fly', composition: [{ fiber: 'Cotton', pct: 60 }, { fiber: 'Dust', pct: 40 }] },
  Rags: { fiber: 'Mixed Cotton', composition: [{ fiber: 'Cotton', pct: 65 }, { fiber: 'Polyester', pct: 35 }] },
  'Post-Consumer': { fiber: 'Mixed Blend', composition: [{ fiber: 'Cotton', pct: 50 }, { fiber: 'Polyester', pct: 40 }, { fiber: 'Other', pct: 10 }] },
};

function lookupContaminationBand(pct: number) {
  return CONTAMINATION_BANDS.find((b) => pct <= b.maxPct) ?? CONTAMINATION_BANDS[CONTAMINATION_BANDS.length - 1];
}

function lookupProvenance(level: ProvenanceLevel | undefined) {
  return PROVENANCE_LEVELS.find((p) => p.level === level) ?? PROVENANCE_LEVELS[PROVENANCE_LEVELS.length - 1];
}

function lookupFiberAcceptance(fiberType: string | undefined) {
  if (!fiberType) return undefined;
  return FIBER_ACCEPTANCE.find((f) => f.fiberType.toLowerCase() === fiberType.toLowerCase());
}

/** Base grade from contamination band, then nudged by provenance. */
function computeFinalGrade(contaminationGradeImpact: string, provenanceGradeImpact: string): FinalGrade {
  const baseMap: Record<string, FinalGrade> = {
    Excellent: 'A',
    High: 'B',
    Moderate: 'B',
    Low: 'C',
    Fail: 'Fail',
  };
  let grade = baseMap[contaminationGradeImpact] ?? 'C';
  if (grade === 'Fail') return 'Fail';

  const order: FinalGrade[] = ['A', 'B', 'C'];
  const idx = order.indexOf(grade);
  if (provenanceGradeImpact === 'Positive' && idx > 0) grade = order[idx - 1];
  if (provenanceGradeImpact === 'Negative' && idx < order.length - 1) grade = order[idx + 1];
  return grade;
}

/** Downgrade the pathway if the fiber type isn't actually eligible for it. */
function resolvePathway(grade: FinalGrade, fiberType: string | undefined) {
  const acceptance = lookupFiberAcceptance(fiberType);
  const eligible = {
    respinning: acceptance ? acceptance.respinning !== 'no' : true,
    textileRecycling: acceptance ? acceptance.textileRecycling !== 'no' : true,
    briquetting: acceptance ? acceptance.briquetting !== 'no' : true,
  };

  let effectiveGrade = grade;
  if (effectiveGrade !== 'Fail') {
    if ((effectiveGrade === 'A' || effectiveGrade === 'B') && !eligible.respinning) {
      effectiveGrade = eligible.textileRecycling ? 'B' : eligible.briquetting ? 'C' : 'Fail';
    }
    if (effectiveGrade === 'C' && !eligible.briquetting && !eligible.textileRecycling) {
      effectiveGrade = 'Fail';
    }
  }

  const rule = RECOVERY_PATHWAYS.find((r) => r.grade === effectiveGrade) ?? RECOVERY_PATHWAYS[RECOVERY_PATHWAYS.length - 1];
  return { effectiveGrade, eligible, rule };
}

function routeFromGrade(grade: FinalGrade): AnalysisResult['recommendedRoute'] {
  if (grade === 'A') return 'Respin';
  if (grade === 'B') return 'Reuse';
  if (grade === 'C') return 'Recycle';
  return 'Discard';
}

function suggestProducts(weightKg: number, fiberLabel: string, fiberLengthMm: number | undefined) {
  const grams = weightKg * 1000;
  const byWeight = PRODUCT_WEIGHT_YIELD.filter(
    (p) =>
      grams >= p.minGrams &&
      grams <= p.maxGrams &&
      p.suitableFibers.some(
        (f) => fiberLabel.toLowerCase().includes(f.toLowerCase()) || f.toLowerCase().includes(fiberLabel.toLowerCase())
      )
  );

  // Cross-check against the length table: if fiberLengthMm is short, exclude
  // products that also appear in the length table (i.e. products where fiber
  // length actually matters), unless the batch has no length data at all.
  if (fiberLengthMm !== undefined && fiberLengthMm < 15) {
    const lengthSensitiveProducts = new Set(PRODUCT_LENGTH_YIELD.map((p) => p.product));
    return byWeight
      .filter((p) => !lengthSensitiveProducts.has(p.product))
      .map((p) => ({ product: p.product, suitableFibers: p.suitableFibers }));
  }

  return byWeight.map((p) => ({ product: p.product, suitableFibers: p.suitableFibers }));
}

class MockAnalysisService implements AnalysisService {
  async analyze(input: AnalysisInput): Promise<HfcfAnalysisResult> {
    await delay(2200);

    const fiberAcceptance = lookupFiberAcceptance(input.fiberType);
    const profile = fiberProfiles[input.wasteCategory] ?? fiberProfiles['Cutting Scrap'];
    const detectedFiber = fiberAcceptance?.fiberType ?? profile.fiber;

    const contaminationBand = lookupContaminationBand(input.contaminationPct);
    const provenanceRating = lookupProvenance(input.provenance);

    const finalGrade = computeFinalGrade(contaminationBand.gradeImpact, provenanceRating.gradeImpact);
    const { effectiveGrade, eligible, rule } = resolvePathway(finalGrade, input.fiberType);
    const route = routeFromGrade(effectiveGrade);

    const recoverability = Math.max(8, Math.min(97, 96 - input.contaminationPct * 1.6 - input.moisturePct * 0.8));
    const confidence = Math.max(60, Math.min(99, 94 - input.contaminationPct * 0.4));
    const contaminationGrade: AnalysisResult['contaminationGrade'] =
      contaminationBand.level === 'Very Low' || contaminationBand.level === 'Low'
        ? 'Low'
        : contaminationBand.level === 'Moderate'
          ? 'Medium'
          : 'High';
    const pricePerKg = Math.round(20 + (recoverability / 100) * 50 - input.contaminationPct * 0.3);

    const productSuggestions = suggestProducts(input.weightKg, detectedFiber, input.fiberLengthMm);

    return {
      id: `a-${Date.now()}`,
      batchId: '',
      detectedFiber,
      composition: profile.composition,
      confidencePct: Math.round(confidence),
      recoverabilityPct: Math.round(recoverability),
      contaminationGrade,
      moisturePct: input.moisturePct,
      estimatedYarnLengthM: Math.round(input.weightKg * (recoverability / 100) * 7.4),
      estimatedPriceInr: Math.max(500, Math.round(pricePerKg * input.weightKg)),
      recommendedRoute: route,
      reasoning: `${detectedFiber} at ${contaminationBand.level.toLowerCase()} contamination (${input.contaminationPct}%, grade impact: ${contaminationBand.gradeImpact}) with ${provenanceRating.level} provenance (${provenanceRating.stars}★) → final grade ${effectiveGrade} → routed to ${rule.pathway.toLowerCase()}.`,
      suggestedBuyerIds: recoverability > 60 ? ['org-buyer', 'org-recycler'] : ['org-recycler'],
      co2SavedKg: Math.round(input.weightKg * 0.8),
      waterSavedL: Math.round(input.weightKg * 12.4),
      createdAt: new Date().toISOString(),
      hfcf: {
        finalGrade: effectiveGrade,
        contaminationLevel: contaminationBand.level,
        provenanceLevel: provenanceRating.level,
        provenanceStars: provenanceRating.stars,
        eligiblePathways: eligible,
        pathway: rule.pathway,
        hubs: rule.hubs,
        productSuggestions,
      },
    };
  }
}

export const analysisService: AnalysisService = new MockAnalysisService();