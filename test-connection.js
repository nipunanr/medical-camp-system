const { Client } = require('pg');

async function testConnection() {
  const client = new Client({
    connectionString: "postgresql://postgres.sjxdskrypwpxqkbdnkgs:Moragodast123@aws-1-ap-southeast-1.pooler.supabase.com:6543/postgres",
    ssl: {
      rejectUnauthorized: false
    }
  });

  try {
    await client.connect();
    console.log('✅ Successfully connected to Supabase!');
    
    const result = await client.query('SELECT NOW()');
    console.log('📅 Server time:', result.rows[0].now);
    
    await client.end();
  } catch (error) {
    console.error('❌ Connection failed:', error.message);
  }
}

testConnection();