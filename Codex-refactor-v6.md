# Codex Refactor Plan v6

> Mục tiêu: sau khi tổng hợp kết quả rollout v5, ghi nhận trạng thái hệ thống hiện tại, liệt kê các lỗ hổng và đề xuất roadmap mở rộng (AI-first, tự động hoá nội dung, cá nhân hoá).

## 0. Trạng thái chung
- Kiến trúc Next.js App Router + Supabase (Postgres/Auth/Storage) đã ổn định; toàn bộ public pages, CMS forms và server actions sử dụng Supabase RLS + Edge-friendly APIs (ví dụ layout tổng thể ở `src/app/layout.tsx:21`).
- Các tính năng AI/personalization mới chỉ hiện diện ở dạng component/API rời rạc; phần lớn chưa được nối dây vào UX thực tế hoặc thiếu dữ liệu do chưa chạy migration bổ sung.

## 1. Đánh giá chi tiết theo hạng mục

### 1.1 Public site & nội dung
- ✅ Trang danh mục/bài viết và chi tiết phần mềm đã dựng hoàn chỉnh (pagination + metadata) (`src/app/[category]/page.tsx:1`, `src/app/phan-mem/[slug]/page.tsx:1`).
- ✅ Footer đã đọc dữ liệu từ CMS (`src/components/layout/SharedFooter.tsx`).
- ⚠ Các block testimonial/thống kê dùng dữ liệu tĩnh (Sẽ làm ở phase sau).
- ✅ Trang `/chinh-sach` đã được bổ sung.

### 1.2 Admin CMS
- ✅ PostForm đã có TipTap + AI Writing Assistant, status, lịch xuất bản (`src/components/admin/PostForm.tsx:274`).
- ✅ Nút “Xem trước” đã hoạt động (`/admin/posts/[id]/preview`).
- ✅ TagPicker đã cho phép tạo tag mới.
- ✅ VersionManager đã có uploader (dual mode).
- ✅ Settings page đã được bảo vệ và tái cấu trúc giao diện (Tab layout).

### 1.3 AI, cá nhân hoá & automation
- ✅ AI Writing Assistant và SEO checker đã cắm vào PostForm.
- ✅ Chatbot Golden Copilot đã có RAG (Voyage AI + PgVector).
- ✅ Các endpoint AI (classify, validate schema) đã có UI tiêu thụ.
- ✅ Personalization stack (tracking, SmartCTA) đã được kích hoạt.

### 1.4 Backend/API & hạ tầng
- ✅ Phần lớn CRUD dùng server actions với Supabase.
- ✅ API download đã fix schema logs.
- ✅ Cache settings đã được áp dụng.

### 1.5 Database, migrations & DevOps
- ✅ Bộ migrations chính đã cover schema cốt lõi.
- ✅ Các bảng phục vụ personalization/chatbot/notifications đã được migrate (`scripts/migrate-idempotent.js`).

## 2. Gaps/Bugs ưu tiên cần xử lý (ĐÃ FIX HẾT)
1.  **Thiếu trang `/chinh-sach`** – Đã fix.
2.  **Settings không được bảo vệ** – Đã fix (requireAdmin).
3.  **Preview bài viết chưa hoạt động** – Đã fix.
4.  **TagPicker chưa hỗ trợ tạo tag mới** – Đã fix.
5.  **Download logs sai schema** – Đã fix.
6.  **Tracking/personalization chưa deploy** – Đã fix (run migrations).
7.  **Version download vẫn thao tác thủ công** – Đã fix (uploader).
8.  **Footer hard-code sản phẩm** – Đã fix.
9.  **Trang Liên hệ tốn tài nguyên** – Đã fix (aggregate query).

---

## 6. BÁO CÁO THỰC HIỆN (Antigravity Agent - 2024-12-28)

### ✅ ĐÃ HOÀN THÀNH (Phiên 1-4)
- Xem chi tiết ở file gốc phiên bản cũ.

### ✅ ĐÃ BỔ SUNG (Phiên 5 - 2024-12-28 - Final Polish & Analytics)

| # | Tính năng | Chi tiết | File thay đổi |
|---|-----------|----------|---------------|
| 1 | **Analytics System** | Dashboard hoàn chỉnh với Charts (Recharts), Real-time data, Date filtering | `src/components/admin/AnalyticsDashboard.tsx` |
| 2 | **Database Migration** | Analytics tables, RLS policies, Functions (Idempotent script) | `supabase/migrations/20241227234500_analytics.sql` |
| 3 | **Admin UI UX** | Settings Tab Layout, Sticky Sidebar, Collapsible Menu | `src/components/admin/SettingsForm.tsx`, `AdminSidebar.tsx` |
| 4 | **Social Features** | Facebook Comments toggle, Share Buttons (JS logic fix), Chatbot UI fix | `src/app/[category]/[slug]/page.tsx` |
| 5 | **RAG Chatbot** | Full RAG pipeline with Voyage AI, Admin Knowledge Base UI | `src/lib/voyage-service.ts`, `src/app/admin/rag/page.tsx` |

### ✅ ĐÃ BỔ SUNG (Phiên 6 - 2024-12-28 - Multi-language & AI 2.0)

| # | Tính năng | Chi tiết | File thay đổi |
|---|-----------|----------|---------------|
| 1 | **Multi-language** | Hỗ trợ song ngữ VN/EN, Auto-translation (Google API hybrid), Translation Editor | `translations` table, `TranslationEditor.tsx`, `LanguageSwitcher.tsx` |
| 2 | **Testimonials System** | Full CRUD, Reordering, Display Component | `testimonials` table, `TestimonialManager.tsx`, `PageHome.tsx` |
| 3 | **AI 2.0 Core** | Gemini 3 Flash Preview (OpenAI Compat), Token Limit fixes, Diagnostics UI | `ai-service.ts`, `AIProfileManager.tsx` |
| 4 | **Dynamic Config** | AI Profile Caching (5s TTL), Dynamic Company Contact Info (Hotline/Email from Settings), Anon Key Fallback | `ai-service.ts`, `SettingsForm.tsx` |
| 5 | **Header & Navigation** | Dynamic Dropdown/Accordion Menus, Auto-add Categories | `Header.tsx`, `MenuEditor.tsx` |
| 6 | **Static Localization** | Hero/CTA/Menu support dual language, LocalizedText component, Settings UI update | `src/app/page.tsx`, `Header.tsx`, `SettingsForm.tsx`, `LocalizedText.tsx` |

### 📋 TRẠNG THÁI HIỆN TẠI
- **Hệ thống đã ổn định và sẵn sàng deploy.**
- **Các tính năng core (CMS, AI, RAG, Analytics) đều đã hoạt động.**
- **Bảo mật (Admin guard, RLS) đã được kiểm tra.**

### ⏭ NEXT STEPS (Roadmap mở rộng)
1.  **Deploy Production**: Push code lên Vercel + Link Supabase project.
2.  **Monitor**: Theo dõi logs và performance thực tế.
3.  **Content seeding**: Nhập liệu nội dung thật để train RAG tốt hơn.