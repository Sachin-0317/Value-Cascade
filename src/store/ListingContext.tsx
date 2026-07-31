
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { useBatches } from '@/store/BatchContext';

export interface ScannedListing {
  id: string;
  batchId: string;
  title: string;
  material: string;
  quantityKg: number;
  pricePerKgInr: number;
  qualityScore: number;
  location: string;
  certifications: string[];
  status: 'Draft' | 'Published' | 'Paused' | 'Closed';
  publishedAt?: string;
  createdAt: string;
}

export interface NewListingInput {
  batchId: string;
  title: string;
  pricePerKgInr: number;
  certifications: string[];
}

interface ListingContextValue {
  listings: ScannedListing[];
  createListing: (input: NewListingInput) => ScannedListing;
  setListingStatus: (id: string, status: ScannedListing['status']) => void;
}

const ListingContext = createContext<ListingContextValue | null>(null);
const STORAGE_KEY = 'valuecascade:listings';

function loadFromStorage(): ScannedListing[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as ScannedListing[]) : [];
  } catch {
    return [];
  }
}

export function ListingProvider({ children }: { children: ReactNode }) {
  const { batches, updateBatchStatus } = useBatches();
  const [listings, setListings] = useState<ScannedListing[]>(loadFromStorage);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(listings));
    } catch {
      // storage full/unavailable, session still works
    }
  }, [listings]);

  const createListing = useCallback(
    (input: NewListingInput) => {
      const batch = batches.find((b) => b.id === input.batchId);
      if (!batch) throw new Error('Batch not found');

      const listing: ScannedListing = {
        id: `listing-${Date.now()}`,
        batchId: batch.id,
        title: input.title,
        material: batch.analysis.detectedFiber,
        quantityKg: batch.weightKg,
        pricePerKgInr: Math.max(1, input.pricePerKgInr),
        qualityScore: batch.analysis.recoverabilityPct,
        location: batch.location,
        certifications: input.certifications,
        status: 'Draft',
        createdAt: new Date().toISOString(),
      };

      setListings((prev) => [listing, ...prev]);
      updateBatchStatus(batch.id, 'Listed');
      return listing;
    },
    [batches, updateBatchStatus]
  );

  const setListingStatus = useCallback((id: string, status: ScannedListing['status']) => {
    setListings((prev) =>
      prev.map((l) => (l.id === id ? { ...l, status, publishedAt: status === 'Published' ? new Date().toISOString() : l.publishedAt } : l))
    );
  }, []);

  const value = useMemo(() => ({ listings, createListing, setListingStatus }), [listings, createListing, setListingStatus]);

  return <ListingContext.Provider value={value}>{children}</ListingContext.Provider>;
}

export function useListings() {
  const ctx = useContext(ListingContext);
  if (!ctx) throw new Error('useListings must be used within ListingProvider');
  return ctx;
}