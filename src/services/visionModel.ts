/**
 * Real neural network inference, client-side, no backend.
 *
 * Loads a pretrained MobileNet (trained on ~1.4M ImageNet images) once via
 * TensorFlow.js and runs actual CNN inference on the uploaded batch photo.
 * This is a genuine trained model — not a rule, not pixel math — but its
 * output classes are general-purpose (ImageNet labels), not our fiber
 * taxonomy, so we treat its result as a supporting confidence signal
 * alongside the domain-expert HFCF rules engine, not a replacement for it.
 */
import * as tf from '@tensorflow/tfjs';
import * as mobilenet from '@tensorflow-models/mobilenet';

export interface NeuralPrediction {
  className: string;
  probability: number;
}

let modelPromise: Promise<mobilenet.MobileNet> | null = null;

function getModel(): Promise<mobilenet.MobileNet> {
  if (!modelPromise) {
    modelPromise = mobilenet.load({ version: 2, alpha: 1.0 });
  }
  return modelPromise;
}

/** Runs real MobileNet inference on an already-loaded <img> element. */
export async function classifyImage(img: HTMLImageElement): Promise<NeuralPrediction[]> {
  const model = await getModel();
  const predictions = await model.classify(img, 5);
  return predictions.map((p) => ({ className: p.className, probability: Math.round(p.probability * 100) }));
}

/** Textile-relevant keywords we look for in MobileNet's general ImageNet labels,
 *  to translate its output into something meaningful for fiber/material context. */
const TEXTILE_KEYWORDS = ['wool', 'cotton', 'fabric', 'cloth', 'textile', 'silk', 'velvet', 'denim', 'knit', 'wig', 'fur', 'towel', 'quilt', 'sweater', 'rag', 'sarong', 'handkerchief'];

export function summarizeTextileRelevance(predictions: NeuralPrediction[]): { relevant: boolean; matchedLabel: string | null; note: string } {
  for (const p of predictions) {
    const lower = p.className.toLowerCase();
    const match = TEXTILE_KEYWORDS.find((k) => lower.includes(k));
    if (match) {
      return { relevant: true, matchedLabel: p.className, note: `Neural network recognized "${p.className}" (${p.probability}% confidence) — visually consistent with a textile/fiber material.` };
    }
  }
  return { relevant: false, matchedLabel: predictions[0]?.className ?? null, note: `Neural network's top match was "${predictions[0]?.className ?? 'unknown'}" — no strong textile signature detected; recommend a clearer close-up photo of the fiber.` };
}

export { tf };