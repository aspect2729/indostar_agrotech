# Implementation Plan

- [x] 1. Set up design system foundation





  - Create theme configuration file with colors, spacing, typography, and border radius values
  - Set up CSS custom properties in variables.css
  - Create utility classes for common patterns (flexbox, spacing, text styles)
  - Create animation keyframes for common transitions
  - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 6.1, 6.2, 6.3_

- [x] 2. Implement NavigationDrawer component






  - [x] 2.1 Create NavigationDrawer component with slide-in animation




    - Build drawer container with overlay
    - Implement slide animation from left (300ms ease-out)
    - Add click-outside-to-close functionality
    - _Requirements: 1.2, 6.1_
  
  - [x] 2.2 Create DrawerHeader with logo and tagline


    - Add brand logo component
    - Style tagline text
    - _Requirements: 1.3_
  

  - [x] 2.3 Create DrawerMenu with navigation items

    - Build menu item component with icon and label
    - Implement navigation routing on item click
    - Add active state highlighting
    - Close drawer after navigation
    - _Requirements: 1.3, 1.4, 7.1, 7.5_
  

  - [x] 2.4 Create DrawerFooter with pause deliveries toggle

    - Implement toggle switch component
    - Add version number display
    - Wire up pause deliveries functionality
    - _Requirements: 7.2, 7.3, 7.4_
  
  - [x] 2.5 Write property test for NavigationDrawer


    - **Property 1: Navigation drawer toggle behavior**
    - **Validates: Requirements 1.2**
  
  - [x] 2.6 Write property test for navigation routing

    - **Property 2: Navigation item routing**
    - **Validates: Requirements 1.4**

- [x] 3. Implement TopHeader component









  - [x] 3.1 Create TopHeader with hamburger menu, title, and action icons


    - Build header container with fixed positioning
    - Add hamburger menu button
    - Implement notification bell icon with badge
    - Implement cart icon with count badge
    - Style page title
    - _Requirements: 1.1, 4.1, 4.2, 4.3_
  
  - [x] 3.2 Wire up header icon click handlers


    - Connect hamburger to drawer toggle
    - Connect notification icon to notifications page
    - Connect cart icon to cart page
    - _Requirements: 4.4, 4.5_
  
  - [x] 3.3 Write property tests for header functionality


    - **Property 11: Notification badge visibility**
    - **Property 12: Cart badge display**
    - **Property 13: Icon navigation behavior**
    - **Validates: Requirements 4.2, 4.3, 4.4, 4.5**

- [x] 4. Implement BottomNavigation component





  - [x] 4.1 Create BottomNavigation with five nav items


    - Build fixed bottom navigation bar
    - Create nav item component with icon and label
    - Implement elevated center item (Products) with circular background
    - Add active state highlighting
    - _Requirements: 1.5, 9.1, 9.3, 9.5_
  

  - [x] 4.2 Implement navigation routing

    - Wire up click handlers for each nav item
    - Update active state based on current route
    - Add smooth transition animations
    - _Requirements: 9.2, 9.4_
  
  - [x] 4.3 Write property tests for bottom navigation


    - **Property 30: Active navigation highlighting**
    - **Property 31: Bottom navigation item routing**
    - **Validates: Requirements 9.2, 9.4**

- [x] 5. Implement ProductCard component



  - [x] 5.1 Create ProductCard layout structure


    - Build card container with white background and shadow
    - Add product image with rounded corners
    - Display product name, brand, and volume
    - Implement pricing display with discount logic
    - Add discount badge when applicable
    - _Requirements: 2.1, 2.2, 2.5_
  
  - [x] 5.2 Add action buttons to ProductCard

    - Create Subscribe button with yellow background
    - Create Buy Once button with white background and blue border
    - Add share icon button
    - Implement button click handlers
    - Prevent button clicks from triggering card click
    - _Requirements: 2.3, 2.4, 11.1, 11.2, 11.4_
  
  - [x] 5.3 Add ProductCard interactions

    - Implement card click navigation to product detail
    - Add button hover effects (darken by 10%)
    - Implement long press for quick actions menu
    - Add button tap feedback animations
    - _Requirements: 6.2, 8.2, 8.3, 8.4, 11.3_
  
  - [x] 5.4 Write property tests for ProductCard


    - **Property 3: Product card structure completeness**
    - **Property 4: Discount display consistency**
    - **Property 5: Product card action buttons presence**
    - **Property 6: Share functionality trigger**
    - **Property 7: Product image styling consistency**
    - **Property 26: Product card navigation**
    - **Property 27: Button event propagation prevention**
    - **Validates: Requirements 2.1, 2.2, 2.3, 2.4, 2.5, 8.2, 8.3**

- [x] 6. Implement CategoryTabs component





  - [x] 6.1 Create CategoryTabs with horizontal scrolling


    - Build tabs container with horizontal scroll
    - Create tab item component
    - Implement active tab indicator with underline
    - Add smooth scroll behavior
    - Hide scrollbar for clean appearance
    - _Requirements: 3.1, 3.2, 3.4_
  
  - [x] 6.2 Implement category filtering logic


    - Wire up tab click to filter products
    - Reset scroll position on category change
    - Animate indicator sliding to new position
    - _Requirements: 3.3, 3.5, 6.5_
  
  - [x] 6.3 Write property tests for CategoryTabs


    - **Property 8: Category tab selection highlighting**
    - **Property 9: Category filtering accuracy**
    - **Property 10: Category switch scroll reset**
    - **Property 22: Tab indicator animation**
    - **Validates: Requirements 3.2, 3.3, 3.5, 6.5**

- [x] 7. Implement ProductGrid component





  - [x] 7.1 Create responsive ProductGrid layout


    - Build grid container with responsive columns (1/2/3 based on viewport)
    - Implement consistent spacing between cards (16px mobile, 20px tablet, 24px desktop)
    - Add proper padding around grid
    - _Requirements: 8.5, 12.3_
  
  - [x] 7.2 Add loading and empty states

    - Create skeleton screen matching product card layout
    - Implement empty state with illustration and message
    - Add error state with retry button
    - Implement fade-in animation for loaded content
    - _Requirements: 6.3, 13.1, 13.2, 13.3, 13.5_
  
  - [x] 7.3 Write property tests for ProductGrid


    - **Property 29: Product grid spacing consistency**
    - **Property 39: Responsive grid column adjustment**
    - **Property 42: Loading skeleton layout matching**
    - **Property 43: Error state retry button**
    - **Property 45: Content load transition**
    - **Validates: Requirements 8.5, 12.3, 13.1, 13.3, 13.5**

- [x] 8. Implement Layout component





  - [x] 8.1 Create main Layout wrapper


    - Build layout container with TopHeader, content area, and BottomNavigation
    - Implement responsive behavior (show/hide bottom nav based on viewport)
    - Add proper spacing and padding
    - Integrate NavigationDrawer
    - _Requirements: 1.5, 9.1, 12.1, 12.2_
  
  - [x] 8.2 Implement responsive layout switching


    - Show bottom navigation on mobile (< 768px)
    - Adjust layout for tablet and desktop
    - Ensure proper z-index stacking
    - _Requirements: 12.1, 12.2_

- [x] 9. Update HomePage with new design




  - [x] 9.1 Redesign HomePage hero section


    - Update hero section with new color scheme
    - Improve visual hierarchy
    - Add smooth scroll animations
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 6.3_
  
  - [x] 9.2 Update HomePage product sections


    - Replace existing product displays with ProductCard components
    - Add CategoryTabs for filtering
    - Implement ProductGrid layout
    - _Requirements: 2.1, 2.2, 2.3, 3.1, 3.2_

- [x] 10. Update ProductCatalog page




  - [x] 10.1 Rebuild ProductCatalog with new components


    - Integrate CategoryTabs at the top
    - Replace product list with ProductGrid
    - Use ProductCard for each product
    - Add loading states
    - _Requirements: 2.1, 2.2, 2.3, 3.1, 3.2, 3.3, 13.1, 13.4_
  
  - [x] 10.2 Implement product filtering and sorting


    - Wire up category filtering
    - Maintain filter state in URL
    - Add smooth transitions between filter changes
    - _Requirements: 3.3, 3.5_

- [x] 11. Update ProductDetail page




  - [x] 11.1 Redesign ProductDetail layout


    - Update image gallery with rounded corners
    - Improve product information layout
    - Style Subscribe and Buy Once buttons consistently
    - Add share functionality
    - _Requirements: 2.3, 2.4, 2.5, 11.1, 11.2, 11.4_
  
  - [x] 11.2 Add product detail interactions


    - Implement image zoom/carousel
    - Add quantity selector
    - Wire up Subscribe and Buy Once actions
    - _Requirements: 2.3, 6.2_

- [x] 12. Update Cart page





  - [x] 12.1 Redesign Cart with card-based layout


    - Update cart item cards with new styling
    - Improve quantity controls
    - Style checkout button with primary color
    - Add empty cart state
    - _Requirements: 5.1, 5.2, 5.4, 13.2_
  
  - [x] 12.2 Add cart interactions


    - Implement smooth remove animations
    - Add quantity change animations
    - Show loading states during updates
    - _Requirements: 6.2, 13.4_

- [x] 13. Update Subscriptions page




  - [x] 13.1 Redesign subscription cards


    - Update subscription item cards with new styling
    - Add pause/resume toggle with smooth animation
    - Improve subscription details display
    - _Requirements: 5.1, 5.2, 5.4, 6.1_
  
  - [x] 13.2 Implement subscription management


    - Wire up pause/resume functionality
    - Add edit subscription flow
    - Show loading and success states
    - _Requirements: 7.3, 13.4_

- [x] 14. Update OrderHistory page




  - [x] 14.1 Redesign order history cards


    - Update order cards with new styling
    - Improve order status display
    - Add order detail expansion
    - _Requirements: 5.1, 5.2, 5.4_
  
  - [x] 14.2 Add order history interactions


    - Implement order detail modal/expansion
    - Add reorder functionality
    - Show loading states
    - _Requirements: 6.2, 13.4_

- [x] 15. Implement responsive design





  - [x] 15.1 Add responsive breakpoints and media queries


    - Implement mobile-first CSS
    - Add breakpoints for tablet and desktop
    - Test layouts at all breakpoints
    - _Requirements: 12.1, 12.2, 12.3_
  
  - [x] 15.2 Optimize images for responsive display


    - Implement responsive image loading with srcset
    - Add lazy loading for below-fold images
    - Use WebP format with fallbacks
    - _Requirements: 12.4_
  
  - [x] 15.3 Write property tests for responsive behavior


    - **Property 39: Responsive grid column adjustment**
    - **Property 40: Responsive image sizing**
    - **Property 41: Touch target size maintenance**
    - **Validates: Requirements 12.3, 12.4, 12.5**

- [x] 16. Implement accessibility features





  - [x] 16.1 Add ARIA labels and semantic HTML

    - Add aria-labels to icon-only buttons
    - Use semantic HTML elements
    - Implement focus management for drawer
    - Add keyboard navigation support
    - _Requirements: 8.1_
  
  - [x] 16.2 Ensure color contrast and touch targets


    - Verify color contrast ratios (4.5:1 minimum)
    - Ensure touch targets are at least 44x44px
    - Test with screen readers
    - _Requirements: 5.2, 8.1_
  

  - [x] 16.3 Write property tests for accessibility

    - **Property 25: Touch target minimum size**
    - **Validates: Requirements 8.1**

- [x] 17. Implement animations and transitions






  - [x] 17.1 Add micro-interactions

    - Implement button hover and tap animations
    - Add page transition animations
    - Create loading animations
    - Implement scroll animations
    - _Requirements: 6.1, 6.2, 6.3, 6.5_
  


  - [x] 17.2 Optimize animation performance

    - Use transform and opacity for animations
    - Add will-change for complex animations
    - Implement prefers-reduced-motion
    - Test animation performance (60fps target)
    - _Requirements: 6.4_

  
  - [x] 17.3 Write property tests for animations

    - **Property 19: Drawer animation timing**
    - **Property 20: Button interaction feedback**
    - **Property 21: Content load animation**
    - **Property 22: Tab indicator animation**
    - **Validates: Requirements 6.1, 6.2, 6.3, 6.5**

- [x] 18. Update typography system





  - [x] 18.1 Implement typography scale

    - Apply font sizes for product names (16-18px medium)
    - Apply font sizes for prices (20-24px bold)
    - Apply font sizes for page titles (20-22px semi-bold)
    - Apply font sizes for body text (14-16px regular)
    - Use system fonts for optimal performance
    - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5_
  

  - [x] 18.2 Write property tests for typography

    - **Property 32: Product name typography**
    - **Property 33: Price typography**
    - **Property 34: Page title typography**
    - **Property 35: Body text typography**
    - **Property 36: System font usage**
    - **Validates: Requirements 10.1, 10.2, 10.3, 10.4, 10.5**

- [x] 19. Implement color system






  - [x] 19.1 Apply color palette throughout application

    - Use primary yellow/gold (#F4C430) for primary actions
    - Use dark gray (#333333) for primary text
    - Use medium gray (#666666) for secondary text
    - Use blue (#4A90E2) for links and secondary actions
    - Use white (#FFFFFF) for cards and light gray (#F5F5F5) for backgrounds
    - Use green (#00C853) for discount badges
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5_
  

  - [x] 19.2 Write property tests for color consistency

    - **Property 14: Primary action color consistency**
    - **Property 15: Text color hierarchy**
    - **Property 16: Interactive element color scheme**
    - **Property 17: Background color consistency**
    - **Property 18: Discount badge styling**
    - **Validates: Requirements 5.1, 5.2, 5.3, 5.4, 5.5**


- [x] 20. Update distributor dashboard

  - [x] 20.1 Apply new design system to distributor pages


    - Update BulkOrderForm with new styling
    - Update DistributorDashboard with new layout
    - Update DistributorOrderHistory with card-based design
    - Integrate NavigationDrawer and TopHeader
    - _Requirements: 1.1, 1.2, 1.3, 4.1, 5.1, 5.2, 5.4_

- [x] 21. Update owner dashboard









  - [x] 21.1 Apply new design system to owner pages



    - Update OwnerDashboard with new layout
    - Update ProductManagement with ProductCard components
    - Update InventoryManagement with new styling
    - Update OrderManagement with card-based design
    - Update Analytics with new chart styling
    - Integrate NavigationDrawer and TopHeader
    - _Requirements: 1.1, 1.2, 1.3, 4.1, 5.1, 5.2, 5.4_

- [x] 22. Implement loading states






  - [x] 22.1 Create skeleton screens for all pages

    - Build skeleton components matching actual content layout
    - Implement skeleton for ProductCard
    - Implement skeleton for product list
    - Implement skeleton for order cards
    - _Requirements: 13.1_

  
  - [x] 22.2 Add loading indicators

    - Create spinner component
    - Add non-blocking loading indicators
    - Implement progress indicators for long operations
    - _Requirements: 13.4_
  

  - [x] 22.3 Write property tests for loading states

    - **Property 42: Loading skeleton layout matching**
    - **Property 44: Non-blocking loading indicators**
    - **Validates: Requirements 13.1, 13.4**

- [x] 23. Implement error states






  - [x] 23.1 Create error components

    - Build error message component
    - Create retry button component
    - Implement empty state component with illustration
    - _Requirements: 13.2, 13.3_
  

  - [x] 23.2 Add error handling throughout application

    - Add error boundaries for major sections
    - Implement network error handling
    - Add user input validation with error messages
    - _Requirements: 13.3_
  

  - [x] 23.3 Write property tests for error states

    - **Property 43: Error state retry button**
    - **Validates: Requirements 13.3**

- [x] 24. Performance optimization






  - [x] 24.1 Implement code splitting and lazy loading

    - Lazy load route components
    - Lazy load heavy components (charts, modals)
    - Implement image lazy loading
    - _Requirements: 12.4_
  

  - [x] 24.2 Optimize bundle size

    - Analyze bundle size
    - Remove unused dependencies
    - Optimize imports
    - Enable compression
    - _Requirements: 6.4_

- [ ] 25. Cross-browser testing
  - [x] 25.1 Test on all supported browsers




    - Test on Chrome/Edge (last 2 versions)
    - Test on Firefox (last 2 versions)
    - Test on Safari (last 2 versions)
    - Test on iOS Safari (last 2 versions)
    - Test on Android Chrome (last 2 versions)
    - _Requirements: All_
-

- [x] 26. Final checkpoint - Ensure all tests pass











  - Ensure all tests pass, ask the user if questions arise.