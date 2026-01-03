const { Client } = require('pg');

const client = new Client({
    host: 'db.nthzqqeakvtkbrxponng.supabase.co',
    port: 5432,
    user: 'postgres',
    password: 'Sam0905@',
    database: 'postgres',
    ssl: { rejectUnauthorized: false }
});

async function checkTables() {
    try {
        await client.connect();
        console.log('Connected to database!\n');

        // Get all tables
        const result = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name
    `);

        console.log('=== TABLES IN DATABASE ===');
        result.rows.forEach((row, i) => {
            console.log(`${i + 1}. ${row.table_name}`);
        });
        console.log(`\nTotal: ${result.rows.length} tables`);

    } catch (err) {
        console.error('Error:', err.message);
    } finally {
        await client.end();
    }
}

checkTables();
