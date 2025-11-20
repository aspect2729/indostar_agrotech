/**
 * Analytics Component
 * 
 * Displays sales analytics and insights for the business owner.
 * Features:
 * - Display sales charts and trends
 * - Show popular products
 * - Implement revenue metrics display
 * - Create category performance visualization
 */

import React, { useState, useEffect } from 'react';
import { getOrders } from '../../services/orderService';
import { getProducts } from '../../services/productService';
import {
  Order,
  Product,
  ProductCategory,
} from '../../types';
import './Analytics.css';

interface CategoryStats {
  category: ProductCategory;
  revenue: number;
  orderCount: number;
  itemsSold: number;
}

interface ProductStats {
  product: Product;
  revenue: number;
  quantitySold: number;
  orderCount: number;
}

interface TimeSeriesData {
  date: string;
  revenue: number;
  orders: number;
}

const Analytics: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'year'>('month');

  useEffect(() => {
    loadAnalyticsData();
  }, []);

  const loadAnalyticsData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [ordersData, productsData] = await Promise.all([
        getOrders({}),
        getProducts({}),
      ]);

      setOrders(ordersData.data || []);
      setProducts(productsData.data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load analytics data');
    } finally {
      setLoading(false);
    }
  };

  // Calculate overall metrics
  const calculateMetrics = () => {
    const completedOrders = (orders || []).filter(o => o.status !== 'cancelled');
    const totalRevenue = completedOrders.reduce((sum, o) => sum + o.total, 0);
    const totalOrders = completedOrders.length;
    const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
    
    const totalItems = completedOrders.reduce(
      (sum, o) => sum + o.items.reduce((itemSum, item) => itemSum + item.quantity, 0),
      0
    );

    return {
      totalRevenue,
      totalOrders,
      averageOrderValue,
      totalItems,
    };
  };

  // Calculate category performance
  const calculateCategoryStats = (): CategoryStats[] => {
    const categoryMap = new Map<ProductCategory, CategoryStats>();

    // Initialize categories
    const categories: ProductCategory[] = ['jaggery', 'oil', 'chutney_powder', 'pickles', 'milk'];
    categories.forEach(cat => {
      categoryMap.set(cat, {
        category: cat,
        revenue: 0,
        orderCount: 0,
        itemsSold: 0,
      });
    });

    // Create product map for quick lookup
    const productMap = new Map((products || []).map(p => [p._id, p]));

    // Calculate stats from orders
    (orders || [])
      .filter(o => o.status !== 'cancelled')
      .forEach(order => {
        (order.items || []).forEach(item => {
          const product = productMap.get(item.productId);
          if (product) {
            const stats = categoryMap.get(product.category);
            if (stats) {
              stats.revenue += item.total;
              stats.itemsSold += item.quantity;
            }
          }
        });
      });

    // Count orders per category
    (orders || [])
      .filter(o => o.status !== 'cancelled')
      .forEach(order => {
        const categoriesInOrder = new Set<ProductCategory>();
        (order.items || []).forEach(item => {
          const product = productMap.get(item.productId);
          if (product) {
            categoriesInOrder.add(product.category);
          }
        });
        categoriesInOrder.forEach(cat => {
          const stats = categoryMap.get(cat);
          if (stats) {
            stats.orderCount++;
          }
        });
      });

    return Array.from(categoryMap.values()).sort((a, b) => b.revenue - a.revenue);
  };

  // Calculate popular products
  const calculatePopularProducts = (): ProductStats[] => {
    const productStatsMap = new Map<string, ProductStats>();

    // Create product map
    const productMap = new Map((products || []).map(p => [p._id, p]));

    // Calculate stats from orders
    (orders || [])
      .filter(o => o.status !== 'cancelled')
      .forEach(order => {
        (order.items || []).forEach(item => {
          const product = productMap.get(item.productId);
          if (product) {
            if (!productStatsMap.has(item.productId)) {
              productStatsMap.set(item.productId, {
                product,
                revenue: 0,
                quantitySold: 0,
                orderCount: 0,
              });
            }
            const stats = productStatsMap.get(item.productId)!;
            stats.revenue += item.total;
            stats.quantitySold += item.quantity;
            stats.orderCount++;
          }
        });
      });

    return Array.from(productStatsMap.values())
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 10);
  };

  // Calculate time series data
  const calculateTimeSeries = (): TimeSeriesData[] => {
    const now = new Date();
    const daysToShow = timeRange === 'week' ? 7 : timeRange === 'month' ? 30 : 365;
    const dataMap = new Map<string, TimeSeriesData>();

    // Initialize dates
    for (let i = daysToShow - 1; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      dataMap.set(dateStr, {
        date: dateStr,
        revenue: 0,
        orders: 0,
      });
    }

    // Aggregate data
    (orders || [])
      .filter(o => o.status !== 'cancelled')
      .forEach(order => {
        const orderDate = new Date(order.createdAt).toISOString().split('T')[0];
        const data = dataMap.get(orderDate);
        if (data) {
          data.revenue += order.total;
          data.orders++;
        }
      });

    return Array.from(dataMap.values());
  };

  const metrics = calculateMetrics();
  const categoryStats = calculateCategoryStats();
  const popularProducts = calculatePopularProducts();
  const timeSeries = calculateTimeSeries();

  // Calculate max values for chart scaling
  const maxRevenue = Math.max(...timeSeries.map(d => d.revenue), 1);

  if (loading) {
    return (
      <div className="analytics">
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Loading analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="analytics">
      <div className="analytics-header">
        <h2>Analytics Dashboard</h2>
        <div className="time-range-selector">
          <button
            className={timeRange === 'week' ? 'active' : ''}
            onClick={() => setTimeRange('week')}
          >
            Week
          </button>
          <button
            className={timeRange === 'month' ? 'active' : ''}
            onClick={() => setTimeRange('month')}
          >
            Month
          </button>
          <button
            className={timeRange === 'year' ? 'active' : ''}
            onClick={() => setTimeRange('year')}
          >
            Year
          </button>
        </div>
      </div>

      {error && (
        <div className="error-message">
          {error}
          <button onClick={() => setError(null)}>✕</button>
        </div>
      )}

      {/* Key Metrics */}
      <div className="metrics-grid">
        <div className="metric-card revenue">
          <div className="metric-icon">💰</div>
          <div className="metric-content">
            <h3>Total Revenue</h3>
            <p className="metric-value">₹{metrics.totalRevenue.toFixed(2)}</p>
          </div>
        </div>

        <div className="metric-card orders">
          <div className="metric-icon">📦</div>
          <div className="metric-content">
            <h3>Total Orders</h3>
            <p className="metric-value">{metrics.totalOrders}</p>
          </div>
        </div>

        <div className="metric-card average">
          <div className="metric-icon">📊</div>
          <div className="metric-content">
            <h3>Avg Order Value</h3>
            <p className="metric-value">₹{metrics.averageOrderValue.toFixed(2)}</p>
          </div>
        </div>

        <div className="metric-card items">
          <div className="metric-icon">🛒</div>
          <div className="metric-content">
            <h3>Items Sold</h3>
            <p className="metric-value">{metrics.totalItems}</p>
          </div>
        </div>
      </div>

      {/* Sales Trend Chart */}
      <div className="chart-section">
        <h3>Sales Trend</h3>
        <div className="chart-container">
          <div className="chart">
            {timeSeries.map((data, index) => {
              const heightPercent = (data.revenue / maxRevenue) * 100;
              return (
                <div key={index} className="chart-bar-container">
                  <div
                    className="chart-bar"
                    style={{ height: `${heightPercent}%` }}
                    title={`${data.date}: ₹${data.revenue.toFixed(2)}`}
                  >
                    <span className="bar-value">
                      {data.revenue > 0 ? `₹${data.revenue.toFixed(0)}` : ''}
                    </span>
                  </div>
                  <div className="chart-label">
                    {timeRange === 'week'
                      ? new Date(data.date).toLocaleDateString('en-US', { weekday: 'short' })
                      : timeRange === 'month'
                      ? new Date(data.date).getDate()
                      : new Date(data.date).toLocaleDateString('en-US', { month: 'short' })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Category Performance */}
      <div className="category-section">
        <h3>Category Performance</h3>
        <div className="category-grid">
          {categoryStats.map(stat => {
            const totalRevenue = categoryStats.reduce((sum, s) => sum + s.revenue, 0);
            const percentage = totalRevenue > 0 ? (stat.revenue / totalRevenue) * 100 : 0;
            
            return (
              <div key={stat.category} className="category-card">
                <div className="category-header">
                  <h4>{stat.category.replace('_', ' ')}</h4>
                  <span className="category-percentage">{percentage.toFixed(1)}%</span>
                </div>
                <div className="category-stats">
                  <div className="stat-item">
                    <span className="stat-label">Revenue</span>
                    <span className="stat-value">₹{stat.revenue.toFixed(2)}</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-label">Orders</span>
                    <span className="stat-value">{stat.orderCount}</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-label">Items Sold</span>
                    <span className="stat-value">{stat.itemsSold}</span>
                  </div>
                </div>
                <div className="category-bar">
                  <div
                    className="category-bar-fill"
                    style={{ width: `${percentage}%` }}
                  ></div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Popular Products */}
      <div className="popular-products-section">
        <h3>Top 10 Products</h3>
        <div className="products-table-container">
          <table className="products-table">
            <thead>
              <tr>
                <th>Rank</th>
                <th>Product</th>
                <th>Category</th>
                <th>Revenue</th>
                <th>Quantity Sold</th>
                <th>Orders</th>
              </tr>
            </thead>
            <tbody>
              {popularProducts.length === 0 ? (
                <tr>
                  <td colSpan={6} className="no-data">
                    No sales data available
                  </td>
                </tr>
              ) : (
                popularProducts.map((stat, index) => (
                  <tr key={stat.product._id}>
                    <td className="rank">
                      <span className={`rank-badge rank-${index + 1}`}>
                        {index + 1}
                      </span>
                    </td>
                    <td className="product-name">{stat.product.name}</td>
                    <td className="product-category">
                      {stat.product.category.replace('_', ' ')}
                    </td>
                    <td className="revenue">₹{stat.revenue.toFixed(2)}</td>
                    <td className="quantity">{stat.quantitySold}</td>
                    <td className="orders">{stat.orderCount}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
