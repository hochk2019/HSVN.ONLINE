# Codex Refactor Plan v4

> Muc tieu: hoan thien vong refactor cuoi cung de dam bao CMS van hanh tron tru, dap ung day du yeu cau dang bai/quan tri, va loai bo rui ro bao mat truoc khi chuyen giao.

## 1. Luong bien tap & lich dang
1. **Trang thai len lich**
   - Cap nhat schema/`postSchema` de nhan `scheduled` + `scheduled_at` (ts: `src/lib/schemas.ts:11`, Supabase migrations).
   - PostForm: them truong chon thoi gian publish, nut "Publish ngay"/"Len lich", chan neu ngay qua khu (`src/components/admin/PostForm.tsx:282-289`).
   - Server actions: luu `scheduled_at`, tu set `status='scheduled'`, giu `published_at` null cho toi khi trigger (`src/lib/post-actions.ts`).
   - Tao cron/edge function hoac tac vu thu cong de chuyen `scheduled` sang `published` khi den han.
2. **Danh sach bai viet**
   - Filter theo khoang ngay, author, tag.
   - `getPosts` dung `select('*', { count: 'exact' })` de co tong trang -> pagination dung (`src/lib/post-actions.ts:13-39`).
   - Them bulk actions (publish/unpublish/delete) danh cho admin.
3. **Preview & share**
   - Nut "Xem truoc" mo route public draft (signed token).
   - Hoan thien nut share/copy link tren trang bai viet (`src/app/[category]/[slug]/page.tsx:198-207`).

## 2. Taxonomy & Tagging
1. Tao cac route con thieu:
   - `/admin/categories/new`, `/admin/categories/[id]` CRUD day du.
   - `/admin/tags/new`, `/admin/tags/[id]` voi create/update/delete.
2. `TagPicker`: goi API tao tag moi (slug auto), hien thi spinner/toast thay vi TODO (`src/components/admin/TagPicker.tsx:37-44`).
3. Rang buoc du lieu: khong cho xoa category dang co bai; de xuat chuyen sang category khac.

## 3. Module phan mem & tai xuong an toan
1. **SoftwareForm**
   - UI cho highlights (list bullet), FAQ (Q/A), yeu cau he thong (OS, RAM, phu thuoc), pricing, screenshot gallery, tags (Automation/Barcode/Reporting).
   - Cho phep upload icon/cover/screenshot qua MediaLibrary (drag-drop, chon tu thu vien).
2. **VersionManager**
   - Tich hop Supabase Storage: upload file, doc metadata (size, mimetype), luu path chuan `media/installers/...`.
   - Khi danh dau `is_latest`, tu unset cac version khac trong transaction.
   - Cho phep them changelog rich-text.
3. **Public `/phan-mem/[slug]`**
   - Render highlights cards, FAQ accordion, system requirements, CTA download/sign-up.
   - Them block "Ban dung thu" hoac "Video demo" neu settings cung cap.
4. **API `/api/download`**
   - Neu file nam trong bucket private thi tao signed URL tu path luu DB, khong phu thuoc URL nguoi dung nhap (`src/app/api/download/route.ts`).
   - Gioi han toc do theo IP (vi du 10/phut) de tranh abuse.

## 4. Settings & noi dung tinh
1. **Contact/Footer dynamic**
   - Trang `lien-he` va Footer doc dia chi/dien thoai/email/link tu settings thay vi hardcode (`src/app/lien-he/page.tsx`, `src/components/layout/SharedFooter.tsx`).
   - Cho phep cau hinh menu footer nhieu cot, link chinh sach, Facebook fanpage.
2. **Logo/Favicon/OG**
   - Them picker trong Settings cho logo (header), favicon, OG default image; Header/Footer su dung URL tu DB.
3. **Chinh sach**
   - Tao trang `/chinh-sach` (privacy) voi noi dung editable (settings hoac CMS).
4. **Form contact**
   - Cho phep bat/tat form, cau hinh email nhan thong bao, optional reCAPTCHA/Turnstile key.
5. **`updateSettings` khong ep kieu**
   - Bo logic convert string -> number de tranh mat so 0 dau (`src/lib/settings-actions.ts:52-65`).

## 5. Search & SEO
1. Su dung Postgres Full Text Search (`websearch_to_tsquery`) cho bai viet va phan mem; them index tuong ung (`scripts/migrations/add-performance-indexes.sql`).
2. Trang `/tim-kiem`: filter theo loai (post/software), category, co pagination & highlight keyword (`src/app/tim-kiem/page.tsx`).
3. JSON-LD: SoftwareApplication doc highlights/FAQ, Article mo rong schema attachments neu co.
4. Sitemap: them trang `/chinh-sach`, `/phan-mem/[slug]` khi status active, category listing.

## 6. Admin UX & RBAC
1. **Notifications**
   - Them migration `admin_notifications` vao Supabase; remove catch `42P01` (`src/lib/notification-actions.ts:23-45`).
   - UI dropdown: mark-as-read, load-more, link den trang chi tiet.
2. **Users & phan quyen**
   - Trang `/admin/users`: implement flow moi user qua email (Supabase), cho phep doi role, deactivate.
   - Ap dung `requireAdmin` cho Settings, Users, Audit log (`src/lib/auth-actions.ts:82-90`).
3. **Contacts CRM**
   - Luu nguoi xu ly, ghi chu noi bo, tag (hot/spam).
   - Cho phep export CSV.
4. **Dashboard**
   - Them bieu do view/download/contact theo tuan, card canh bao (vi du co version chua co file).

## 7. Media & assets
1. `getMediaFiles` tra ve danh sach dung thu muc (`uploads/`), tra URL hoan chinh (`src/lib/post-actions.ts:274-288`).
2. MediaLibrary: preview nhieu dinh dang, loc theo loai, hien kich thuoc & ngay.
3. Ho tro tao thu muc logic (/uploads/posts, /uploads/software) va bo loc tuong ung trong picker.

## 8. Bao mat & van hanh
1. Go cac script chua connection string, thay bang huong dan Supabase CLI + env (`scripts/run-indexes-migration.js`, `scripts/run-notifications-migration.js`). Rotate password ngay.
2. Cai dat git hook/`git-secrets` de chan commit credentials.
3. Contact form: giu rate-limit, bo sung tuy chon CAPTCHA, log IP/UA vao `contact_messages`.
4. Review RLS policies dam bao editor chi CRUD phan duoc quyen.

## 9. Kiem thu & tai lieu
1. Unit test cho `post-actions` (scheduled), `software-actions` (upload + is_latest), `settings-actions` (menu JSON).
2. Checklist QA: dang nhap, tao draft, len lich, tai phan mem, chinh menu/footer, bat/tat Facebook comments.
3. Cap nhat tai lieu HDSD Admin, huong dan deploy (Vercel + Supabase, env, storage bucket).
