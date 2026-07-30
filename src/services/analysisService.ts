import type { AnalysisResult } from '@/types';

export interface AnalysisInput {
  materialType: string;
  wasteCategory: string;
  weightKg: number;
  color: string;
  moisturePct: number;
  contaminationPct: number;
}

export interface AnalysisService {
  analyze(input: AnalysisInput): Promise<AnalysisResult>;
}

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

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

function routeFor(recoverability: number, contamination: number): AnalysisResult['recommendedRoute'] {
  if (contamination > 35) return 'Discard';
  if (recoverability >= 85) return 'Respin';
  if (recoverability >= 65) return 'Reuse';
  if (recoverability >= 40) return 'Recycle';
  if (recoverability >= 20) return 'Sell';
  return 'Store';
}

class MockAnalysisService implements AnalysisService {
  async analyze(input: AnalysisInput): Promise<AnalysisResult> {
    await delay(2200);
    const profile = fiberProfiles[input.wasteCategory] ?? fiberProfiles['Cutting Scrap'];
    const recoverability = Math.max(8, Math.min(97, 96 - input.contaminationPct * 1.6 - input.moisturePct * 0.8));
    const confidence = Math.max(60, Math.min(99, 94 - input.contaminationPct * 0.4));
    const contaminationGrade: AnalysisResult['contaminationGrade'] =
      input.contaminationPct < 8 ? 'Low' : input.contaminationPct < 20 ? 'Medium' : 'High';
    const pricePerKg = Math.round(20 + (recoverability / 100) * 50 - input.contaminationPct * 0.3);
    const route = routeFor(recoverability, input.contaminationPct);

    return {
      id: `a-${Date.now()}`,
      batchId: '',
      detectedFiber: profile.fiber,
      composition: profile.composition,
      confidencePct: Math.round(confidence),
      recoverabilityPct: Math.round(recoverability),
      contaminationGrade,
      moisturePct: input.moisturePct,
      estimatedYarnLengthM: Math.round(input.weightKg * (recoverability / 100) * 7.4),
      estimatedPriceInr: Math.max(500, Math.round(pricePerKg * input.weightKg)),
      recommendedRoute: route,
      reasoning: `${profile.fiber} composition with ${contaminationGrade.toLowerCase()} contamination (${input.contaminationPct}%) and ${input.moisturePct}% moisture yields ${Math.round(recoverability)}% recoverability — routed to ${route.toLowerCase()}.`,
      suggestedBuyerIds: recoverability > 60 ? ['org-buyer', 'org-recycler'] : ['org-recycler'],
      co2SavedKg: Math.round(input.weightKg * 0.8),
      waterSavedL: Math.round(input.weightKg * 12.4),
      createdAt: new Date().toISOString(),
    };
  }
}

export const analysisService: AnalysisService = new MockAnalysisService();
