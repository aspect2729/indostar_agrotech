/**
 * Inventory Management Component
 * 
 * Allows owner to view and manage inventory levels for all products.
 * Updated with new design system: Layout and card-based design
 * Features:
 * - Display product list with current stock levels
 * - Show low-stock alerts with visual indicators
 * - Create inventory update forms
 * - Implement real-time inventory updates
 */

import React, { useState, useEffect } from 'react';
import Layout from '../../components/common/Layout';
import {
  getAllInventory,
  updateInventory,
  getLowStockAlerts,
} from '../../services/inventoryService';
import { getProducts } from '../../services/productService';
import {
  InventoryResponse,
  Product,
  LowStockAlert,
  UpdateInventoryRequest,
} from '../../types';
import './InventoryManagement.css';

interface InventoryWithProduct extends InventoryResponse {
  product?: Product;
}

const InventoryManagement: React.FC = () => {
  const [inventory, setInventory] = useState<InventoryWithProduct[]>([]);
  const [lowStockAlerts, setLowStockAlerts] = useState<LowStockAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [updateQuantity, setUpdateQuantity] = useState<number>(0);
  const [updateOperation, setUpdateOperation] = useState<'set' | 'add' | 'subtract'>('set');
  const [updating, setUpdating] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterLowStock, setFilterLowStock] = useState(false);

  useEffect(() => {
    loadInventoryData();
  }, []);

  const loadInventoryData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Load inventory and products in parallel
      const [inventoryData, productsData, alertsData] = await Promise.all([
        getAllInventory(),
        getProducts({}),
        getLowStockAlerts(),
      ]);

      // Create a map of products for quick lookup
      const productMap = new Map((productsData.data || []).map(p => [p._id, p]));

      // Merge inventory with product data
      const inventoryWithProducts = (inventoryData.data || []).map(inv => ({
        ...inv,
        product: productMap.get(inv.productId),
      }));

      setInventory(inventoryWithProducts);
      setLowStockAlerts(alertsData.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load inventory');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateInventory = async (productId: string) => {
    if (updateQuantity <= 0 && updateOperation !== 'set') {
      setError('Quantity must be greater than 0');
      return;
    }

    try {
      setUpdating(true);
      setError(null);

      const updateData: UpdateInventoryRequest = {
        quantity: updateQuantity,
        operation: updateOperation,
      };

      await updateInventory(productId, updateData);
      
      // Reload inventory data
      await loadInventoryData();
      
      // Reset form
      setEditingId(null);
      setUpdateQuantity(0);
      setUpdateOperation('set');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update inventory');
    } finally {
      setUpdating(false);
    }
  };

  const startEditing = (inv: InventoryWithProduct) => {
    setEditingId(inv.productId);
    setUpdateQuantity(inv.quantity);
    setUpdateOperation('set');
  };

  const cancelEditing = () => {
    setEditingId(null);
    setUpdateQuantity(0);
    setUpdateOperation('set');
  };

  const filteredInventory = inventory.filter(inv => {
    const matchesSearch = !searchTerm || 
      inv.product?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inv.product?.category.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = !filterLowStock || inv.isLowStock;

    return matchesSearch && matchesFilter;
  });

  if (loading) {
    return (
      <Layout>
        <div className="inventory-management">
          <div className="loading-container">
            <div className="spinner"></div>
            <p>Loading inventory...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="inventory-management">
        <div className="inventory-header">
          <h2 className="page-title">Inventory Management</h2>
          <button onClick={loadInventoryData} className="refresh-btn" disabled={loading}>
            🔄 Refresh
          </button>
        </div>

        {/* Low Stock Alerts */}
        {(lowStockAlerts?.length || 0) > 0 && (
          <div className="low-stock-alerts">
            <h3>⚠️ Low Stock Alerts ({lowStockAlerts?.length || 0})</h3>
            <div className="alerts-list">
              {(lowStockAlerts || []).map(alert => (
                <div key={alert.product._id} className="alert-item">
                  <span className="alert-product">{alert.product.name}</span>
                  <span className="alert-quantity">
                    {alert.inventory.quantity} {alert.inventory.unit} remaining
                  </span>
                  <span className="alert-threshold">
                    (Threshold: {alert.inventory.lowStockThreshold})
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="inventory-filters">
          <input
            type="text"
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
          <label className="filter-checkbox">
            <input
              type="checkbox"
              checked={filterLowStock}
              onChange={(e) => setFilterLowStock(e.target.checked)}
            />
            Show only low stock items
          </label>
        </div>

        {error && (
          <div className="error-message">
            {error}
            <button onClick={() => setError(null)}>✕</button>
          </div>
        )}

        {/* Inventory Table */}
        <div className="inventory-table-container">
          <table className="inventory-table">
            <thead>
              <tr>
                <th>Product</th>
                <th>Category</th>
                <th>Current Stock</th>
                <th>Unit</th>
                <th>Status</th>
                <th>Last Restocked</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {(filteredInventory?.length || 0) === 0 ? (
                <tr>
                  <td colSpan={7} className="no-data">
                    No inventory items found
                  </td>
                </tr>
              ) : (
                (filteredInventory || []).map(inv => (
                  <tr key={inv.productId} className={inv.isLowStock ? 'low-stock-row' : ''}>
                    <td className="product-name">
                      {inv.product?.name || 'Unknown Product'}
                    </td>
                    <td className="product-category">
                      {inv.product?.category.replace('_', ' ') || '-'}
                    </td>
                    <td className="stock-quantity">
                      {editingId === inv.productId ? (
                        <div className="edit-quantity">
                          <select
                            value={updateOperation}
                            onChange={(e) => setUpdateOperation(e.target.value as any)}
                            className="operation-select"
                          >
                            <option value="set">Set to</option>
                            <option value="add">Add</option>
                            <option value="subtract">Subtract</option>
                          </select>
                          <input
                            type="number"
                            value={updateQuantity}
                            onChange={(e) => setUpdateQuantity(Number(e.target.value))}
                            min="0"
                            className="quantity-input"
                          />
                        </div>
                      ) : (
                        <span className={inv.isOutOfStock ? 'out-of-stock' : ''}>
                          {inv.quantity}
                        </span>
                      )}
                    </td>
                    <td>{inv.unit}</td>
                    <td>
                      <span className={`status-badge ${
                        inv.isOutOfStock ? 'out-of-stock' : 
                        inv.isLowStock ? 'low-stock' : 
                        'in-stock'
                      }`}>
                        {inv.isOutOfStock ? '❌ Out of Stock' : 
                         inv.isLowStock ? '⚠️ Low Stock' : 
                         '✅ In Stock'}
                      </span>
                    </td>
                    <td className="last-restocked">
                      {new Date(inv.lastRestocked).toLocaleDateString()}
                    </td>
                    <td className="actions">
                      {editingId === inv.productId ? (
                        <div className="edit-actions">
                          <button
                            onClick={() => handleUpdateInventory(inv.productId)}
                            disabled={updating}
                            className="save-btn"
                          >
                            {updating ? 'Saving...' : 'Save'}
                          </button>
                          <button
                            onClick={cancelEditing}
                            disabled={updating}
                            className="cancel-btn"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => startEditing(inv)}
                          className="edit-btn"
                        >
                          Edit
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Summary Stats */}
        <div className="inventory-summary">
          <div className="summary-card">
            <h4>Total Products</h4>
            <p className="summary-value">{inventory?.length || 0}</p>
          </div>
          <div className="summary-card">
            <h4>Low Stock Items</h4>
            <p className="summary-value warning">{lowStockAlerts?.length || 0}</p>
          </div>
          <div className="summary-card">
            <h4>Out of Stock</h4>
            <p className="summary-value danger">
              {(inventory || []).filter(inv => inv.isOutOfStock).length}
            </p>
          </div>
          <div className="summary-card">
            <h4>In Stock</h4>
            <p className="summary-value success">
              {(inventory || []).filter(inv => !inv.isLowStock && !inv.isOutOfStock).length}
            </p>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default InventoryManagement;
