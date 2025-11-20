/**
 * Offline Indicator Component
 * 
 * Displays a banner when the user is offline.
 * Implements requirement: 6.4
 */

import React from 'react';
import { useNetworkStatus } from '../../hooks/useNetworkStatus';
import './OfflineIndicator.css';

const OfflineIndicator: React.FC = () => {
  const { isOffline } = useNetworkStatus();

  if (!isOffline) return null;

  return (
    <div className="offline-indicator slide-in-down" role="alert">
      <span className="offline-icon">📡</span>
      <span className="offline-text">
        You are currently offline. Some features may not be available.
      </span>
    </div>
  );
};

export default OfflineIndicator;
