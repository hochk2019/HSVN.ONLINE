# Codex Refactor Plan v7

> Mục tiêu: Rà soát lại toàn bộ codebase, DB, frontend/backend sau rollout v6 và chốt các hạng mục cần củng cố trước khi triển khai chính thức (AI-first + analytics + đa ngôn ngữ).

## 0. Trạng thái kiến trúc & release

- Next.js 16 App Router + TypeScript phối hợp Supabase SSR/server actions cho toàn bộ public/admin flows; `src/app/layout.tsx` gắn `HeaderWrapper`, `TrackingProvider`, `ChatWidget`, `SEOWrapper` để tái sử dụng điều hướng, tracking và SEO trên mọi trang, `src/lib/supabase-server.ts` chuẩn hóa client.
- Chủ đề/SEO/analytics được tiêm từ `ThemeWrapper` (`src/components/ThemeWrapper.tsx`) giúp đọc settings (primary color, favicon, GA, Clarity, Facebook Pixel) và expose CSS variables, favicon động, script đo lường.
- Tooling & tài liệu: `package.json` bao gồm `lint`, `typecheck`, `vitest`, `playwright`; thư mục `docs/` duy trì `ADMIN-GUIDE.md`, `DEPLOY-GUIDE.md`, `PLAN_*`, `QA-CHECKLIST.md` cùng schema hình ảnh Supabase để dễ bàn giao.

## 1. Đánh giá chi tiết theo mảng

### 1.1 Public site & trải nghiệm
- Trang chủ (`src/app/page.tsx`) dựng hero, CTA, stats, danh sách sản phẩm + bài viết dựa trên `getSettings`/`getPublicSoftware`/`getLatestPostsByCategory`, dùng `LocalizedText` + `LanguageSwitcher` để hỗ trợ VN/EN, đồng bộ CTA/điện thoại/email từ settings.
- Header/Navigation đọc menu cấu hình + cây categories (`src/components/layout/HeaderWrapper.tsx`, `src/components/admin/MenuEditor.tsx`) để render dropdown + accordion (desktop/mobile) kèm chuyển ngữ, `SearchBox`, `SmartCTA`, `RecommendedPosts`, `ChatWidget` phủ mọi trang.
- Testimonials, số liệu xã hội và block chia sẻ đọc runtime data thay vì hard-code (`src/components/home/Testimonials.tsx`, `src/components/ShareButtons.tsx`, `src/components/home/Stats.tsx`) với fallback để không gián đoạn khi DB rỗng.
- Trang chi tiết bài viết (`src/app/[category]/[slug]/page.tsx`) thêm `BreadcrumbJsonLd`, `SEOWrapper`, `TrackPostView`/`ViewTracker`, `ArticleViewer` (tự động dịch nội dung khi người dùng chuyển EN) và `SmartCTA`/`RecommendedPosts` nhằm tăng tương tác.

### 1.2 Admin CMS & quy trình nội dung
- `middleware.ts` + `src/app/admin/(dashboard)/layout.tsx` + `requireAdmin` khóa toàn bộ `/admin`, đồng thời hiển thị `AdminSidebar`/`AdminHeader` với notification bell và thông tin phiên hiện tại.
- `PostForm` (`src/components/admin/PostForm.tsx`) tích hợp TipTap editor, upload ảnh, status/scheduling, preview, TagPicker, ai assistant (`AIWritingAssistant.tsx`, `AISuggest.tsx`, `SchemaValidator.tsx`), và TranslationEditor để nhập bản dịch thủ công.
- `SettingsForm` (`src/components/admin/SettingsForm.tsx`) dựng tab (General/Homepage/AI/SEO/Appearance/Static) quản lý contact info, hero, CTA đa ngôn ngữ, menu builder, analytics toggles, social IDs, theme colors, static copy, AI Profiles (`AIProfileManager.tsx`) và Voyage key manager.
- Bộ công cụ còn bao gồm `SoftwareForm`, `VersionManager` (phát hành phần mềm + uploader), `AnalyticsDashboard.tsx`, `TestimonialManager.tsx`, `RAGManager.tsx`, `MediaLibrary.tsx`, `TranslationEditor.tsx`, `VoyageKeyManager.tsx` giúp vận hành CMS/AI.

### 1.3 AI, personalization & automation
- `src/lib/ai-service.ts` quản lý cấu hình model (OpenRouter/OpenAI/Azure), cache 5s, fallback qua danh sách free models, tự lấy company info từ settings; `AIProfileManager.tsx` cho phép định nghĩa nhiều profile + Active profile.
- Golden Copilot chatbot (`src/components/ChatWidget.tsx`, `src/app/api/ai/chat/route.ts`) áp dụng rate limit, log `chat_sessions` và hiển thị theo kiểu floating widget; `ImageAltGenerator`, `ContactAIAnalyzer`, `AIWritingAssistant`, `AISuggest` tận dụng các endpoint `/api/ai/*`.
- RAG pipeline dùng Voyage embeddings (`src/lib/voyage-service.ts`, `supabase/migrations/01_schema.sql` + `post_embeddings`), admin có thể ingest/search bằng `RAGManager.tsx`, API `/api/embeddings/ingest|search` gọi RPC `search_posts`.
- Đa ngôn ngữ: `LanguageSwitcher.tsx`, `LocalizedText.tsx`, `useTranslatedContent.tsx` cùng migrations `20241228_translations.sql` mở rộng JSONB translations; `ArticleViewer.tsx` lắng nghe sự kiện đổi ngôn ngữ và trigger `/api/ai/translate`.
- Personalization & tracking: `TrackingProvider.tsx`, `/api/track/route.ts` ghi `user_events`, `useExperiment.tsx` + `ExperimentCTA` gọi RPC `get_experiment_variant`, `SmartCTA`/`RecommendedPosts` điều chỉnh CTA theo ngữ cảnh.

### 1.4 Backend/API, analytics & tích hợp
- Server actions (`src/lib/post-actions.ts`, `settings-actions.ts`, `public-actions.ts`, `software-actions.ts`, `testimonial-actions.ts`, `taxonomy-actions.ts`) xử lý CRUD, revalidate path, audit log.
- Tracking & analytics: `ViewTracker.tsx` + `/api/track/view/route.ts` gọi functions `record_visit`/`increment_view_duration` (migrations `20241227234500_analytics.sql`), `/api/admin/analytics/route.ts` tổng hợp traffic/device/top posts hiển thị trong `AnalyticsDashboard.tsx`.
- APIs bổ sung cho download (`src/app/api/download`), contact intent/classifier, embeddings, experiments, voyage key test, preview, etc; middleware giữ session đồng bộ cookies Supabase (`middleware.ts`).
- Script kiểm tra (`scripts/verify-analytics.js`, `scripts/check-*.js`) giúp validate schema/logs trên Supabase ngoài Next runtime.

### 1.5 Database, migrations & DevOps
- Core schema (posts, categories, tags, software_products/versions, contacts, profiles, audit_logs, download_logs, post_embeddings, user_events, experiments, chat_sessions, settings) định nghĩa trong `supabase/migrations/01_schema.sql` + `02_rls_policies.sql` và type-safe qua `src/types/database.types.ts`.
- Migration mới: `20241227234500_analytics.sql` (analytics_visits + RPC), `20241228_testimonials.sql`, `20241228_categories_parent.sql`, `20241228_translations.sql` phục vụ menu cha-con, testimonials, JSONB translations, view tracking.
- Scripts CLI: `scripts/migrate-idempotent.js`, `scripts/run-migration.js`, `scripts/verify-analytics.js`, `scripts/seed-*.mjs`, `scripts/check-schemas.js` hỗ trợ rollout idempotent và seed dữ liệu; supabase schema snapshot (`supabase-schema-*.png`) giúp tài liệu hóa.
- Dev guides: `docs/DEPLOY-GUIDE.md`, `docs/ADMIN-GUIDE.md`, `docs/PLAN_*` mô tả quy trình deployment, analytics kế hoạch, personalization & CI.

### 1.6 Testing, QA & observability
- Unit schema tests tồn tại trong `src/lib/schemas.test.ts` (Vitest + jsdom config `vitest.config.ts`, setup `src/test/setup.ts`), bao phủ validation cơ bản của post/contact.
- Playwright e2e (`e2e/public.spec.ts`, `e2e/admin.spec.ts`, `playwright.config.ts`) kiểm tra flow chính (public browse, admin CRUD) với baseURL `http://localhost:3000`.
- QA/CI kế hoạch trong `docs/QA-CHECKLIST.md`, `docs/PLAN_TESTING_CI.md`; environment example `.env.example`, `.env.local` phục vụ cấu hình.

## 2. Tồn tại / rủi ro mở sau khi rà soát

1. **API dịch tự động đang mở công khai** – `/api/ai/translate` (`src/app/api/ai/translate/route.ts`) nhận POST không cần auth; khi `SUPABASE_SERVICE_ROLE_KEY` tồn tại, endpoint đọc/ghi thẳng `posts.translations`. `ArticleViewer` kích hoạt endpoint khi người dùng đổi ngôn ngữ, vì vậy bất kỳ visitor nào cũng có thể tiêu tốn quota AI và ghi bản dịch vào DB bằng quyền service role.
2. **Tracking endpoints dùng service role mà không chống spam** – `/api/track/route.ts` sử dụng `createClient(..., SUPABASE_SERVICE_ROLE_KEY)` cho mọi event page view/CTA và chấp nhận payload tùy ý; không có auth/token hoặc throttling nên dễ bị flood, gây nhiễu `user_events` và làm lộ hành vi server role tương tự.
3. **Rate limit AI dựa trên memory local** – cả `/api/ai/chat/route.ts` và `/api/ai/translate/route.ts` lưu limit trong `Map` module-scope. Trên môi trường serverless (Vercel), map reset mỗi deployment/instance và không chia sẻ giữa regions → không bảo vệ được trước abuse thực tế và khó audit.
4. **Quy trình dịch/RAG chạy ngay trên client/admin tab** – `ArticleViewer.tsx` tự gọi AI mỗi khi người dùng đầu tiên chọn EN, `RAGManager.tsx` loop toàn bộ bài viết và ngủ 5s giữa từng lần ngay trong UI. Thiếu hàng đợi/background worker khiến admin tab dễ timeout, không có retry trung tâm và khó lên lịch ngoài giờ.
5. **Credential Postgres hard-code** – các script `scripts/migrate-idempotent.js`, `scripts/verify-analytics.js` chứa connection string đầy đủ (host, user, password). Việc commit thông tin này vào repo là rủi ro bảo mật và gây khó khăn khi muốn dùng môi trường khác.
6. **Coverage kiểm thử hạn chế** – ngoài `schemas.test.ts`, chưa có unit/integration test cho analytics, tracking, AI endpoints; Playwright specs chưa được tự động hóa trong CI. Những tính năng vừa bổ sung (analytics dashboard, personalization, translations) hiện chưa có regression test.

## 3. Lộ trình đề xuất sau đánh giá

- **Harden AI & tracking APIs**: bắt buộc admin session/signed token cho `/api/ai/translate` và `/api/track`, tách thao tác ghi DB ra Edge Function dùng service key, thêm rate limit phân tán (Upstash/Redis) cùng logging tập trung.
- **Đưa dịch & RAG về background job**: tạo Supabase Queue/cron hoặc server action riêng để admin bấm “Translate/Ingest” và job chạy ở server (có trạng thái, retry, thông báo) thay vì thực thi từ trình duyệt.
- **Ẩn secrets khỏi repo**: chuyển toàn bộ connection string sang `.env`, dùng Supabase CLI/`supabase/config.toml` để chạy migrations, xóa credential cũ khỏi lịch sử và cập nhật hướng dẫn trong `docs/DEPLOY-GUIDE.md`.
- **Mở rộng observability & kiểm thử**: thêm endpoints healthcheck cho analytics RPC, viết thêm Vitest cho tracking/AI service, bật Playwright trong CI (sử dụng `docs/PLAN_TESTING_CI.md`) trước mỗi release.
- **Chống nhiễu dữ liệu người dùng**: bổ sung hàng đợi hoặc sampling cho `/api/track`, hash session/UA trước khi ghi, chuẩn hóa schema `user_events`/`analytics_visits` để tách bot traffic và đảm bảo dashboard phản ánh số liệu thực.

---

## 4. BÁO CÁO THỰC HIỆN (Antigravity Agent - 2024-12-28)

### ✅ ĐÃ HOÀN THÀNH - Phase 7 Security Hardening

| # | Vấn đề gốc | Giải pháp | File thay đổi |
|---|------------|-----------|---------------|
| 1 | API dịch tự động mở công khai | Thêm `requireAdmin` check | `src/app/api/ai/translate/route.ts` |
| 2 | Tracking endpoints không chống spam | Zod validation payload | `src/app/api/track/route.ts` |
| 3 | Rate limit AI dựa trên memory local | DB-based với RPC `check_rate_limit` | `20241228_rate_limits.sql`, `src/app/api/ai/content/route.ts` |
| 4 | Dịch/RAG chạy trên client/admin tab | Translation Queue API | `20241228_translation_queue.sql`, `src/app/api/admin/translate-queue/route.ts` |
| 5 | Credential Postgres hard-code | Chuyển sang `process.env.DATABASE_URL` | `scripts/migrate-idempotent.js`, `scripts/verify-analytics.js` |
| 6 | Coverage kiểm thử hạn chế | 17 unit tests (rate-limit, tracking, schemas) | `src/lib/rate-limit.test.ts`, `src/lib/tracking.test.ts` |

### 📋 TRẠNG THÁI DATABASE
- **28 bảng** đã tồn tại và đồng bộ
- `rate_limits` ✅ Đã migrate
- `translation_queue` ✅ Đã migrate
- Tất cả RPC functions đã hoạt động

### ⏭ NEXT STEPS
1. **Deploy Production**: Push code lên Vercel
2. **Monitor Logs**: Theo dõi rate limit và translation queue
3. **UI Integration**: Thêm Translation Queue UI vào Admin

