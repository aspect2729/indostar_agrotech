/**
 * Network Status Hook
 * 
 * Custom React hook for monitoring network connectivity.
 * Implements requirement: 6.4
 */

import { useState, useEffect } from 'react';
import { networkMonitor } from '../utils/errorHandling';

export interface UseNetworkStatusReturn {
  isOnline: boolean;
  isOffline: boolean;
}

export const useNetworkStatus = (): UseNetworkStatusReturn => {
  const [isOnline, setIsOnline] = useState(networkMonitor.getStatus());

  useEffect(() => {
    const unsubscribe = networkMonitor.subscribe((online) => {
      setIsOnline(online);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  return {
    isOnline,
    isOffline: !isOnline,
  };
};
