# Manual Testing Checklist - Indostar E-commerce Application

Use this checklist to manually verify all functionality before deployment.

## Prerequisites
- [ ] Backend server running on http://localhost:8000
- [ ] Frontend server running on http://localhost:3000
- [ ] MongoDB running and seeded with test data
- [ ] Browser developer tools open (for checking console errors)

## 1. Consumer Portal Testing

### Homepage
- [ ] Navigate to http://localhost:3000
- [ ] Verify hero section displays with company branding
- [ ] Check that featured products carousel works
- [ ] Verify all 5 category cards display (Jaggery, Oil, Chutney Powder, Pickles, Milk)
- [ ] Click each category card and verify navigation
- [ ] Check scroll animations work smoothly
- [ ] Verify no console errors

### Product Catalog
- [ ] Click "Shop Now" or navigate to products page
- [ ] Verify product grid displays with images
- [ ] Test category filter dropdown
- [ ] Test search bar with keyword "jaggery"
- [ ] Verify product cards show price, name, and image
- [ ] Test hover effects on product cards
- [ ] Check pagination if more than 20 products
- [ ] Verify loading skeleton appears during data fetch

### Product Detail
- [ ] Click on any product card
- [ ] Verify product detail page displays
- [ ] Check product images, description, price
- [ ] Verify nutritional info displays (if available)
- [ ] Test quantity selector (increase/decrease)
- [ ] Click "Add to Cart" button
- [ ] Verify success message appears
- [ ] Check cart icon updates with item count

### Shopping Cart
- [ ] Click cart icon in navigation
- [ ] Verify cart items display correctly
- [ ] Test quantity adjustment (+/- buttons)
- [ ] Verify subtotal updates when quantity changes
- [ ] Check tax calculation (18% GST)
- [ ] Verify shipping cost displays
- [ ] Test "Remove" button for cart items
- [ ] Fill in delivery address form
- [ ] Verify form validation (required fields)
- [ ] Click "Place Order" button
- [ ] Verify order confirmation message
- [ ] Check order appears in order history

### Order History
- [ ] Navigate to "My Orders" page
- [ ] Verify list of past orders displays
- [ ] Check order status indicators (pending, confirmed, etc.)
- [ ] Click on an order to view details
- [ ] Verify order items, total, and delivery address show correctly

## 2. Distributor Portal Testing

### Login as Distributor
- [ ] Logout if logged in as consumer
- [ ] Click "Login as Owner/Distributor"
- [ ] Enter distributor email (e.g., distributor@example.com)
- [ ] Verify redirect to distributor dashboard

### Distributor Dashboard
- [ ] Verify bulk product catalog displays
- [ ] Check wholesale pricing is shown (lower than consumer price)
- [ ] Verify "Bulk Order" section is visible
- [ ] Check recent orders summary displays

### Bulk Order Placement
- [ ] Select a product (jaggery or oil for inter-state)
- [ ] Enter bulk quantity (e.g., 50 units)
- [ ] Select delivery state (try both Karnataka and another state)
- [ ] Verify shipping cost calculation
- [ ] Check that inter-state costs more than in-state
- [ ] Fill in delivery address
- [ ] Click "Place Bulk Order"
- [ ] Verify order confirmation
- [ ] Check order appears in distributor order history

### Distributor Order History
- [ ] Navigate to "My Orders"
- [ ] Verify all distributor orders display
- [ ] Check order status tracking
- [ ] Verify reorder functionality (if implemented)

## 3. Owner Dashboard Testing

### Login as Owner
- [ ] Logout if logged in
- [ ] Click "Login as Owner/Distributor"
- [ ] Enter owner email (owner@indostar.com)
- [ ] Verify redirect to owner dashboard

### Inventory Management
- [ ] Navigate to "Inventory" tab
- [ ] Verify all products list with current stock levels
- [ ] Check low-stock alerts display (red indicators)
- [ ] Click "Update Stock" on any product
- [ ] Enter new quantity
- [ ] Click "Save"
- [ ] Verify inventory updates immediately
- [ ] Check that low-stock alert appears/disappears based on threshold

### Order Management
- [ ] Navigate to "Orders" tab
- [ ] Verify all orders display (consumer + distributor)
- [ ] Check order filtering by status
- [ ] Check order filtering by user type
- [ ] Click on an order to view details
- [ ] Change order status (pending → confirmed)
- [ ] Verify status updates successfully
- [ ] Check that status change reflects in consumer/distributor view

### Product Management
- [ ] Navigate to "Products" tab
- [ ] Click "Add New Product"
- [ ] Fill in product details:
  - [ ] Name
  - [ ] Category
  - [ ] Description
  - [ ] Consumer price
  - [ ] Distributor price
  - [ ] Unit
  - [ ] Inter-state delivery checkbox
- [ ] Click "Create Product"
- [ ] Verify product appears in list
- [ ] Click "Edit" on a product
- [ ] Modify price
- [ ] Click "Save"
- [ ] Verify changes saved
- [ ] Click "Delete" on test product
- [ ] Verify product is soft-deleted (not visible to consumers)

### Analytics Dashboard
- [ ] Navigate to "Analytics" tab
- [ ] Verify sales chart displays
- [ ] Check popular products list
- [ ] Verify revenue metrics show
- [ ] Check category performance chart

## 4. Authentication & Authorization Testing

### Role-Based Access
- [ ] Login as consumer
- [ ] Try to access /owner/dashboard directly
- [ ] Verify redirect or access denied
- [ ] Try to access /distributor/dashboard
- [ ] Verify redirect or access denied
- [ ] Logout and login as distributor
- [ ] Try to access /owner/dashboard
- [ ] Verify access denied
- [ ] Logout and login as owner
- [ ] Verify access to all dashboards

### Token Expiration
- [ ] Login to any portal
- [ ] Wait for token to expire (or manually delete token from localStorage)
- [ ] Try to perform an action
- [ ] Verify redirect to login page
- [ ] Login again
- [ ] Verify can continue working

## 5. Error Handling Testing

### Form Validation
- [ ] Try to submit order without delivery address
- [ ] Verify validation error messages
- [ ] Try to create product with missing required fields
- [ ] Verify error messages display
- [ ] Try to update inventory with negative number
- [ ] Verify validation prevents it

### API Error Handling
- [ ] Stop backend server
- [ ] Try to load products page
- [ ] Verify error message displays
- [ ] Verify loading state doesn't hang
- [ ] Restart backend server
- [ ] Verify app recovers

### Insufficient Inventory
- [ ] Find a product with low stock (e.g., 2 units)
- [ ] Try to order more than available
- [ ] Verify error message: "Insufficient inventory"
- [ ] Verify order is not placed

## 6. UI/UX Testing

### Responsive Design
- [ ] Open browser developer tools
- [ ] Toggle device toolbar (mobile view)
- [ ] Test on iPhone SE (375px)
- [ ] Test on iPad (768px)
- [ ] Test on desktop (1920px)
- [ ] Verify layout adapts correctly
- [ ] Check navigation menu on mobile
- [ ] Verify all buttons are clickable on mobile

### Animations
- [ ] Scroll down homepage
- [ ] Verify scroll animations trigger
- [ ] Hover over buttons
- [ ] Verify hover effects work
- [ ] Navigate between pages
- [ ] Verify page transitions are smooth
- [ ] Check loading spinners appear during API calls

### Accessibility
- [ ] Tab through forms using keyboard
- [ ] Verify focus indicators visible
- [ ] Check color contrast (text vs background)
- [ ] Verify images have alt text
- [ ] Test with screen reader (if available)

## 7. Performance Testing

### Load Times
- [ ] Open Network tab in developer tools
- [ ] Reload homepage
- [ ] Verify page loads in < 2 seconds
- [ ] Check product images load progressively
- [ ] Verify no unnecessary API calls

### Browser Console
- [ ] Check console for errors (should be none)
- [ ] Check console for warnings (minimize if possible)
- [ ] Verify no 404 errors for resources

## 8. Data Integrity Testing

### Order Flow
- [ ] Note current inventory for a product
- [ ] Place an order for 3 units
- [ ] Check inventory decreased by 3
- [ ] Login as owner
- [ ] Verify order appears in order management
- [ ] Check order details match what was placed

### Concurrent Orders
- [ ] Open two browser windows
- [ ] Login as different consumers
- [ ] Both try to order the last 5 units of a product
- [ ] Verify only one order succeeds
- [ ] Verify other gets "insufficient inventory" error

## 9. Inter-State Delivery Testing

### Eligible Products
- [ ] Select jaggery product
- [ ] Enter Karnataka address
- [ ] Note shipping cost (should be ₹50)
- [ ] Change address to Maharashtra
- [ ] Note shipping cost (should be ₹150-200)
- [ ] Verify cost difference

### Non-Eligible Products
- [ ] Select chutney powder product
- [ ] Try to enter Maharashtra address
- [ ] Verify error or restriction message
- [ ] Verify only Karnataka addresses accepted

## 10. Final Checks

### Documentation
- [ ] Read README.md
- [ ] Verify setup instructions are clear
- [ ] Read DEPLOYMENT.md
- [ ] Verify deployment steps are complete

### Environment Variables
- [ ] Check .env.example files exist
- [ ] Verify all required variables documented
- [ ] Check sensitive data not committed to git

### Database
- [ ] Verify seed data script works
- [ ] Check database indexes created
- [ ] Verify data validation works

## Issues Found

Document any issues found during testing:

| Issue # | Description | Severity | Status |
|---------|-------------|----------|--------|
| 1       |             |          |        |
| 2       |             |          |        |
| 3       |             |          |        |

## Sign-Off

- [ ] All critical tests passed
- [ ] All high-priority tests passed
- [ ] Known issues documented
- [ ] Application ready for next phase

**Tested By:** ___________________  
**Date:** ___________________  
**Environment:** ___________________  
**Notes:** ___________________
