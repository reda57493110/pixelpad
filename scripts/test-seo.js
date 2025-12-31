/**
 * SEO Testing Script
 * Run this to test your SEO implementation
 * 
 * Usage: node scripts/test-seo.js
 */

const https = require('https');
const http = require('http');

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

const pages = [
  { path: '/', name: 'Homepage' },
  { path: '/products', name: 'Products' },
  { path: '/services', name: 'Services' },
  { path: '/contacts', name: 'Contacts' },
  { path: '/more/about', name: 'About' },
  { path: '/more/faq', name: 'FAQ' },
];

const tests = {
  sitemap: `${baseUrl}/sitemap.xml`,
  robots: `${baseUrl}/robots.txt`,
};

console.log('🔍 SEO Testing Script for PIXEL PAD\n');
console.log('='.repeat(50));
console.log(`Testing: ${baseUrl}\n`);

// Test function
function testUrl(url, name) {
  return new Promise((resolve) => {
    const protocol = url.startsWith('https') ? https : http;
    
    protocol.get(url, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        const status = res.statusCode === 200 ? '✅' : '❌';
        console.log(`${status} ${name}: ${res.statusCode}`);
        resolve({ status: res.statusCode, data });
      });
    }).on('error', (err) => {
      console.log(`❌ ${name}: ERROR - ${err.message}`);
      resolve({ status: 0, error: err.message });
    });
  });
}

// Check for required SEO elements
function checkSEO(data, pageName) {
  const checks = {
    title: /<title[^>]*>([^<]+)<\/title>/i.test(data),
    description: /<meta[^>]*name=["']description["'][^>]*content=["']([^"']+)["']/i.test(data),
    ogTitle: /<meta[^>]*property=["']og:title["'][^>]*content=["']([^"']+)["']/i.test(data),
    ogDescription: /<meta[^>]*property=["']og:description["'][^>]*content=["']([^"']+)["']/i.test(data),
    canonical: /<link[^>]*rel=["']canonical["'][^>]*href=["']([^"']+)["']/i.test(data),
    structuredData: /<script[^>]*type=["']application\/ld\+json["']/i.test(data),
  };

  console.log(`\n📄 ${pageName} SEO Check:`);
  Object.entries(checks).forEach(([key, value]) => {
    console.log(`   ${value ? '✅' : '❌'} ${key}`);
  });

  return checks;
}

// Main test function
async function runTests() {
  console.log('\n1. Testing Core Files:\n');
  
  // Test sitemap and robots.txt
  await testUrl(tests.sitemap, 'Sitemap');
  await testUrl(tests.robots, 'Robots.txt');

  console.log('\n2. Testing Pages:\n');
  
  // Test each page
  for (const page of pages) {
    const url = `${baseUrl}${page.path}`;
    const result = await testUrl(url, page.name);
    
    if (result.status === 200 && result.data) {
      checkSEO(result.data, page.name);
    }
    
    // Small delay to avoid overwhelming the server
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  console.log('\n' + '='.repeat(50));
  console.log('\n✅ Testing Complete!\n');
  console.log('📋 Next Steps:');
  console.log('1. Create /public/og-image.jpg (1200x630px)');
  console.log('2. Set NEXT_PUBLIC_SITE_URL in .env.local');
  console.log('3. Submit sitemap to Google Search Console');
  console.log('4. Test with Google Rich Results Test');
  console.log('\n🔗 Useful Links:');
  console.log('- Google Rich Results: https://search.google.com/test/rich-results');
  console.log('- Schema Validator: https://validator.schema.org/');
  console.log('- Facebook Debugger: https://developers.facebook.com/tools/debug/');
  console.log('- Twitter Validator: https://cards-dev.twitter.com/validator\n');
}

// Run tests
runTests().catch(console.error);





