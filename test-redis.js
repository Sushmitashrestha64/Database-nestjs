const { createClient } = require('redis');

async function testRedis() {
  console.log('Testing Redis connection...');
  
  const client = createClient({
    socket: {
      host: 'yamanote.proxy.rlwy.net',
      port: 10991,
    },
    password: 'sNYFhGEwfmrUSYMwYlPLTynYdQIdQsqP'
  });

  client.on('error', (err) => console.error('Redis Client Error:', err));

  try {
    await client.connect();
    console.log('✅ Connected to Redis!');
    
    await client.set('test:key', 'test-value');
    console.log('✅ Set test key');
    
    const value = await client.get('test:key');
    console.log('✅ Got value:', value);
    
    await client.disconnect();
    console.log('✅ Redis connection test successful!');
  } catch (error) {
    console.error('❌ Redis connection failed:', error.message);
  }
}

testRedis();
