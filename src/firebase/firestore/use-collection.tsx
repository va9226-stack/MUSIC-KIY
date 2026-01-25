'use client';

import { useState, useEffect } from 'react';
import {
  onSnapshot,
  Query,
  DocumentData,
  collection,
  query,
  Timestamp,
} from 'firebase/firestore';
import { useFirestore } from '@/firebase/provider';

function isTimestamp(value: any): value is Timestamp {
    return value && typeof value.toDate === 'function';
}

// Function to recursively convert Timestamps to ISO strings for client-side consistency
function convertTimestamps<T>(data: T): T {
    if (data === null || typeof data !== 'object') {
        return data;
    }

    if (isTimestamp(data)) {
        return data.toDate().toISOString() as any;
    }
    
    if (Array.isArray(data)) {
        return data.map(convertTimestamps) as any;
    }

    const newData: { [key: string]: any } = {};
    for (const key in data) {
        if (Object.prototype.hasOwnProperty.call(data, key)) {
            newData[key] = convertTimestamps((data as any)[key]);
        }
    }
    return newData as T;
}


export function useCollection<T = DocumentData>(path: string): { data: T[] | null; isLoading: boolean };
export function useCollection<T = DocumentData>(q: Query<T> | null): { data: T[] | null; isLoading: boolean };
export function useCollection<T = DocumentData>(pathOrQuery: string | Query<T> | null): {
  data: T[] | null;
  isLoading: boolean;
} {
  const firestore = useFirestore();
  const [data, setData] = useState<T[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!firestore || !pathOrQuery) {
        setIsLoading(false);
        setData(null);
        return;
    }

    let q: Query<T>;
    if (typeof pathOrQuery === 'string') {
      q = query(collection(firestore, pathOrQuery)) as Query<T>;
    } else {
      q = pathOrQuery;
    }

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const documents = snapshot.docs.map((doc) => {
            const docData = doc.data();
            const dataWithConvertedTimestamps = convertTimestamps(docData);
            return { id: doc.id, ...dataWithConvertedTimestamps } as T
        });
        setData(documents);
        setIsLoading(false);
      },
      (error) => {
        console.error('Error fetching collection:', error);
        setData(null);
        setIsLoading(false);
      }
    );

    return () => unsubscribe();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [firestore, pathOrQuery]);

  return { data, isLoading };
}
