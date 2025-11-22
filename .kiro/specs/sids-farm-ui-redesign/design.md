# Design Document

## Overview

This design document outlines the comprehensive UI/UX redesign of the IndoStar e-commerce application frontend to match the modern, clean aesthetic of the Sid's Farm milk delivery application. The redesign transforms the existing interface into a mobile-first, card-based layout with improved navigation patterns, visual hierarchy, and user experience.

The redesign maintains all existing functionality while introducing:
- Slide-out navigation drawer with brand identity
- Bottom navigation bar for quick access
- Card-based product display with dual action buttons
- Tab-based category filtering
- Modern color palette with yellow/gold primary color
- Smooth animations and micro-interactions
- Responsive layouts for all screen sizes

## Architecture

### Component Hierarchy

```
App
├── NavigationDrawer
│   ├── DrawerHeader (Logo + Tagline)
│   ├── DrawerMenu (Navigation Items)
│   └── DrawerFooter (Pause Deliveries + Version)
├── Layout
│   ├── TopHeader
│   │   ├── HamburgerButton
│   │   ├── PageTitle
│   │   ├── NotificationIcon
│   │   └── CartIcon
│   ├── MainContent
│   │   └── [Page Components]
│   └── BottomNavigation
│       ├── NavItem (Home)
│       ├── NavItem (Subscriptions)
│       ├── NavItem (Products - Elevated)
│       ├── NavItem (Wallet)
│       └── NavItem (Account)
└── Pages
    ├── HomePage
    ├── ProductCatalog
    │   ├── CategoryTabs
    │   └── ProductGrid
    │       └── ProductCard[]
    ├── ProductDetail
    ├── Cart
    ├── Subscriptions
    ├── OrderHistory
    └── [Other Pages]
```

### Design Patterns

1. **Mobile-First Approach**: Design starts with mobile viewport and scales up
2. **Progressive Enhancement**: Core functionality works without JavaScript, enhanced with interactions
3. **Component-Based Architecture**: Reusable UI components with consistent styling
4. **Atomic Design**: Components organized as atoms, molecules, organisms
5. **CSS-in-JS or CSS Modules**: Scoped styling to prevent conflicts

## Components and Interfaces

### 1. NavigationDrawer Component

**Purpose**: Slide-out menu providing access to all application sections

**Props**:
```typescript
interface NavigationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  userRole: 'consumer' | 'distributor' | 'owner';
  deliveriesPaused: boolean;
  onTogglePause: (paused: boolean) => void;
  appVersion: string;
}
```

**Visual Specifications**:
- Width: 280px (mobile), 320px (tablet+)
- Background: White (#FFFFFF)
- Shadow: 0 0 20px rgba(0,0,0,0.1)
- Animation: Slide from left, 300ms ease-out
- Overlay: Semi-transparent black (rgba(0,0,0,0.5))

**Menu Items Structure**:
```typescript
interface MenuItem {
  id: string;
  label: string;
  icon: IconComponent;
  route: string;
  roles: UserRole[];
  badge?: number;
}
```

### 2. TopHeader Component

**Purpose**: Fixed header with navigation trigger, title, and action icons

**Props**:
```typescript
interface TopHeaderProps {
  title: string;
  onMenuClick: () => void;
  notificationCount: number;
  cartItemCount: number;
  onNotificationClick: () => void;
  onCartClick: () => void;
}
```

**Visual Specifications**:
- Height: 56px (mobile), 64px (desktop)
- Background: White (#FFFFFF)
- Border Bottom: 1px solid #E0E0E0
- Position: Fixed top
- Z-index: 100

### 3. BottomNavigation Component

**Purpose**: Fixed bottom navigation for primary app sections (mobile only)

**Props**:
```typescript
interface BottomNavigationProps {
  activeRoute: string;
  onNavigate: (route: string) => void;
  userRole: 'consumer' | 'distributor' | 'owner';
}
```

**Visual Specifications**:
- Height: 64px
- Background: White (#FFFFFF)
- Shadow: 0 -2px 10px rgba(0,0,0,0.1)
- Position: Fixed bottom
- Display: Flex, space-around
- Center Item (Products): Elevated 16px, circular background

### 4. ProductCard Component

**Purpose**: Display product information with action buttons

**Props**:
```typescript
interface ProductCardProps {
  product: {
    id: string;
    name: string;
    brand: string;
    image: string;
    volume: string;
    price: number;
    originalPrice?: number;
    discount?: number;
    category: string;
  };
  onSubscribe: (productId: string) => void;
  onBuyOnce: (productId: string) => void;
  onShare: (productId: string) => void;
  onCardClick: (productId: string) => void;
}
```

**Visual Specifications**:
- Background: White (#FFFFFF)
- Border Radius: 12px
- Shadow: 0 2px 8px rgba(0,0,0,0.08)
- Padding: 16px
- Image Aspect Ratio: 1:1
- Image Border Radius: 8px
- Spacing: 12px between elements

**Button Styles**:
- Subscribe Button: Background #F4C430, Color #333333, Bold
- Buy Once Button: Background #FFFFFF, Border 2px solid #4A90E2, Color #4A90E2
- Button Height: 40px
- Button Border Radius: 20px
- Button Font Size: 14px

### 5. CategoryTabs Component

**Purpose**: Horizontal scrollable tabs for product category filtering

**Props**:
```typescript
interface CategoryTabsProps {
  categories: Array<{
    id: string;
    name: string;
    count?: number;
  }>;
  activeCategory: string;
  onCategoryChange: (categoryId: string) => void;
}
```

**Visual Specifications**:
- Height: 48px
- Background: White (#FFFFFF)
- Tab Padding: 16px 20px
- Active Indicator: 3px solid #F4C430, bottom border
- Active Text: #333333, Semi-bold
- Inactive Text: #666666, Regular
- Scroll: Horizontal, hide scrollbar

### 6. ProductGrid Component

**Purpose**: Responsive grid layout for product cards

**Props**:
```typescript
interface ProductGridProps {
  products: Product[];
  loading: boolean;
  onLoadMore?: () => void;
}
```

**Layout Specifications**:
- Mobile (<768px): 1 column, 16px gap
- Tablet (768-1024px): 2 columns, 20px gap
- Desktop (>1024px): 3 columns, 24px gap
- Padding: 16px (mobile), 24px (desktop)

## Data Models

### Product Model
```typescript
interface Product {
  id: string;
  name: string;
  brand: string;
  description: string;
  category: string;
  subcategory?: string;
  images: string[];
  volume: string;
  unit: 'ML' | 'L' | 'KG' | 'G';
  price: number;
  originalPrice?: number;
  discount?: number;
  inStock: boolean;
  subscriptionAvailable: boolean;
  tags: string[];
  nutritionInfo?: NutritionInfo;
}
```

### Navigation Item Model
```typescript
interface NavigationItem {
  id: string;
  label: string;
  icon: string;
  route: string;
  badge?: number;
  roles: UserRole[];
  order: number;
}
```

### Theme Configuration
```typescript
interface ThemeConfig {
  colors: {
    primary: string;        // #F4C430 (Yellow/Gold)
    secondary: string;      // #4A90E2 (Blue)
    success: string;        // #00C853 (Green)
    error: string;          // #E53935 (Red)
    warning: string;        // #FF9800 (Orange)
    textPrimary: string;    // #333333
    textSecondary: string;  // #666666
    textDisabled: string;   // #999999
    background: string;     // #F5F5F5
    surface: string;        // #FFFFFF
    border: string;         // #E0E0E0
  };
  spacing: {
    xs: string;   // 4px
    sm: string;   // 8px
    md: string;   // 16px
    lg: string;   // 24px
    xl: string;   // 32px
  };
  borderRadius: {
    sm: string;   // 4px
    md: string;   // 8px
    lg: string;   // 12px
    xl: string;   // 20px
    full: string; // 9999px
  };
  typography: {
    fontFamily: string;
    h1: TypographyStyle;
    h2: TypographyStyle;
    h3: TypographyStyle;
    body1: TypographyStyle;
    body2: TypographyStyle;
    button: TypographyStyle;
    caption: TypographyStyle;
  };
}
```


## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system-essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Navigation drawer toggle behavior
*For any* application state, when the hamburger menu is clicked, the navigation drawer should transition from closed to open or open to closed
**Validates: Requirements 1.2**

### Property 2: Navigation item routing
*For any* navigation menu item, clicking it should navigate to its corresponding route and close the drawer
**Validates: Requirements 1.4**

### Property 3: Product card structure completeness
*For any* product displayed in the catalog, its card should contain all required elements: image, name, brand, volume, and pricing
**Validates: Requirements 2.1**

### Property 4: Discount display consistency
*For any* product with a discount value greater than zero, the card should display original price with strikethrough, discounted price, and discount percentage badge
**Validates: Requirements 2.2**

### Property 5: Product card action buttons presence
*For any* product card rendered, it should display both "Subscribe" and "Buy Once" buttons with correct styling (Subscribe: yellow background, Buy Once: white with blue border)
**Validates: Requirements 2.3, 11.1, 11.2**

### Property 6: Share functionality trigger
*For any* product card, clicking the share icon should invoke the native share API or fallback share mechanism
**Validates: Requirements 2.4**

### Property 7: Product image styling consistency
*For any* product image displayed, it should have rounded corners (border-radius >= 8px) and maintain proper aspect ratio
**Validates: Requirements 2.5**

### Property 8: Category tab selection highlighting
*For any* category tab, when selected, it should display an active indicator (underline) and appropriate text styling
**Validates: Requirements 3.2**

### Property 9: Category filtering accuracy
*For any* selected category, the product list should contain only products belonging to that category
**Validates: Requirements 3.3**

### Property 10: Category switch scroll reset
*For any* category tab selection change, the product list scroll position should reset to the top
**Validates: Requirements 3.5**

### Property 11: Notification badge visibility
*For any* notification count greater than zero, a badge indicator should be visible on the notification bell icon
**Validates: Requirements 4.2**

### Property 12: Cart badge display
*For any* cart with one or more items, a count badge should be displayed on the cart icon showing the number of items
**Validates: Requirements 4.3**

### Property 13: Icon navigation behavior
*For any* header icon (notification or cart), clicking it should navigate to the corresponding page
**Validates: Requirements 4.4, 4.5**

### Property 14: Primary action color consistency
*For any* primary action button in the application, it should use the primary yellow/gold color (#F4C430 or similar)
**Validates: Requirements 5.1**

### Property 15: Text color hierarchy
*For any* text element, it should use dark gray for primary text and medium gray for secondary text based on its semantic importance
**Validates: Requirements 5.2**

### Property 16: Interactive element color scheme
*For any* link or secondary action button, it should use blue color (#4A90E2 or similar)
**Validates: Requirements 5.3**

### Property 17: Background color consistency
*For any* card component, it should have white background, and any page background should use light gray
**Validates: Requirements 5.4**

### Property 18: Discount badge styling
*For any* discount badge displayed, it should have green background with white text
**Validates: Requirements 5.5**

### Property 19: Drawer animation timing
*For any* navigation drawer open or close action, the animation duration should be approximately 300 milliseconds
**Validates: Requirements 6.1**

### Property 20: Button interaction feedback
*For any* button tap or click, visual feedback (scale, opacity, or color change) should be provided
**Validates: Requirements 6.2**

### Property 21: Content load animation
*For any* content that loads asynchronously, it should fade in smoothly when rendered
**Validates: Requirements 6.3**

### Property 22: Tab indicator animation
*For any* tab selection change, the active indicator should animate smoothly to the new position
**Validates: Requirements 6.5**

### Property 23: Delivery pause toggle functionality
*For any* toggle action on "Pause all deliveries", the delivery status should update and a confirmation should be displayed
**Validates: Requirements 7.3**

### Property 24: Menu item icon presence
*For any* navigation menu item displayed, it should have an icon rendered to the left of its text label
**Validates: Requirements 7.5**

### Property 25: Touch target minimum size
*For any* interactive element on mobile viewport (< 768px), its touch target should be at least 44x44 pixels
**Validates: Requirements 8.1**

### Property 26: Product card navigation
*For any* product card, clicking on the card (outside of action buttons) should navigate to the product detail page
**Validates: Requirements 8.2**

### Property 27: Button event propagation prevention
*For any* action button on a product card, clicking it should not trigger the card's click event
**Validates: Requirements 8.3**

### Property 28: Long press quick actions
*For any* product card, performing a long press should display a quick actions menu
**Validates: Requirements 8.4**

### Property 29: Product grid spacing consistency
*For any* product grid with multiple products, the spacing between cards should be consistent (16px on mobile)
**Validates: Requirements 8.5**

### Property 30: Active navigation highlighting
*For any* page navigation, the corresponding navigation item in the bottom nav should be highlighted as active
**Validates: Requirements 9.2**

### Property 31: Bottom navigation item routing
*For any* bottom navigation item, tapping it should navigate to the corresponding page
**Validates: Requirements 9.4**

### Property 32: Product name typography
*For any* product name displayed, it should use 16-18px font size with medium weight
**Validates: Requirements 10.1**

### Property 33: Price typography
*For any* price displayed, it should use 20-24px font size with bold weight
**Validates: Requirements 10.2**

### Property 34: Page title typography
*For any* page title displayed, it should use 20-22px font size with semi-bold weight
**Validates: Requirements 10.3**

### Property 35: Body text typography
*For any* body text displayed, it should use 14-16px font size with regular weight
**Validates: Requirements 10.4**

### Property 36: System font usage
*For any* text element, the font-family should include system fonts (system-ui, -apple-system, etc.)
**Validates: Requirements 10.5**

### Property 37: Button hover state
*For any* action button, hovering over it should darken its color by approximately 10%
**Validates: Requirements 11.3**

### Property 38: Action button border radius
*For any* action button (Subscribe or Buy Once), it should have rounded corners with 20px border radius
**Validates: Requirements 11.4**

### Property 39: Responsive grid column adjustment
*For any* viewport width change, the product grid should adjust from 1 column (mobile) to 2-3 columns (tablet/desktop) appropriately
**Validates: Requirements 12.3**

### Property 40: Responsive image sizing
*For any* image displayed, the appropriate size variant should be served based on the current viewport width
**Validates: Requirements 12.4**

### Property 41: Touch target size maintenance
*For any* screen size, interactive elements should maintain minimum touch target sizes for accessibility
**Validates: Requirements 12.5**

### Property 42: Loading skeleton layout matching
*For any* loading state, the skeleton screen should match the structure and layout of the actual content
**Validates: Requirements 13.1**

### Property 43: Error state retry button
*For any* error state displayed, an error message and retry button should be present
**Validates: Requirements 13.3**

### Property 44: Non-blocking loading indicators
*For any* data fetching operation, loading indicators should be shown without blocking user interaction with other UI elements
**Validates: Requirements 13.4**

### Property 45: Content load transition
*For any* successful content load, the loading state should be removed and content should appear with a fade-in animation
**Validates: Requirements 13.5**

## Error Handling

### UI Error Boundaries

1. **Component Error Boundaries**: Wrap major sections in error boundaries to prevent full app crashes
2. **Fallback UI**: Display user-friendly error messages with recovery options
3. **Error Logging**: Log errors to monitoring service for debugging

### Network Error Handling

1. **Retry Logic**: Implement exponential backoff for failed API requests
2. **Offline Detection**: Show offline banner when network is unavailable
3. **Cached Data**: Display cached data when fresh data cannot be fetched
4. **Timeout Handling**: Set reasonable timeouts and show appropriate messages

### User Input Validation

1. **Client-Side Validation**: Validate inputs before submission
2. **Error Messages**: Display clear, actionable error messages near relevant fields
3. **Prevent Invalid States**: Disable actions that would lead to errors

### Loading States

1. **Skeleton Screens**: Show content placeholders during initial load
2. **Spinners**: Use for short operations (< 2 seconds)
3. **Progress Indicators**: Show progress for longer operations
4. **Optimistic Updates**: Update UI immediately, rollback on error

## Testing Strategy

### Unit Testing

**Framework**: Jest + React Testing Library

**Coverage Areas**:
1. Component rendering with various props
2. User interaction handlers (clicks, taps, swipes)
3. Conditional rendering logic
4. State management
5. Utility functions

**Example Tests**:
- ProductCard renders with all required elements
- Navigation drawer opens when hamburger is clicked
- Category tabs filter products correctly
- Bottom navigation highlights active route
- Buttons have correct styling classes

### Property-Based Testing

**Framework**: fast-check (JavaScript/TypeScript property-based testing library)

**Configuration**: Each property test should run a minimum of 100 iterations

**Test Tagging**: Each property-based test must include a comment with format:
`// Feature: sids-farm-ui-redesign, Property {number}: {property_text}`

**Coverage Areas**:
1. Component behavior across random valid inputs
2. Styling consistency across different data sets
3. Responsive behavior across viewport ranges
4. Navigation and routing with various states
5. Animation and transition properties

**Example Property Tests**:
- For any product data, ProductCard displays all required fields
- For any category selection, only matching products are shown
- For any viewport width, appropriate layout is applied
- For any button, hover state darkens color
- For any navigation action, drawer closes

### Integration Testing

**Framework**: Cypress or Playwright

**Coverage Areas**:
1. Complete user flows (browse → add to cart → checkout)
2. Navigation between pages
3. Responsive behavior across devices
4. Animation and transition smoothness
5. Cross-browser compatibility

### Visual Regression Testing

**Framework**: Percy or Chromatic

**Coverage Areas**:
1. Component visual consistency
2. Responsive layouts at key breakpoints
3. Theme and color application
4. Typography rendering
5. Animation states

### Accessibility Testing

**Framework**: axe-core + jest-axe

**Coverage Areas**:
1. WCAG 2.1 AA compliance
2. Keyboard navigation
3. Screen reader compatibility
4. Color contrast ratios
5. Touch target sizes

### Performance Testing

**Tools**: Lighthouse, WebPageTest

**Metrics**:
1. First Contentful Paint (< 1.5s)
2. Largest Contentful Paint (< 2.5s)
3. Time to Interactive (< 3.5s)
4. Cumulative Layout Shift (< 0.1)
5. First Input Delay (< 100ms)

## Implementation Notes

### CSS Architecture

**Approach**: CSS Modules or Styled Components for component-scoped styles

**Structure**:
```
styles/
├── globals.css          # Global resets and base styles
├── variables.css        # CSS custom properties (colors, spacing, etc.)
├── animations.css       # Reusable animations
└── utilities.css        # Utility classes
```

### Responsive Breakpoints

```css
/* Mobile First */
--breakpoint-sm: 640px;   /* Small tablets */
--breakpoint-md: 768px;   /* Tablets */
--breakpoint-lg: 1024px;  /* Small desktops */
--breakpoint-xl: 1280px;  /* Large desktops */
```

### Animation Performance

1. Use `transform` and `opacity` for animations (GPU accelerated)
2. Avoid animating `width`, `height`, `top`, `left`
3. Use `will-change` sparingly for complex animations
4. Implement `prefers-reduced-motion` media query

### Image Optimization

1. Use WebP format with JPEG/PNG fallbacks
2. Implement lazy loading for below-fold images
3. Serve responsive images with `srcset`
4. Use blur-up technique for progressive loading

### State Management

**Approach**: React Context API for global state, local state for component-specific data

**Global State**:
- User authentication
- Cart items
- Navigation drawer open/closed
- Active category/filters
- Theme preferences

**Local State**:
- Form inputs
- UI toggles
- Temporary selections
- Animation states

### Accessibility Considerations

1. **Semantic HTML**: Use appropriate HTML elements
2. **ARIA Labels**: Add labels for icon-only buttons
3. **Focus Management**: Trap focus in drawer when open
4. **Keyboard Navigation**: Support Tab, Enter, Escape keys
5. **Screen Reader**: Announce dynamic content changes
6. **Color Contrast**: Ensure 4.5:1 ratio for text
7. **Touch Targets**: Minimum 44x44px for mobile

### Browser Support

- Chrome/Edge: Last 2 versions
- Firefox: Last 2 versions
- Safari: Last 2 versions
- iOS Safari: Last 2 versions
- Android Chrome: Last 2 versions

### Migration Strategy

1. **Phase 1**: Implement new design system and components
2. **Phase 2**: Update consumer-facing pages (Home, Products, Cart)
3. **Phase 3**: Update distributor dashboard
4. **Phase 4**: Update owner dashboard
5. **Phase 5**: Remove old components and styles

### Performance Optimization

1. **Code Splitting**: Lazy load routes and heavy components
2. **Bundle Size**: Keep initial bundle < 200KB gzipped
3. **Caching**: Implement service worker for offline support
4. **CDN**: Serve static assets from CDN
5. **Compression**: Enable Brotli/Gzip compression
