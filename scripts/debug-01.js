const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

const connectionString = 'postgresql://postgres:Sam0905%40@db.nthzqqeakvtkbrxponng.supabase.co:5432/postgres';

const client = new Client({
    connectionString,
    ssl: { rejectUnauthorized: false }
});

async function run() {
    try {
        await client.connect();

        const sqlPath = path.join(__dirname, '../supabase/migrations/01_schema.sql');
        console.log(`Reading SQL from: ${sqlPath}`);
        const sql = fs.readFileSync(sqlPath, 'utf8');

        console.log('Running migration 01...');
        await client.query(sql);
        console.log('Migration 01 successful!');
    } catch (err) {
        console.error('Migration 01 failed:');
        console.error(err);
    } finally {
        await client.end();
    }
}

run();
