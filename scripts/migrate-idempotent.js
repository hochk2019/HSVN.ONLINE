const { Client } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env.local') });

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
    console.error('❌ DATABASE_URL missing in .env.local');
    process.exit(1);
}

const client = new Client({
    connectionString,
    ssl: { rejectUnauthorized: false }
});

function makeIdempotent(sql) {
    let fixed = sql;

    // 1. CREATE INDEX -> CREATE INDEX IF NOT EXISTS
    // Negative lookahead to ensure we don't double add
    fixed = fixed.replace(/CREATE INDEX (?!IF NOT EXISTS)/g, 'CREATE INDEX IF NOT EXISTS ');

    // 2. ADD COLUMN -> ADD COLUMN IF NOT EXISTS
    fixed = fixed.replace(/ADD COLUMN (?!IF NOT EXISTS)/g, 'ADD COLUMN IF NOT EXISTS ');

    // 3. CREATE EXTENSION -> CREATE EXTENSION IF NOT EXISTS
    fixed = fixed.replace(/CREATE EXTENSION (?!IF NOT EXISTS)/g, 'CREATE EXTENSION IF NOT EXISTS ');

    // 4. CREATE TABLE -> CREATE TABLE IF NOT EXISTS
    fixed = fixed.replace(/CREATE TABLE (?!IF NOT EXISTS)/g, 'CREATE TABLE IF NOT EXISTS ');

    // 5. Triggers: Explicit DROP before CREATE
    // Matches: CREATE TRIGGER name [BEFORE|AFTER] [INSERT|UPDATE...] ON table
    // We regex replace to prepend DROP TRIGGER IF EXISTS name ON table;
    fixed = fixed.replace(
        /CREATE TRIGGER\s+(\w+)\s+(.*?)\s+ON\s+(\w+)/g,
        (match, triggerName, timingEvents, tableName) => {
            return `DROP TRIGGER IF EXISTS ${triggerName} ON ${tableName};\n${match}`;
        }
    );

    return fixed;
}

async function run() {
    try {
        await client.connect();

        const migrationsDir = path.join(__dirname, '../supabase/migrations');
        const files = fs.readdirSync(migrationsDir).sort();

        // Skip seed data (03) because it inserts data without ON CONFLICT and harder to regex fix
        const targetFiles = files.filter(f => f.endsWith('.sql') && !f.startsWith('03'));

        for (const file of targetFiles) {
            console.log(`\n--- Processing ${file} ---`);
            const sqlPath = path.join(migrationsDir, file);
            let sql = fs.readFileSync(sqlPath, 'utf8');

            // Apply Fixes
            sql = makeIdempotent(sql);

            try {
                await client.query(sql);
                console.log(`✅ ${file} applied successfully.`);
            } catch (err) {
                console.error(`⚠️ ${file} failed. Error:`);
                console.error(err.message.split('\n')[0]);
                // If it's policy exists error, we ignore for now as regex for policy is hard
                if (err.message.includes('policy') && err.message.includes('already exists')) {
                    console.log('Ignored policy exists error.');
                }
            }
        }

        // Attempt seed separately if needed, but risky.

        console.log('\nAll migrations processed (idempotent).');

    } catch (err) {
        console.error('Fatal Error:', err);
    } finally {
        await client.end();
    }
}

run();
