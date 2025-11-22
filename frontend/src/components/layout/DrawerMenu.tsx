/**
 * DrawerMenu Component
 * 
 * Menu section of the navigation drawer with navigation items.
 * Implements requirements: 1.3, 1.4, 7.1, 7.5
 */

import React from 'react';
import { UserRole } from '../../types';
import { MenuItem } from './NavigationDrawer';

interface DrawerMenuProps {
  userRole: UserRole;
  currentPath: string;
  onNavigate: (route: string) => void;
}

// Define menu items for different user roles
const getMenuItems = (role: UserRole): MenuItem[] => {
  const consumerItems: MenuItem[] = [
    { id: 'home', label: 'Home', icon: '🏠', route: '/', roles: ['consumer', 'distributor', 'owner'] },
    { id: 'subscriptions', label: 'My Subscriptions', icon: '📦', route: '/subscriptions', roles: ['consumer'] },
    { id: 'refer', label: 'Refer & Earn', icon: '🎁', route: '/refer', roles: ['consumer'] },
    { id: 'orders', label: 'Order History', icon: '📋', route: '/orders', roles: ['consumer', 'distributor', 'owner'] },
    { id: 'holidays', label: 'Holidays', icon: '🏖️', route: '/holidays', roles: ['consumer'] },
    { id: 'offers', label: 'Offers', icon: '🏷️', route: '/offers', roles: ['consumer'] },
    { id: 'quality', label: 'Quality', icon: '✨', route: '/quality', roles: ['consumer'] },
    { id: 'faqs', label: 'FAQs', icon: '❓', route: '/faqs', roles: ['consumer', 'distributor', 'owner'] },
    { id: 'help', label: 'Help & Support', icon: '💬', route: '/help', roles: ['consumer', 'distributor', 'owner'] },
    { id: 'policies', label: 'Policies', icon: '📄', route: '/policies', roles: ['consumer', 'distributor', 'owner'] },
  ];

  const distributorItems: MenuItem[] = [
    { id: 'home', label: 'Home', icon: '🏠', route: '/', roles: ['consumer', 'distributor', 'owner'] },
    { id: 'dashboard', label: 'Dashboard', icon: '📊', route: '/distributor/dashboard', roles: ['distributor'] },
    { id: 'bulk-order', label: 'Bulk Orders', icon: '📦', route: '/distributor/bulk-order', roles: ['distributor'] },
    { id: 'orders', label: 'Order History', icon: '📋', route: '/orders', roles: ['consumer', 'distributor', 'owner'] },
    { id: 'faqs', label: 'FAQs', icon: '❓', route: '/faqs', roles: ['consumer', 'distributor', 'owner'] },
    { id: 'help', label: 'Help & Support', icon: '💬', route: '/help', roles: ['consumer', 'distributor', 'owner'] },
    { id: 'policies', label: 'Policies', icon: '📄', route: '/policies', roles: ['consumer', 'distributor', 'owner'] },
  ];

  const ownerItems: MenuItem[] = [
    { id: 'home', label: 'Home', icon: '🏠', route: '/', roles: ['consumer', 'distributor', 'owner'] },
    { id: 'dashboard', label: 'Dashboard', icon: '📊', route: '/owner/dashboard', roles: ['owner'] },
    { id: 'products', label: 'Product Management', icon: '🛍️', route: '/owner/products', roles: ['owner'] },
    { id: 'inventory', label: 'Inventory', icon: '📦', route: '/owner/inventory', roles: ['owner'] },
    { id: 'order-management', label: 'Order Management', icon: '📋', route: '/owner/orders', roles: ['owner'] },
    { id: 'analytics', label: 'Analytics', icon: '📈', route: '/owner/analytics', roles: ['owner'] },
    { id: 'faqs', label: 'FAQs', icon: '❓', route: '/faqs', roles: ['consumer', 'distributor', 'owner'] },
    { id: 'help', label: 'Help & Support', icon: '💬', route: '/help', roles: ['consumer', 'distributor', 'owner'] },
    { id: 'policies', label: 'Policies', icon: '📄', route: '/policies', roles: ['consumer', 'distributor', 'owner'] },
  ];

  switch (role) {
    case 'distributor':
      return distributorItems;
    case 'owner':
      return ownerItems;
    case 'consumer':
    default:
      return consumerItems;
  }
};

const DrawerMenu: React.FC<DrawerMenuProps> = ({ userRole, currentPath, onNavigate }) => {
  const menuItems = getMenuItems(userRole);

  const handleItemClick = (route: string) => {
    onNavigate(route);
  };

  const isActive = (route: string): boolean => {
    if (route === '/') {
      return currentPath === '/';
    }
    return currentPath.startsWith(route);
  };

  return (
    <div className="drawer-menu">
      {menuItems.map((item) => (
        <button
          key={item.id}
          className={`drawer-menu__item ${isActive(item.route) ? 'drawer-menu__item--active' : ''}`}
          onClick={() => handleItemClick(item.route)}
          aria-label={item.label}
          aria-current={isActive(item.route) ? 'page' : undefined}
        >
          <span className="drawer-menu__icon" aria-hidden="true">
            {item.icon}
          </span>
          <span className="drawer-menu__label">{item.label}</span>
          {item.badge && item.badge > 0 && (
            <span className="drawer-menu__badge" aria-label={`${item.badge} notifications`}>
              {item.badge}
            </span>
          )}
        </button>
      ))}
    </div>
  );
};

export default DrawerMenu;
