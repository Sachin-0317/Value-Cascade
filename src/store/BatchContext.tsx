import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import type { HfcfAnalysisResult } from '@/services/analysisService';

export type BatchStatus = 'Ready for Sale' | 'Listed' | 'Reserved' | 'In Transit' | 'Sold' | 'Recycled' | 'Rejected';

/** A scanned batch, holding the metadata entered on AnalysisPage plus its HFCF result. */
export interface ScannedBatch {
  id: string;
  code: string;
  materialType: string;
  wasteCategory: string;
  weightKg: number;
  location: string;
  imageUrl: string | null;
  createdAt: string;
  analysis: HfcfAnalysisResult;
  status: BatchStatus;
}

interface BatchContextValue {
  batches: ScannedBatch[];
  addBatch: (batch: Omit<ScannedBatch, 'id' | 'code' | 'createdAt' | 'status'>) => ScannedBatch;
  getBatch: (id: string) => ScannedBatch | undefined;
  updateBatchStatus: (id: string, status: BatchStatus) => void;
}

const BatchContext = createContext<BatchContextValue | null>(null);

const STORAGE_KEY = 'valuecascade:batches';

function loadFromStorage(): ScannedBatch[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as ScannedBatch[];
    return parsed.map((b) => ({ ...b, status: b.status ?? 'Ready for Sale' }));
  } catch {
    return [];
  }
}

function nextCounterFrom(batches: ScannedBatch[]): number {
  const nums = batches.map((b) => Number(b.id.replace('batch-', ''))).filter((n) => !Number.isNaN(n));
  return nums.length ? Math.max(...nums) : 1000;
}

export function BatchProvider({ children }: { children: ReactNode }) {
  const [batches, setBatches] = useState<ScannedBatch[]>(loadFromStorage);
  const [, setCounter] = useState(() => nextCounterFrom(loadFromStorage()));

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(batches));
    } catch {
      // storage full/unavailable, session still works
    }
  }, [batches]);

  const addBatch = useCallback((input: Omit<ScannedBatch, 'id' | 'code' | 'createdAt' | 'status'>) => {
    let created!: ScannedBatch;
    setCounter((c) => {
      const next = c + 1;
      created = { ...input, id: `batch-${next}`, code: `VC-BATCH-${next}`, createdAt: new Date().toISOString(), status: 'Ready for Sale' };
      return next;
    });
    setBatches((prev) => [created, ...prev]);
    return created;
  }, []);

  const getBatch = useCallback((id: string) => batches.find((b) => b.id === id), [batches]);

  const updateBatchStatus = useCallback((id: string, status: BatchStatus) => {
    setBatches((prev) => prev.map((b) => (b.id === id ? { ...b, status } : b)));
  }, []);

  const value = useMemo(
    () => ({ batches, addBatch, getBatch, updateBatchStatus }),
    [batches, addBatch, getBatch, updateBatchStatus]
  );

  return <BatchContext.Provider value={value}>{children}</BatchContext.Provider>;
}

export function useBatches() {
  const ctx = useContext(BatchContext);
  if (!ctx) throw new Error('useBatches must be used within BatchProvider');
  return ctx;
}