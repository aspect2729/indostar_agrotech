# Browser Testing Guide

## Overview

This guide outlines the browser testing strategy for the IndoStar e-commerce application, covering all supported browsers as specified in the requirements.

## Supported Browsers

According to the design specification, the application supports:

- **Chrome/Edge**: Last 2 versions
- **Firefox**: Last 2 versions
- **Safari**: Last 2 versions
- **iOS Safari**: Last 2 versions
- **Android Chrome**: Last 2 versions

## Browser Configuration

The `browserslist` configuration in `package.json` defines browser support:

```json
"browserslist": {
  "production": [
    ">0.2%",
    "not dead",
    "not op_mini all"
  ],
  "development": [
    "last 1 chrome version",
    "last 1 firefox version",
    "last 1 safari version"
  ]
}
```

## Automated Testing Approach

### 1. Unit and Integration Tests

All existing Jest tests run in a jsdom environment that simulates browser behavior:

```bash
npm test
```

### 2. Build Verification

Ensure the production build completes successfully with proper transpilation:

```bash
npm run build
```

This uses Babel with browserslist to transpile code for all supported browsers.

### 3. CSS Compatibility

The build process automatically adds vendor prefixes using PostCSS and Autoprefixer based on browserslist configuration.

## Manual Testing Checklist

### Desktop Browsers

#### Chrome (Latest 2 versions)
- [ ] Navigation drawer opens/closes smoothly
- [ ] Product cards display correctly
- [ ] Category tabs scroll horizontally
- [ ] Bottom navigation (mobile view) works
- [ ] All animations run at 60fps
- [ ] Images load with proper lazy loading
- [ ] Forms validate correctly
- [ ] Cart functionality works
- [ ] Checkout process completes

#### Edge (Latest 2 versions)
- [ ] All Chrome checklist items
- [ ] Specific Edge rendering quirks verified

#### Firefox (Latest 2 versions)
- [ ] Navigation drawer opens/closes smoothly
- [ ] Product cards display correctly
- [ ] Category tabs scroll horizontally
- [ ] CSS Grid layouts render correctly
- [ ] Flexbox layouts work as expected
- [ ] All animations run smoothly
- [ ] Images load correctly
- [ ] Forms validate correctly

#### Safari (Latest 2 versions)
- [ ] Navigation drawer opens/closes smoothly
- [ ] Product cards display correctly
- [ ] Category tabs scroll horizontally
- [ ] Webkit-specific CSS properties work
- [ ] Touch events work on trackpad
- [ ] Images load correctly (WebP fallback)
- [ ] Date pickers work correctly
- [ ] Forms validate correctly

### Mobile Browsers

#### iOS Safari (Latest 2 versions)
- [ ] Touch targets are at least 44x44px
- [ ] Navigation drawer swipe works
- [ ] Product cards are touch-friendly
- [ ] Bottom navigation is accessible
- [ ] Scroll behavior is smooth
- [ ] Pinch-to-zoom disabled where appropriate
- [ ] Forms work with iOS keyboard
- [ ] Safe area insets respected
- [ ] Landscape orientation works
- [ ] Add to home screen works

#### Android Chrome (Latest 2 versions)
- [ ] Touch targets are at least 44x44px
- [ ] Navigation drawer swipe works
- [ ] Product cards are touch-friendly
- [ ] Bottom navigation is accessible
- [ ] Scroll behavior is smooth
- [ ] Forms work with Android keyboard
- [ ] Back button behavior correct
- [ ] Landscape orientation works
- [ ] PWA installation works

## Testing Tools

### Local Testing

1. **Chrome DevTools Device Mode**
   - Test responsive layouts
   - Simulate mobile devices
   - Test touch events
   - Throttle network and CPU

2. **Firefox Responsive Design Mode**
   - Test responsive layouts
   - Simulate mobile devices

3. **Safari Responsive Design Mode**
   - Test iOS Safari behavior
   - Test webkit-specific features

### Browser Testing Services

For comprehensive cross-browser testing, consider using:

1. **BrowserStack** (https://www.browserstack.com/)
   - Real device testing
   - Automated screenshot testing
   - Live interactive testing

2. **Sauce Labs** (https://saucelabs.com/)
   - Real device testing
   - Automated testing
   - Performance monitoring

3. **LambdaTest** (https://www.lambdatest.com/)
   - Real browser testing
   - Screenshot testing
   - Responsive testing

### Visual Regression Testing

Consider implementing visual regression testing with:

- **Percy** (https://percy.io/)
- **Chromatic** (https://www.chromatic.com/)
- **BackstopJS** (https://github.com/garris/BackstopJS)

## Common Browser Issues and Solutions

### Safari-Specific Issues

1. **Date Input Fallback**
   - Safari has different date picker UI
   - Test date input formatting

2. **Flexbox Bugs**
   - Use explicit flex properties
   - Test flex-shrink behavior

3. **Position: sticky**
   - May require -webkit- prefix
   - Test with polyfill if needed

### iOS Safari Issues

1. **100vh Issue**
   - Use `height: -webkit-fill-available`
   - Account for address bar

2. **Touch Event Delays**
   - Use `touch-action: manipulation`
   - Avoid 300ms click delay

3. **Scroll Momentum**
   - Use `-webkit-overflow-scrolling: touch`

### Firefox Issues

1. **Scrollbar Styling**
   - Use Firefox-specific scrollbar properties
   - Test scrollbar-width and scrollbar-color

2. **CSS Grid**
   - Test grid-gap vs gap property
   - Verify grid auto-placement

## Performance Testing

Test performance metrics across all browsers:

1. **First Contentful Paint (FCP)**: < 1.5s
2. **Largest Contentful Paint (LCP)**: < 2.5s
3. **Time to Interactive (TTI)**: < 3.5s
4. **Cumulative Layout Shift (CLS)**: < 0.1
5. **First Input Delay (FID)**: < 100ms

Use Chrome Lighthouse, Firefox DevTools, or Safari Web Inspector.

## Accessibility Testing

Test with browser accessibility tools:

1. **Chrome**: Lighthouse Accessibility Audit
2. **Firefox**: Accessibility Inspector
3. **Safari**: Accessibility Inspector
4. **axe DevTools**: Browser extension

## Testing Workflow

### Pre-Release Testing

1. Run all automated tests: `npm test`
2. Build production bundle: `npm run build`
3. Test locally in Chrome, Firefox, Safari
4. Test on physical iOS device
5. Test on physical Android device
6. Run Lighthouse audits
7. Check console for errors in all browsers

### Post-Deployment Testing

1. Test production URL in all supported browsers
2. Verify CDN assets load correctly
3. Test on real devices
4. Monitor error tracking (Sentry, etc.)
5. Check analytics for browser-specific issues

## Reporting Issues

When reporting browser-specific issues, include:

1. Browser name and version
2. Operating system and version
3. Device (if mobile)
4. Steps to reproduce
5. Expected vs actual behavior
6. Screenshots or video
7. Console errors
8. Network tab information

## Continuous Monitoring

Set up monitoring for:

1. Browser usage analytics
2. JavaScript errors by browser
3. Performance metrics by browser
4. Feature support detection
5. User feedback by browser

## Resources

- [Can I Use](https://caniuse.com/) - Browser feature support
- [MDN Browser Compatibility](https://developer.mozilla.org/en-US/docs/Web/API) - API compatibility
- [Browserslist](https://browsersl.ist/) - Query browserslist config
- [Autoprefixer](https://autoprefixer.github.io/) - CSS prefix tool
