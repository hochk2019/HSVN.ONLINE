const { Client } = require('pg');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env.local') });

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
    console.error('DATABASE_URL missing');
    process.exit(1);
}

const client = new Client({
    connectionString,
    ssl: { rejectUnauthorized: false }
});

async function run() {
    await client.connect();

    await client.query(
        "UPDATE posts SET translations = '{}' WHERE slug = 'cong-van-3456tchq-cntt-ve-trien-khai-cong-thong-tin-mot-cua-quoc-gia'"
    );

    console.log('Translation cleared');

    await client.end();
}

run().catch(console.error);
