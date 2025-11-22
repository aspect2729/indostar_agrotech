/**
 * Consumer Home Page
 * 
 * Main landing page for consumers with hero section, featured products, and category navigation.
 * Implements requirements: 1.1, 1.5, 7.1, 7.2, 7.4, 8.2
 */

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts';
import { getProducts } from '../../services';
import { Product } from '../../types';
import CategoryTabs from '../../components/consumer/CategoryTabs';
import ProductGrid from '../../components/consumer/ProductGrid';
import './HomePage.css';

interface CategoryCard {
  id: string;
  name: string;
  icon: string;
  description: string;
}

const categoryCards: CategoryCard[] = [
  {
    id: 'jaggery',
    name: 'Jaggery',
    icon: '🍯',
    description: 'Pure organic jaggery'
  },
  {
    id: 'oil',
    name: 'Oil',
    icon: '🫒',
    description: 'Cold-pressed oils'
  },
  {
    id: 'chutney_powder',
    name: 'Chutney Powder',
    icon: '🌶️',
    description: 'Traditional spice blends'
  },
  {
    id: 'pickles',
    name: 'Pickles',
    icon: '🥒',
    description: 'Homemade pickles'
  },
  {
    id: 'milk',
    name: 'Milk',
    icon: '🥛',
    description: 'Fresh cow & buffalo milk'
  }
];

// Categories for tabs (Requirements 3.1, 3.2)
const categoryTabs = [
  { id: 'all', name: 'All Products' },
  { id: 'milk', name: 'Milk' },
  { id: 'jaggery', name: 'Jaggery' },
  { id: 'oil', name: 'Oil' },
  { id: 'chutney_powder', name: 'Chutney Powder' },
  { id: 'pickles', name: 'Pickles' },
];

const HomePage: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [productsLoading, setProductsLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<string>('all');

  useEffect(() => {
    loadAllProducts();
    
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
  }, []);

  // Filter products when category changes
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

  const handleCategoryClick = (category: string) => {
    navigate(`/consumer/products?category=${category}`);
  };

  const handleCategoryChange = (categoryId: string) => {
    setActiveCategory(categoryId);
  };

  const handleSubscribe = (productId: string) => {
    navigate(`/consumer/subscriptions/create?productId=${productId}`);
  };

  const handleBuyOnce = (productId: string) => {
    navigate(`/consumer/products/${productId}`);
  };

  const handleShare = (productId: string) => {
    console.log('Share product:', productId);
  };

  return (
    <div className="home-page">
      {/* Header */}
      <header className="home-header fade-in">
        <div className="header-content">
          <div className="logo-section">
            <h1 className="brand-name">Indostar Agrotech</h1>
            <p className="tagline">Pure. Organic. Trusted.</p>
          </div>
          <nav className="header-nav">
            <button
              className="nav-link"
              onClick={() => navigate('/consumer/products')}
            >
              Products
            </button>
            <button
              className="nav-link"
              onClick={() => navigate('/consumer/cart')}
            >
              Cart
            </button>
            <button
              className="nav-link"
              onClick={() => navigate('/consumer/orders')}
            >
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

      {/* Hero Section */}
      <section className="hero-section slide-in-up">
        <div className="hero-content">
          <h2 className="hero-title">Welcome to Indostar Agrotech</h2>
          <p className="hero-subtitle">
            Your trusted source for 100% organic products from Karnataka
          </p>
          <p className="hero-description">
            We bring you the finest organic jaggery, cold-pressed oils, traditional
            chutney powders, homemade pickles, and fresh milk directly from our farms
            to your doorstep.
          </p>
          <button
            className="cta-button hover-lift"
            onClick={() => navigate('/consumer/products')}
          >
            Shop Now
          </button>
        </div>
        <div className="hero-image">
          <div className="hero-image-placeholder">
            🌾
          </div>
        </div>
      </section>

      {/* Products Section with CategoryTabs and ProductGrid (Requirements 2.1, 2.2, 2.3, 3.1, 3.2) */}
      <section className="products-section scroll-reveal">
        <h2 className="section-title">Our Products</h2>
        
        {/* Category Tabs */}
        <CategoryTabs
          categories={categoryTabs}
          activeCategory={activeCategory}
          onCategoryChange={handleCategoryChange}
        />
        
        {/* Product Grid */}
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

      {/* Category Navigation */}
      <section className="categories-section scroll-reveal">
        <h2 className="section-title">Shop by Category</h2>
        <div className="categories-grid">
          {categoryCards.map((category, index) => (
            <div
              key={category.id}
              className="category-card hover-scale"
              onClick={() => handleCategoryClick(category.id)}
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="category-icon">{category.icon}</div>
              <h3 className="category-name">{category.name}</h3>
              <p className="category-description">{category.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Mission Section */}
      <section className="mission-section scroll-reveal">
        <div className="mission-content">
          <h2 className="section-title">Our Mission</h2>
          <p className="mission-text">
            At Indostar Agrotech Private Limited, we are committed to providing
            100% organic, chemical-free products that promote health and wellness.
            Our products are sourced directly from our farms in Karnataka, ensuring
            the highest quality and freshness.
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
        </div>
      </section>

      {/* Footer */}
      <footer className="home-footer">
        <div className="footer-content">
          <div className="footer-section">
            <h4>Indostar Agrotech</h4>
            <p>Pure organic products from Karnataka</p>
          </div>
          <div className="footer-section">
            <h4>Quick Links</h4>
            <button onClick={() => navigate('/consumer/products')}>Products</button>
            <button onClick={() => navigate('/consumer/orders')}>My Orders</button>
          </div>
          <div className="footer-section">
            <h4>Contact</h4>
            <p>Email: info@indostar.com</p>
            <p>Phone: +91 1234567890</p>
          </div>
        </div>
        <div className="footer-bottom">
          <p>&copy; 2024 Indostar Agrotech Private Limited. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;
