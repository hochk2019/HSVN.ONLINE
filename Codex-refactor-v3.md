# Codex Refactor Plan v3

> Mục tiêu: Đảm bảo hệ thống hoạt động ổn định khi dữ liệu (bài viết/phần mềm) tăng mạnh, nâng cấp UX cho người dùng & admin, gia cố bảo mật, và chuẩn bị hạ tầng mở rộng dài hạn. Các hạng mục dưới đây cần giao cho Agent Antigravity (Claude Opus 4.5) thực hiện đầy đủ, tuần tự.

---

## 0. Đánh giá hiện trạng (sau refactor v2)

### Logic & codebase
- App Router + Supabase SSR đã vận hành, nhưng nhiều file vẫn chứa `@ts-nocheck` và chuỗi tiếng Việt lỗi encoding (ví dụ `src/app/page.tsx`, `src/components/layout/SharedFooter.tsx`, `scripts/seed-posts.mjs`).  
- Layout/header/footer bị lặp markup ở nhiều trang (Trang chủ, Tìm kiếm, Liên hệ); `SharedFooter`/`Header` gọi Supabase mỗi lần render, chưa cache context.  
- `getSettings` ép JSONB → string, khiến admin không chỉnh menu/hero/footer được.

### Database & dữ liệu
- Schema Supabase có đầy đủ bảng (posts, categories, tags, post_tags, software_products, software_versions, download_logs, contact_messages, settings, audit_logs).  
- Chưa đặt index bổ sung cho các trường truy vấn nhiều (ví dụ `download_logs(software_id, created_at)`, `contact_messages(status)`), gây rủi ro hiệu năng.  
- Settings vẫn dạng key-value → khó mở rộng khi cần cấu hình menu đa cấp, multiple hero sections.

### Giao diện & trải nghiệm
- Trang public đẹp nhưng hero/CTA vẫn hardcode; thiếu block “bài mới theo chuyên mục”, testimonials, case-study…  
- Trang `/tim-kiem` thiếu pagination/filter; SearchBox bị ẩn trên mobile.  
- Form liên hệ/ download chỉ có phản hồi đơn giản, chưa có spam protection.

### Admin UX
- PostForm chưa hỗ trợ tag/attachments, chưa preview/ autosave/ schedule/ assign author.  
- List posts/software/contacts không pagination; khi dữ liệu tăng lớn sẽ chậm.  
- Media library chưa tích hợp vào form (chọn ảnh OG/featured).  
- Dashboard thiếu analytics (view/download/contact).  
- Audit logs mới ghi tạo bài viết, chưa bao phủ update/delete/settings/contact/download.

### Bảo mật
- Download link hiển thị trực tiếp `file_url`, không signed, không kiểm soát lượt tải.  
- Không rate-limit contact/login; không CAPTCHA.  
- Audit chưa ghi login thất bại, đổi settings.  
- Dữ liệu nhạy cảm (email/phone) hiển thị thẳng trên trang public mà không obfuscate.

### Khả năng mở rộng
- Khi số bài & phần mềm tăng 1000+:  
  * Homepage đang fetch toàn bộ software rồi lọc => chậm.  
  * Sitemap build toàn bộ mỗi giờ → dễ timeout.  
  * Search dùng `ilike` trên `title/excerpt` => không index, sẽ rất chậm.  
  * Admin list (posts, contacts) render 50 bản ghi cố định, không filter/ pagination.  
  * Download logs không index, khó thống kê.  
  * Không có queue/background job cho tác vụ nặng (ví dụ rebuild sitemap, gửi email).

---

## 1. Chuẩn hóa Encoding + TypeScript + ESLint

### Công việc
1. **Encoding UTF-8**  
   - Dò toàn bộ repo, chuyển mọi file sang UTF-8, sửa chuỗi bị mojibake. Kiểm tra kỹ các file:  
     * `src/app/page.tsx`, `src/components/layout/SharedFooter.tsx`, `src/app/lien-he/page.tsx`, `src/app/tim-kiem/page.tsx`, `scripts/seed-posts.mjs`, `scripts/seed-articles.mjs`, `supabase/migrations/*.sql`.  
   - Cập nhật `Task.md`/docs nếu có chữ sai.

2. **Bật strict TypeScript**  
   - Xóa `@ts-nocheck` khỏi mọi file.  
   - Sửa lỗi type, bổ sung interface/type alias.  
   - Đảm bảo `tsconfig.json` có `"strict": true`, `"noImplicitAny": true`, `"noUncheckedIndexedAccess": true`.

3. **ESLint + Prettier**  
   - Cài và cấu hình `eslint-config-next`, `@typescript-eslint`, `prettier`.  
   - Tạo script `npm run lint` + `npm run format`.  
   - Thêm hook/CI (nếu có) để chạy lint + typecheck trước khi deploy.

---

## 2. Kiến trúc Layout, Metadata & Caching

### Công việc
1. **Central layout**  
   - Tạo `src/components/layout/AppLayout.tsx` sử dụng `<Header />`, `<SharedFooter />`, `<SearchBox />`.  
   - Áp dụng cho mọi trang public (home, category, post detail, software, search, contact, giới thiệu) để tránh lặp markup.  
   - Header responsive: SearchBox hiển thị ở mobile (toggle off-canvas).

2. **Settings context/caching**  
   - Viết hook `useSettings()` dùng `cache()` (Next 16) + `revalidateTag('settings')`.  
   - `SharedFooter`/`Header` đọc từ context thay vì gọi Supabase trực tiếp.  
   - Khi update settings (`updateSettings`), gọi `revalidateTag`.

3. **Metadata/SEO builder**  
   - Viết helper `buildMetadata({ title, description, canonical, ogImage, type })`.  
   - Mỗi page dynamic (category, post, software) có `generateMetadata` dùng helper, set canonical theo slug, OpenGraph/Twitter, structured data (Article/SoftwareApplication).  
   - Thêm JSON-LD component cho Article & Software detail.

4. **ISR & revalidate**  
   - Đặt `export const revalidate` phù hợp cho từng route (home: 60s, category: 120s, software detail: 300s, search: `'force-dynamic'` + caching query).  
   - Dùng `revalidatePath` khi CRUD posts/software để tránh stale data.

---

## 3. Dịch vụ Settings & cấu hình nội dung

### Công việc
1. **Design schema settings**  
   - Tách settings theo nhóm: `site_info`, `hero`, `menus`, `footer_links`, `seo_defaults`, `social_links`, `facebook_comments`, `contact_info`.  
   - Tạo type + Zod schema, parse JSONB → object.  
   - Cập nhật `getSettings` → trả object typed.  
   - `SettingsForm` hiển thị field dạng form section, hỗ trợ add/remove menu item, reorder, upload logo/favicon/OG.

2. **Admin form**  
   - Validate input, hiển thị lỗi rõ, loading state.  
   - Khi lưu, convert data → JSONB.  
   - Bổ sung toggle `enable_facebook_comments`, `enable_contact_form`, threshold download alert.

3. **Sử dụng settings**  
   - Trang chủ lấy hero title/subtitle/button link từ settings.  
   - Header menu, footer links, contact info hiển thị theo cấu hình.  
   - `robots.txt`, `sitemap` lấy domain từ `NEXT_PUBLIC_SITE_URL` hoặc settings.

---

## 4. Trang chủ & trang public nâng cao

### Trang chủ
1. **Sections mới**  
   - “Sản phẩm nổi bật” (4 cards).  
   - “Bài mới theo chuyên mục”: 3 column, mỗi column hiển thị 3 bài.  
   - “Tài liệu miễn phí/Checklist” (CTA tải pdf).  
   - “Khách hàng nói gì” (testimonial slider).  
   - “Quy trình triển khai” (timeline).  
   - “CTA liên hệ / đăng ký demo”.

2. **Dữ liệu động**  
   - Cho phép editor chọn featured posts/software qua settings hoặc flag `is_featured`.  
   - Dùng `getPublishedPosts` với `limit` + `categorySlug`.

3. **Hiệu năng**  
   - Sử dụng `Promise.all` + `cache`.  
   - Chỉ fetch cột cần thiết.

### Trang public khác
1. **Category page**  
   - Pagination (page param).  
   - Filter theo tag (side bar).  
   - Hiển thị “Bài liên quan”/“Most viewed”.

2. **Post detail**  
   - Table of contents (auto generate).  
   - Attachments (download file).  
   - Tag list + share buttons.  
   - `FacebookComments` chỉ hiển thị khi setting bật; lazy-load SDK.

3. **Software detail**  
   - Use signed download button (xem phần 6).  
   - Hiển thị highlights, FAQ, yêu cầu hệ thống (dữ liệu JSON).  
   - Bảng phiên bản có sort/pagination nếu >10.

4. **Search**  
   - Dùng Supabase FTS (`textSearch`).  
   - Pagination & filters (type, category).  
   - UI highlight keyword.

---

## 5. CMS & Admin trải nghiệm

### Post management
1. **PostForm**  
   - Bổ sung multi-select tags, checkbox allow_comments, toggle featured.  
   - Cho phép upload/đính kèm file: integrate MediaLibrary (pick existing or upload).  
   - Preview mode (render TipTap HTML).  
   - Scheduling: trường `scheduled_at`, server action set status `scheduled`.  
   - Autosave draft (client component).

2. **Post list**  
   - Pagination, search, filter by status/category/tag/author.  
   - Bulk actions (publish/unpublish/delete).  
   - Hiển thị statistics (views, comments count).

### Software management
1. **Software form**  
   - Manage highlights/system requirements/FAQ (UI form builder).  
   - Upload icon/cover via Media picker.  
   - Field “Platform Support”, “Pricing” (free, freemium, paid).  
   - Option gắn Tag (Automation, Barcode, Reporting).

2. **Version manager**  
   - Allow upload file to Supabase Storage via admin, auto generate file_size.  
   - Flag `is_latest` auto update.  
   - Changelog editor (TipTap or markdown).  
   - Display download stats per version.

### Contacts & CRM
1. **ContactActions**  
   - Ghi chú nội bộ, assign nhân sự (profile).  
   - Email reply template + option send to customer (via sendgrid/mail?).  
   - Rate-limit & CAPTCHA (Cloudflare Turnstile or hCaptcha).  
   - Spam detection (check duplicate messages).

2. **Contacts list**  
   - Filter theo status/assigned, search theo email.  
   - Pagination & infinite scroll.

### Users & Permissions
1. **Role management**  
   - Table `profiles` hiển thị role, last_login.  
   - Cho phép admin đổi role, deactivate user.  
   - Middleware/Server actions check `role` (admin vs editor).  

2. **Audit log**  
   - Ghi log cho: login/logout, CRUD posts/software, settings change, contact status change, download toggle.  
   - Trang audit có filter (action/entity/user/date) + pagination.

### Dashboard
1. **Analytics**  
   - Chart view count theo ngày (dùng `posts.view_count` + event tracker).  
   - Download stats (từ `download_logs`).  
   - Contact funnel (new/read/replied).  
   - Top posts/software.

2. **Notifications**  
   - Hiển thị badge khi có liên hệ mới, download cao bất thường.  
   - Optional email/slack alert.

---

## 6. Download & Media Security

### Download flow
1. **Signed download endpoint**  
   - Tạo `app/api/download/route.ts` nhận `versionId`.  
   - Validate version active, tạo signed URL (Supabase Storage).  
   - Ghi log: `download_logs` (version_id, software_id, user_agent, ip, country, created_at).  
   - Tăng `software_products.download_count` (update).  
   - Trả `302` redirect tới signed URL.

2. **DownloadButton**  
   - Gọi endpoint `/api/download?version=...` thay vì `window.open(file_url)`.  
   - Hiển thị lỗi nếu API fail.  
   - Option “Yêu cầu thông tin trước khi tải” (collect email).

3. **Download analytics**  
   - Trang admin software hiển thị biểu đồ download theo phiên bản, top nguồn.  
   - Export CSV log.

### Media management
1. **Media library**  
   - Cho phép tạo thư mục, tag media, search by name/type/date.  
   - Dùng signed URL preview.  
   - Xoá media kèm confirm (kiểm tra file có đang dùng?).  
   - API dọn file không dùng.

2. **Integrate with editor**  
   - TipTap image upload → upload to Supabase Storage, insert link.  
   - Option embed video (YouTube/Vimeo) qua extension.

---

## 7. SEO, Sitemap & Localization

1. **Sitemap phân đoạn**  
   - Thay `src/app/sitemap.ts` bằng dynamic route `/sitemap.xml` → chia child sitemap:  
     * `/sitemap-pages.xml` (static)  
     * `/sitemap-posts-1.xml`, `/sitemap-posts-2.xml`… (paginate 500 URLs)  
     * `/sitemap-software.xml`  
   - Mỗi sitemap dùng `SELECT id, slug` with `range`.  
   - Ping Google/Bing sau khi publish (optional).

2. **Robots & canonical**  
   - `robots.ts` tham chiếu base URL từ env, disallow route private (preview, api).  
   - Setup `x-robots-tag` cho page admin/API.

3. **Structured data**  
   - Post: Article JSON-LD (headline, author, publishedAt, image, keywords).  
   - Software: SoftwareApplication JSON-LD (name, operatingSystem, offers).  
   - BreadcrumbList (Home > Category > Post).

4. **Localization chuẩn bị**  
   - Tách text sang i18n (next-intl hoặc TS dictionary).  
   - Chuẩn bị cho English version (route `/en/...`).

---

## 8. Hiệu năng & dữ liệu lớn

1. **Pagination / infinite scroll**  
   - Category page, search, admin list, audit logs, download logs: implement pagination + “load more”.  
   - API support `limit`, `offset`/`cursor`.

2. **Caching & queue**  
   - Dùng `revalidateTag` + `on-demand revalidate` khi publish.  
   - Tạo edge cache cho static assets (logo, background).  
   - Cân nhắc background job (Edge Functions) cho tác vụ nặng (generate PDF, rebuild sitemap).

3. **Indexes & migrations**  
   - Viết migrations thêm index:  
     * `CREATE INDEX idx_posts_category_status ON posts(category_id, status, published_at DESC);`  
     * `CREATE INDEX idx_download_logs_software_created ON download_logs(software_id, created_at DESC);`  
     * `CREATE INDEX idx_contact_messages_status_created ON contact_messages(status, created_at DESC);`  
     * `CREATE INDEX idx_audit_logs_entity ON audit_logs(entity_type, entity_id);`  
   - Kiểm tra trigger update timestamp.

4. **Data retention**  
   - Chính sách xóa log cũ (download/contact) sau X tháng (tùy compliance).  
   - Backup/restore hướng dẫn.

---

## 9. Bảo mật & Tuân thủ

1. **Auth & RBAC**  
   - Middleware kiểm tra role rõ ràng, redirect unauthorized.  
   - CSRF protection cho server actions quan trọng (settings, delete).  
   - Rate-limit login và contact form (middleware + KV storage).

2. **Privacy**  
   - Mask email/phone khi hiển thị public.  
   - Cookie banner nếu sử dụng tracking.  
   - Cập nhật chính sách bảo mật trong trang `/chinh-sach`.

3. **Audit & logging**  
   - Log login thất bại, reset mật khẩu, đổi settings, download error.  
   - Lưu IP/user agent cho contact spam detection.  
   - Dashboard hiển thị log summary cho admin.

4. **Secrets & scripts**  
   - Đảm bảo `scripts/seed-*.mjs` chỉ đọc `DATABASE_URL` từ env, không log credentials.  
   - `.env.example` liệt kê biến cần thiết (NEXT_PUBLIC_SITE_URL, SUPABASE_URL, SUPABASE_ANON_KEY, SERVICE_ROLE, CAPTCHA key…).  
   - Document quy trình rotate keys.

---

## 10. Testing & CI/CD

1. **Automated tests**  
   - Unit test cho server actions (`contact`, `download`, `settings`, `post-actions`).  
   - Integration test cho API download (mock Supabase).  
   - Playwright smoke test: `/`, `/phan-mem`, `/cong-van/[slug]`, `/tim-kiem`, admin login.

2. **CI Pipeline**  
   - GitHub Actions (hoặc tương đương): install deps, lint, test, build.  
   - Fail pipeline nếu lint/test/tsc lỗi.

3. **Manual QA checklist**  
   - Trước deploy: verify forms, download, settings, search, contact spam, sitemap, robots, SEO meta.  
   - Viết tài liệu “Release checklist”.

---

## 11. Documentation & Hươ
