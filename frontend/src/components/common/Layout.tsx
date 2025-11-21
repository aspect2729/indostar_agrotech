/**
 * Layout Component
 * Wraps pages with the unified header
 */

import React from 'react';
import Header from './Header';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <>
      <Header />
      <main className="main-content">
        {children}
      </main>
    </>
  );
};

export default Layout;
