/**
 * DrawerHeader Component
 * 
 * Header section of the navigation drawer with brand logo and tagline.
 * Implements requirements: 1.3
 */

import React from 'react';

const DrawerHeader: React.FC = () => {
  return (
    <div className="drawer-header">
      <div className="drawer-header__logo-container">
        {/* Logo - using a placeholder, can be replaced with actual logo */}
        <div 
          className="drawer-header__logo"
          style={{
            backgroundColor: '#F4C430',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 'bold',
            fontSize: '20px',
            color: '#333333'
          }}
        >
          IS
        </div>
        <h2 className="drawer-header__brand-name">IndoStar</h2>
      </div>
      <p className="drawer-header__tagline">Pure & Natural Products</p>
    </div>
  );
};

export default DrawerHeader;
