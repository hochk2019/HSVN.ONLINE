const { Client } = require('pg');

const connectionString = 'postgresql://postgres:Sam0905%40@db.nthzqqeakvtkbrxponng.supabase.co:5432/postgres';

const client = new Client({
    connectionString,
    ssl: { rejectUnauthorized: false }
});

async function run() {
    try {
        await client.connect();

        const res = await client.query("SELECT schema_name FROM information_schema.schemata");
        console.log('Schemas:', res.rows.map(r => r.schema_name));

        // Check table auth.users
        try {
            const res2 = await client.query("SELECT count(*) FROM auth.users");
            console.log('auth.users count:', res2.rows[0].count);
        } catch (e) {
            console.log('Error querying auth.users:', e.message);
        }

    } catch (err) {
        console.error('Fatal Error:', err);
    } finally {
        await client.end();
    }
}

run();
