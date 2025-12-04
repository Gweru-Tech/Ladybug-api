// Test file for Anime & Media API v7
const axios = require('axios');

const API_BASE = 'http://localhost:3000';

// Test function
async function testAPI(method, endpoint, params = {}) {
  try {
    const startTime = Date.now();
    let response;
    
    if (method === 'GET') {
      response = await axios.get(`${API_BASE}${endpoint}`, { params });
    } else {
      response = await axios.post(`${API_BASE}${endpoint}`, params);
    }
    
    const latency = Date.now() - startTime;
    
    console.log(`✅ ${method} ${endpoint} - ${response.status} (${latency}ms)`);
    return { success: true, data: response.data, latency };
  } catch (error) {
    console.log(`❌ ${method} ${endpoint} - ${error.response?.status || 'Network Error'}`);
    return { success: false, error: error.message };
  }
}

// Run tests
async function runTests() {
  console.log('🚀 Testing Anime & Media API v7 by Ntando Mods ✔️\n');
  
  const tests = [
    // System tests
    ['GET', '/api/status'],
    ['GET', '/api/health'],
    
    // YouTube tests
    ['GET', '/api/ytsearch', { q: 'anime music', limit: 3 }],
    ['GET', '/api/ytdl', { url: 'https://youtube.com/watch?v=demo' }],
    
    // Anime tests
    ['GET', '/api/anime/search', { q: 'naruto', limit: 3 }],
    ['GET', '/api/anime/info', { id: '20' }],
    ['GET', '/api/anime/random'],
    
    // AI tests
    ['POST', '/api/ai/chat', { message: 'Hello world' }],
    ['POST', '/api/ai/image', { prompt: 'anime character' }],
    
    // Image tests
    ['GET', '/api/image/lyrics', { title: 'Demo Song', artist: 'Demo Artist' }],
    ['POST', '/api/image/bgremove'],
    ['GET', '/api/image/resize', { url: 'https://example.com/image.jpg' }],
    
    // Utility tests
    ['GET', '/api/weather', { city: 'Tokyo' }],
    ['GET', '/api/shorten', { url: 'https://example.com/very-long-url' }],
    ['GET', '/api/qr', { text: 'Hello World', size: '200' }],
    ['POST', '/api/validate/email', { email: 'test@example.com' }],
    ['POST', '/api/validate/password', { password: 'SecurePass123!' }],
    
    // Social tests
    ['GET', '/api/social/instagram', { username: 'demo' }],
    ['GET', '/api/social/tiktok', { username: 'demo' }],
    ['GET', '/api/social/twitter', { username: 'demo' }],
    
    // Text tests
    ['POST', '/api/text/translate', { text: 'Hello world', to: 'es' }],
    ['POST', '/api/text/summarize', { text: 'This is a long text that needs to be summarized.' }],
    ['POST', '/api/text/analyze', { text: 'This is a sample text for analysis.' }],
    ['POST', '/api/text/sentiment', { text: 'I love this API!' }],
    
    // File tests
    ['POST', '/api/pdf/extract', { url: 'https://example.com/file.pdf' }],
    ['POST', '/api/convert/image', { url: 'https://example.com/image.jpg', format: 'png' }],
    
    // Entertainment tests
    ['GET', '/api/jokes/random'],
    ['GET', '/api/quotes/random'],
    ['GET', '/api/news/random']
  ];
  
  let passed = 0;
  let failed = 0;
  let totalLatency = 0;
  
  for (const [method, endpoint, params] of tests) {
    const result = await testAPI(method, endpoint, params);
    if (result.success) {
      passed++;
      totalLatency += result.latency;
    } else {
      failed++;
    }
    
    // Small delay to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  
  const avgLatency = Math.round(totalLatency / passed);
  
  console.log(`\n📊 Test Results:`);
  console.log(`✅ Passed: ${passed}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`📈 Success Rate: ${Math.round(passed / tests.length * 100)}%`);
  console.log(`⚡ Average Latency: ${avgLatency}ms`);
  console.log(`🎯 Total Tests: ${tests.length}`);
  
  if (failed === 0) {
    console.log(`\n🎉 All tests passed! API is ready for production.`);
  } else {
    console.log(`\n⚠️  Some tests failed. Please check the errors above.`);
  }
}

// Run if called directly
if (require.main === module) {
  runTests().catch(console.error);
}

module.exports = { testAPI, runTests };