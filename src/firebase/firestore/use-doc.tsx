'use client';

import { useState, useEffect } from 'react';
import {
  onSnapshot,
  DocumentReference,
  DocumentData,
  doc,
  Timestamp,
} from 'firebase/firestore';
import { useFirestore } from '@/firebase/provider';


function isTimestamp(value: any): value is Timestamp {
    return value && typeof value.toDate === 'function';
}

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

export function useDoc<T = DocumentData>(path: string): { data: T | null; isLoading: boolean };
export function useDoc<T = DocumentData>(ref: DocumentReference<T> | null): { data: T | null; isLoading: boolean };
export function useDoc<T = DocumentData>(pathOrRef: string | DocumentReference<T> | null): {
  data: T | null;
  isLoading: boolean;
} {
  const firestore = useFirestore();
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!firestore || !pathOrRef) {
      setIsLoading(false);
      setData(null);
      return;
    }

    const ref = typeof pathOrRef === 'string' ? doc(firestore, pathOrRef) as DocumentReference<T> : pathOrRef;

    const unsubscribe = onSnapshot(
      ref,
      (snapshot) => {
        if (snapshot.exists()) {
          const docData = snapshot.data();
          const dataWithConvertedTimestamps = convertTimestamps(docData);
          setData({ id: snapshot.id, ...dataWithConvertedTimestamps } as T);
        } else {
          setData(null);
        }
        setIsLoading(false);
      },
      (error) => {
        console.error('Error fetching document:', error);
        setData(null);
        setIsLoading(false);
      }
    );

    return () => unsubscribe();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [firestore, pathOrRef]);

  return { data, isLoading };
}
