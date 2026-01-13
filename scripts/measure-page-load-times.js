const http = require('http');
const https = require('https');

const pages = [
  { name: 'Home', path: '/' },
  { name: 'Shop', path: '/products' },
  { name: 'About', path: '/more/about' },
  { name: 'Contact', path: '/contacts' },
  { name: 'Services', path: '/services' },
  { name: 'Warranty', path: '/more/warranty' },
  { name: 'Return Policy', path: '/more/return' },
  { name: 'FAQ', path: '/more/faq' },
  { name: 'Privacy', path: '/privacy' },
  { name: 'Terms', path: '/terms' },
];

const host = 'localhost';
const port = 3000;
const protocol = http;

function measurePageLoad(path) {
  return new Promise((resolve, reject) => {
    const startTime = Date.now();
    let responseTime = 0;
    let contentLength = 0;
    let statusCode = 0;

    const req = protocol.request({
      hostname: host,
      port: port,
      path: path,
      method: 'GET',
      headers: {
        'User-Agent': 'Performance-Test',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      },
    }, (res) => {
      statusCode = res.statusCode;
      responseTime = Date.now() - startTime;
      contentLength = parseInt(res.headers['content-length'] || '0', 10);

      // Consume response data to get accurate timing
      let dataLength = 0;
      res.on('data', (chunk) => {
        dataLength += chunk.length;
      });

      res.on('end', () => {
        const totalTime = Date.now() - startTime;
        resolve({
          path,
          statusCode,
          responseTime, // Time to first byte (TTFB)
          totalTime,    // Total time including data transfer
          contentLength: dataLength || contentLength,
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

async function measureAllPages() {
  console.log('🚀 Starting Page Load Time Measurement\n');
  console.log('='.repeat(70));
  console.log(`Testing pages on ${host}:${port}\n`);

  const results = [];

  for (const page of pages) {
    try {
      process.stdout.write(`Testing ${page.name.padEnd(20)} (${page.path})... `);
      const result = await measurePageLoad(page.path);
      results.push({ ...result, name: page.name });
      
      const status = result.statusCode === 200 ? '✅' : '⚠️';
      console.log(`${status} ${result.totalTime}ms (TTFB: ${result.responseTime}ms)`);
      
      // Small delay between requests
      await new Promise(resolve => setTimeout(resolve, 100));
    } catch (error) {
      console.log(`❌ Error: ${error.error || error.message}`);
      results.push({ name: page.name, path: page.path, error: error.error || error.message });
    }
  }

  console.log('\n' + '='.repeat(70));
  console.log('\n📊 SUMMARY\n');
  console.log('='.repeat(70));
  console.log('Page'.padEnd(25) + 'Path'.padEnd(25) + 'Total Time'.padEnd(15) + 'TTFB'.padEnd(15) + 'Status');
  console.log('-'.repeat(70));

  results.forEach(result => {
    if (result.error) {
      console.log(
        result.name.padEnd(25) + 
        result.path.padEnd(25) + 
        'ERROR'.padEnd(15) + 
        'ERROR'.padEnd(15) + 
        '❌'
      );
    } else {
      const status = result.statusCode === 200 ? '✅' : '⚠️';
      console.log(
        result.name.padEnd(25) + 
        result.path.padEnd(25) + 
        `${result.totalTime}ms`.padEnd(15) + 
        `${result.responseTime}ms`.padEnd(15) + 
        status
      );
    }
  });

  console.log('\n' + '='.repeat(70));
  
  // Calculate averages
  const successfulResults = results.filter(r => !r.error && r.statusCode === 200);
  if (successfulResults.length > 0) {
    const avgTotalTime = Math.round(
      successfulResults.reduce((sum, r) => sum + r.totalTime, 0) / successfulResults.length
    );
    const avgTTFB = Math.round(
      successfulResults.reduce((sum, r) => sum + r.responseTime, 0) / successfulResults.length
    );
    
    console.log(`\n📈 Average Total Time: ${avgTotalTime}ms`);
    console.log(`📈 Average TTFB (Time to First Byte): ${avgTTFB}ms`);
    
    const fastest = successfulResults.reduce((min, r) => r.totalTime < min.totalTime ? r : min, successfulResults[0]);
    const slowest = successfulResults.reduce((max, r) => r.totalTime > max.totalTime ? r : max, successfulResults[0]);
    
    console.log(`\n⚡ Fastest: ${fastest.name} (${fastest.totalTime}ms)`);
    console.log(`🐌 Slowest: ${slowest.name} (${slowest.totalTime}ms)`);
  }

  console.log('\n' + '='.repeat(70));
  console.log('\n💡 Note: These are server response times. Actual browser load times');
  console.log('   may vary based on network conditions, device performance,');
  console.log('   and client-side rendering.');
  console.log('\n   TTFB = Time to First Byte (server processing time)');
  console.log('   Total Time = TTFB + data transfer time\n');
}

// Run the measurement
measureAllPages().catch(console.error);


