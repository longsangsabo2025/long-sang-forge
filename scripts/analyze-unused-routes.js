#!/usr/bin/env node

/**
 * 🚀 ELON MUSK STYLE - Route Analysis Script
 *
 * Tìm:
 * 1. Routes trùng lặp (duplicate paths)
 * 2. Routes không được sử dụng trong frontend
 * 3. Routes bị quên (forgotten)
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Colors for output
const colors = {
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  reset: '\x1b[0m',
};

const log = {
  error: (msg) => console.log(`${colors.red}❌ ${msg}${colors.reset}`),
  success: (msg) => console.log(`${colors.green}✅ ${msg}${colors.reset}`),
  warn: (msg) => console.log(`${colors.yellow}⚠️  ${msg}${colors.reset}`),
  info: (msg) => console.log(`${colors.blue}ℹ️  ${msg}${colors.reset}`),
  header: (msg) => console.log(`\n${colors.cyan}${'='.repeat(60)}\n🚀 ${msg}\n${'='.repeat(60)}${colors.reset}\n`),
};

// Read server.js to extract all routes
function extractRoutesFromServer() {
  const serverPath = path.join(__dirname, '../api/server.js');
  const content = fs.readFileSync(serverPath, 'utf8');

  const routes = [];
  const routeRegex = /app\.use\(['"]([^'"]+)['"]/g;
  let match;

  while ((match = routeRegex.exec(content)) !== null) {
    const routePath = match[1];
    routes.push({
      path: routePath,
      line: content.substring(0, match.index).split('\n').length,
      fullMatch: match[0]
    });
  }

  return routes;
}

// Find duplicate routes
function findDuplicates(routes) {
  const pathCounts = {};
  const duplicates = [];

  routes.forEach(route => {
    if (!pathCounts[route.path]) {
      pathCounts[route.path] = [];
    }
    pathCounts[route.path].push(route);
  });

  Object.keys(pathCounts).forEach(path => {
    if (pathCounts[path].length > 1) {
      duplicates.push({
        path,
        count: pathCounts[path].length,
        occurrences: pathCounts[path]
      });
    }
  });

  return duplicates;
}

// Search for route usage in frontend
function searchRouteUsage(routePath) {
  const basePath = path.join(__dirname, '../src');
  const searchTerms = [
    routePath.replace('/api/', ''),
    routePath,
    routePath.split('/').pop(),
  ];

  let found = false;
  const foundIn = [];

  try {
    // Search in TypeScript/TSX files
    searchTerms.forEach(term => {
      try {
        const result = execSync(
          `grep -r -l "${term}" "${basePath}" --include="*.ts" --include="*.tsx" --include="*.js" --include="*.jsx" 2>/dev/null || echo ""`,
          { encoding: 'utf8', maxBuffer: 10 * 1024 * 1024 }
        );

        if (result && result.trim()) {
          const files = result.trim().split('\n').filter(f => f);
          files.forEach(file => {
            if (!foundIn.includes(file)) {
              foundIn.push(file);
              found = true;
            }
          });
        }
      } catch (e) {
        // Ignore errors
      }
    });
  } catch (e) {
    // Ignore
  }

  return { found, foundIn };
}

// Get all route files
function getAllRouteFiles() {
  const routesDir = path.join(__dirname, '../api/routes');
  const brainRoutesDir = path.join(__dirname, '../api/brain/routes');

  const routeFiles = [];

  // Get routes from api/routes
  if (fs.existsSync(routesDir)) {
    const files = fs.readdirSync(routesDir);
    files.forEach(file => {
      if (file.endsWith('.js') || file.endsWith('.ts')) {
        routeFiles.push({
          file: path.join(routesDir, file),
          name: file,
          type: 'route'
        });
      }
    });
  }

  // Get routes from api/brain/routes
  if (fs.existsSync(brainRoutesDir)) {
    const files = fs.readdirSync(brainRoutesDir);
    files.forEach(file => {
      if (file.endsWith('.js') || file.endsWith('.ts')) {
        routeFiles.push({
          file: path.join(brainRoutesDir, file),
          name: file,
          type: 'brain-route'
        });
      }
    });
  }

  return routeFiles;
}

// Main analysis
function main() {
  log.header('ROUTE ANALYSIS - ELON MUSK STYLE');

  // 1. Extract routes from server.js
  log.info('Extracting routes from server.js...');
  const routes = extractRoutesFromServer();
  log.success(`Found ${routes.length} route registrations`);

  // 2. Find duplicates
  log.info('\n🔍 Finding duplicate routes...');
  const duplicates = findDuplicates(routes);

  if (duplicates.length > 0) {
    log.error(`Found ${duplicates.length} duplicate route paths!`);
    duplicates.forEach(dup => {
      console.log(`\n${colors.red}⚠️  DUPLICATE: ${dup.path}${colors.reset}`);
      console.log(`   Registered ${dup.count} times:`);
      dup.occurrences.forEach((occ, idx) => {
        console.log(`   ${idx + 1}. Line ${occ.line}: ${occ.fullMatch}`);
      });
    });
  } else {
    log.success('No duplicate routes found!');
  }

  // 3. Get all route files
  log.info('\n📁 Analyzing route files...');
  const routeFiles = getAllRouteFiles();
  log.success(`Found ${routeFiles.length} route files`);

  // 4. Check route usage in frontend
  log.info('\n🔍 Checking route usage in frontend...');
  log.info('(This may take a moment...)');

  const usageReport = [];

  routes.forEach(route => {
    const { found, foundIn } = searchRouteUsage(route.path);
    usageReport.push({
      path: route.path,
      used: found,
      foundIn: foundIn.slice(0, 3), // Limit to 3 files
      line: route.line
    });
  });

  // 5. Categorize routes
  const unusedRoutes = usageReport.filter(r => !r.used);
  const usedRoutes = usageReport.filter(r => r.used);

  // 6. Print report
  log.header('ANALYSIS REPORT');

  console.log(`\n${colors.green}✅ Used Routes: ${usedRoutes.length}${colors.reset}`);
  console.log(`${colors.red}❌ Unused Routes: ${unusedRoutes.length}${colors.reset}`);
  console.log(`${colors.yellow}⚠️  Duplicate Routes: ${duplicates.length}${colors.reset}`);

  // Print unused routes
  if (unusedRoutes.length > 0) {
    log.header(`UNUSED ROUTES (${unusedRoutes.length})`);
    unusedRoutes.forEach(route => {
      console.log(`${colors.red}❌ ${route.path}${colors.reset}`);
      console.log(`   Registered at line ${route.line}`);
    });
  }

  // Print duplicate routes summary
  if (duplicates.length > 0) {
    log.header(`DUPLICATE ROUTES (${duplicates.length}) - CRITICAL!`);
    duplicates.forEach(dup => {
      console.log(`${colors.red}⚠️  ${dup.path} - Used ${dup.count} times${colors.reset}`);
      console.log(`   Last route will override previous ones!`);
    });
  }

  // 7. Generate JSON report
  const report = {
    timestamp: new Date().toISOString(),
    totalRoutes: routes.length,
    duplicateRoutes: duplicates.map(d => ({
      path: d.path,
      count: d.count,
      occurrences: d.occurrences.map(o => ({ line: o.line }))
    })),
    unusedRoutes: unusedRoutes.map(r => ({
      path: r.path,
      line: r.line
    })),
    usedRoutesCount: usedRoutes.length,
    unusedRoutesCount: unusedRoutes.length
  };

  const reportPath = path.join(__dirname, '../_DOCS/ROUTE_ANALYSIS_REPORT.json');
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  log.success(`\n📊 Full report saved to: ${reportPath}`);

  // 8. Recommendations
  log.header('RECOMMENDATIONS');

  if (duplicates.length > 0) {
    console.log(`${colors.yellow}1. FIX DUPLICATE ROUTES FIRST!${colors.reset}`);
    console.log('   - Routes with same path will conflict');
    console.log('   - Last registered route wins (others silently fail)');
    console.log('   - This is a CRITICAL BUG!\n');
  }

  if (unusedRoutes.length > 10) {
    console.log(`${colors.yellow}2. DELETE UNUSED ROUTES${colors.reset}`);
    console.log(`   - ${unusedRoutes.length} routes appear unused`);
    console.log('   - Verify before deleting (may be used in scripts/tests)\n');
  }

  console.log(`${colors.cyan}3. ADD ROUTE TRACKING${colors.reset}`);
  console.log('   - Log all API calls');
  console.log('   - Generate usage analytics\n');

  log.success('Analysis complete! 🚀');
}

// Run if called directly
if (require.main === module) {
  try {
    main();
  } catch (error) {
    log.error(`Error: ${error.message}`);
    console.error(error.stack);
    process.exit(1);
  }
}

module.exports = { main, extractRoutesFromServer, findDuplicates };


