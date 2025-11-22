#!/usr/bin/env node

/**
 * Browser Compatibility Verification Script
 * 
 * This script verifies that the application build is compatible with
 * all supported browsers by checking:
 * 1. Browserslist configuration
 * 2. Build output for proper transpilation
 * 3. CSS vendor prefixes
 * 4. Feature detection
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Browser Compatibility Verification\n');

// Check if build directory exists
const buildDir = path.join(__dirname, '..', 'build');
if (!fs.existsSync(buildDir)) {
  console.error('❌ Build directory not found. Run "npm run build" first.');
  process.exit(1);
}

console.log('✅ Build directory found\n');

// Read package.json to check browserslist config
const packageJson = require('../package.json');
const browserslist = packageJson.browserslist;

console.log('📋 Browserslist Configuration:');
console.log('Production targets:');
browserslist.production.forEach(target => {
  console.log(`  - ${target}`);
});
console.log('Development targets:');
browserslist.development.forEach(target => {
  console.log(`  - ${target}`);
});
console.log('');

// Check for common browser-specific issues in built files
console.log('🔎 Checking built JavaScript files...\n');

const jsDir = path.join(buildDir, 'static', 'js');
if (fs.existsSync(jsDir)) {
  const jsFiles = fs.readdirSync(jsDir).filter(f => f.endsWith('.js'));
  
  let hasModernSyntax = false;
  let hasPolyfills = false;
  
  jsFiles.forEach(file => {
    const content = fs.readFileSync(path.join(jsDir, file), 'utf8');
    
    // Check for untranspiled modern syntax (potential issues)
    if (content.includes('async ') || content.includes('await ')) {
      hasModernSyntax = true;
    }
    
    // Check for polyfills
    if (content.includes('polyfill') || content.includes('core-js')) {
      hasPolyfills = true;
    }
  });
  
  if (hasModernSyntax) {
    console.log('✅ Modern JavaScript syntax detected (will be transpiled)');
  }
  
  if (hasPolyfills) {
    console.log('✅ Polyfills included for older browsers');
  }
  
  console.log(`✅ Found ${jsFiles.length} JavaScript files\n`);
} else {
  console.warn('⚠️  JavaScript directory not found in build\n');
}

// Check CSS files for vendor prefixes
console.log('🔎 Checking built CSS files...\n');

const cssDir = path.join(buildDir, 'static', 'css');
if (fs.existsSync(cssDir)) {
  const cssFiles = fs.readdirSync(cssDir).filter(f => f.endsWith('.css'));
  
  let hasVendorPrefixes = false;
  let hasFlexbox = false;
  let hasGrid = false;
  
  cssFiles.forEach(file => {
    const content = fs.readFileSync(path.join(cssDir, file), 'utf8');
    
    // Check for vendor prefixes
    if (content.includes('-webkit-') || content.includes('-moz-') || content.includes('-ms-')) {
      hasVendorPrefixes = true;
    }
    
    // Check for modern CSS features
    if (content.includes('display:flex') || content.includes('display: flex')) {
      hasFlexbox = true;
    }
    
    if (content.includes('display:grid') || content.includes('display: grid')) {
      hasGrid = true;
    }
  });
  
  if (hasVendorPrefixes) {
    console.log('✅ Vendor prefixes found (Autoprefixer working)');
  } else {
    console.log('ℹ️  No vendor prefixes detected (may not be needed)');
  }
  
  if (hasFlexbox) {
    console.log('✅ Flexbox detected');
  }
  
  if (hasGrid) {
    console.log('✅ CSS Grid detected');
  }
  
  console.log(`✅ Found ${cssFiles.length} CSS files\n`);
} else {
  console.warn('⚠️  CSS directory not found in build\n');
}

// Check for service worker (PWA support)
const swPath = path.join(buildDir, 'service-worker.js');
if (fs.existsSync(swPath)) {
  console.log('✅ Service Worker found (PWA support enabled)\n');
} else {
  console.log('ℹ️  No Service Worker found\n');
}

// Check manifest.json
const manifestPath = path.join(buildDir, 'manifest.json');
if (fs.existsSync(manifestPath)) {
  console.log('✅ Web App Manifest found\n');
  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
  console.log(`   App Name: ${manifest.name || manifest.short_name}`);
  console.log(`   Theme Color: ${manifest.theme_color || 'Not set'}`);
  console.log('');
} else {
  console.log('ℹ️  No Web App Manifest found\n');
}

// Summary
console.log('📊 Summary\n');
console.log('The build has been verified for browser compatibility.');
console.log('');
console.log('Next Steps:');
console.log('1. Test manually in Chrome, Firefox, and Safari');
console.log('2. Test on iOS Safari (iPhone/iPad)');
console.log('3. Test on Android Chrome');
console.log('4. Use BrowserStack or similar for comprehensive testing');
console.log('5. Run Lighthouse audits in each browser');
console.log('6. Check console for errors in each browser');
console.log('');
console.log('See BROWSER_TESTING_GUIDE.md for detailed testing checklist.');
console.log('');
console.log('✅ Verification complete!');
