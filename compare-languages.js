import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Read all language files
const localesPath = path.join(__dirname, 'src/i18n/locales');
const enFile = path.join(localesPath, 'en.json');
const ruFile = path.join(localesPath, 'ru.json');
const ukFile = path.join(localesPath, 'uk.json');
const frFile = path.join(localesPath, 'fr.json');

// Read English file as the reference
const enData = JSON.parse(fs.readFileSync(enFile, 'utf8'));

// Function to get all keys from an object recursively
function getAllKeys(obj, prefix = '') {
  let keys = [];
  for (const key in obj) {
    const fullKey = prefix ? `${prefix}.${key}` : key;
    if (typeof obj[key] === 'object' && obj[key] !== null && !Array.isArray(obj[key])) {
      keys = keys.concat(getAllKeys(obj[key], fullKey));
    } else {
      keys.push(fullKey);
    }
  }
  return keys;
}

// Get all keys from English file
const enKeys = getAllKeys(enData);
console.log(`English file has ${enKeys.length} keys`);

// Function to check missing keys
function checkMissingKeys(filePath, languageName) {
  try {
    const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    const fileKeys = getAllKeys(data);
    const missingKeys = enKeys.filter(key => !fileKeys.includes(key));
    
    console.log(`\n${languageName} (${filePath}):`);
    console.log(`  Total keys: ${fileKeys.length}`);
    console.log(`  Missing keys: ${missingKeys.length}`);
    
    if (missingKeys.length > 0) {
      console.log('  Missing keys:');
      missingKeys.forEach(key => console.log(`    - ${key}`));
    }
    
    return missingKeys;
  } catch (error) {
    console.log(`\n${languageName}: Error reading file - ${error.message}`);
    return enKeys; // All keys are missing if file can't be read
  }
}

// Check all language files
console.log('=== Language File Comparison ===');
const ruMissing = checkMissingKeys(ruFile, 'Russian');
const ukMissing = checkMissingKeys(ukFile, 'Ukrainian');
const frMissing = checkMissingKeys(frFile, 'French');

// Summary
console.log('\n=== Summary ===');
console.log(`Russian missing: ${ruMissing.length} keys`);
console.log(`Ukrainian missing: ${ukMissing.length} keys`);
console.log(`French missing: ${frMissing.length} keys`);

// Create a script to add missing keys
function createUpdateScript() {
  console.log('\n=== Creating update script ===');
  
  let script = `// Auto-generated script to add missing keys
// Run this to add missing translations

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Read current files
const enData = ${JSON.stringify(enData, null, 2)};
const ruData = JSON.parse(fs.readFileSync('src/i18n/locales/ru.json', 'utf8'));
const ukData = JSON.parse(fs.readFileSync('src/i18n/locales/uk.json', 'utf8'));
const frData = JSON.parse(fs.readFileSync('src/i18n/locales/fr.json', 'utf8'));

// Function to add missing keys recursively
function addMissingKeys(source, target, path = '') {
  for (const key in source) {
    const currentPath = path ? \`\${path}.\${key}\` : key;
    
    if (typeof source[key] === 'object' && source[key] !== null && !Array.isArray(source[key])) {
      if (!target[key]) {
        target[key] = {};
      }
      addMissingKeys(source[key], target[key], currentPath);
    } else {
      if (!(key in target)) {
        target[key] = source[key]; // Use English as fallback
        console.log(\`Added missing key: \${currentPath}\`);
      }
    }
  }
}

// Add missing keys to each language
console.log('Adding missing keys to Russian...');
addMissingKeys(enData, ruData);
fs.writeFileSync('src/i18n/locales/ru.json', JSON.stringify(ruData, null, 2));

console.log('Adding missing keys to Ukrainian...');
addMissingKeys(enData, ukData);
fs.writeFileSync('src/i18n/locales/uk.json', JSON.stringify(ukData, null, 2));

console.log('Adding missing keys to French...');
addMissingKeys(enData, frData);
fs.writeFileSync('src/i18n/locales/fr.json', JSON.stringify(frData, null, 2));

console.log('Done! Please review and translate the added keys.');
`;

  fs.writeFileSync('update-missing-keys.js', script);
  console.log('Created update-missing-keys.js script');
}

createUpdateScript(); 