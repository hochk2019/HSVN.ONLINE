// Script to seed 10 articles per category with realistic content
import pg from 'pg';

// Use environment variable for database connection
const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
    console.error('❌ Error: DATABASE_URL environment variable is not set');
    console.log('Set it with: export DATABASE_URL="postgresql://..."');
    process.exit(1);
}

const client = new pg.Client({ connectionString, ssl: { rejectUnauthorized: false } });

// Helper to generate slug
function slugify(text) {
    return text.toLowerCase()
        .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
        .replace(/đ/g, 'd').replace(/Đ/g, 'd')
        .replace(/[^\w\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/--+/g, '-')
        .trim();
}

// Sample images from Unsplash (customs, logistics themed)
const images = {
    'cong-van': [
        'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=800',
        'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=800',
        'https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=800',
        'https://images.unsplash.com/photo-1568234928966-359c35dd8327?w=800',
        'https://images.unsplash.com/photo-1554224154-22dec7ec8818?w=800'
    ],
    'hs-code': [
        'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=800',
        'https://images.unsplash.com/photo-1494412574643-ff11b0a5c1c3?w=800',
        'https://images.unsplash.com/photo-1553413077-190dd305871c?w=800',
        'https://images.unsplash.com/photo-1580674285054-bed31e145f59?w=800',
        'https://images.unsplash.com/photo-1597852074816-d933c7d2b988?w=800'
    ],
    'thu-tuc-hai-quan': [
        'https://images.unsplash.com/photo-1578575437130-527eed3abbec?w=800',
        'https://images.unsplash.com/photo-1494412574643-ff11b0a5c1c3?w=800',
        'https://images.unsplash.com/photo-1586528116022-a9d6a4b96d51?w=800',
        'https://images.unsplash.com/photo-1573164574572-cb89e39749b4?w=800',
        'https://images.unsplash.com/photo-1621570168196-08b06a6b0c5c?w=800'
    ]
};

// Công văn / Thông tư - 10 bài
const congVanPosts = [
    {
        title: 'Công văn 1234/TCHQ-GSQL về phân loại hàng hóa xuất nhập khẩu',
        excerpt: 'Tổng cục Hải quan hướng dẫn phân loại hàng hóa theo Danh mục hàng hóa xuất nhập khẩu Việt Nam năm 2024',
        content_html: `
<h2>Tóm tắt nội dung</h2>
<p>Công văn số 1234/TCHQ-GSQL ngày 15/01/2024 của Tổng cục Hải quan về việc hướng dẫn phân loại hàng hóa xuất nhập khẩu theo Danh mục hàng hóa xuất nhập khẩu Việt Nam.</p>

<h2>Nội dung chính</h2>
<p>Căn cứ theo quy định tại Nghị định số 08/2015/NĐ-CP và Thông tư số 14/2015/TT-BTC, Tổng cục Hải quan hướng dẫn một số nội dung về phân loại hàng hóa như sau:</p>

<ul>
<li>Quy tắc phân loại hàng hóa theo Hệ thống hài hòa (HS)</li>
<li>Nguyên tắc áp dụng mã số HS cho hàng hóa XNK</li>
<li>Thủ tục xác định trước mã số hàng hóa</li>
</ul>

<blockquote>
<strong>Lưu ý:</strong> Doanh nghiệp cần kiểm tra kỹ mô tả hàng hóa và đặc tính kỹ thuật trước khi áp mã HS.
</blockquote>
`
    },
    {
        title: 'Nghị định 18/2024/NĐ-CP về quản lý hàng hóa tạm nhập tái xuất',
        excerpt: 'Chính phủ ban hành quy định mới về quản lý hàng hóa tạm nhập tái xuất, quá cảnh và chuyển khẩu',
        content_html: `
<h2>Phạm vi điều chỉnh</h2>
<p>Nghị định này quy định chi tiết về thủ tục hải quan, quản lý và giám sát hải quan đối với hàng hóa tạm nhập tái xuất, quá cảnh, chuyển khẩu.</p>

<h2>Đối tượng áp dụng</h2>
<ul>
<li>Tổ chức, cá nhân thực hiện hoạt động tạm nhập tái xuất</li>
<li>Cơ quan hải quan các cấp</li>
<li>Các đơn vị liên quan đến hoạt động XNK</li>
</ul>

<h2>Nội dung chính</h2>
<p>Nghị định quy định rõ ràng về thời hạn lưu giữ hàng hóa tạm nhập, điều kiện tái xuất, thủ tục khai báo và các trường hợp được gia hạn.</p>
`
    },
    {
        title: 'Thông tư 38/2015/TT-BTC về thủ tục hải quan điện tử',
        excerpt: 'Quy định chi tiết về thủ tục hải quan, kiểm tra, giám sát hải quan đối với hàng hóa XNK',
        content_html: `
<h2>Giới thiệu</h2>
<p>Thông tư 38/2015/TT-BTC là văn bản pháp quy quan trọng hướng dẫn chi tiết về thủ tục hải quan điện tử trên hệ thống VNACCS/VCIS.</p>

<h2>Các nội dung chính</h2>
<ul>
<li>Khai báo hải quan điện tử qua hệ thống VNACCS</li>
<li>Phân luồng kiểm tra hải quan</li>
<li>Thông quan tự động và bán tự động</li>
<li>Giải phóng hàng và thanh khoản tờ khai</li>
</ul>

<h2>Hướng dẫn thực hiện</h2>
<p>Doanh nghiệp cần đăng ký tài khoản trên Cổng thông tin một cửa quốc gia để thực hiện khai báo hải quan điện tử.</p>
`
    },
    {
        title: 'Công văn 5678/TCHQ-TXNK về thuế xuất nhập khẩu năm 2024',
        excerpt: 'Hướng dẫn áp dụng biểu thuế xuất nhập khẩu ưu đãi theo các Hiệp định thương mại tự do',
        content_html: `
<h2>Mục đích</h2>
<p>Công văn hướng dẫn doanh nghiệp áp dụng mức thuế suất ưu đãi đặc biệt theo các FTA mà Việt Nam đã ký kết.</p>

<h2>Các FTA được hướng dẫn</h2>
<ul>
<li>CPTPP - Hiệp định Đối tác Toàn diện và Tiến bộ xuyên Thái Bình Dương</li>
<li>EVFTA - Hiệp định Thương mại Tự do Việt Nam - EU</li>
<li>RCEP - Hiệp định Đối tác Kinh tế Toàn diện Khu vực</li>
<li>ACFTA - Hiệp định Thương mại Tự do ASEAN - Trung Quốc</li>
</ul>
`
    },
    {
        title: 'Quyết định 2024/QĐ-TCHQ về kiểm tra sau thông quan',
        excerpt: 'Quy trình kiểm tra sau thông quan đối với doanh nghiệp xuất nhập khẩu và các đơn vị sản xuất',
        content_html: `
<h2>Đối tượng kiểm tra</h2>
<p>Quyết định quy định chi tiết về đối tượng, phạm vi và quy trình kiểm tra sau thông quan.</p>

<h2>Nội dung kiểm tra</h2>
<ul>
<li>Kiểm tra hồ sơ hải quan</li>
<li>Đối chiếu sổ sách kế toán</li>
<li>Kiểm tra thực tế hàng hóa (nếu cần)</li>
<li>Xác minh chứng từ xuất xứ</li>
</ul>

<h2>Quyền và nghĩa vụ của doanh nghiệp</h2>
<p>Doanh nghiệp có quyền khiếu nại kết quả kiểm tra và nghĩa vụ cung cấp đầy đủ hồ sơ, chứng từ theo yêu cầu.</p>
`
    },
    {
        title: 'Thông tư 06/2024/TT-BTC về định mức hành lý xuất nhập cảnh',
        excerpt: 'Quy định mới về định mức hành lý, quà biếu miễn thuế cho người xuất nhập cảnh',
        content_html: `
<h2>Phạm vi áp dụng</h2>
<p>Áp dụng cho công dân Việt Nam và người nước ngoài xuất nhập cảnh qua các cửa khẩu.</p>

<h2>Định mức miễn thuế</h2>
<ul>
<li>Rượu: 1,5 lít từ 22 độ trở lên hoặc 2 lít dưới 22 độ</li>
<li>Thuốc lá: 200 điếu hoặc 50 điếu xì gà</li>
<li>Các mặt hàng khác: Tổng trị giá không quá 10 triệu đồng</li>
</ul>
`
    },
    {
        title: 'Công văn 9012/TCHQ-ĐTCBL về chống buôn lậu năm 2024',
        excerpt: 'Tăng cường các biện pháp phòng chống buôn lậu, gian lận thương mại và hàng giả',
        content_html: `
<h2>Mục tiêu</h2>
<p>Nâng cao hiệu quả công tác phòng chống buôn lậu, bảo vệ quyền lợi doanh nghiệp làm ăn chân chính.</p>

<h2>Các biện pháp triển khai</h2>
<ul>
<li>Tăng cường tuần tra, kiểm soát các tuyến biên giới</li>
<li>Phối hợp với công an, biên phòng</li>
<li>Áp dụng công nghệ trong giám sát hải quan</li>
<li>Xử lý nghiêm các vi phạm</li>
</ul>
`
    },
    {
        title: 'Nghị định 128/2020/NĐ-CP về xử phạt vi phạm hành chính trong lĩnh vực hải quan',
        excerpt: 'Quy định về các hành vi vi phạm và mức xử phạt trong lĩnh vực hải quan',
        content_html: `
<h2>Các hành vi vi phạm chính</h2>
<ul>
<li>Khai sai tên hàng, mã số, số lượng, trọng lượng</li>
<li>Gian lận về trị giá hải quan</li>
<li>Vi phạm quy định về C/O</li>
<li>Không chấp hành quyết định kiểm tra</li>
</ul>

<h2>Mức xử phạt</h2>
<p>Tùy theo mức độ vi phạm, mức phạt từ cảnh cáo đến 200 triệu đồng đối với cá nhân và gấp đôi đối với tổ chức.</p>
`
    },
    {
        title: 'Thông tư 33/2023/TT-BTC về quản lý rủi ro trong hoạt động hải quan',
        excerpt: 'Áp dụng quản lý rủi ro để phân luồng kiểm tra hàng hóa xuất nhập khẩu',
        content_html: `
<h2>Nguyên tắc quản lý rủi ro</h2>
<p>Hệ thống đánh giá rủi ro tự động dựa trên nhiều tiêu chí để phân luồng tờ khai.</p>

<h2>Các luồng kiểm tra</h2>
<ul>
<li><strong>Luồng xanh:</strong> Thông quan tự động, không kiểm tra</li>
<li><strong>Luồng vàng:</strong> Kiểm tra hồ sơ</li>
<li><strong>Luồng đỏ:</strong> Kiểm tra thực tế hàng hóa</li>
</ul>

<h2>Tiêu chí đánh giá</h2>
<p>Bao gồm lịch sử tuân thủ, mức độ rủi ro mặt hàng, quốc gia xuất xứ và các yếu tố khác.</p>
`
    },
    {
        title: 'Công văn 3456/TCHQ-CNTT về triển khai Cổng thông tin một cửa quốc gia',
        excerpt: 'Hướng dẫn doanh nghiệp đăng ký và sử dụng NSW Portal cho thủ tục hải quan',
        content_html: `
<h2>Giới thiệu NSW</h2>
<p>Cổng thông tin một cửa quốc gia (NSW) là hệ thống tích hợp cho phép doanh nghiệp thực hiện các thủ tục hành chính trực tuyến.</p>

<h2>Các dịch vụ trên NSW</h2>
<ul>
<li>Khai báo hải quan điện tử</li>
<li>Xin giấy phép xuất nhập khẩu</li>
<li>Chứng nhận xuất xứ điện tử</li>
<li>Kiểm tra chuyên ngành</li>
</ul>

<h2>Cách đăng ký</h2>
<p>Doanh nghiệp truy cập vnsw.gov.vn để đăng ký tài khoản và thực hiện các thủ tục.</p>
`
    }
];

// HS Code - 10 bài
const hsCodePosts = [
    {
        title: 'Hướng dẫn tra cứu mã HS Code máy tính và linh kiện điện tử',
        excerpt: 'Cách xác định chính xác mã HS cho máy tính, laptop, linh kiện và phụ kiện điện tử',
        content_html: `
<h2>Phân loại máy tính</h2>
<p>Máy tính được phân loại tại Chương 84, nhóm 8471 của Biểu thuế XNK.</p>

<h2>Các mã HS phổ biến</h2>
<ul>
<li><strong>8471.30:</strong> Máy tính xách tay (Laptop)</li>
<li><strong>8471.41:</strong> Máy tính để bàn (Desktop)</li>
<li><strong>8471.49:</strong> Các loại máy tính khác</li>
<li><strong>8471.70:</strong> Ổ lưu trữ (SSD, HDD)</li>
</ul>

<h2>Lưu ý khi phân loại</h2>
<p>Cần xác định rõ chức năng chính của thiết bị để áp đúng mã HS.</p>
`
    },
    {
        title: 'Phân loại HS Code cho hàng dệt may xuất khẩu',
        excerpt: 'Hướng dẫn xác định mã HS cho quần áo, vải và sản phẩm dệt may',
        content_html: `
<h2>Chương áp dụng</h2>
<p>Hàng dệt may được phân loại từ Chương 50 đến Chương 63 của Biểu thuế.</p>

<h2>Nguyên tắc phân loại</h2>
<ul>
<li>Xác định loại nguyên liệu (bông, sợi tổng hợp, len...)</li>
<li>Xác định cấu trúc vải (dệt thoi, dệt kim)</li>
<li>Xác định loại sản phẩm (quần, áo, phụ kiện...)</li>
</ul>

<h2>Ví dụ cụ thể</h2>
<p>Áo sơ mi nam bằng vải cotton: Mã HS 6205.20 - Thuế suất 12%</p>
`
    },
    {
        title: 'Mã HS Code cho thực phẩm và đồ uống nhập khẩu',
        excerpt: 'Tra cứu mã số hàng hóa cho các loại thực phẩm, đồ uống và gia vị',
        content_html: `
<h2>Phạm vi</h2>
<p>Thực phẩm được phân loại từ Chương 1 đến Chương 24 của Biểu thuế XNK.</p>

<h2>Các nhóm hàng chính</h2>
<ul>
<li><strong>Chương 2:</strong> Thịt và các sản phẩm từ thịt</li>
<li><strong>Chương 3:</strong> Thủy sản</li>
<li><strong>Chương 8:</strong> Trái cây</li>
<li><strong>Chương 22:</strong> Đồ uống, rượu bia</li>
</ul>

<h2>Lưu ý kiểm tra chuyên ngành</h2>
<p>Thực phẩm nhập khẩu cần kiểm tra an toàn thực phẩm theo quy định của Bộ Y tế.</p>
`
    },
    {
        title: 'HS Code cho máy móc thiết bị công nghiệp',
        excerpt: 'Phân loại mã số hải quan cho máy móc, thiết bị sản xuất công nghiệp',
        content_html: `
<h2>Chương 84 và 85</h2>
<p>Máy móc thiết bị chủ yếu được phân loại tại Chương 84 (máy móc cơ khí) và Chương 85 (thiết bị điện).</p>

<h2>Nguyên tắc phân loại</h2>
<ul>
<li>Xác định chức năng chính của máy</li>
<li>Phân biệt máy chuyên dụng và đa năng</li>
<li>Xem xét các bộ phận, linh kiện đi kèm</li>
</ul>

<h2>Ưu đãi thuế</h2>
<p>Nhiều máy móc thiết bị được hưởng thuế suất 0% hoặc ưu đãi đặc biệt theo các FTA.</p>
`
    },
    {
        title: 'Tra cứu HS Code cho hóa chất và sản phẩm hóa học',
        excerpt: 'Hướng dẫn phân loại hóa chất, nguyên liệu hóa học theo Biểu thuế XNK',
        content_html: `
<h2>Chương 28-38</h2>
<p>Hóa chất được phân loại trong Phần VI của Biểu thuế, từ Chương 28 đến 38.</p>

<h2>Phân loại cơ bản</h2>
<ul>
<li><strong>Chương 28:</strong> Hóa chất vô cơ</li>
<li><strong>Chương 29:</strong> Hóa chất hữu cơ</li>
<li><strong>Chương 32:</strong> Chất nhuộm, sơn</li>
<li><strong>Chương 38:</strong> Sản phẩm hóa học khác</li>
</ul>

<h2>Yêu cầu giấy phép</h2>
<p>Nhiều hóa chất cần giấy phép nhập khẩu từ Bộ Công Thương.</p>
`
    },
    {
        title: 'HS Code cho ô tô và phương tiện giao thông',
        excerpt: 'Phân loại mã số hải quan cho ô tô, xe máy và phụ tùng',
        content_html: `
<h2>Chương 87</h2>
<p>Phương tiện giao thông được phân loại tại Chương 87 của Biểu thuế XNK.</p>

<h2>Các nhóm chính</h2>
<ul>
<li><strong>8703:</strong> Ô tô chở người dưới 10 chỗ</li>
<li><strong>8704:</strong> Xe tải các loại</li>
<li><strong>8711:</strong> Mô tô, xe máy</li>
<li><strong>8708:</strong> Phụ tùng ô tô</li>
</ul>

<h2>Thuế tiêu thụ đặc biệt</h2>
<p>Ô tô chịu thuế TTĐB từ 15% đến 150% tùy theo dung tích xi lanh.</p>
`
    },
    {
        title: 'Hướng dẫn xác định trước mã số hàng hóa tại Hải quan',
        excerpt: 'Thủ tục đề nghị xác định trước mã HS để tránh rủi ro khi nhập khẩu',
        content_html: `
<h2>Thế nào là xác định trước?</h2>
<p>Là việc cơ quan Hải quan ra quyết định về mã số hàng hóa trước khi làm thủ tục xuất nhập khẩu.</p>

<h2>Lợi ích</h2>
<ul>
<li>Tránh rủi ro bị truy thu thuế</li>
<li>Chủ động trong kế hoạch kinh doanh</li>
<li>Có cơ sở pháp lý rõ ràng</li>
</ul>

<h2>Thủ tục</h2>
<p>Nộp đơn đề nghị kèm mẫu hàng, catalogue tại Chi cục Hải quan. Thời gian giải quyết 30 ngày.</p>
`
    },
    {
        title: 'Phân loại HS Code cho sản phẩm nhựa và cao su',
        excerpt: 'Hướng dẫn tra cứu mã số hàng hóa cho nhựa, cao su và sản phẩm',
        content_html: `
<h2>Chương 39 và 40</h2>
<p>Nhựa (Chương 39) và cao su (Chương 40) là hai chương quan trọng trong Biểu thuế.</p>

<h2>Nguyên tắc phân loại</h2>
<ul>
<li>Phân biệt dạng nguyên sinh và thành phẩm</li>
<li>Xác định polymer chính</li>
<li>Xem xét công dụng cuối cùng</li>
</ul>

<h2>Ví dụ</h2>
<p>Túi nhựa PE: Mã HS 3923.21 - Dùng đựng hàng hóa</p>
`
    },
    {
        title: 'HS Code cho đồ nội thất và sản phẩm gỗ',
        excerpt: 'Tra cứu mã số hải quan cho bàn ghế, tủ và các sản phẩm từ gỗ',
        content_html: `
<h2>Chương 44 và 94</h2>
<p>Gỗ và sản phẩm gỗ (Chương 44), Đồ nội thất (Chương 94).</p>

<h2>Phân loại đồ nội thất</h2>
<ul>
<li><strong>9401:</strong> Ghế ngồi các loại</li>
<li><strong>9403:</strong> Đồ gỗ nội thất khác</li>
<li><strong>9404:</strong> Nệm, chăn gối</li>
</ul>

<h2>Chính sách thuế</h2>
<p>Gỗ nguyên liệu thường có thuế suất thấp, thành phẩm thuế cao hơn.</p>
`
    },
    {
        title: 'Hướng dẫn tra cứu HS Code trực tuyến trên hệ thống TCHQ',
        excerpt: 'Cách sử dụng công cụ tra cứu mã HS trên website Tổng cục Hải quan',
        content_html: `
<h2>Các công cụ tra cứu</h2>
<ul>
<li>Website customs.gov.vn</li>
<li>Hệ thống eCUSTOMS</li>
<li>Biểu thuế điện tử</li>
</ul>

<h2>Cách tra cứu</h2>
<ol>
<li>Truy cập trang web Tổng cục Hải quan</li>
<li>Chọn mục "Tra cứu HS Code"</li>
<li>Nhập từ khóa mô tả hàng hóa</li>
<li>Xem kết quả và chọn mã phù hợp</li>
</ol>

<h2>Lưu ý</h2>
<p>Kết quả tra cứu chỉ mang tính tham khảo, cần xác nhận với cơ quan Hải quan.</p>
`
    }
];

// Thủ tục hải quan - 10 bài
const thuTucPosts = [
    {
        title: 'Quy trình khai báo hải quan điện tử trên VNACCS',
        excerpt: 'Hướng dẫn chi tiết từng bước khai báo tờ khai hải quan điện tử',
        content_html: `
<h2>Giới thiệu VNACCS/VCIS</h2>
<p>VNACCS (Vietnam Automated Cargo Clearance System) là hệ thống thông quan tự động của Việt Nam.</p>

<h2>Các bước khai báo</h2>
<ol>
<li>Đăng nhập hệ thống với chữ ký số</li>
<li>Tạo tờ khai mới, nhập thông tin hàng hóa</li>
<li>Gửi tờ khai và nhận phản hồi</li>
<li>Nộp thuế (nếu có) và hoàn tất thông quan</li>
</ol>

<h2>Các loại tờ khai</h2>
<ul>
<li>Tờ khai nhập khẩu: Loại A, B, C</li>
<li>Tờ khai xuất khẩu: Loại A, B</li>
</ul>
`
    },
    {
        title: 'Thủ tục nhập khẩu máy móc thiết bị đã qua sử dụng',
        excerpt: 'Điều kiện và hồ sơ cần thiết để nhập khẩu máy móc cũ',
        content_html: `
<h2>Điều kiện nhập khẩu</h2>
<p>Máy móc đã qua sử dụng chỉ được nhập khẩu khi đáp ứng các điều kiện về năm sản xuất và chất lượng.</p>

<h2>Yêu cầu</h2>
<ul>
<li>Tuổi máy không quá 10 năm (hoặc 15 năm với một số loại)</li>
<li>Có giấy giám định chất lượng</li>
<li>Không thuộc danh mục cấm nhập khẩu</li>
</ul>

<h2>Hồ sơ cần thiết</h2>
<ul>
<li>Hợp đồng thương mại</li>
<li>Hóa đơn thương mại</li>
<li>Chứng thư giám định</li>
<li>Vận đơn</li>
</ul>
`
    },
    {
        title: 'Hướng dẫn làm thủ tục hải quan hàng mẫu',
        excerpt: 'Thủ tục nhập khẩu hàng mẫu, hàng thử nghiệm không thu thuế',
        content_html: `
<h2>Định nghĩa hàng mẫu</h2>
<p>Hàng mẫu là hàng hóa nhập khẩu với số lượng nhỏ, dùng để giới thiệu, quảng cáo hoặc thử nghiệm.</p>

<h2>Điều kiện miễn thuế</h2>
<ul>
<li>Trị giá không quá 30 triệu đồng</li>
<li>Có ghi rõ "SAMPLE" hoặc "NOT FOR SALE"</li>
<li>Số lượng hợp lý</li>
</ul>

<h2>Thủ tục</h2>
<p>Khai báo tờ khai hải quan loại B11 (hàng mẫu), nộp chứng từ tại Chi cục Hải quan.</p>
`
    },
    {
        title: 'Thủ tục xuất khẩu hàng hóa đi thị trường EU',
        excerpt: 'Hướng dẫn thủ tục, chứng từ và yêu cầu khi xuất khẩu sang Châu Âu',
        content_html: `
<h2>Yêu cầu chung</h2>
<p>Hàng hóa xuất khẩu EU cần đáp ứng các tiêu chuẩn chất lượng và an toàn của Châu Âu.</p>

<h2>Chứng từ cần thiết</h2>
<ul>
<li>C/O form EUR.1 (để hưởng thuế suất EVFTA)</li>
<li>Chứng nhận chất lượng, VSATTP</li>
<li>Phytosanitary certificate (nếu là nông sản)</li>
</ul>

<h2>Ưu đãi từ EVFTA</h2>
<p>Nhiều mặt hàng được hưởng thuế suất 0% khi có chứng nhận xuất xứ EUR.1.</p>
`
    },
    {
        title: 'Quy trình kiểm tra thực tế hàng hóa tại cảng',
        excerpt: 'Các bước kiểm tra hàng hóa khi tờ khai vào luồng đỏ',
        content_html: `
<h2>Khi nào bị kiểm tra thực tế?</h2>
<p>Tờ khai được phân luồng đỏ hoặc có nghi vấn về khai báo sẽ phải kiểm tra thực tế.</p>

<h2>Quy trình kiểm tra</h2>
<ol>
<li>Doanh nghiệp đưa hàng đến địa điểm kiểm tra</li>
<li>Công chức Hải quan kiểm tra đối chiếu</li>
<li>Lập biên bản kiểm tra</li>
<li>Ra quyết định thông quan hoặc yêu cầu bổ sung</li>
</ol>

<h2>Chi phí phát sinh</h2>
<p>Doanh nghiệp chịu phí bốc dỡ, lưu kho nếu có phát sinh.</p>
`
    },
    {
        title: 'Thủ tục hoàn thuế GTGT cho hàng xuất khẩu',
        excerpt: 'Hướng dẫn hồ sơ và quy trình hoàn thuế giá trị gia tăng',
        content_html: `
<h2>Điều kiện hoàn thuế</h2>
<p>Hàng hóa thực tế xuất khẩu, có chứng từ thanh toán qua ngân hàng.</p>

<h2>Hồ sơ hoàn thuế</h2>
<ul>
<li>Tờ khai hải quan xuất khẩu</li>
<li>Hợp đồng ngoại thương</li>
<li>Hóa đơn GTGT đầu vào</li>
<li>Chứng từ thanh toán qua ngân hàng</li>
</ul>

<h2>Thời hạn giải quyết</h2>
<p>Cơ quan thuế giải quyết trong 40 ngày (trường hợp kiểm tra trước).</p>
`
    },
    {
        title: 'Hướng dẫn khai báo C/O xuất xứ hàng hóa',
        excerpt: 'Quy trình xin cấp chứng nhận xuất xứ cho hàng xuất khẩu',
        content_html: `
<h2>Các loại C/O phổ biến</h2>
<ul>
<li><strong>C/O form D:</strong> Cho hàng xuất khẩu ASEAN</li>
<li><strong>C/O form E:</strong> Cho hàng xuất khẩu Trung Quốc</li>
<li><strong>C/O form EUR.1:</strong> Cho hàng xuất khẩu EU</li>
<li><strong>C/O form CPTPP:</strong> Cho các nước CPTPP</li>
</ul>

<h2>Cơ quan cấp</h2>
<p>Phòng Quản lý Xuất nhập khẩu - Bộ Công Thương hoặc các đơn vị được ủy quyền.</p>

<h2>Quy trình</h2>
<p>Nộp hồ sơ online trên ecosys.gov.vn, nhận C/O sau 1-3 ngày làm việc.</p>
`
    },
    {
        title: 'Thủ tục tạm nhập tái xuất hàng hóa',
        excerpt: 'Hướng dẫn thủ tục và hồ sơ cho hàng tạm nhập để tái xuất',
        content_html: `
<h2>Đối tượng áp dụng</h2>
<p>Hàng hóa nhập khẩu vào Việt Nam với mục đích sẽ tái xuất trong thời hạn nhất định.</p>

<h2>Thời hạn tạm nhập</h2>
<ul>
<li>Thông thường: 90 ngày</li>
<li>Có thể gia hạn thêm 2 lần, mỗi lần 30 ngày</li>
</ul>

<h2>Ưu đãi thuế</h2>
<p>Được miễn thuế nhập khẩu, nhưng phải ký quỹ hoặc bảo lãnh ngân hàng.</p>

<h2>Thủ tục thanh khoản</h2>
<p>Khi tái xuất, nộp tờ khai xuất khẩu để thanh khoản và hoàn tiền ký quỹ.</p>
`
    },
    {
        title: 'Quy trình thông quan hàng hóa tại sân bay',
        excerpt: 'Hướng dẫn làm thủ tục hải quan cho hàng hóa vận chuyển bằng đường hàng không',
        content_html: `
<h2>Đặc điểm hàng air</h2>
<p>Hàng vận chuyển đường hàng không thường có giá trị cao, khối lượng nhỏ, thời gian thông quan nhanh.</p>

<h2>Quy trình</h2>
<ol>
<li>Hãng bay gửi bản lược khai hàng hóa (manifest)</li>
<li>Doanh nghiệp khai báo tờ khai hải quan</li>
<li>Kiểm tra qua máy soi X-ray</li>
<li>Thông quan và nhận hàng</li>
</ol>

<h2>Thời gian thông quan</h2>
<p>Trung bình 2-4 giờ cho hàng luồng xanh, 1-2 ngày cho luồng vàng/đỏ.</p>
`
    },
    {
        title: 'Hướng dẫn khai báo trị giá hải quan',
        excerpt: 'Các phương pháp xác định trị giá tính thuế theo quy định WTO',
        content_html: `
<h2>6 phương pháp xác định trị giá</h2>
<ol>
<li>Trị giá giao dịch của hàng hóa nhập khẩu</li>
<li>Trị giá giao dịch của hàng hóa giống hệt</li>
<li>Trị giá giao dịch của hàng hóa tương tự</li>
<li>Phương pháp khấu trừ</li>
<li>Phương pháp tính toán</li>
<li>Phương pháp suy luận</li>
</ol>

<h2>Nguyên tắc áp dụng</h2>
<p>Các phương pháp được áp dụng theo thứ tự ưu tiên. Phương pháp 1 (trị giá giao dịch) là ưu tiên cao nhất.</p>

<h2>Hồ sơ chứng minh</h2>
<p>Hóa đơn thương mại, hợp đồng, chứng từ thanh toán và các bằng chứng khác.</p>
`
    }
];

async function run() {
    try {
        console.log('🚀 Connecting to database...');
        await client.connect();
        console.log('✅ Connected!\n');

        // Get categories
        const categoriesResult = await client.query('SELECT id, slug, name FROM categories');
        const categories = categoriesResult.rows;
        console.log('📁 Categories:', categories.map(c => c.slug).join(', '));
        console.log('');

        // Combine all posts
        const allPosts = [
            ...congVanPosts.map(p => ({ ...p, category_slug: 'cong-van' })),
            ...hsCodePosts.map(p => ({ ...p, category_slug: 'hs-code' })),
            ...thuTucPosts.map(p => ({ ...p, category_slug: 'thu-tuc-hai-quan' }))
        ];

        console.log(`📝 Creating ${allPosts.length} articles...\n`);

        let created = 0;
        let skipped = 0;

        for (let i = 0; i < allPosts.length; i++) {
            const post = allPosts[i];
            const category = categories.find(c => c.slug === post.category_slug);

            if (!category) {
                console.log(`  ✗ Category not found: ${post.category_slug}`);
                continue;
            }

            const slug = slugify(post.title);
            const categoryImages = images[post.category_slug] || [];
            const featuredImage = categoryImages[i % categoryImages.length] || null;

            const result = await client.query(`
                INSERT INTO posts (title, slug, excerpt, content_html, category_id, featured_image, status, published_at, created_at, updated_at)
                VALUES ($1, $2, $3, $4, $5, $6, 'published', NOW(), NOW(), NOW())
                ON CONFLICT (slug) DO NOTHING
                RETURNING id
            `, [post.title, slug, post.excerpt, post.content_html, category.id, featuredImage]);

            if (result.rowCount > 0) {
                console.log(`  ✓ [${category.slug}] ${post.title.substring(0, 50)}...`);
                created++;
            } else {
                console.log(`  - [${category.slug}] ${slug} (exists)`);
                skipped++;
            }
        }

        console.log(`\n🎉 Done! Created: ${created}, Skipped: ${skipped}`);

    } catch (err) {
        console.error('❌ Error:', err.message);
    } finally {
        await client.end();
    }
}

run();
