const { Client } = require('pg');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env.local') });

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
    console.error('❌ DATABASE_URL missing');
    process.exit(1);
}

const client = new Client({
    connectionString,
    ssl: { rejectUnauthorized: false }
});

// Expected tables from migrations
const expectedTables = [
    'posts',
    'categories',
    'tags',
    'post_tags',
    'software_products',
    'software_versions',
    'contacts',
    'profiles',
    'settings',
    'audit_logs',
    'download_logs',
    'post_embeddings',
    'user_events',
    'experiments',
    'chat_sessions',
    'analytics_visits',
    'testimonials',
    'translation_queue',
    'rate_limits',
    'notifications'
];

async function run() {
    try {
        await client.connect();
        console.log('=== DATABASE SCHEMA CHECK ===\n');

        // Get all tables
        const result = await client.query(`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public' 
            ORDER BY table_name
        `);

        const existingTables = result.rows.map(r => r.table_name);

        console.log('📋 Tables in Supabase:');
        existingTables.forEach(t => console.log(`   ✅ ${t}`));
        console.log(`\nTotal: ${existingTables.length} tables\n`);

        // Check missing
        const missing = expectedTables.filter(t => !existingTables.includes(t));

        if (missing.length > 0) {
            console.log('❌ Missing tables:');
            missing.forEach(t => console.log(`   - ${t}`));
        } else {
            console.log('✅ All expected tables exist!');
        }

        // Check new tables
        console.log('\n📊 New Phase 7 tables:');
        console.log('   - rate_limits:', existingTables.includes('rate_limits') ? '✅' : '❌');
        console.log('   - translation_queue:', existingTables.includes('translation_queue') ? '✅' : '❌');

    } catch (err) {
        console.error('Error:', err.message);
    } finally {
        await client.end();
    }
}

run();
