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

        const migrationsDir = path.join(__dirname, '../supabase/migrations');
        const files = fs.readdirSync(migrationsDir).sort();

        for (const file of files) {
            if (!file.endsWith('.sql')) continue;

            console.log(`\n--- Running ${file} ---`);
            const sqlPath = path.join(migrationsDir, file);
            const sql = fs.readFileSync(sqlPath, 'utf8');

            try {
                await client.query(sql);
                console.log(`✅ ${file} applied successfully.`);
            } catch (err) {
                console.error(`⚠️ ${file} failed (might be already applied or conflict). Error:`);
                console.error(err.message.split('\n')[0]); // Log first line of error
            }
        }

        console.log('\nAll migrations processed.');

    } catch (err) {
        console.error('Fatal Error:', err);
    } finally {
        await client.end();
    }
}

run();
