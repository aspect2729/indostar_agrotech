/**
 * Product Management Component
 * 
 * Allows owner to view, add, edit, and manage products.
 */

import React, { useState, useEffect } from 'react';
import { getProducts, createProduct } from '../../services';
import { Product, ProductCategory } from '../../types';
import './ProductManagement.css';

const CATEGORIES: { value: ProductCategory; label: string }[] = [
  { value: 'jaggery', label: 'Jaggery' },
  { value: 'oil', label: 'Oil' },
  { value: 'chutney_powder', label: 'Chutney Powder' },
  { value: 'pickles', label: 'Pickles' },
  { value: 'milk', label: 'Milk' }
];

interface ProductFormData {
  name: string;
  category: ProductCategory;
  description: string;
  consumerPrice: string;
  distributorPrice: string;
  unit: string;
  interStateDelivery: boolean;
}

const ProductManagement: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [formData, setFormData] = useState<ProductFormData>({
    name: '',
    category: 'jaggery',
    description: '',
    consumerPrice: '',
    distributorPrice: '',
    unit: 'kg',
    interStateDelivery: true
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      const response: any = await getProducts({});
      console.log('Products loaded:', response);
      // Backend returns {products: [...]} not {data: [...]}
      setProducts(response.products || response.data || []);
    } catch (err: any) {
      console.error('Error loading products:', err);
      setError(err.response?.data?.detail || err.message || 'Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const newProduct = await createProduct({
        name: formData.name,
        category: formData.category,
        description: formData.description,
        images: [],
        price: {
          consumer: parseFloat(formData.consumerPrice),
          distributor: parseFloat(formData.distributorPrice)
        },
        unit: formData.unit,
        interStateDelivery: formData.interStateDelivery
      });

      console.log('Product created successfully:', newProduct);

      // Reset form and reload products
      setFormData({
        name: '',
        category: 'jaggery',
        description: '',
        consumerPrice: '',
        distributorPrice: '',
        unit: 'kg',
        interStateDelivery: true
      });
      setShowAddModal(false);
      await loadProducts();
    } catch (err: any) {
      console.error('Error creating product:', err);
      setError(err.response?.data?.detail || err.message || 'Failed to add product');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="product-management">
      <div className="page-header">
        <h1>Product Management</h1>
        <button className="add-product-btn" onClick={() => setShowAddModal(true)}>
          + Add New Product
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}

      {loading ? (
        <div className="loading">Loading products...</div>
      ) : products.length === 0 ? (
        <div className="no-products">
          <p>No products found. Click "Add New Product" to get started!</p>
        </div>
      ) : (
        <div className="products-grid">
          {(products || []).map(product => (
            <div key={product._id} className="product-card">
              <h3>{product.name}</h3>
              <p className="category">{product.category.replace('_', ' ').toUpperCase()}</p>
              <p className="description">{product.description}</p>
              <div className="prices">
                <div>Consumer: ₹{product.price.consumer}/{product.unit}</div>
                <div>Distributor: ₹{product.price.distributor}/{product.unit}</div>
              </div>
              {product.interStateDelivery && (
                <span className="badge">Inter-state delivery</span>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Add Product Modal */}
      {showAddModal && (
        <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Add New Product</h2>
              <button className="close-btn" onClick={() => setShowAddModal(false)}>×</button>
            </div>

            <form onSubmit={handleSubmit} className="product-form">
              <div className="form-group">
                <label>Product Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label>Category *</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value as ProductCategory })}
                  required
                >
                  {CATEGORIES.map(cat => (
                    <option key={cat.value} value={cat.value}>{cat.label}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Description *</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  required
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Consumer Price (₹) *</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.consumerPrice}
                    onChange={(e) => setFormData({ ...formData, consumerPrice: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Distributor Price (₹) *</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.distributorPrice}
                    onChange={(e) => setFormData({ ...formData, distributorPrice: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Unit *</label>
                <select
                  value={formData.unit}
                  onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                  required
                >
                  <option value="kg">Kilogram (kg)</option>
                  <option value="liter">Liter</option>
                  <option value="piece">Piece</option>
                  <option value="gram">Gram</option>
                </select>
              </div>

              <div className="form-group checkbox-group">
                <label>
                  <input
                    type="checkbox"
                    checked={formData.interStateDelivery}
                    onChange={(e) => setFormData({ ...formData, interStateDelivery: e.target.checked })}
                  />
                  Enable inter-state delivery
                </label>
              </div>

              <div className="form-actions">
                <button type="button" onClick={() => setShowAddModal(false)} className="cancel-btn">
                  Cancel
                </button>
                <button type="submit" disabled={submitting} className="submit-btn">
                  {submitting ? 'Adding...' : 'Add Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductManagement;
