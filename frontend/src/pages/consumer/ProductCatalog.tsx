/**
 * Product Catalog Component
 * 
 * Displays all products with filtering, search, and pagination.
 * Implements requirements: 1.1, 8.1, 8.2, 8.3, 8.5, 7.1, 7.2
 */

import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../contexts';
import { getProducts } from '../../services';
import { Product, ProductCategory } from '../../types';
import './ProductCatalog.css';

const categories: { id: ProductCategory | 'all'; name: string }[] = [
  { id: 'all', name: 'All Products' },
  { id: 'jaggery', name: 'Jaggery' },
  { id: 'oil', name: 'Oil' },
  { id: 'chutney_powder', name: 'Chutney Powder' },
  { id: 'pickles', name: 'Pickles' },
  { id: 'milk', name: 'Milk' }
];

const ProductCatalog: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<ProductCategory | 'all'>('all');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [total, setTotal] = useState(0);
  
  const ITEMS_PER_PAGE = 12;

  useEffect(() => {
    // Get category from URL params
    const categoryParam = searchParams.get('category');
    if (categoryParam && categoryParam !== 'all') {
      setSelectedCategory(categoryParam as ProductCategory);
    }
  }, [searchParams]);

  useEffect(() => {
    loadProducts();
  }, [selectedCategory, searchQuery, page]);

  useEffect(() => {
    // Setup scroll reveal animation
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('revealed');
          }
        });
      },
      { threshold: 0.1 }
    );

    document.querySelectorAll('.scroll-reveal').forEach((el) => {
      observer.observe(el);
    });

    return () => observer.disconnect();
  }, [products]);

  const loadProducts = async () => {
    setLoading(true);
    try {
      const params: any = {
        limit: ITEMS_PER_PAGE,
        offset: (page - 1) * ITEMS_PER_PAGE,
        isActive: true
      };

      if (selectedCategory !== 'all') {
        params.category = selectedCategory;
      }

      if (searchQuery.trim()) {
        params.search = searchQuery.trim();
      }

      const response: any = await getProducts(params);
      // Backend returns {products: [...]} not {data: [...]}
      setProducts(response.products || response.data || []);
      setTotal(response.total || 0);
      setHasMore(response.hasMore || false);
    } catch (error) {
      console.error('Failed to load products:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryChange = (category: ProductCategory | 'all') => {
    setSelectedCategory(category);
    setPage(1);
    
    // Update URL params
    if (category !== 'all') {
      setSearchParams({ category });
    } else {
      setSearchParams({});
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setPage(1);
  };

  const handleProductClick = (productId: string) => {
    navigate(`/consumer/products/${productId}`);
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const totalPages = Math.ceil(total / ITEMS_PER_PAGE);

  return (
    <div className="product-catalog">
      {/* Header */}
      <header className="catalog-header fade-in">
        <div className="header-content">
          <div className="logo-section">
            <h1 className="brand-name" onClick={() => navigate('/consumer/home')}>
              Indostar Agrotech
            </h1>
          </div>
          <nav className="header-nav">
            <button className="nav-link" onClick={() => navigate('/consumer/home')}>
              Home
            </button>
            <button className="nav-link active">
              Products
            </button>
            <button className="nav-link" onClick={() => navigate('/consumer/cart')}>
              Cart
            </button>
            <button className="nav-link" onClick={() => navigate('/consumer/orders')}>
              Orders
            </button>
            <div className="user-menu">
              <span className="user-name">{user?.name}</span>
              <button className="logout-btn" onClick={logout}>
                Logout
              </button>
            </div>
          </nav>
        </div>
      </header>

      <div className="catalog-container">
        {/* Search and Filter Section */}
        <section className="filter-section slide-in-down">
          <div className="search-bar">
            <input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={handleSearchChange}
              className="search-input"
            />
            <span className="search-icon">🔍</span>
          </div>

          <div className="category-filters">
            {categories.map((category) => (
              <button
                key={category.id}
                className={`category-filter ${
                  selectedCategory === category.id ? 'active' : ''
                }`}
                onClick={() => handleCategoryChange(category.id)}
              >
                {category.name}
              </button>
            ))}
          </div>

          <div className="results-info">
            <p>
              {loading ? 'Loading...' : `${total} product${total !== 1 ? 's' : ''} found`}
            </p>
          </div>
        </section>

        {/* Products Grid */}
        <section className="products-section">
          {loading ? (
            <div className="products-grid">
              {[...Array(6)].map((_, index) => (
                <div key={index} className="product-card skeleton-card">
                  <div className="skeleton skeleton-image"></div>
                  <div className="skeleton-content">
                    <div className="skeleton skeleton-title"></div>
                    <div className="skeleton skeleton-text"></div>
                    <div className="skeleton skeleton-text"></div>
                    <div className="skeleton skeleton-price"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="no-products">
              <div className="no-products-icon">📦</div>
              <h3>No products found</h3>
              <p>Try adjusting your search or filters</p>
            </div>
          ) : (
            <div className="products-grid">
              {products && products.map((product, index) => (
                <div
                  key={product._id}
                  className="product-card hover-lift scroll-reveal"
                  onClick={() => handleProductClick(product._id)}
                  style={{ animationDelay: `${index * 0.05}s` }}
                >
                  <div className="product-image">
                    {product.images && product.images.length > 0 ? (
                      <img src={product.images[0]} alt={product.name} />
                    ) : (
                      <div className="product-image-placeholder">📦</div>
                    )}
                    {product.interStateDelivery && (
                      <span className="delivery-badge">🚚 Inter-state delivery</span>
                    )}
                  </div>
                  <div className="product-info">
                    <h3 className="product-name">{product.name}</h3>
                    <p className="product-category">
                      {product.category.replace('_', ' ').toUpperCase()}
                    </p>
                    <p className="product-description">{product.description}</p>
                    <div className="product-footer">
                      <span className="product-price">
                        ₹{product.price.consumer}/{product.unit}
                      </span>
                      <button
                        className="view-details-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleProductClick(product._id);
                        }}
                      >
                        View Details
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Pagination */}
          {!loading && totalPages > 1 && (
            <div className="pagination">
              <button
                className="pagination-btn"
                onClick={() => handlePageChange(page - 1)}
                disabled={page === 1}
              >
                ← Previous
              </button>
              <div className="pagination-info">
                Page {page} of {totalPages}
              </div>
              <button
                className="pagination-btn"
                onClick={() => handlePageChange(page + 1)}
                disabled={!hasMore}
              >
                Next →
              </button>
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default ProductCatalog;
