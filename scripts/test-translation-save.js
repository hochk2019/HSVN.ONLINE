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

    // Test update translations
    const testTranslation = {
        en: {
            title: "Test English Title",
            excerpt: "Test English excerpt",
            content_html: "<p>Test English content</p>"
        }
    };

    const { rowCount } = await client.query(
        "UPDATE posts SET translations = $1 WHERE slug = 'cong-van-3456tchq-cntt-ve-trien-khai-cong-thong-tin-mot-cua-quoc-gia'",
        [JSON.stringify(testTranslation)]
    );

    console.log('Rows updated:', rowCount);

    // Verify
    const r = await client.query(
        "SELECT translations FROM posts WHERE slug = 'cong-van-3456tchq-cntt-ve-trien-khai-cong-thong-tin-mot-cua-quoc-gia'"
    );
    console.log('After update:', JSON.stringify(r.rows[0]?.translations, null, 2));

    await client.end();
}

run().catch(console.error);
