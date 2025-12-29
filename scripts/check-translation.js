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

    const r = await client.query(
        "SELECT id, title, translations FROM posts WHERE slug = 'cong-van-3456tchq-cntt-ve-trien-khai-cong-thong-tin-mot-cua-quoc-gia'"
    );

    console.log('Post found:', r.rows.length > 0);
    if (r.rows[0]) {
        console.log('Has translations:', r.rows[0].translations ? 'YES' : 'NO');
        if (r.rows[0].translations) {
            console.log('translations:', JSON.stringify(r.rows[0].translations, null, 2).substring(0, 500));
        }
    }

    await client.end();
}

run().catch(console.error);
