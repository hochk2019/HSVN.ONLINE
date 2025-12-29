-- Settings keys for dynamic content
-- Run this in Supabase SQL Editor

-- Delete existing settings if needed and insert new ones
INSERT INTO settings (key, value) VALUES
-- Homepage
('hero_title', 'Golden Logistics Cung Cấp Giải Pháp Vận Chuyển và Thủ Tục Hải Quan Chuyên Nghiệp - Giá Rẻ'),
('hero_subtitle', 'Cung cấp phần mềm hỗ trợ nghiệp vụ hải quan, tự động hóa quy trình xuất nhập khẩu, kiến thức và cập nhật văn bản pháp luật mới nhất.'),
('posts_per_category', '5'),

-- Sidebar & Related Posts
('sidebar_posts_count', '5'),
('related_posts_count', '5'),
('related_posts_enabled', 'true'),

-- Contact Info
('company_name', 'Công ty TNHH Tiếp Vận Hoàng Kim'),
('company_address', 'TP. Hồ Chí Minh, Việt Nam'),
('contact_email', 'hochk2019@gmail.com'),
('contact_phone', '0868.333.606'),
('facebook_url', ''),
('zalo_id', ''),
('wechat_id', '')
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;
