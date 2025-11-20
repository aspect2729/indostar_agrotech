# CSS Animations and Styling Guide

This directory contains comprehensive CSS styling and animation utilities for the Indostar E-commerce Application.

## Files Overview

### Core Styles
- **index.css** - Global styles, CSS variables, and base styles
- **App.css** - Application-level styles

### Component Styles
- **animations.css** - Reusable animation utilities and keyframes
- **buttons.css** - Button styles with hover effects
- **cards.css** - Card component styles with animations
- **forms.css** - Form input styles with smooth transitions
- **utilities.css** - Utility classes for common patterns

## CSS Variables

All CSS variables are defined in `index.css` under the `:root` selector:

### Colors
```css
--primary-color: #2e7d32
--primary-dark: #1b5e20
--primary-light: #4caf50
--secondary-color: #ff6f00
--success: #4caf50
--warning: #ff9800
--error: #f44336
--info: #2196f3
```

### Spacing
```css
--spacing-xs: 4px
--spacing-sm: 8px
--spacing-md: 16px
--spacing-lg: 24px
--spacing-xl: 32px
--spacing-xxl: 48px
```

### Typography
```css
--font-size-xs: 12px
--font-size-sm: 14px
--font-size-md: 16px
--font-size-lg: 18px
--font-size-xl: 24px
--font-size-xxl: 32px
```

### Transitions
```css
--transition-fast: 150ms ease-in-out
--transition-base: 200ms ease-in-out
--transition-slow: 300ms ease-in-out
```

## Animation Classes

### Page Transitions

**Fade Animations**
```html
<div class="fade-in">Content</div>
<div class="fade-in-fast">Fast fade</div>
<div class="fade-in-slow">Slow fade</div>
```

**Slide Animations**
```html
<div class="slide-in-left">Slides from left</div>
<div class="slide-in-right">Slides from right</div>
<div class="slide-in-up">Slides from bottom</div>
<div class="slide-in-down">Slides from top</div>
```

**Scale Animations**
```html
<div class="scale-in">Scales up</div>
<div class="scale-out">Scales down</div>
```

### Hover Effects

**For Buttons and Cards**
```html
<button class="hover-lift">Lifts on hover</button>
<div class="hover-scale">Scales on hover</div>
<div class="hover-glow">Glows on hover</div>
<div class="hover-brighten">Brightens on hover</div>
```

### Loading Animations

**Spinner**
```html
<div class="spinner"></div>
<div class="spinner spinner-sm"></div>
<div class="spinner spinner-lg"></div>
```

**Pulse**
```html
<div class="pulse">Pulsing element</div>
```

**Loading Dots**
```html
<div class="loading-dots">
  <span></span>
  <span></span>
  <span></span>
</div>
```

### Skeleton Screens

```html
<div class="skeleton skeleton-text"></div>
<div class="skeleton skeleton-title"></div>
<div class="skeleton skeleton-avatar"></div>
<div class="skeleton skeleton-card"></div>
```

### Scroll Animations

**Scroll Reveal**
```html
<div class="scroll-reveal">Reveals on scroll</div>
```

**Staggered Scroll Reveal**
```html
<div class="scroll-reveal-stagger">Item 1</div>
<div class="scroll-reveal-stagger">Item 2</div>
<div class="scroll-reveal-stagger">Item 3</div>
```

**Parallax Effect**
```html
<div class="parallax">Parallax element</div>
```

## Button Styles

### Basic Buttons
```html
<button class="btn btn-primary">Primary</button>
<button class="btn btn-secondary">Secondary</button>
<button class="btn btn-success">Success</button>
<button class="btn btn-warning">Warning</button>
<button class="btn btn-danger">Danger</button>
```

### Button Sizes
```html
<button class="btn btn-primary btn-sm">Small</button>
<button class="btn btn-primary btn-md">Medium</button>
<button class="btn btn-primary btn-lg">Large</button>
<button class="btn btn-primary btn-xl">Extra Large</button>
```

### Outline Buttons
```html
<button class="btn btn-outline-primary">Outline Primary</button>
<button class="btn btn-outline-secondary">Outline Secondary</button>
```

### Special Effects
```html
<button class="btn btn-primary btn-glow">Glow Effect</button>
<button class="btn btn-gradient-animate">Animated Gradient</button>
<button class="btn btn-primary btn-ripple">Ripple Effect</button>
```

### Loading State
```html
<button class="btn btn-primary btn-loading">Loading...</button>
```

## Card Styles

### Basic Card
```html
<div class="card card-hover">
  <div class="card-header">
    <h3 class="card-header-title">Card Title</h3>
  </div>
  <div class="card-body">
    Card content
  </div>
  <div class="card-footer">
    Footer content
  </div>
</div>
```

### Card Variants
```html
<div class="card card-elevated">Elevated Card</div>
<div class="card card-flat">Flat Card</div>
<div class="card card-outlined">Outlined Card</div>
<div class="card card-gradient">Gradient Card</div>
```

### Card Hover Effects
```html
<div class="card card-lift">Lifts on hover</div>
<div class="card card-scale">Scales on hover</div>
<div class="card card-glow">Glows on hover</div>
<div class="card card-tilt">Tilts on hover</div>
```

### Product Card
```html
<div class="card product-card">
  <div class="product-card-image">
    <img src="..." alt="Product" />
  </div>
  <div class="product-card-body">
    <h3 class="product-card-title">Product Name</h3>
    <p class="product-card-description">Description</p>
    <div class="product-card-footer">
      <span class="product-card-price">$99.99</span>
      <button class="btn btn-primary">Add to Cart</button>
    </div>
  </div>
</div>
```

## Form Styles

### Basic Input
```html
<div class="form-group">
  <label class="form-label">Email</label>
  <input type="email" class="form-input" placeholder="Enter email" />
  <span class="form-help">We'll never share your email</span>
</div>
```

### Input States
```html
<input class="form-input form-input-success" />
<input class="form-input form-input-error" />
<input class="form-input form-input-warning" />
```

### Validation Messages
```html
<div class="form-error-message">
  ⚠️ This field is required
</div>
<div class="form-success-message">
  ✓ Looks good!
</div>
```

### Search Input
```html
<div class="search-input-wrapper">
  <span class="search-icon">🔍</span>
  <input type="text" class="form-input search-input" placeholder="Search..." />
  <button class="search-clear">✕</button>
</div>
```

### Switch/Toggle
```html
<div class="form-switch">
  <input type="checkbox" class="switch-input" id="toggle" />
  <label class="switch-label" for="toggle">Enable notifications</label>
</div>
```

## Utility Classes

### Display
```html
<div class="d-flex justify-center align-center gap-md">
  Centered flex container with gap
</div>
```

### Spacing
```html
<div class="mt-lg mb-md p-xl">
  Margin top large, margin bottom medium, padding extra large
</div>
```

### Text
```html
<p class="text-center text-lg font-bold text-primary">
  Centered, large, bold, primary color text
</p>
```

### Background & Borders
```html
<div class="bg-primary text-white rounded-lg shadow-md p-md">
  Styled container
</div>
```

## Scroll Animation Utilities

The application includes JavaScript utilities for scroll-based animations in `utils/scrollAnimations.ts`:

### Initialize Scroll Animations
```typescript
import { initAllScrollAnimations } from './utils/scrollAnimations';

useEffect(() => {
  const cleanup = initAllScrollAnimations();
  return cleanup;
}, []);
```

### Smooth Scroll
```typescript
import { smoothScrollTo } from './utils/scrollAnimations';

smoothScrollTo('section-id', 80); // Scroll to element with 80px offset
```

### Check if Element is in Viewport
```typescript
import { isInViewport } from './utils/scrollAnimations';

if (isInViewport(element, 100)) {
  // Element is in viewport with 100px offset
}
```

## Accessibility

### Reduced Motion Support

All animations respect the user's motion preferences. If a user has `prefers-reduced-motion: reduce` set, animations will be disabled or significantly reduced.

```css
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

### Focus States

All interactive elements have visible focus states for keyboard navigation:

```css
.btn:focus-visible {
  outline: 2px solid var(--primary-color);
  outline-offset: 2px;
}
```

## Performance Optimization

### Will Change

For complex animations, use `will-change` to optimize performance:

```html
<div class="will-change-transform hover-lift">
  Optimized animation
</div>
```

### CSS Transforms

All animations use CSS transforms instead of layout properties for better performance:

```css
/* Good - uses transform */
.hover-lift:hover {
  transform: translateY(-4px);
}

/* Avoid - triggers layout */
.hover-lift:hover {
  top: -4px;
}
```

## Best Practices

1. **Use CSS Variables** - Always use CSS variables for colors, spacing, and timing
2. **Respect Motion Preferences** - Test with `prefers-reduced-motion: reduce`
3. **Keep Animations Short** - 200-400ms for most transitions
4. **Use Appropriate Easing** - `ease-out` for entrances, `ease-in` for exits
5. **Optimize Performance** - Use transforms and opacity for animations
6. **Test Accessibility** - Ensure keyboard navigation and screen reader support
7. **Mobile First** - Test animations on mobile devices for performance

## Examples

### Animated Card Grid
```html
<div class="card-grid">
  <div class="card card-hover scroll-reveal-stagger">Card 1</div>
  <div class="card card-hover scroll-reveal-stagger">Card 2</div>
  <div class="card card-hover scroll-reveal-stagger">Card 3</div>
</div>
```

### Animated Button with Loading State
```typescript
const [loading, setLoading] = useState(false);

<button 
  className={`btn btn-primary btn-transition ${loading ? 'btn-loading' : ''}`}
  disabled={loading}
>
  {loading ? 'Loading...' : 'Submit'}
</button>
```

### Form with Validation
```html
<div class="form-group">
  <label class="form-label form-label-required">Email</label>
  <input 
    type="email" 
    class="form-input form-input-error" 
    placeholder="Enter email"
  />
  <div class="form-error-message">
    ⚠️ Please enter a valid email address
  </div>
</div>
```

## Requirements Implemented

This styling system implements the following requirements:

- **1.5** - Responsive and animated user interface with smooth transitions
- **7.1** - CSS animations for page transitions (200-400ms duration)
- **7.2** - Visual feedback with smooth transitions on hover
- **7.3** - Loading animations when fetching data
- **7.4** - Scroll animations for product listings
- **7.5** - Animations don't impact page load performance beyond 100ms

All animations respect `prefers-reduced-motion` for accessibility.
