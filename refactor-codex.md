# Prompt cho Agent Antigravity (Claude Opus 4.5)

Bạn là Agent Antigravity, dùng Claude Opus 4.5 để refactor dự án Next.js 16 + Supabase (App Router, Tailwind, shadcn/ui, TipTap). Repository nằm tại thư mục gốc hiện tại. Mọi mã nguồn phải dùng UTF-8, tuân thủ strict TypeScript, không để lại `@ts-nocheck` khi bàn giao.

## Bối cảnh & vấn đề chính
- Chuỗi tiếng Việt bị lỗi encoding (ví dụ `src/app/layout.tsx`, `src/components/layout/SharedFooter.tsx`), khiến UI/SEO hỏng.
- Trang public đang `force-dynamic`, mỗi request lại gọi Supabase (kể cả footer/header). Không có caching/ISR.
- Trang chủ chỉ lấy settings, thiếu dữ liệu bài viết/phần mềm và không bám theo Task.md.
- `getSettings` flatten JSON thành string, nên admin không chỉnh được các object/array; nhiều form bị `@ts-nocheck`.
- Form liên hệ không lưu dữ liệu, trong khi admin contacts kỳ vọng đọc từ Supabase.
- Ghi nhận download & counter chưa hoạt động (`logDownload` không được gọi, RPC `increment` không tồn tại).
- Toggle Facebook Comments không được tôn trọng.
- SEO chưa đủ: sitemap/robots cố định domain, không liệt kê post/software, chưa có canonical/schema.
- Secrets Supabase (user/pass) bị hardcode trong scripts.
- CMS không quản lý tags/attachments như Task.md; audit logs chưa được ghi từ server actions.

## Mục tiêu chính
1. Chuẩn hóa encoding UTF-8, bật lại strict TS + ESLint, loại bỏ `@ts-nocheck`.
2. Thiết lập Layout chuẩn dùng `Header`/`SharedFooter` toàn site, cache settings bằng `cache()/revalidateTag` hoặc React context.
3. Hoàn thiện trang chủ và các trang public để lấy dữ liệu động (featured software, bài mới theo chuyên mục, testimonial v.v.) đúng mô tả Task.md.
4. Thiết kế lại hệ thống settings (có thể tách bảng hoặc chuẩn hóa JSON), đảm bảo admin form đọc/ghi đúng kiểu.
5. Hoàn thiện form liên hệ (server action + insert Supabase + thông báo + quản lý trạng thái trong admin).
6. Hoàn chỉnh cơ chế download: endpoint ký URL, ghi log, tăng `download_count`, dùng Supabase Storage an toàn.
7. Tôn trọng toggle Facebook Comments, lazy-load SDK một lần, thêm cảnh báo privacy.
8. Bổ sung SEO: sitemap động, robots tham chiếu biến môi trường, canonical/meta/schema cho Article & SoftwareApplication, route `/tim-kiem` sử dụng Supabase FTS.
9. Bảo mật: bỏ cred khỏi script, dùng `.env`, xoá dữ liệu nhạy cảm khỏi git (hoặc tài liệu hướng dẫn rotate). Thêm audit logging vào mọi server action chính.
10. Testing & deploy: thêm smoke tests (Playwright/Cypress hoặc vitest server actions), cập nhật hướng dẫn migration Supabase & deploy Vercel.

## Công việc chi tiết
### 1. Encoding & TypeScript hygiene
- Chuẩn UTF-8 toàn repo, đảm bảo tiếng Việt hiển thị đúng.
- Bật strict TS, gỡ `@ts-nocheck`, dùng types hoặc `zod` validation.
- Cấu hình ESLint + Prettier (hoặc dùng đã có) để fail CI nếu còn lỗi.

### 2. Layout & caching
- Dùng `src/components/layout/Header|SharedFooter` trong `src/app/layout.tsx`.
- Áp dụng `cache()` + `revalidateTag` để đọc settings một lần, tránh Supabase ở mỗi component.
- Gỡ `force-dynamic` nếu không cần; thiết lập `export const revalidate = <n>` phù hợp cho từng route.

### 3. Nội dung động trang chủ & public
- Trang `/` phải truy vấn Supabase: danh sách phần mềm nổi bật, bài mới cho 3 chuyên mục, testimonials (có thể cấu hình trong settings), CTA rõ ràng.
- Trang category và chi tiết bài cần pagination, related posts, attachments, tags.
- Trang `/phan-mem` + `/phan-mem/[slug]` phải đọc highlights/FAQ/system requirements đúng schema DB (JSONB).

### 4. Hệ thống settings & admin UX
- `getSettings` trả về object typed (không ép string khi là JSON). Có thể tách bảng `site_settings`, `menu_items`, hoặc dùng JSON schema + `zod`.
- `SettingsForm` hiển thị đủ trường trong Task.md: site info, menu/header/footer, SEO default, Facebook comments toggle, contact info đa kênh.
- Bổ sung khả năng chọn logo/favicon/OG image từ media library.

### 5. Liên hệ & lead management
- Tạo server action (hoặc API route) xử lý form: validate, insert `contact_messages`, gửi email/Zalo nếu cần (ít nhất log), rate-limit theo IP.
- Admin contacts: cho phép mark read/replied/archived, xóa, thêm ghi chú. Buttons phải gọi server action tương ứng.

### 6. Download & media
- Tạo endpoint `/phan-mem/[slug]/download/[versionId]` (hoặc API route) dùng signed URL từ Supabase Storage, trước khi redirect phải:
  - ghi `download_logs` (phiên bản, IP, user-agent, optionally country),
  - tăng `download_count` bằng `update` hoặc RPC hợp lệ.
- UI hiển thị kích thước file, checksum (nếu có), số lượt tải thực tế từ DB.
- Media library: cho phép chọn file từ PostForm/SoftwareForm (modal hoặc picker).

### 7. Facebook Comments toggle
- Đọc `enable_facebook_comments` từ settings. Chỉ render `<FacebookComments>` khi bật.
- SDK nạp lazy (one-time), thêm fallback message nếu tắt.

### 8. SEO & tìm kiếm
- Tạo `/tim-kiem` nhận `q`, dùng Supabase full-text search (`select().textSearch` hoặc RPC) cho posts + software.
- Tạo sitemap động (posts/categories/software) với `revalidate` hợp lý, domain lấy từ biến `NEXT_PUBLIC_SITE_URL`.
- Robots tham chiếu sitemap mới, disallow đúng route admin/api.
- Bổ sung canonical url, OpenGraph, Twitter, Article/SoftwareApplication schema generator.

### 9. Bảo mật & audit
- Xóa credentials khỏi `scripts/seed-*.mjs`, dùng biến môi trường, cập nhật README hướng dẫn chạy seed.
- Thêm hooks ghi `audit_logs` cho login/logout, CRUD posts/software/tags/settings, contact status.
- Đảm bảo middleware + server actions kiểm tra role đúng (admin/editor), không để lộ service key.

### 10. Kiểm thử & bàn giao
- Viết ít nhất 1-2 smoke test (ví dụ Playwright mở trang chủ, trang phần mềm, trang bài viết).
- Cập nhật tài liệu deploy: biến môi trường, Supabase migrations, cách tạo admin/editor, checklist acceptance.
- Chạy `npm run lint`, `npm run build`, test scripts; document kết quả trong PR/commit.

## Tiêu chí chấp nhận
- Không còn chuỗi tiếng Việt lỗi encoding.
- Trang public tải dữ liệu động đúng mô tả Task.md; caching/ISR hoạt động.
- Admin có thể chỉnh mọi cấu hình và chúng phản ánh real-time (sau revalidate).
- Form liên hệ lưu được bản ghi, admin thay đổi trạng thái được.
- Download counter/log hoạt động và không cần RPC giả.
- Facebook comments obey toggle, SEO sitemap/canonical đầy đủ.
- Secrets không còn trong repo; audit logs ghi lại các thao tác chính.
- Build + lint + test pass.

## Lưu ý
- Tuân thủ triết lý “miễn phí/tiết kiệm” trong Task.md: ưu tiên giải pháp sẵn có của Supabase/Vercel, không thêm dịch vụ trả phí.
- Giữ phụ thuộc hiện tại; chỉ thêm package khi thực sự cần.
- Ghi lại mọi migration Supabase mới vào `supabase/migrations` và cập nhật hướng dẫn chạy.
- Đảm bảo không để lộ khóa hoặc dữ liệu nhạy cảm trong commit/prompt này.
