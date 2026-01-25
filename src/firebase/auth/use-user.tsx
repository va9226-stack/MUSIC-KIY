'use client';

import { useState, useEffect } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { useAuth, useFirestore } from '@/firebase';

export function useUser() {
  const auth = useAuth();
  const firestore = useFirestore();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!auth || !firestore) {
      // Firebase is not initialized yet.
      // We'll wait for the provider to be ready.
      setIsLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const userRef = doc(firestore, `users/${firebaseUser.uid}`);
        // Create or update the user document in Firestore
        try {
          await setDoc(userRef, {
            displayName: firebaseUser.displayName,
            email: firebaseUser.email,
            photoURL: firebaseUser.photoURL,
            lastLogin: serverTimestamp(),
          }, { merge: true });
          // Set user state only after profile is synced
          setUser(firebaseUser);
        } catch (error) {
          console.error("Error creating/updating user profile:", error);
          // If we can't write the user profile, it's safer to sign out
          // to avoid being in an inconsistent state.
          if (auth) {
            await auth.signOut();
          }
          setUser(null);
        }
      } else {
        // User is signed out.
        setUser(null);
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [auth, firestore]);

  return { user, isLoading };
}
