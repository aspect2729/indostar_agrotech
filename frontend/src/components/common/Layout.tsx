/**
 * Clean Layout Component - Fresh Design
 * Simple layout with modern navigation
 */

import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import TopHeader from '../layout/TopHeader';
import NavigationDrawer from '../layout/NavigationDrawer';
import BottomNavigation from '../layout/BottomNavigation';
import { useCart } from '../../contexts/CartContext';
import { useAuth } from '../../contexts/AuthContext';
import './Layout.css';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [deliveriesPaused, setDeliveriesPaused] = useState(false);
  const { itemCount } = useCart();
  const { user } = useAuth();
  const location = useLocation();

  const getPageTitle = (): string => {
    const path = location.pathname;
    
    if (path.includes('/consumer/home')) return 'Home';
    if (path.includes('/consumer/products') && !path.includes('/consumer/products/')) return 'Products';
    if (path.includes('/consumer/products/')) return 'Product Details';
    if (path.includes('/consumer/cart')) return 'Cart';
    if (path.includes('/consumer/orders')) return 'Order History';
    if (path.includes('/consumer/subscriptions')) return 'Subscriptions';
    if (path.includes('/consumer/subscribe')) return 'Create Subscription';
    
    if (path.includes('/distributor/dashboard')) return 'Dashboard';
    if (path.includes('/distributor/bulk-order')) return 'Bulk Order';
    if (path.includes('/distributor/orders')) return 'Order History';
    
    if (path.includes('/owner/dashboard')) return 'Dashboard';
    if (path.includes('/owner/products')) return 'Products';
    if (path.includes('/owner/inventory')) return 'Inventory';
    if (path.includes('/owner/orders')) return 'Orders';
    if (path.includes('/owner/analytics')) return 'Analytics';
    
    return 'IndoStar';
  };

  const handleMenuClick = () => {
    setIsDrawerOpen(true);
  };

  const handleDrawerClose = () => {
    setIsDrawerOpen(false);
  };

  const handleTogglePause = (paused: boolean) => {
    setDeliveriesPaused(paused);
    console.log('Deliveries paused:', paused);
  };

  const notificationCount = 0;
  const userRole = (user?.role as 'consumer' | 'distributor' | 'owner') || 'consumer';

  return (
    <div className="layout">
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>
      
      <TopHeader
        title={getPageTitle()}
        onMenuClick={handleMenuClick}
        notificationCount={notificationCount}
        cartItemCount={itemCount}
        isMenuOpen={isDrawerOpen}
      />
      
      <NavigationDrawer
        isOpen={isDrawerOpen}
        onClose={handleDrawerClose}
        deliveriesPaused={deliveriesPaused}
        onTogglePause={handleTogglePause}
        appVersion="1.0.0"
      />
      
      <main className="main-content" role="main" id="main-content">
        {children}
      </main>
      
      <BottomNavigation userRole={userRole} />
    </div>
  );
};

export default Layout;
