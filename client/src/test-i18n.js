// Simple test to verify internationalization setup
const zh = require('./translations/zh.js');
const en = require('./translations/en.js');

console.log('=== Internationalization Test ===');

// Test translation file loading
console.log('✓ Chinese translations loaded:', Object.keys(zh.default).length, 'sections');
console.log('✓ English translations loaded:', Object.keys(en.default).length, 'sections');

// Test key structure consistency
const zhKeys = JSON.stringify(Object.keys(zh.default).sort());
const enKeys = JSON.stringify(Object.keys(en.default).sort());

if (zhKeys === enKeys) {
  console.log('✓ Translation key structure is consistent');
} else {
  console.log('⚠ Translation key structure mismatch');
  console.log('Chinese keys:', Object.keys(zh.default));
  console.log('English keys:', Object.keys(en.default));
}

// Test sample translations
console.log('\n=== Sample Translations ===');
console.log('Database Title:');
console.log('  Chinese:', zh.default.database?.title || 'MISSING');
console.log('  English:', en.default.database?.title || 'MISSING');

console.log('Repository Title:');
console.log('  Chinese:', zh.default.repository?.title || 'MISSING');
console.log('  English:', en.default.repository?.title || 'MISSING');

console.log('Common Search:');
console.log('  Chinese:', zh.default.common?.search || 'MISSING');
console.log('  English:', en.default.common?.search || 'MISSING');

console.log('\n✓ Internationalization setup test completed');