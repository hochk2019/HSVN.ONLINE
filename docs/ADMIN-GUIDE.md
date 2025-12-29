# 📖 Hướng dẫn sử dụng Admin - Golden Logistics

## Mục lục
1. [Đăng nhập](#đăng-nhập)
2. [Quản lý bài viết](#quản-lý-bài-viết)
3. [Quản lý phần mềm](#quản-lý-phần-mềm)
4. [Categories & Tags](#categories--tags)
5. [Media Library](#media-library)
6. [Cài đặt](#cài-đặt)
7. [Quản lý người dùng](#quản-lý-người-dùng)

---

## Đăng nhập

1. Truy cập `/admin/login`
2. Nhập email và mật khẩu
3. Click **Đăng nhập**

> **Lưu ý:** Chỉ tài khoản được cấp quyền mới đăng nhập được vào admin.

---

## Quản lý bài viết

### Tạo bài viết mới
1. Vào **Bài viết** → **Thêm mới**
2. Nhập tiêu đề, nội dung
3. Chọn category và tags
4. Upload ảnh đại diện
5. Click **Lưu nháp** hoặc **Xuất bản**

### Lên lịch đăng bài
1. Chọn trạng thái **Lên lịch**
2. Chọn ngày giờ xuất bản
3. Click **Lưu**

### Xem trước bài chưa xuất bản
- Ở trang sửa bài viết, click nút **Xem trước**
- Link preview có token bảo mật, hết hạn sau 24h

### Bulk actions
1. Tick chọn nhiều bài viết
2. Chọn hành động (Xuất bản, Nháp, Xóa)
3. Xác nhận

---

## Quản lý phần mềm

### Tạo phần mềm mới
1. Vào **Phần mềm** → **Thêm mới**
2. Điền thông tin: tên, mô tả, tóm tắt
3. Thêm **Điểm nổi bật** (bullet list)
4. Thêm **FAQ** (câu hỏi/trả lời)
5. Thêm **Yêu cầu hệ thống** (OS, RAM, Disk)
6. Click **Lưu**

### Quản lý phiên bản
1. Mở phần mềm → tab **Versions**
2. Click **Thêm phiên bản**
3. Upload file, nhập release notes
4. Đánh dấu **Phiên bản mới nhất**

---

## Categories & Tags

### Tạo category
1. Vào **Chuyên mục** → **Thêm mới**
2. Nhập tên, slug, mô tả
3. Click **Lưu**

> ⚠️ Không thể xóa category nếu còn bài viết liên kết.

### Tạo tag
1. Vào **Tags** → **Thêm mới**
2. Nhập tên, slug
3. Click **Lưu**

---

## Media Library

### Upload file
1. Vào **Media**
2. Click **Upload** hoặc kéo thả file
3. File được lưu vào Supabase Storage

### Sử dụng ảnh
- Click vào ảnh để copy URL
- Paste URL vào bài viết hoặc settings

---

## Cài đặt

### Thông tin liên hệ
- **Email liên hệ**: Hiển thị ở footer và trang liên hệ
- **Số điện thoại**: Hiển thị ở footer
- **Địa chỉ**: Hiển thị ở trang liên hệ
- **Giờ làm việc**: Hiển thị ở trang liên hệ
- **Facebook URL**: Link trong footer

### Menu điều hướng
1. Kéo thả để sắp xếp menu
2. Thêm/xóa mục menu
3. Click **Lưu thay đổi**

### SEO
- **Meta Title mặc định**
- **Meta Description mặc định**
- **Google Analytics ID**

---

## Quản lý người dùng

### Vai trò
| Vai trò | Quyền hạn |
|---------|-----------|
| **Admin** | Toàn quyền: Settings, Users, mọi nội dung |
| **Editor** | CRUD bài viết, phần mềm, media |

### Đổi vai trò
1. Vào **Người dùng**
2. Click dropdown vai trò
3. Chọn vai trò mới

> ⚠️ Không thể đổi vai trò của chính mình.

---

*Tài liệu này được cập nhật: 2025-12-21*
