/**
 * CategoryTabs Component
 * 
 * Horizontal scrollable tabs for product category filtering.
 * Implements requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 6.5
 */

import React, { useRef, useEffect, useState } from 'react';
import './CategoryTabs.css';

export interface Category {
  id: string;
  name: string;
  count?: number;
}

export interface CategoryTabsProps {
  categories: Category[];
  activeCategory: string;
  onCategoryChange: (categoryId: string) => void;
  scrollTargetRef?: React.RefObject<HTMLElement>;
}

const CategoryTabs: React.FC<CategoryTabsProps> = ({
  categories,
  activeCategory,
  onCategoryChange,
  scrollTargetRef,
}) => {
  const tabsContainerRef = useRef<HTMLDivElement>(null);
  const indicatorRef = useRef<HTMLDivElement>(null);
  const activeTabRef = useRef<HTMLButtonElement>(null);
  const [indicatorStyle, setIndicatorStyle] = useState({ left: 0, width: 0 });

  // Update indicator position when active category changes
  useEffect(() => {
    if (activeTabRef.current && tabsContainerRef.current) {
      const tabElement = activeTabRef.current;
      const containerElement = tabsContainerRef.current;
      
      const tabRect = tabElement.getBoundingClientRect();
      const containerRect = containerElement.getBoundingClientRect();
      
      const left = tabRect.left - containerRect.left + containerElement.scrollLeft;
      const width = tabRect.width;
      
      setIndicatorStyle({ left, width });
      
      // Scroll active tab into view (check if method exists for test compatibility)
      if (typeof tabElement.scrollIntoView === 'function') {
        tabElement.scrollIntoView({
          behavior: 'smooth',
          block: 'nearest',
          inline: 'center',
        });
      }
    }
  }, [activeCategory, categories]);

  const handleTabClick = (categoryId: string) => {
    // Call the category change handler
    onCategoryChange(categoryId);
    
    // Reset scroll position on category change (Requirement 3.5)
    if (scrollTargetRef?.current) {
      scrollTargetRef.current.scrollTo({
        top: 0,
        behavior: 'smooth',
      });
    } else {
      // Fallback to window scroll
      window.scrollTo({
        top: 0,
        behavior: 'smooth',
      });
    }
  };

  // Keyboard navigation for tabs
  const handleKeyDown = (e: React.KeyboardEvent, categoryId: string, index: number) => {
    let nextIndex = index;

    switch (e.key) {
      case 'ArrowLeft':
        e.preventDefault();
        nextIndex = index > 0 ? index - 1 : categories.length - 1;
        break;
      case 'ArrowRight':
        e.preventDefault();
        nextIndex = index < categories.length - 1 ? index + 1 : 0;
        break;
      case 'Home':
        e.preventDefault();
        nextIndex = 0;
        break;
      case 'End':
        e.preventDefault();
        nextIndex = categories.length - 1;
        break;
      case 'Enter':
      case ' ':
        e.preventDefault();
        handleTabClick(categoryId);
        return;
      default:
        return;
    }

    // Focus the next tab
    const nextCategory = categories[nextIndex];
    const nextTabElement = document.getElementById(`category-tab-${nextCategory.id}`);
    if (nextTabElement) {
      nextTabElement.focus();
    }
  };

  return (
    <div className="category-tabs" role="tablist" aria-label="Product categories">
      <div className="category-tabs__container" ref={tabsContainerRef}>
        {categories.map((category, index) => {
          const isActive = category.id === activeCategory;
          
          return (
            <button
              key={category.id}
              ref={isActive ? activeTabRef : null}
              className={`category-tabs__tab ${isActive ? 'category-tabs__tab--active' : ''}`}
              onClick={() => handleTabClick(category.id)}
              onKeyDown={(e) => handleKeyDown(e, category.id, index)}
              role="tab"
              aria-selected={isActive}
              aria-controls={`category-panel-${category.id}`}
              id={`category-tab-${category.id}`}
              tabIndex={isActive ? 0 : -1}
            >
              <span className="category-tabs__tab-text">{category.name}</span>
              {category.count !== undefined && (
                <span className="category-tabs__tab-count" aria-label={`${category.count} products`}>
                  ({category.count})
                </span>
              )}
            </button>
          );
        })}
        
        {/* Active indicator underline */}
        <div
          ref={indicatorRef}
          className="category-tabs__indicator"
          style={{
            transform: `translateX(${indicatorStyle.left}px)`,
            width: `${indicatorStyle.width}px`,
          }}
          aria-hidden="true"
        />
      </div>
    </div>
  );
};

export default CategoryTabs;
