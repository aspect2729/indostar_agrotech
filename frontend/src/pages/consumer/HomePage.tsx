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
import { Product, ProductCategory } from '../../types';
import './HomePage.css';

interface CategoryCard {
  id: ProductCategory;
  name: string;
  icon: string;
  description: string;
}

const categories: CategoryCard[] = [
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

const HomePage: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    loadFeaturedProducts();
    
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

  // Auto-advance carousel
  useEffect(() => {
    if (featuredProducts.length > 0) {
      const interval = setInterval(() => {
        setCurrentSlide((prev) => (prev + 1) % featuredProducts.length);
      }, 5000);
      return () => clearInterval(interval);
    }
    return undefined;
  }, [featuredProducts.length]);

  const loadFeaturedProducts = async () => {
    try {
      const response: any = await getProducts({ limit: 6, isActive: true });
      // Backend returns {products: [...]} not {data: [...]}
      setFeaturedProducts(response.products || response.data || []);
    } catch (error) {
      console.error('Failed to load featured products:', error);
      setFeaturedProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryClick = (category: ProductCategory) => {
    navigate(`/consumer/products?category=${category}`);
  };

  const handleProductClick = (productId: string) => {
    navigate(`/consumer/products/${productId}`);
  };

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
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

      {/* Featured Products Carousel */}
      {!loading && featuredProducts.length > 0 && (
        <section className="featured-section scroll-reveal">
          <h2 className="section-title">Featured Products</h2>
          <div className="carousel-container">
            <div
              className="carousel-track"
              style={{ transform: `translateX(-${currentSlide * 100}%)` }}
            >
              {featuredProducts.map((product) => (
                <div
                  key={product._id}
                  className="carousel-slide"
                  onClick={() => handleProductClick(product._id)}
                >
                  <div className="product-card hover-lift">
                    <div className="product-image">
                      {product.images && product.images.length > 0 ? (
                        <img src={product.images[0]} alt={product.name} />
                      ) : (
                        <div className="product-image-placeholder">📦</div>
                      )}
                    </div>
                    <div className="product-info">
                      <h3 className="product-name">{product.name}</h3>
                      <p className="product-description">{product.description}</p>
                      <div className="product-footer">
                        <span className="product-price">
                          ₹{product.price.consumer}/{product.unit}
                        </span>
                        <button className="add-to-cart-btn">View Details</button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="carousel-indicators">
              {featuredProducts.map((_, index) => (
                <button
                  key={index}
                  className={`indicator ${index === currentSlide ? 'active' : ''}`}
                  onClick={() => goToSlide(index)}
                  aria-label={`Go to slide ${index + 1}`}
                />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Category Navigation */}
      <section className="categories-section scroll-reveal">
        <h2 className="section-title">Shop by Category</h2>
        <div className="categories-grid">
          {categories.map((category, index) => (
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
