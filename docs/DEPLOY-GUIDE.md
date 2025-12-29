# 🚀 Hướng dẫn Deploy - Golden Logistics

## Yêu cầu
- Node.js 18+
- Tài khoản [Vercel](https://vercel.com)
- Tài khoản [Supabase](https://supabase.com)

---

## 1. Setup Supabase

### Tạo project
1. Đăng nhập [Supabase Dashboard](https://supabase.com/dashboard)
2. Click **New Project**
3. Nhập tên project, chọn region (Singapore gần VN)
4. Set database password (lưu lại!)

### Chạy migrations
1. Vào **SQL Editor** trong Supabase Dashboard
2. Copy nội dung từ `supabase/migrations/01_schema.sql`
3. Chạy query
4. Lặp lại với các file: `02_rls_policies.sql`, `03_seed_data.sql`, `04_create_admin.sql`, `05_settings_keys.sql`

### Tạo Storage bucket
1. Vào **Storage** → **New bucket**
2. Tên: `media`
3. Chọn **Public bucket**
4. Tạo folder: `uploads`

### Lấy credentials
- **Project URL**: `Settings` → `API` → `Project URL`
- **Anon Key**: `Settings` → `API` → `anon public`
- **Service Role Key**: `Settings` → `API` → `service_role` (chỉ dùng server-side!)

---

## 2. Setup Vercel

### Import project
1. Đăng nhập [Vercel](https://vercel.com)
2. Click **Add New** → **Project**
3. Import từ GitHub repository
4. Framework: **Next.js** (tự detect)

### Environment Variables
Thêm các biến trong Vercel:

```
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIs...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIs... (secreter!)
PREVIEW_SECRET=your-random-secret-string
```

### Deploy
1. Click **Deploy**
2. Đợi build hoàn tất
3. Truy cập domain Vercel để test

---

## 3. Production Checklist

### Bảo mật
- [ ] Đổi database password sau deploy
- [ ] Verify RLS policies đang hoạt động
- [ ] Kiểm tra SUPABASE_SERVICE_ROLE_KEY không bị leak client-side

### SEO
- [ ] Update `NEXT_PUBLIC_SITE_URL` nếu có custom domain
- [ ] Verify sitemap.xml và robots.txt

### Performance
- [ ] Enable Vercel Analytics (optional)
- [ ] Enable Supabase Performance (optional)

---

## 4. Custom Domain

### Vercel
1. Vào **Settings** → **Domains**
2. Add domain của bạn
3. Config DNS theo hướng dẫn

### Cập nhật env
```
NEXT_PUBLIC_SITE_URL=https://yourdomain.com
```

---

## 5. Maintenance

### Chạy migrations mới
```bash
# Set DATABASE_URL
set DATABASE_URL=postgresql://postgres:PASSWORD@db.xxx.supabase.co:5432/postgres

# Chạy migration
node scripts/run-migration.js <migration-file.sql>
```

### Backup database
- Supabase cự cung cấp daily backups (Pro plan)
- Hoặc export manual từ SQL Editor

---

*Last updated: 2025-12-21*
