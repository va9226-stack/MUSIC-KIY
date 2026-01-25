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
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        // User is signed in.
        setUser(user);
        // Update user profile in Firestore
        const userRef = doc(firestore, `users/${user.uid}`);
        
        // We use set with merge to create the doc if it doesn't exist,
        // or update it if it does. This is a fire-and-forget operation
        // on the client, with errors logged to the console.
        setDoc(userRef, {
          displayName: user.displayName,
          email: user.email,
          photoURL: user.photoURL,
          lastLogin: serverTimestamp(),
        }, { merge: true }).catch(error => {
          console.error("Error updating user profile:", error);
        });

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
