/**
 * Product Catalog - Clean Design
 * Displays all products with filtering
 */

import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { getProducts } from '../../services';
import { Product } from '../../types';
import CategoryTabs, { Category } from '../../components/consumer/CategoryTabs';
import ProductGrid from '../../components/consumer/ProductGrid';
import './ProductCatalog.css';

const categories: Category[] = [
  { id: 'all', name: 'All Products' },
  { id: 'jaggery', name: 'Jaggery' },
  { id: 'oil', name: 'Oil' },
  { id: 'chutney_powder', name: 'Chutney Powder' },
  { id: 'pickles', name: 'Pickles' },
  { id: 'milk', name: 'Milk' }
];

const ProductCatalog: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [total, setTotal] = useState(0);
  
  const ITEMS_PER_PAGE = 12;

  const loadProducts = useCallback(async () => {
    setLoading(true);
    setError(null);
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
      console.log('Products loaded:', response);
      setProducts(response.products || response.data || []);
      setTotal(response.total || 0);
      setHasMore(response.hasMore || false);
    } catch (err) {
      console.error('Failed to load products:', err);
      setError(err instanceof Error ? err : new Error('Failed to load products'));
    } finally {
      setLoading(false);
    }
  }, [page, selectedCategory, searchQuery]);

  useEffect(() => {
    const categoryParam = searchParams.get('category');
    if (categoryParam) {
      setSelectedCategory(categoryParam);
    }
  }, [searchParams]);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  const handleCategoryChange = (categoryId: string) => {
    setSelectedCategory(categoryId);
    setPage(1);
    
    if (categoryId !== 'all') {
      setSearchParams({ category: categoryId });
    } else {
      setSearchParams({});
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setPage(1);
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubscribe = (productId: string) => {
    navigate(`/consumer/subscribe/${productId}`);
  };

  const handleBuyOnce = (productId: string) => {
    navigate(`/consumer/products/${productId}`);
  };

  const handleShare = (productId: string) => {
    console.log('Share product:', productId);
  };

  const handleRetry = () => {
    loadProducts();
  };

  const totalPages = Math.ceil(total / ITEMS_PER_PAGE);

  return (
    <div className="product-catalog">
      <div className="catalog-container">
        {/* Search Section */}
        <section className="filter-section">
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

          <div className="results-info">
            <p>
              {loading ? 'Loading...' : `${total} product${total !== 1 ? 's' : ''} found`}
            </p>
          </div>
        </section>

        {/* Category Tabs */}
        <CategoryTabs
          categories={categories}
          activeCategory={selectedCategory}
          onCategoryChange={handleCategoryChange}
        />

        {/* Products Grid */}
        <section className="products-section">
          <ProductGrid
            products={products}
            loading={loading}
            error={error}
            onRetry={handleRetry}
            onSubscribe={handleSubscribe}
            onBuyOnce={handleBuyOnce}
            onShare={handleShare}
          />

          {/* Pagination */}
          {!loading && !error && totalPages > 1 && (
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
