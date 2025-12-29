// Script to seed sample posts for testing sidebar
import pg from 'pg';

// Use environment variable for database connection
const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
    console.error('❌ Error: DATABASE_URL environment variable is not set');
    console.log('Set it with: export DATABASE_URL="postgresql://..."');
    process.exit(1);
}

const client = new pg.Client({ connectionString, ssl: { rejectUnauthorized: false } });

async function run() {
    try {
        console.log('Connecting to database...');
        await client.connect();
        console.log('Connected!');

        // Get category IDs
        const categoriesResult = await client.query('SELECT id, slug, name FROM categories');
        const categories = categoriesResult.rows;
        console.log('Categories found:', categories.map(c => c.slug));

        if (categories.length === 0) {
            console.log('No categories found. Creating default categories...');
            await client.query(`
                INSERT INTO categories (name, slug, description, icon, color, sort_order) VALUES
                ('Công văn / Thông tư', 'cong-van', 'Văn bản pháp luật, nghị định, thông tư liên quan hải quan', 'FileText', '#3B82F6', 1),
                ('HS Code', 'hs-code', 'Phân loại hàng hóa, xác định trước mã số', 'Tag', '#22C55E', 2),
                ('Thủ tục hải quan', 'thu-tuc-hai-quan', 'Hướng dẫn quy trình xuất nhập khẩu', 'ClipboardList', '#F59E0B', 3)
                ON CONFLICT (slug) DO NOTHING
            `);
            const newCats = await client.query('SELECT id, slug, name FROM categories');
            categories.push(...newCats.rows);
        }

        // Sample posts data
        const samplePosts = [
            {
                title: 'Công văn 1234/TCHQ-GSQL về phân loại hàng hóa',
                slug: 'cong-van-1234-tchq-gsql',
                excerpt: 'Hướng dẫn phân loại hàng hóa theo Danh mục hàng hóa XNK Việt Nam',
                content_html: '<p>Nội dung công văn 1234/TCHQ-GSQL về việc phân loại hàng hóa...</p><h2>Nội dung chính</h2><p>Căn cứ theo quy định tại Nghị định...</p>',
                category_slug: 'cong-van'
            },
            {
                title: 'Thông tư 38/2015/TT-BTC về thủ tục hải quan',
                slug: 'thong-tu-38-2015-tt-btc',
                excerpt: 'Quy định về thủ tục hải quan, kiểm tra, giám sát hải quan',
                content_html: '<p>Thông tư 38/2015/TT-BTC quy định chi tiết...</p>',
                category_slug: 'cong-van'
            },
            {
                title: 'Hướng dẫn tra cứu mã HS Code máy tính',
                slug: 'huong-dan-tra-cuu-hs-code-may-tinh',
                excerpt: 'Cách xác định mã HS cho các loại máy tính và linh kiện điện tử',
                content_html: '<p>Bài viết hướng dẫn cách tra cứu mã HS Code cho máy tính...</p><h2>Bước 1</h2><p>Truy cập hệ thống...</p>',
                category_slug: 'hs-code'
            },
            {
                title: 'Phân loại HS Code cho hàng dệt may',
                slug: 'phan-loai-hs-code-hang-det-may',
                excerpt: 'Hướng dẫn xác định mã HS cho các sản phẩm dệt may xuất nhập khẩu',
                content_html: '<p>Hàng dệt may được phân loại theo chương 50-63...</p>',
                category_slug: 'hs-code'
            },
            {
                title: 'Quy trình khai báo hải quan điện tử',
                slug: 'quy-trinh-khai-bao-hai-quan-dien-tu',
                excerpt: 'Hướng dẫn chi tiết quy trình khai báo hải quan qua hệ thống VNACCS',
                content_html: '<p>Quy trình khai báo hải quan điện tử bao gồm các bước sau...</p><h2>Chuẩn bị hồ sơ</h2><p>Trước khi khai báo...</p>',
                category_slug: 'thu-tuc-hai-quan'
            },
            {
                title: 'Thủ tục nhập khẩu máy móc thiết bị',
                slug: 'thu-tuc-nhap-khau-may-moc-thiet-bi',
                excerpt: 'Các bước và hồ sơ cần thiết để nhập khẩu máy móc công nghiệp',
                content_html: '<p>Nhập khẩu máy móc thiết bị cần tuân thủ các quy định...</p>',
                category_slug: 'thu-tuc-hai-quan'
            }
        ];

        console.log('\nCreating sample posts...');

        for (const post of samplePosts) {
            const category = categories.find(c => c.slug === post.category_slug);
            if (!category) {
                console.log(`  ✗ Category not found: ${post.category_slug}`);
                continue;
            }

            const result = await client.query(`
                INSERT INTO posts (title, slug, excerpt, content_html, category_id, status, published_at)
                VALUES ($1, $2, $3, $4, $5, 'published', NOW())
                ON CONFLICT (slug) DO NOTHING
                RETURNING id
            `, [post.title, post.slug, post.excerpt, post.content_html, category.id]);

            if (result.rowCount > 0) {
                console.log(`  ✓ ${post.title}`);
            } else {
                console.log(`  - ${post.slug} (already exists)`);
            }
        }

        console.log('\n✓ Sample posts created!');

    } catch (err) {
        console.error('Error:', err.message);
    } finally {
        await client.end();
    }
}

run();
