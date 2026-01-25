'use client';
import { useMemo } from 'react';
import {
  DocumentReference,
  Query,
} from 'firebase/firestore';

export function useMemoFirebase<T extends DocumentReference | Query | null>(
  factory: () => T,
  deps: React.DependencyList
): T {
  // eslint-disable-next-line react-hooks/exhaustive-deps
  return useMemo(factory, deps);
}
