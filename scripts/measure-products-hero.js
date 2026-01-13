const http = require('http');

function measureAPI(path) {
  return new Promise((resolve, reject) => {
    const startTime = Date.now();
    let responseTime = 0;
    let statusCode = 0;

    const req = http.request({
      hostname: 'localhost',
      port: 3000,
      path: path,
      method: 'GET',
      headers: {
        'User-Agent': 'Performance-Test',
        'Accept': 'application/json',
      },
    }, (res) => {
      statusCode = res.statusCode;
      responseTime = Date.now() - startTime;

      let dataLength = 0;
      res.on('data', (chunk) => {
        dataLength += chunk.length;
      });

      res.on('end', () => {
        const totalTime = Date.now() - startTime;
        resolve({
          path,
          statusCode,
          responseTime,
          totalTime,
          contentLength: dataLength,
        });
      });
    });

    req.on('error', (error) => {
      reject({ path, error: error.message });
    });

    req.setTimeout(15000, () => {
      req.destroy();
      reject({ path, error: 'Request timeout' });
    });

    req.end();
  });
}

function measureImage(path) {
  return new Promise((resolve, reject) => {
    const startTime = Date.now();
    
    const req = http.request({
      hostname: 'localhost',
      port: 3000,
      path: path,
      method: 'HEAD', // Use HEAD to just check if image exists and get headers
      headers: {
        'User-Agent': 'Performance-Test',
      },
    }, (res) => {
      const responseTime = Date.now() - startTime;
      const totalTime = Date.now() - startTime;
      resolve({
        path,
        statusCode: res.statusCode,
        responseTime,
        totalTime,
        contentLength: parseInt(res.headers['content-length'] || '0', 10),
      });
    });

    req.on('error', (error) => {
      reject({ path, error: error.message });
    });

    req.setTimeout(10000, () => {
      req.destroy();
      reject({ path, error: 'Request timeout' });
    });

    req.end();
  });
}

async function measureProductsAndHero() {
  console.log('🚀 Measuring Products API and Hero Background Load Times\n');
  console.log('='.repeat(70));
  console.log('Testing on localhost:3000\n');

  const results = [];

  // Test Products API
  console.log('📦 Testing Products API...\n');
  
  const productAPIs = [
    { name: 'Products Page API', path: '/api/products/page' },
    { name: 'All Products API', path: '/api/products' },
  ];

  for (const api of productAPIs) {
    try {
      process.stdout.write(`Testing ${api.name.padEnd(30)} (${api.path})... `);
      const result = await measureAPI(api.path);
      results.push({ ...result, name: api.name, type: 'API' });
      
      const status = result.statusCode === 200 ? '✅' : '⚠️';
      console.log(`${status} ${result.totalTime}ms (TTFB: ${result.responseTime}ms, Size: ${(result.contentLength / 1024).toFixed(2)}KB)`);
      
      await new Promise(resolve => setTimeout(resolve, 200));
    } catch (error) {
      console.log(`❌ Error: ${error.error || error.message}`);
      results.push({ name: api.name, path: api.path, type: 'API', error: error.error || error.message });
    }
  }

  // Test Hero Background Image
  console.log('\n🖼️  Testing Hero Background Image...\n');
  
  const heroImages = [
    { name: 'Hero Background', path: '/images/hero-background.jpg' },
  ];

  for (const image of heroImages) {
    try {
      process.stdout.write(`Testing ${image.name.padEnd(30)} (${image.path})... `);
      const result = await measureImage(image.path);
      results.push({ ...result, name: image.name, type: 'Image' });
      
      const status = result.statusCode === 200 ? '✅' : '⚠️';
      const sizeKB = result.contentLength > 0 ? (result.contentLength / 1024).toFixed(2) : 'Unknown';
      console.log(`${status} ${result.totalTime}ms (Size: ${sizeKB}KB)`);
      
      await new Promise(resolve => setTimeout(resolve, 200));
    } catch (error) {
      console.log(`❌ Error: ${error.error || error.message}`);
      results.push({ name: image.name, path: image.path, type: 'Image', error: error.error || error.message });
    }
  }

  // Test Categories API (also loaded on homepage)
  console.log('\n📂 Testing Categories API...\n');
  
  try {
    process.stdout.write(`Testing Categories API (Active)      (/api/categories?active=true)... `);
    const result = await measureAPI('/api/categories?active=true');
    results.push({ ...result, name: 'Categories API (Active)', type: 'API' });
    
    const status = result.statusCode === 200 ? '✅' : '⚠️';
    console.log(`${status} ${result.totalTime}ms (TTFB: ${result.responseTime}ms, Size: ${(result.contentLength / 1024).toFixed(2)}KB)`);
  } catch (error) {
    console.log(`❌ Error: ${error.error || error.message}`);
    results.push({ name: 'Categories API (Active)', path: '/api/categories?active=true', type: 'API', error: error.error || error.message });
  }

  console.log('\n' + '='.repeat(70));
  console.log('\n📊 SUMMARY\n');
  console.log('='.repeat(70));
  console.log('Resource'.padEnd(35) + 'Type'.padEnd(10) + 'Total Time'.padEnd(15) + 'TTFB'.padEnd(15) + 'Size'.padEnd(15) + 'Status');
  console.log('-'.repeat(70));

  results.forEach(result => {
    if (result.error) {
      console.log(
        result.name.padEnd(35) + 
        (result.type || '').padEnd(10) + 
        'ERROR'.padEnd(15) + 
        'ERROR'.padEnd(15) + 
        'ERROR'.padEnd(15) + 
        '❌'
      );
    } else {
      const status = result.statusCode === 200 ? '✅' : '⚠️';
      const size = result.type === 'Image' 
        ? (result.contentLength > 0 ? `${(result.contentLength / 1024).toFixed(2)}KB` : 'Unknown')
        : `${(result.contentLength / 1024).toFixed(2)}KB`;
      const ttfb = result.type === 'Image' ? 'N/A' : `${result.responseTime}ms`;
      
      console.log(
        result.name.padEnd(35) + 
        (result.type || '').padEnd(10) + 
        `${result.totalTime}ms`.padEnd(15) + 
        ttfb.padEnd(15) + 
        size.padEnd(15) + 
        status
      );
    }
  });

  console.log('\n' + '='.repeat(70));
  
  const successfulResults = results.filter(r => !r.error && r.statusCode === 200);
  if (successfulResults.length > 0) {
    const apiResults = successfulResults.filter(r => r.type === 'API');
    const imageResults = successfulResults.filter(r => r.type === 'Image');
    
    if (apiResults.length > 0) {
      const avgAPITime = Math.round(
        apiResults.reduce((sum, r) => sum + r.totalTime, 0) / apiResults.length
      );
      const avgAPITTFB = Math.round(
        apiResults.reduce((sum, r) => sum + r.responseTime, 0) / apiResults.length
      );
      
      console.log(`\n📈 API Average Total Time: ${avgAPITime}ms`);
      console.log(`📈 API Average TTFB: ${avgAPITTFB}ms`);
    }
    
    if (imageResults.length > 0) {
      const avgImageTime = Math.round(
        imageResults.reduce((sum, r) => sum + r.totalTime, 0) / imageResults.length
      );
      console.log(`\n📈 Image Average Load Time: ${avgImageTime}ms`);
    }
    
    const fastest = successfulResults.reduce((min, r) => r.totalTime < min.totalTime ? r : min, successfulResults[0]);
    const slowest = successfulResults.reduce((max, r) => r.totalTime > max.totalTime ? r : max, successfulResults[0]);
    
    console.log(`\n⚡ Fastest: ${fastest.name} (${fastest.totalTime}ms)`);
    console.log(`🐌 Slowest: ${slowest.name} (${slowest.totalTime}ms)`);
  }

  console.log('\n' + '='.repeat(70));
  console.log('\n💡 Note: These are server response times for API endpoints and image files.');
  console.log('   Actual browser load times may vary based on network conditions,');
  console.log('   device performance, and client-side rendering.\n');
}

measureProductsAndHero().catch(console.error);


