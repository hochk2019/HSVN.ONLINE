-- =====================================================
-- Golden Logistics Seed Data
-- Chạy file này SAU KHI đã chạy 01_schema.sql và 02_rls_policies.sql
-- =====================================================

-- =====================================================
-- 1. CATEGORIES (3 chuyên mục chính)
-- =====================================================
INSERT INTO categories (name, slug, description, icon, color, sort_order) VALUES
(
    'Công văn / Thông tư / Nghị định / Luật',
    'cong-van',
    'Văn bản pháp luật, nghị định, thông tư liên quan đến hải quan và xuất nhập khẩu',
    'FileText',
    '#3B82F6',
    1
),
(
    'HS code / Xác định trước mã số',
    'hs-code',
    'Phân loại hàng hóa, kết quả phân tích phân loại, xác định trước mã số',
    'Tag',
    '#22C55E',
    2
),
(
    'Hướng dẫn thủ tục hải quan',
    'thu-tuc-hai-quan',
    'Hướng dẫn chi tiết các thủ tục xuất nhập khẩu, quy trình làm việc với hải quan',
    'ClipboardList',
    '#F59E0B',
    3
);

-- =====================================================
-- 2. SETTINGS (Cấu hình mặc định)
-- =====================================================
INSERT INTO settings (key, value, description) VALUES
(
    'site_info',
    '{
        "name": "Công ty TNHH Tiếp Vận Hoàng Kim",
        "short_name": "Golden Logistics",
        "description": "Cung cấp giải pháp logistics và phần mềm hải quan chuyên nghiệp",
        "email": "hochk2019@gmail.com",
        "phone": "0868.333.606",
        "address": ""
    }'::jsonb,
    'Thông tin cơ bản của website'
),
(
    'seo_defaults',
    '{
        "meta_title": "Công ty TNHH Tiếp Vận Hoàng Kim | Golden Logistics",
        "meta_description": "Cung cấp giải pháp logistics và phần mềm hải quan chuyên nghiệp. Phần mềm Customs Extractor, Customs Barcode Automation.",
        "og_image": "/logo.png"
    }'::jsonb,
    'SEO mặc định cho trang'
),
(
    'facebook_comments',
    '{
        "enabled": false,
        "app_id": ""
    }'::jsonb,
    'Cấu hình Facebook Comments'
),
(
    'developer_credit',
    '{
        "name": "Học HK",
        "email": "hochk2019@gmail.com",
        "phone": "0868.333.606"
    }'::jsonb,
    'Thông tin developer/designer'
);

-- =====================================================
-- 3. SOFTWARE PRODUCTS (2 phần mềm)
-- =====================================================

-- A) Customs Extractor V2
INSERT INTO software_products (
    name, slug, summary, description_html, highlights, system_requirements, faq, 
    status, is_featured, meta_title, meta_description
) VALUES (
    'Customs Extractor V2',
    'customs-extractor-v2',
    'Trích xuất danh sách hàng hóa từ file Excel tờ khai (xuất/nhập), tự làm sạch và chuẩn hóa dữ liệu.',
    '<p><strong>Customs Extractor V2</strong> là giải pháp phần mềm tự động hóa việc trích xuất danh sách hàng hóa từ các file Excel <strong>Tờ khai Hải quan (Export/Import)</strong>. Công cụ này được thiết kế để giúp nhân viên xuất nhập khẩu tiết kiệm thời gian, giảm thiểu sai sót khi xử lý dữ liệu từ tờ khai.</p>
    <h3>Tính năng nổi bật</h3>
    <ul>
        <li><strong>Hỗ trợ đa dạng tờ khai:</strong> Tờ khai Xuất khẩu (TKX) và Nhập khẩu (TKN)</li>
        <li><strong>Tự động nhận diện khối dữ liệu:</strong> Quét toàn bộ file Excel để tìm và trích xuất chính xác từng dòng hàng hóa</li>
        <li><strong>Chuẩn hóa định dạng số:</strong> Tự động chuyển đổi định dạng số Việt Nam sang chuẩn Excel</li>
        <li><strong>Giao diện hiện đại:</strong> Dark Mode, Progress Bar, Log chi tiết</li>
    </ul>',
    '[
        "Hỗ trợ TK xuất khẩu (TKX) và nhập khẩu (TKN)",
        "Tách xuất xứ theo quy tắc #&VN (nếu có)",
        "Quét tìm dòng hàng theo HS code",
        "Chuẩn hóa định dạng số VN/EN về chuẩn Excel",
        "GUI hiện đại: tab xuất/nhập, dark mode, progress + log",
        "Tự động mở file sau khi extract"
    ]'::jsonb,
    '[
        "Hệ điều hành: Windows 10/11",
        "Python 3.8+ (nếu chạy bản script)",
        "Hoặc bản đóng gói EXE - không cần cài Python",
        "Dung lượng: ~50MB"
    ]'::jsonb,
    '[
        {
            "question": "Tại sao bấm Extract mà báo lỗi?",
            "answer": "Hãy kiểm tra file Excel đầu vào. Có thể file đang bị lỗi format hoặc đang được mở bởi chương trình khác. Hãy đóng file Excel đó lại trước khi chạy phần mềm."
        },
        {
            "question": "Cột số lượng/giá trị bị sai định dạng?",
            "answer": "Phần mềm đã tự động xử lý. Nếu vẫn sai, kiểm tra xem máy tính của bạn đang dùng dấu phẩy (,) hay chấm (.) để ngăn cách hàng nghìn."
        },
        {
            "question": "Cột Xuất xứ ở hàng xuất khẩu bị trống?",
            "answer": "Phần mềm tìm xuất xứ dựa trên quy tắc #&[MãNước] trong dòng mô tả (VD: #&VN). Nếu tờ khai không ghi theo quy tắc này, phần mềm sẽ không nhận diện được."
        }
    ]'::jsonb,
    'active',
    true,
    'Customs Extractor V2 - Trích xuất dữ liệu tờ khai hải quan',
    'Phần mềm tự động trích xuất danh sách hàng hóa từ file Excel tờ khai hải quan. Hỗ trợ tờ khai xuất khẩu và nhập khẩu.'
);

-- B) Customs Barcode Automation
INSERT INTO software_products (
    name, slug, summary, description_html, highlights, system_requirements, faq,
    status, is_featured, meta_title, meta_description
) VALUES (
    'Customs Barcode Automation',
    'customs-barcode-automation',
    'Tự động tải mã vạch tờ khai hải quan; kết nối ECUS5/VNACCS; tải hàng loạt; đặt tên file thông minh.',
    '<p><strong>Customs Barcode Automation</strong> là phần mềm hỗ trợ các doanh nghiệp xuất nhập khẩu và đại lý hải quan tự động hóa quy trình lấy mã vạch tờ khai từ Tổng cục Hải quan Việt Nam.</p>
    <h3>Tính năng chính</h3>
    <ul>
        <li><strong>Kết nối trực tiếp ECUS5:</strong> Đọc dữ liệu tờ khai từ phần mềm khai báo hải quan ECUS5/VNACCS</li>
        <li><strong>Tải mã vạch tự động:</strong> Lấy mã vạch từ hệ thống Hải quan qua API hoặc Web</li>
        <li><strong>Tải hàng loạt:</strong> Tải nhiều mã vạch cùng lúc, tiết kiệm thời gian</li>
        <li><strong>Quản lý theo công ty:</strong> Lọc và quản lý tờ khai theo từng doanh nghiệp</li>
        <li><strong>Đặt tên file thông minh:</strong> Tự động đặt tên file theo mã số thuế, số hóa đơn hoặc vận đơn</li>
    </ul>',
    '[
        "Kết nối ECUS5/VNACCS (SQL Server)",
        "Lấy mã vạch qua API/Web (fallback)",
        "Tải hàng loạt + tự động theo chu kỳ",
        "Lọc theo công ty",
        "Đặt tên file theo MST/số HĐ/số vận đơn",
        "Theme sáng/tối + auto update từ GitHub"
    ]'::jsonb,
    '[
        "Hệ điều hành: Windows 10/11 64-bit",
        "SQL Server với ECUS5/VNACCS",
        "Kết nối Internet để lấy mã vạch",
        "Dung lượng: ~100MB ổ cứng"
    ]'::jsonb,
    '[
        {
            "question": "Không thể kết nối database?",
            "answer": "Kiểm tra SQL Server đang chạy, xác minh lại Server/Username/Password, và kiểm tra firewall không chặn port 1433."
        },
        {
            "question": "Không tìm thấy tờ khai?",
            "answer": "Mở rộng khoảng thời gian tìm kiếm và kiểm tra công ty đã chọn đúng chưa."
        },
        {
            "question": "Không thể tải mã vạch?",
            "answer": "Kiểm tra kết nối internet, thử đổi phương thức lấy mã vạch (API ↔ Web), hoặc thử lại sau vài phút."
        },
        {
            "question": "Password decryption failed?",
            "answer": "Mở Cấu hình DB, nhập lại mật khẩu database, và click Lưu."
        }
    ]'::jsonb,
    'active',
    true,
    'Customs Barcode Automation - Tự động lấy mã vạch tờ khai',
    'Phần mềm tự động tải mã vạch tờ khai hải quan, kết nối ECUS5/VNACCS, hỗ trợ tải hàng loạt.'
);

-- =====================================================
-- 4. SOFTWARE VERSIONS (Phiên bản mới nhất)
-- =====================================================
-- Customs Extractor V2 - version 2.0.0
INSERT INTO software_versions (software_id, version, release_notes, file_name, is_latest, status)
SELECT 
    id,
    '2.0.0',
    'Phiên bản đầu tiên với hỗ trợ đầy đủ TK xuất khẩu và nhập khẩu. Giao diện mới với Dark Mode.',
    'CustomsExtractor_V2.0.0.zip',
    true,
    'active'
FROM software_products WHERE slug = 'customs-extractor-v2';

-- Customs Barcode Automation - version 1.3.0
INSERT INTO software_versions (software_id, version, release_notes, file_name, is_latest, status)
SELECT 
    id,
    '1.3.0',
    'Cập nhật tháng 12/2024: Cải thiện hiệu suất, hỗ trợ auto-update từ GitHub.',
    'CustomsBarcodeAutomation_V1.3.0_Full.zip',
    true,
    'active'
FROM software_products WHERE slug = 'customs-barcode-automation';

-- =====================================================
-- 5. TAGS (Một số tags mẫu)
-- =====================================================
INSERT INTO tags (name, slug) VALUES
('công-văn', 'cong-van'),
('pháp-lý', 'phap-ly'),
('xnk', 'xnk'),
('thông-tư', 'thong-tu'),
('nghị-định', 'nghi-dinh'),
('luật', 'luat'),
('hiệu-lực', 'hieu-luc'),
('tra-cứu', 'tra-cuu'),
('thuật-ngữ', 'thuat-ngu'),
('lưu-trữ', 'luu-tru'),
('hs-code', 'hs-code'),
('phân-loại', 'phan-loai'),
('xác-định-trước', 'xac-dinh-truoc'),
('catalogue', 'catalogue'),
('hồ-sơ', 'ho-so'),
('nhập-khẩu', 'nhap-khau'),
('xuất-khẩu', 'xuat-khau'),
('phân-luồng', 'phan-luong'),
('tờ-khai', 'to-khai'),
('checklist', 'checklist');

-- =====================================================
-- 6. BÀI TEST LAYOUT (Published)
-- =====================================================
INSERT INTO posts (
    title, slug, excerpt, content_html, 
    status, published_at, 
    category_id, allow_comments, is_featured
) 
SELECT 
    'Checklist hồ sơ & luồng xử lý khi mở tờ khai nhập khẩu (bài test layout)',
    'checklist-ho-so-luong-xu-ly-to-khai-nhap-khau-test-layout',
    'Bài mẫu dùng để test layout: tiêu đề, mục lục, bảng, checklist, callout, trích dẫn và tài liệu đính kèm.',
    '<h2>1) Mục tiêu</h2>
<ul>
<li>Giảm thiếu sót hồ sơ</li>
<li>Chuẩn hoá thứ tự thao tác</li>
<li>Dễ bàn giao cho nhân sự mới</li>
</ul>

<blockquote>
<p>Ghi chú: Đây là bài mẫu, bạn có thể xoá sau khi layout ổn.</p>
</blockquote>

<h2>2) Checklist hồ sơ (tham khảo)</h2>
<ul>
<li>☐ Hợp đồng / Invoice / Packing List</li>
<li>☐ Vận đơn (B/L / AWB)</li>
<li>☐ C/O (nếu có)</li>
<li>☐ Catalogue / tài liệu kỹ thuật (nếu hàng mới)</li>
<li>☐ Kết quả phân tích / xác định trước (nếu có)</li>
</ul>

<h2>3) Bảng tóm tắt thao tác theo luồng</h2>
<table>
<thead>
<tr>
<th>Bước</th>
<th>Việc cần làm</th>
<th>Gợi ý</th>
</tr>
</thead>
<tbody>
<tr>
<td>1</td>
<td>Kiểm tra chứng từ</td>
<td>đối chiếu số lượng, trị giá</td>
</tr>
<tr>
<td>2</td>
<td>Khai báo chỉ tiêu</td>
<td>chuẩn hoá mô tả, HS</td>
</tr>
<tr>
<td>3</td>
<td>Nộp tờ khai</td>
<td>chụp màn hình lưu hồ sơ</td>
</tr>
<tr>
<td>4</td>
<td>Xử lý phân luồng</td>
<td>chuẩn bị bổ sung nếu vàng/đỏ</td>
</tr>
</tbody>
</table>

<h2>4) Callout</h2>
<div class="callout callout-tip">
<p>✅ Tip: Luôn chuẩn hóa mô tả hàng hoá + origin ngay từ đầu để giảm sửa tờ khai.</p>
</div>

<h2>5) Ví dụ cấu trúc "mô tả hàng"</h2>
<pre><code>TÊN HÀNG + MODEL + THÀNH PHẦN + CÔNG DỤNG + #&VN (nếu cần ghi xuất xứ)</code></pre>

<h2>6) Tài liệu đính kèm (demo)</h2>
<ul>
<li>Mẫu checklist hồ sơ nhập khẩu.xlsx</li>
<li>Quy trình nội bộ xử lý luồng vàng.pdf</li>
</ul>

<h2>7) Kết luận</h2>
<p>Bạn có thể dùng bài này để kiểm tra:</p>
<ul>
<li>font/spacing/heading</li>
<li>table style</li>
<li>code block</li>
<li>hiển thị attachments</li>
<li>vị trí Facebook Comments</li>
</ul>',
    'published',
    NOW(),
    id,
    true,
    true
FROM categories WHERE slug = 'thu-tuc-hai-quan';

-- =====================================================
-- 7. 30 BÀI MẪU (Draft) - Chuyên mục Công văn (10 bài)
-- =====================================================
INSERT INTO posts (title, slug, excerpt, status, category_id)
SELECT 
    title,
    slug,
    excerpt,
    'draft',
    (SELECT id FROM categories WHERE slug = 'cong-van')
FROM (VALUES
    ('Công văn là gì? Cách đọc nhanh nội dung ảnh hưởng đến doanh nghiệp XNK', 'cong-van-la-gi-cach-doc-nhanh', 'Khung đọc công văn trong 5 phút: đối tượng áp dụng, thời điểm hiệu lực, điểm mới.'),
    ('Thông tư – Nghị định – Luật: phân biệt để áp dụng đúng (kèm ví dụ)', 'phan-biet-thong-tu-nghi-dinh-luat', '3 tầng văn bản phổ biến và cách xác định văn bản "cao hơn".'),
    ('Cách kiểm tra hiệu lực văn bản pháp luật liên quan hải quan', 'cach-kiem-tra-hieu-luc-van-ban', 'Checklist tra cứu hiệu lực, văn bản sửa đổi/bổ sung, văn bản thay thế.'),
    ('Tổng hợp thuật ngữ hay gặp trong văn bản hải quan (bản dễ hiểu)', 'thuat-ngu-hai-quan-de-hieu', 'Glossary: trị giá, mã loại hình, miễn giảm, kiểm tra sau thông quan…'),
    ('Mẹo lưu trữ công văn theo "hồ sơ lô hàng" để audit nhanh', 'meo-luu-tru-cong-van-theo-ho-so-lo-hang', 'Cách đặt tên file, phân thư mục, gắn tag theo loại hình.'),
    ('Khi văn bản mới ban hành: quy trình nội bộ cập nhật & truyền thông', 'quy-trinh-noi-bo-cap-nhat-van-ban-moi', 'Mẫu quy trình 1 trang để doanh nghiệp cập nhật nhanh và đúng.'),
    ('Các lỗi phổ biến khi trích dẫn công văn trong công văn trả lời/giải trình', 'loi-pho-bien-khi-trich-dan-cong-van', 'Trích sai số/ký hiệu/ngày; thiếu điều khoản; áp dụng sai đối tượng.'),
    ('Cách theo dõi "văn bản sửa đổi" để không áp dụng nhầm quy định cũ', 'cach-theo-doi-van-ban-sua-doi', 'Hướng dẫn tạo "bản đồ văn bản" (mapping) cho một chủ đề.'),
    ('Mẫu email/biên bản làm việc khi cần xác minh quy định với cơ quan HQ', 'mau-email-bien-ban-lam-viec-xac-minh-quy-dinh', '2 mẫu nhanh: email hỏi quy định + biên bản làm việc.'),
    ('"Điểm mới" trong một văn bản: cách tóm tắt để sếp duyệt nhanh', 'cach-tom-tat-diem-moi-van-ban', 'Công thức 5 dòng: thay đổi gì, ảnh hưởng ai, áp dụng khi nào, cần làm gì.')
) AS t(title, slug, excerpt);

-- =====================================================
-- 8. 30 BÀI MẪU (Draft) - Chuyên mục HS Code (10 bài)
-- =====================================================
INSERT INTO posts (title, slug, excerpt, status, category_id)
SELECT 
    title,
    slug,
    excerpt,
    'draft',
    (SELECT id FROM categories WHERE slug = 'hs-code')
FROM (VALUES
    ('Quy trình phân loại HS code: từ mô tả hàng → nhóm → phân nhóm', 'quy-trinh-phan-loai-hs-code-co-ban', 'Khung làm việc 6 bước để giảm rủi ro sai mã.'),
    ('5 lỗi khiến HS code dễ bị "bác" khi kiểm tra sau thông quan', '5-loi-hs-code-de-bi-bac', 'Mô tả thiếu thông số, nhầm công dụng, nhầm vật liệu, thiếu catalogue…'),
    ('Khi nào nên xin "xác định trước mã số"?', 'khi-nao-nen-xin-xac-dinh-truoc-ma-so', 'Tình huống hàng mới, tranh chấp mã, trị giá lớn, nhập thường xuyên.'),
    ('Cách viết mô tả hàng hóa để hỗ trợ phân loại HS tốt hơn', 'cach-viet-mo-ta-hang-hoa-ho-tro-phan-loai', 'Mẫu mô tả chuẩn: vật liệu – công dụng – cấu tạo – thông số.'),
    ('Catalogue tối thiểu cần có khi phân loại HS (checklist)', 'checklist-catalogue-toi-thieu-phan-loai-hs', 'Những trang nào cần chụp/đính kèm để đủ căn cứ.'),
    ('Hàng "combo/bộ" phân loại HS thế nào?', 'hang-combo-bo-phan-loai-hs-the-nao', 'Áp dụng quy tắc phân loại cho hàng đóng bộ và hàng lắp ráp.'),
    ('Vật liệu vs công dụng: yếu tố nào quyết định HS?', 'vat-lieu-vs-cong-dung-yeu-to-quyet-dinh-hs', 'Cách ưu tiên tiêu chí khi mô tả không rõ ràng.'),
    ('Case study: đổi HS làm thay đổi thuế suất — bài học hồ sơ', 'case-study-doi-hs-thay-doi-thue-suat', 'Một case demo để test layout + bảng so sánh thuế.'),
    ('Mẫu form nội bộ "phiếu đề xuất HS code" cho phòng XNK', 'mau-phieu-de-xuat-hs-code-noi-bo', '1 form giúp chuẩn hoá thông tin từ sales/kỹ thuật.'),
    ('7 câu hỏi kỹ thuật cần trả lời trước khi chốt HS code', '7-cau-hoi-ky-thuat-truoc-khi-chot-hs', 'Giúp tránh thiếu dữ kiện khi làm hồ sơ giải trình.')
) AS t(title, slug, excerpt);

-- =====================================================
-- 9. 30 BÀI MẪU (Draft) - Chuyên mục Thủ tục HQ (10 bài)
-- =====================================================
INSERT INTO posts (title, slug, excerpt, status, category_id)
SELECT 
    title,
    slug,
    excerpt,
    'draft',
    (SELECT id FROM categories WHERE slug = 'thu-tuc-hai-quan')
FROM (VALUES
    ('Hướng dẫn tạo bộ hồ sơ nhập khẩu "chuẩn audit"', 'huong-dan-tao-bo-ho-so-nhap-khau-chuan-audit', 'Cấu trúc folder + checklist chứng từ.'),
    ('Luồng xanh – vàng – đỏ: cần chuẩn bị gì cho từng luồng?', 'luong-xanh-vang-do-can-chuan-bi-gi', 'Bảng chuẩn bị nhanh theo luồng để giảm thời gian chờ.'),
    ('Cách chuẩn hoá mô tả hàng hoá để giảm "sửa tờ khai"', 'chuan-hoa-mo-ta-hang-hoa-giam-sua-to-khai', 'Template mô tả và ví dụ cho hàng máy móc/linh kiện.'),
    ('Quy trình làm thủ tục cho hàng nhập gia công / sản xuất xuất khẩu (overview)', 'quy-trinh-hang-nhap-gia-cong-sxxk-overview', 'Tổng quan quy trình, điểm hay bị sai, checklist kiểm soát.'),
    ('Làm gì khi thiếu chứng từ lúc mở tờ khai? (giải pháp thực tế)', 'lam-gi-khi-thieu-chung-tu-luc-mo-to-khai', 'Các phương án xử lý phổ biến và rủi ro tương ứng.'),
    ('Cách kiểm tra nhanh trị giá – số lượng – đơn giá trước khi truyền tờ khai', 'kiem-tra-nhanh-tri-gia-so-luong-don-gia', '8 bước kiểm tra để tránh sai sót cơ bản.'),
    ('Hướng dẫn quản lý "tài liệu đính kèm" cho từng lô hàng', 'huong-dan-quan-ly-tai-lieu-dinh-kem-theo-lo-hang', 'Cách lưu PDF/ảnh/email để truy xuất 1 phút.'),
    ('Trình tự xử lý khi bị yêu cầu bổ sung hồ sơ (luồng vàng/đỏ)', 'trinh-tu-xu-ly-khi-bi-yeu-cau-bo-sung-ho-so', 'Checklist trả lời và theo dõi lịch sử bổ sung.'),
    ('Cách bàn giao hồ sơ giữa ca trực / nhân sự để không thất lạc', 'cach-ban-giao-ho-so-giua-ca-truc', 'Mẫu checklist bàn giao và nguyên tắc đặt tên.'),
    ('Mẫu SOP 1 trang cho nhân sự mới làm chứng từ XNK', 'mau-sop-1-trang-cho-nhan-su-moi', 'Một SOP mẫu ngắn gọn để onboarding nhanh.')
) AS t(title, slug, excerpt);

-- =====================================================
-- DONE!
-- =====================================================
