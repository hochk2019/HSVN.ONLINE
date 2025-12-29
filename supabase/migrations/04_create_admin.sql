-- =====================================================
-- Create Admin User
-- Chạy file này trong Supabase Dashboard > SQL Editor
-- SAU KHI đã đăng ký user qua Auth
-- =====================================================

-- OPTION 1: Nếu bạn đã đăng ký user qua Supabase Auth Dashboard
-- hoặc qua email signup, chạy lệnh này để promote thành admin:

-- Thay 'your-email@example.com' bằng email của bạn
UPDATE profiles 
SET role = 'admin' 
WHERE email = 'hochk2019@gmail.com';

-- =====================================================
-- OPTION 2: Tạo user mới qua SQL (cần service role key)
-- Không khuyến khích vì mật khẩu sẽ lưu trong SQL history
-- =====================================================

-- Thông tin để tạo user qua Supabase Auth Dashboard:
-- 1. Vào Supabase Dashboard > Authentication > Users
-- 2. Click "Add user" > "Create new user"
-- 3. Nhập email và password
-- 4. Sau khi tạo, profile sẽ tự động được tạo với role='editor'
-- 5. Chạy UPDATE bên trên để promote thành admin
