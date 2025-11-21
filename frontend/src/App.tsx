import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, CartProvider, useAuth } from './contexts';
import { 
  LoginPage,
  DevLogin,
  HomePage, 
  ProductCatalog, 
  ProductDetail, 
  Cart, 
  OrderHistory,
  DistributorDashboard,
  BulkOrderForm,
  DistributorOrderHistory,
  OwnerDashboard 
} from './pages';
import { ProtectedRoute, OfflineIndicator } from './components/common';
import Layout from './components/common/Layout';
import { initAllScrollAnimations } from './utils/scrollAnimations';
import './styles/App.css';

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
    <Router>
      <AuthProvider>
        <CartProvider>
          <OfflineIndicator />
          <Routes>
            {/* Root route - redirects based on authentication and role */}
            <Route path="/" element={<RoleBasedRedirect />} />
          
          {/* Public routes - no header */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/dev-login" element={<DevLogin />} />
          
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
        </CartProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
