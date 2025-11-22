/**
 * DrawerFooter Component
 * 
 * Footer section of the navigation drawer with pause deliveries toggle and version.
 * Implements requirements: 7.2, 7.3, 7.4
 */

import React from 'react';

interface DrawerFooterProps {
  deliveriesPaused: boolean;
  onTogglePause: () => void;
  appVersion: string;
}

const DrawerFooter: React.FC<DrawerFooterProps> = ({
  deliveriesPaused,
  onTogglePause,
  appVersion,
}) => {
  return (
    <div className="drawer-footer">
      <div className="drawer-footer__pause-section">
        <span className="drawer-footer__pause-label">Pause all deliveries</span>
        <button
          className={`toggle-switch ${deliveriesPaused ? 'toggle-switch--active' : ''}`}
          onClick={onTogglePause}
          role="switch"
          aria-checked={deliveriesPaused}
          aria-label="Pause all deliveries"
        >
          <span className="toggle-switch__slider" />
        </button>
      </div>
      <p className="drawer-footer__version">Version {appVersion}</p>
    </div>
  );
};

export default DrawerFooter;
