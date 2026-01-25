"use client";
import { useState, useEffect, useCallback } from 'react';

// A function to broadcast changes to other components on the same page
const broadcastChange = (key: string) => {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('local-storage-change', { detail: { key } }));
  }
};

export function useLocalStorage<T>(key: string, initialValue: T): [T, (value: T | ((val: T) => T)) => void] {
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (typeof window === 'undefined') {
      return initialValue;
    }
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(error);
      return initialValue;
    }
  });

  const setValue = useCallback((value: T | ((val: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(key, JSON.stringify(valueToStore));
        broadcastChange(key); // Broadcast the change to other hooks on the same page
      }
    } catch (error) {
      console.error(error);
    }
  }, [key, storedValue]);
  
  // Effect to listen for changes from other tabs/windows
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.storageArea === localStorage && e.key === key && e.newValue) {
        try {
          setStoredValue(JSON.parse(e.newValue));
        } catch (error) {
          console.error(error);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [key]);

  // Effect to listen for changes from the same page via our custom event
  useEffect(() => {
    const handleLocalStorageChange = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (customEvent.detail.key === key) {
        try {
          const item = window.localStorage.getItem(key);
          setStoredValue(item ? JSON.parse(item) : initialValue);
        } catch (error) {
          console.error(error);
        }
      }
    };
    
    window.addEventListener('local-storage-change', handleLocalStorageChange);
    return () => window.removeEventListener('local-storage-change', handleLocalStorageChange);
  }, [key, initialValue]);

  return [storedValue, setValue];
}
