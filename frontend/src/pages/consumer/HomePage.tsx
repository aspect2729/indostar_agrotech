/**
 * Consumer Home Page - Fresh Clean Design
 * Main landing page with hero section and products
 */

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getProducts } from '../../services';
import { Product } from '../../types';
import CategoryTabs from '../../components/consumer/CategoryTabs';
import ProductGrid from '../../components/consumer/ProductGrid';
import './HomePage.css';

const categoryTabs = [
  { id: 'all', name: 'All Products' },
  { id: 'milk', name: 'Milk' },
  { id: 'jaggery', name: 'Jaggery' },
  { id: 'oil', name: 'Oil' },
  { id: 'chutney_powder', name: 'Chutney Powder' },
  { id: 'pickles', name: 'Pickles' },
];

const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [productsLoading, setProductsLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<string>('all');

  useEffect(() => {
    loadAllProducts();
  }, []);

  useEffect(() => {
    if (activeCategory === 'all') {
      setFilteredProducts(allProducts);
    } else {
      setFilteredProducts(allProducts.filter(p => p.category === activeCategory));
    }
  }, [activeCategory, allProducts]);

  const loadAllProducts = async () => {
    try {
      setProductsLoading(true);
      const response: any = await getProducts({ isActive: true });
      const products = response.products || response.data || [];
      console.log('Loaded products:', products);
      setAllProducts(products);
      setFilteredProducts(products);
    } catch (error) {
      console.error('Failed to load products:', error);
      setAllProducts([]);
      setFilteredProducts([]);
    } finally {
      setProductsLoading(false);
    }
  };

  const handleCategoryChange = (categoryId: string) => {
    setActiveCategory(categoryId);
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

  return (
    <div className="home-page">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content">
          <h1 className="hero-title">Welcome to Indostar Agrotech</h1>
          <p className="hero-subtitle">
            Your trusted source for 100% organic products from Karnataka
          </p>
          <p className="hero-description">
            We bring you the finest organic jaggery, cold-pressed oils, traditional
            chutney powders, homemade pickles, and fresh milk directly from our farms.
          </p>
          <button
            className="cta-button"
            onClick={() => navigate('/consumer/products')}
          >
            Shop Now
          </button>
        </div>
      </section>

      {/* Products Section */}
      <section className="products-section">
        <h2 className="section-title">Our Products</h2>
        
        <CategoryTabs
          categories={categoryTabs}
          activeCategory={activeCategory}
          onCategoryChange={handleCategoryChange}
        />
        
        <div className="products-grid-container">
          <ProductGrid
            products={filteredProducts}
            loading={productsLoading}
            onSubscribe={handleSubscribe}
            onBuyOnce={handleBuyOnce}
            onShare={handleShare}
          />
        </div>
      </section>

      {/* Mission Section */}
      <section className="mission-section">
        <h2 className="section-title">Our Mission</h2>
        <p className="mission-text">
          At Indostar Agrotech, we provide 100% organic, chemical-free products
          that promote health and wellness. Our products are sourced directly from
          our farms in Karnataka, ensuring the highest quality and freshness.
        </p>
        <div className="mission-values">
          <div className="value-card">
            <div className="value-icon">🌱</div>
            <h4>100% Organic</h4>
            <p>No chemicals or pesticides</p>
          </div>
          <div className="value-card">
            <div className="value-icon">🚚</div>
            <h4>Fast Delivery</h4>
            <p>Inter-state shipping available</p>
          </div>
          <div className="value-card">
            <div className="value-icon">✨</div>
            <h4>Premium Quality</h4>
            <p>Handpicked and tested</p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
