const { Client } = require('pg');

const connectionString = 'postgresql://postgres:Sam0905%40@db.nthzqqeakvtkbrxponng.supabase.co:5432/postgres';

const client = new Client({
    connectionString,
    ssl: { rejectUnauthorized: false }
});

async function run() {
    try {
        await client.connect();

        // Check tables
        const res = await client.query(`
      SELECT 
        to_regclass('public.profiles') as profiles,
        to_regclass('public.posts') as posts,
        to_regclass('public.analytics_visits') as analytics
    `);

        console.log('Tables:', res.rows[0]);

    } catch (err) {
        console.error('Fatal Error:', err);
    } finally {
        await client.end();
    }
}

run();
