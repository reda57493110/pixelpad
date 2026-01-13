const http = require('http');

// First, we need to get product IDs from the products API
async function getProductIds() {
  return new Promise((resolve, reject) => {
    const req = http.request({
      hostname: 'localhost',
      port: 3000,
      path: '/api/products/page',
      method: 'GET',
    }, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        try {
          const products = JSON.parse(data);
          if (Array.isArray(products) && products.length > 0) {
            const ids = products.slice(0, 5).map(p => p._id || p.id).filter(Boolean);
            resolve(ids);
          } else {
            resolve([]);
          }
        } catch (error) {
          reject(error);
        }
      });
    });
    req.on('error', reject);
    req.setTimeout(15000, () => { req.destroy(); reject(new Error('Timeout')); });
    req.end();
  });
}

function measurePageLoad(path) {
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
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
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

    req.setTimeout(10000, () => {
      req.destroy();
      reject({ path, error: 'Request timeout' });
    });

    req.end();
  });
}

async function measureProductPages() {
  console.log('🚀 Starting Product Page Load Time Measurement\n');
  console.log('='.repeat(70));
  console.log('Testing product detail pages on localhost:3000\n');

  try {
    // Get product IDs
    console.log('Fetching product IDs...');
    const productIds = await getProductIds();
    console.log(`Found ${productIds.length} products to test\n`);

    if (productIds.length === 0) {
      console.log('No products found. Testing with sample ID...');
      productIds.push('sample-product-id');
    }

    const results = [];

    for (let i = 0; i < Math.min(productIds.length, 5); i++) {
      const productId = productIds[i];
      const path = `/products/${productId}`;
      
      try {
        process.stdout.write(`Testing Product ${i + 1} (${path})... `);
        const result = await measurePageLoad(path);
        results.push({ ...result, name: `Product ${i + 1}` });
        
        const status = result.statusCode === 200 ? '✅' : '⚠️';
        console.log(`${status} ${result.totalTime}ms (TTFB: ${result.responseTime}ms)`);
        
        await new Promise(resolve => setTimeout(resolve, 100));
      } catch (error) {
        console.log(`❌ Error: ${error.error || error.message}`);
        results.push({ name: `Product ${i + 1}`, path, error: error.error || error.message });
      }
    }

    console.log('\n' + '='.repeat(70));
    console.log('\n📊 PRODUCT PAGES SUMMARY\n');
    console.log('='.repeat(70));
    console.log('Page'.padEnd(25) + 'Path'.padEnd(30) + 'Total Time'.padEnd(15) + 'TTFB'.padEnd(15) + 'Status');
    console.log('-'.repeat(70));

    results.forEach(result => {
      if (result.error) {
        console.log(
          result.name.padEnd(25) + 
          (result.path || '').padEnd(30) + 
          'ERROR'.padEnd(15) + 
          'ERROR'.padEnd(15) + 
          '❌'
        );
      } else {
        const status = result.statusCode === 200 ? '✅' : '⚠️';
        console.log(
          result.name.padEnd(25) + 
          (result.path || '').padEnd(30) + 
          `${result.totalTime}ms`.padEnd(15) + 
          `${result.responseTime}ms`.padEnd(15) + 
          status
        );
      }
    });

    console.log('\n' + '='.repeat(70));
    
    const successfulResults = results.filter(r => !r.error && r.statusCode === 200);
    if (successfulResults.length > 0) {
      const avgTotalTime = Math.round(
        successfulResults.reduce((sum, r) => sum + r.totalTime, 0) / successfulResults.length
      );
      const avgTTFB = Math.round(
        successfulResults.reduce((sum, r) => sum + r.responseTime, 0) / successfulResults.length
      );
      
      console.log(`\n📈 Average Total Time: ${avgTotalTime}ms`);
      console.log(`📈 Average TTFB: ${avgTTFB}ms`);
      
      const fastest = successfulResults.reduce((min, r) => r.totalTime < min.totalTime ? r : min, successfulResults[0]);
      const slowest = successfulResults.reduce((max, r) => r.totalTime > max.totalTime ? r : max, successfulResults[0]);
      
      console.log(`\n⚡ Fastest: ${fastest.name} (${fastest.totalTime}ms)`);
      console.log(`🐌 Slowest: ${slowest.name} (${slowest.totalTime}ms)`);
    }

    console.log('\n' + '='.repeat(70));
  } catch (error) {
    console.error('Error:', error.message);
  }
}

measureProductPages().catch(console.error);

