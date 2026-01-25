'use client';

import React from 'react';
import { initializeFirebase, FirebaseProvider } from '@/firebase';
import { firebaseConfig } from './config';

export function FirebaseClientProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const firebase = initializeFirebase(firebaseConfig);

  return <FirebaseProvider value={firebase}>{children}</FirebaseProvider>;
}
