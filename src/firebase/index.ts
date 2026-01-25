'use client';

import {
  initializeApp,
  type FirebaseOptions,
  type FirebaseApp,
} from 'firebase/app';
import { Auth, getAuth } from 'firebase/auth';
import { Firestore, getFirestore } from 'firebase/firestore';

let app: FirebaseApp | null = null;
let auth: Auth | null = null;
let firestore: Firestore | null = null;

// This function initializes Firebase and ensures it's a singleton.
function initializeFirebase(firebaseConfig: FirebaseOptions) {
  if (app) return { app, auth: auth!, firestore: firestore! };

  try {
    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    firestore = getFirestore(app);
  } catch (e) {
    console.error('Failed to initialize Firebase', e);
  }


  return { app, auth: auth!, firestore: firestore! };
}

export { initializeFirebase };
export * from './provider';
export * from './auth/use-user';
export * from './firestore/use-collection';
export * from './firestore/use-doc';
export * from './firestore/utils';
