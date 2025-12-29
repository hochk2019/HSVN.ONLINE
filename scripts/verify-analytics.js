const { Client } = require('pg');
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

async function run() {
    try {
        await client.connect();
        console.log('=== ANALYTICS MIGRATION VERIFICATION ===\n');

        // 1. Check analytics_visits table
        const tableCheck = await client.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'analytics_visits'
      ORDER BY ordinal_position
    `);
        console.log('1. analytics_visits table columns:');
        if (tableCheck.rows.length > 0) {
            tableCheck.rows.forEach(row => console.log(`   - ${row.column_name}: ${row.data_type}`));
            console.log('   ✅ Table exists with', tableCheck.rows.length, 'columns\n');
        } else {
            console.log('   ❌ Table NOT FOUND\n');
        }

        // 2. Check posts.view_count column
        const viewCountCheck = await client.query(`
      SELECT column_name, data_type, column_default
      FROM information_schema.columns 
      WHERE table_name = 'posts' AND column_name = 'view_count'
    `);
        console.log('2. posts.view_count column:');
        if (viewCountCheck.rows.length > 0) {
            const col = viewCountCheck.rows[0];
            console.log(`   - Type: ${col.data_type}, Default: ${col.column_default}`);
            console.log('   ✅ Column exists\n');
        } else {
            console.log('   ❌ Column NOT FOUND\n');
        }

        // 3. Check functions
        const funcCheck = await client.query(`
      SELECT routine_name 
      FROM information_schema.routines 
      WHERE routine_schema = 'public' 
      AND routine_name IN ('record_visit', 'increment_view_duration')
    `);
        console.log('3. Functions:');
        const funcNames = funcCheck.rows.map(r => r.routine_name);
        console.log('   - record_visit:', funcNames.includes('record_visit') ? '✅' : '❌');
        console.log('   - increment_view_duration:', funcNames.includes('increment_view_duration') ? '✅' : '❌');
        console.log();

        // 4. Check RLS policies on analytics_visits
        const policyCheck = await client.query(`
      SELECT policyname, cmd 
      FROM pg_policies 
      WHERE tablename = 'analytics_visits'
    `);
        console.log('4. RLS Policies on analytics_visits:');
        if (policyCheck.rows.length > 0) {
            policyCheck.rows.forEach(row => console.log(`   - ${row.policyname} (${row.cmd})`));
            console.log('   ✅', policyCheck.rows.length, 'policies found\n');
        } else {
            console.log('   ⚠️ No policies found (might be fine if RLS is disabled)\n');
        }

        // 5. Check indexes on analytics_visits
        const indexCheck = await client.query(`
      SELECT indexname 
      FROM pg_indexes 
      WHERE tablename = 'analytics_visits'
    `);
        console.log('5. Indexes on analytics_visits:');
        if (indexCheck.rows.length > 0) {
            indexCheck.rows.forEach(row => console.log(`   - ${row.indexname}`));
            console.log('   ✅', indexCheck.rows.length, 'indexes found\n');
        } else {
            console.log('   ⚠️ No indexes found\n');
        }

        // 6. Quick data check
        const countCheck = await client.query(`SELECT count(*) FROM analytics_visits`);
        console.log('6. Current visit records:', countCheck.rows[0].count);

        console.log('\n=== VERIFICATION COMPLETE ===');

    } catch (err) {
        console.error('Error:', err.message);
    } finally {
        await client.end();
    }
}

run();
