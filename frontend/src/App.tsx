import React, { useEffect, Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, CartProvider, useAuth } from './contexts';
import { ProtectedRoute, OfflineIndicator, ErrorBoundary, Spinner } from './components/common';
import Layout from './components/common/Layout';
import { initAllScrollAnimations } from './utils/scrollAnimations';
import './styles/App.css';

// Lazy load route components for code splitting
const DevLogin = lazy(() => import('./pages/DevLogin'));
const OTPLoginPage = lazy(() => import('./pages/OTPLoginPage'));
const Notifications = lazy(() => import('./pages/common/Notifications'));

// Consumer pages - lazy loaded
const HomePage = lazy(() => import('./pages/consumer/HomePage'));
const ProductCatalog = lazy(() => import('./pages/consumer/ProductCatalog'));
const ProductDetail = lazy(() => import('./pages/consumer/ProductDetail'));
const Cart = lazy(() => import('./pages/consumer/Cart'));
const OrderHistory = lazy(() => import('./pages/consumer/OrderHistory'));
const MilkSubscription = lazy(() => import('./pages/consumer/MilkSubscription'));
const CreateSubscription = lazy(() => import('./pages/consumer/CreateSubscription'));

// Distributor pages - lazy loaded
const DistributorDashboard = lazy(() => import('./pages/distributor/DistributorDashboard'));
const BulkOrderForm = lazy(() => import('./pages/distributor/BulkOrderForm'));
const DistributorOrderHistory = lazy(() => import('./pages/distributor/DistributorOrderHistory'));

// Owner pages - lazy loaded (heavy components with potential charts)
const OwnerDashboard = lazy(() => import('./pages/owner/OwnerDashboard'));
// Additional owner pages will be lazy loaded when routes are added
// const InventoryManagement = lazy(() => import('./pages/owner/InventoryManagement'));
// const OrderManagement = lazy(() => import('./pages/owner/OrderManagement'));
// const ProductManagement = lazy(() => import('./pages/owner/ProductManagement'));
// const Analytics = lazy(() => import('./pages/owner/Analytics'));

/**
 * RoleBasedRedirect Component
 * Redirects authenticated users to their appropriate portal
 */
const RoleBasedRedirect: React.FC = () => {
  const { isAuthenticated, user, isLoading } = useAuth();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  // Redirect based on user role
  switch (user.role) {
    case 'consumer':
      return <Navigate to="/consumer/home" replace />;
    case 'distributor':
      return <Navigate to="/distributor/dashboard" replace />;
    case 'owner':
      return <Navigate to="/owner/dashboard" replace />;
    default:
      return <Navigate to="/login" replace />;
  }
};

function App() {
  // Initialize scroll animations on mount
  useEffect(() => {
    const cleanup = initAllScrollAnimations();
    return cleanup;
  }, []);

  return (
    <ErrorBoundary>
      <Router>
        <AuthProvider>
          <CartProvider>
            <OfflineIndicator />
            <Suspense fallback={
              <div style={{ 
                display: 'flex', 
                justifyContent: 'center', 
                alignItems: 'center', 
                minHeight: '100vh' 
              }}>
                <Spinner size="large" />
              </div>
            }>
              <Routes>
            {/* Root route - redirects based on authentication and role */}
            <Route path="/" element={<RoleBasedRedirect />} />
          
          {/* Public routes - no header */}
          <Route path="/login" element={<OTPLoginPage />} />
          <Route path="/dev-login" element={<DevLogin />} />
          
          {/* Common routes */}
          <Route
            path="/notifications"
            element={
              <ProtectedRoute allowedRoles={['consumer', 'distributor', 'owner']}>
                <Layout>
                  <Notifications />
                </Layout>
              </ProtectedRoute>
            }
          />
          
          {/* Consumer Portal Routes */}
          <Route
            path="/consumer/home"
            element={
              <ProtectedRoute allowedRoles={['consumer']}>
                <Layout>
                  <HomePage />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/consumer/products"
            element={
              <ProtectedRoute allowedRoles={['consumer']}>
                <Layout>
                  <ProductCatalog />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/consumer/products/:productId"
            element={
              <ProtectedRoute allowedRoles={['consumer']}>
                <Layout>
                  <ProductDetail />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/consumer/cart"
            element={
              <ProtectedRoute allowedRoles={['consumer']}>
                <Layout>
                  <Cart />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/consumer/orders"
            element={
              <ProtectedRoute allowedRoles={['consumer']}>
                <Layout>
                  <OrderHistory />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/consumer/orders/:orderId"
            element={
              <ProtectedRoute allowedRoles={['consumer']}>
                <Layout>
                  <OrderHistory />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/consumer/subscriptions"
            element={
              <ProtectedRoute allowedRoles={['consumer']}>
                <Layout>
                  <MilkSubscription />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/consumer/subscribe/:productId"
            element={
              <ProtectedRoute allowedRoles={['consumer']}>
                <Layout>
                  <CreateSubscription />
                </Layout>
              </ProtectedRoute>
            }
          />
          
          {/* Distributor Portal Routes */}
          <Route
            path="/distributor/dashboard"
            element={
              <ProtectedRoute allowedRoles={['distributor']}>
                <Layout>
                  <DistributorDashboard />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/distributor/products"
            element={
              <ProtectedRoute allowedRoles={['distributor']}>
                <Layout>
                  <DistributorDashboard />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/distributor/bulk-order"
            element={
              <ProtectedRoute allowedRoles={['distributor']}>
                <Layout>
                  <BulkOrderForm />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/distributor/orders"
            element={
              <ProtectedRoute allowedRoles={['distributor']}>
                <Layout>
                  <DistributorOrderHistory />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/distributor/orders/:orderId"
            element={
              <ProtectedRoute allowedRoles={['distributor']}>
                <Layout>
                  <DistributorOrderHistory />
                </Layout>
              </ProtectedRoute>
            }
          />
          
          {/* Owner Dashboard Routes */}
          <Route
            path="/owner/dashboard"
            element={
              <ProtectedRoute allowedRoles={['owner']}>
                <Layout>
                  <OwnerDashboard />
                </Layout>
              </ProtectedRoute>
            }
          />
          {/* Additional owner routes will be added in task 19 */}
          
          {/* Catch-all route - redirect to home */}
          <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </Suspense>
          </CartProvider>
        </AuthProvider>
      </Router>
    </ErrorBoundary>
  );
}

export default App;
