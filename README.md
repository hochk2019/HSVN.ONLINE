# HSVN.ONLINE - Golden Logistics Website

![Next.js](https://img.shields.io/badge/Next.js-15-black?logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)
![Supabase](https://img.shields.io/badge/Supabase-Database-green?logo=supabase)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3-38B2AC?logo=tailwind-css)

Website chuyên nghiệp cho **Công ty TNHH Tiếp Vận Hoàng Kim (Golden Logistics)** - chuyên cung cấp dịch vụ và phần mềm hải quan.

## 🌟 Tính năng chính

### 🏠 Frontend
- **Trang chủ** với thiết kế hiện đại, responsive
- **Trang phần mềm** giới thiệu sản phẩm ECUS5, V5, VNACCS
- **Blog/Tin tức** với SEO tối ưu
- **Trang liên hệ** với form và bản đồ
- **Đa ngôn ngữ** (Tiếng Việt/English)
- **Dark mode** hỗ trợ

### 🔐 Admin Panel (CMS)
- **Quản lý bài viết** - Tạo, sửa, xóa, lên lịch xuất bản
- **Quản lý danh mục & tags**
- **Quản lý media** - Upload ảnh lên Supabase Storage
- **Quản lý phần mềm** - Chi tiết sản phẩm, tính năng, download
- **Thu thập bài viết (Content Aggregator)** - Tự động lấy tin từ RSS
- **AI Writing Assistant** - Hỗ trợ viết content với AI
- **SEO Tools** - Kiểm tra và tối ưu SEO

### 🤖 AI Features
- Tạo tóm tắt tự động
- Gợi ý tiêu đề SEO
- Viết meta description
- Gợi ý danh mục & tags
- Dàn ý bài viết
- Viết lại/dịch nội dung

### 📰 Content Aggregator
- Quản lý nguồn RSS
- Tự động fetch và AI rewrite bài viết
- Phát hiện trùng lặp (URL + Title similarity)
- Tải ảnh về Supabase Storage
- Dashboard thống kê nguồn tin
- Duyệt/Bỏ qua → Tạo bài nháp

## 🛠️ Công nghệ

| Công nghệ | Mô tả |
|-----------|-------|
| **Next.js 15** | React Framework với App Router |
| **TypeScript** | Type-safe JavaScript |
| **Supabase** | PostgreSQL Database + Auth + Storage |
| **TailwindCSS** | Utility-first CSS |
| **TipTap** | Rich Text Editor |
| **OpenRouter AI** | AI API Gateway (miễn phí) |
| **Vercel** | Deployment Platform |

## 📁 Cấu trúc thư mục

```
src/
├── app/                    # Next.js App Router
│   ├── (public)/          # Public pages
│   ├── admin/             # Admin panel
│   └── api/               # API routes
├── components/            # React components
│   ├── admin/             # Admin components
│   ├── editor/            # TipTap editor
│   ├── home/              # Homepage sections
│   └── ui/                # UI primitives
├── lib/                   # Utilities & server actions
└── types/                 # TypeScript types
```

## 🚀 Cài đặt

### Yêu cầu
- Node.js 18+
- Supabase account
- OpenRouter API key (miễn phí)

### Bước 1: Clone repo
```bash
git clone https://github.com/hochk2019/HSVN.ONLINE.git
cd HSVN.ONLINE
```

### Bước 2: Cài đặt dependencies
```bash
npm install
```

### Bước 3: Cấu hình environment
Tạo file `.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
AI_API_KEY=your_openrouter_api_key
AI_BASE_URL=https://openrouter.ai/api/v1
AI_MODEL=google/gemma-2-9b-it:free
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Bước 4: Chạy migrations
Chạy các file SQL trong `supabase/migrations/` trên Supabase Dashboard.

### Bước 5: Chạy development server
```bash
npm run dev
```

Truy cập http://localhost:3000

## 📝 Hướng dẫn sử dụng

### Admin Panel
1. Truy cập `/admin`
2. Đăng nhập bằng tài khoản Supabase Auth
3. Quản lý nội dung qua các menu sidebar

### Content Aggregator
1. Vào **Thu thập tin** > **Quản lý nguồn**
2. Thêm nguồn RSS mới
3. Click **Lấy bài ngay** hoặc chờ cron job
4. Duyệt bài viết và xuất bản

## 🌐 Deploy

### Vercel
1. Import repo vào Vercel
2. Cấu hình Environment Variables
3. Deploy

### Supabase
1. Tạo project mới
2. Chạy migrations
3. Cấu hình Storage bucket `media`
4. Setup RLS policies

## 📄 License

MIT License - Xem file [LICENSE](LICENSE) để biết thêm chi tiết.

## 👨‍💻 Tác giả

**Golden Logistics Team**
- Website: [hsvn.online](https://hsvn.online)
- Email: info@hsvn.vn

---

⭐ Nếu thấy hữu ích, hãy star repo này!
