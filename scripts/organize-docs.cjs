/**
 * 📚 Long Sang Forge Documentation Organizer
 * Run: node scripts/organize-docs.cjs
 */

const fs = require('fs');
const path = require('path');

const PROJECT_ROOT = path.resolve(__dirname, '..');
const DOCS_ROOT = path.join(PROJECT_ROOT, '_DOCS');

// Category definitions
const CATEGORIES = {
  '01-ARCHITECTURE': {
    patterns: [/ARCHITECTURE/, /SYSTEM/, /FOUNDATION/]
  },
  '06-AI': {
    patterns: [/^AI_/, /BRAIN/, /COPILOT/]
  },
  '09-REPORTS': {
    patterns: [/REPORT/, /SUMMARY/, /PHASE/, /COMPLETION/, /HANDOFF/]
  },
  '04-DEPLOYMENT': {
    patterns: [/DEPLOY/, /SQL/, /MIGRATION/]
  },
  '05-GUIDES': {
    patterns: [/GUIDE/, /INSTRUCTION/, /README/]
  }
};

function categorizeFile(filename) {
  const upperName = filename.toUpperCase().replace(/\.MD$/, '');
  
  for (const [category, config] of Object.entries(CATEGORIES)) {
    if (config.patterns.some(p => p.test(upperName))) {
      return category;
    }
  }
  
  if (upperName.includes('PHASE') || upperName.includes('REPORT')) {
    return '09-REPORTS';
  }
  if (upperName.includes('AI') || upperName.includes('BRAIN')) {
    return '06-AI';
  }
  
  return '10-ARCHIVE';
}

function organize() {
  const files = fs.readdirSync(PROJECT_ROOT)
    .filter(f => f.endsWith('.md') && f !== 'README.md');
  
  let moved = 0;
  
  files.forEach(file => {
    const sourcePath = path.join(PROJECT_ROOT, file);
    const category = categorizeFile(file);
    const destPath = path.join(DOCS_ROOT, category, file);
    
    if (fs.existsSync(destPath)) {
      console.log(`⚠️ Skip ${file}`);
      return;
    }
    
    try {
      fs.renameSync(sourcePath, destPath);
      moved++;
      console.log(`✅ ${file} → ${category}`);
    } catch (err) {
      console.error(`❌ Failed: ${file}`);
    }
  });
  
  console.log(`\n📊 Moved ${moved} files`);
}

organize();
