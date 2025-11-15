#!/usr/bin/env node

/**
 * Automated Test Runner
 * Runs all tests: unit, integration, e2e
 */

import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, '..');

console.log('🧪 Starting Automated Test Suite...\n');

// Check if servers are running
async function checkServers() {
  console.log('📡 Checking servers...');
  
  const checks = [
    { name: 'API Server', url: 'http://localhost:3001/api/health' },
    { name: 'Frontend', url: 'http://localhost:8080' }
  ];
  
  for (const check of checks) {
    try {
      const response = await fetch(check.url);
      if (response.ok) {
        console.log(`✅ ${check.name} is running`);
      } else {
        console.log(`⚠️  ${check.name} returned status ${response.status}`);
      }
    } catch (error) {
      console.log(`❌ ${check.name} is NOT running`);
      console.log(`   Please start servers with: npm run dev`);
      return false;
    }
  }
  
  console.log('');
  return true;
}

// Run tests
function runTests() {
  return new Promise((resolve, reject) => {
    console.log('🧪 Running test suite...\n');
    
    const vitest = spawn('npx', ['vitest', 'run', '--reporter=verbose'], {
      cwd: projectRoot,
      stdio: 'inherit',
      shell: true
    });
    
    vitest.on('close', (code) => {
      if (code === 0) {
        console.log('\n✅ All tests passed!');
        resolve();
      } else {
        console.log(`\n❌ Tests failed with code ${code}`);
        reject(new Error(`Tests failed with code ${code}`));
      }
    });
    
    vitest.on('error', (error) => {
      console.error('❌ Failed to run tests:', error);
      reject(error);
    });
  });
}

// Main execution
async function main() {
  try {
    const serversReady = await checkServers();
    
    if (!serversReady) {
      console.log('\n⚠️  Some servers are not running.');
      console.log('   Start them with: npm run dev');
      console.log('   Then run tests again.');
      process.exit(1);
    }
    
    await runTests();
    
    console.log('\n🎉 Test suite completed successfully!');
    console.log('📊 View detailed report above.');
    process.exit(0);
    
  } catch (error) {
    console.error('\n❌ Test suite failed:', error.message);
    process.exit(1);
  }
}

main();
