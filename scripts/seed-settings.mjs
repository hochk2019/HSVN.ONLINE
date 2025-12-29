// Script to seed settings via direct PostgreSQL connection
import pg from 'pg';

// Use environment variable for database connection
const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
    console.error('❌ Error: DATABASE_URL environment variable is not set');
    console.log('Set it with: export DATABASE_URL="postgresql://..."');
    process.exit(1);
}

const client = new pg.Client({ connectionString, ssl: { rejectUnauthorized: false } });

// JSONB values need to be properly formatted
const sql = `
INSERT INTO settings (key, value) VALUES
('hero_title', '"Golden Logistics Cung Cấp Giải Pháp Vận Chuyển và Thủ Tục Hải Quan Chuyên Nghiệp - Giá Rẻ"'::jsonb),
('hero_subtitle', '"Cung cấp phần mềm hỗ trợ nghiệp vụ hải quan, tự động hóa quy trình xuất nhập khẩu, kiến thức và cập nhật văn bản pháp luật mới nhất."'::jsonb),
('posts_per_category', '5'::jsonb),
('sidebar_posts_count', '5'::jsonb),
('related_posts_count', '5'::jsonb),
('related_posts_enabled', 'true'::jsonb),
('company_name', '"Công ty TNHH Tiếp Vận Hoàng Kim"'::jsonb),
('company_address', '"TP. Hồ Chí Minh, Việt Nam"'::jsonb),
('contact_email', '"hochk2019@gmail.com"'::jsonb),
('contact_phone', '"0868.333.606"'::jsonb),
('facebook_url', '""'::jsonb),
('zalo_id', '""'::jsonb),
('wechat_id', '""'::jsonb)
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;
`;

async function run() {
    try {
        console.log('Connecting to database...');
        await client.connect();
        console.log('Connected! Running migration...');

        const result = await client.query(sql);
        console.log('✓ Migration completed successfully!');
        console.log(`  Rows affected: ${result.rowCount}`);

    } catch (err) {
        console.error('Error:', err.message);
    } finally {
        await client.end();
    }
}

run();
