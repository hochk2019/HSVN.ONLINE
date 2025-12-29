# Task.md — Website “Công ty TNHH Tiếp Vận Hoàng Kim” (Golden Logistics)

> **Mục tiêu:** Tạo website hiện đại, tối ưu SEO, có **khu vực quản trị (CMS) đầy đủ** để người không biết code vẫn đăng bài, thêm phần mềm, upload file, chỉnh SEO/menu/footer…  
> **Deploy miễn phí (ưu tiên):** Vercel (Next.js) + Supabase (Postgres/Auth/Storage).  
> **Designer/Developer credit (hiển thị):** **Học HK** — hochk2019@gmail.com — 0868.333.606

---

## 0) Tài nguyên đã cung cấp (Assets)
1) **Logo công ty**: `Logo moi 2- size bé.png` (file đã upload)  
   - Yêu cầu: dùng làm logo header + favicon + OG image mặc định (nếu chưa có OG image riêng).
2) **Tài liệu giới thiệu/hướng dẫn phần mềm (2 file)**:
   - Customs Extractor V2 (trích xuất danh sách hàng từ tờ khai Excel)
   - Customs Barcode Automation v1.3.0 (tự động lấy mã vạch tờ khai, kết nối ECUS5/VNACCS)

> Agent phải **đọc 2 tài liệu này** và chuyển thành nội dung trang “Phần mềm” trong website + FAQ + Hướng dẫn sử dụng ngắn gọn.

---

## 1) Phạm vi chức năng (Scope)

### 1.1 Public (khách truy cập)
- Trang chủ tổng hợp: phần mềm nổi bật + bài mới theo chuyên mục + search.
- Trang “Phần mềm”:
  - Danh sách phần mềm
  - Chi tiết phần mềm + phiên bản + nút tải + hướng dẫn + FAQ
- Trang bài viết theo chuyên mục:
  1) Công văn / Quyết định / Thông tư / Nghị định / Luật hải quan
  2) HS code / kết quả phân tích phân loại / xác định trước mã số
  3) Hướng dẫn thủ tục hải quan
- Trang chi tiết bài viết:
  - Nội dung đẹp, đọc dễ
  - Tài liệu đính kèm
  - Bài liên quan
  - **Nhúng bình luận Facebook** theo URL canonical (bật/tắt trong Admin)
- Trang: Giới thiệu, Liên hệ (form), Chính sách (privacy).

### 1.2 Admin (quản trị — người không biết code vẫn dùng được)
- Đăng nhập (Supabase Auth)
- Dashboard
- Quản lý bài viết (CRUD + lịch đăng + nháp + preview)
- Quản lý chuyên mục, tag
- Quản lý phần mềm, phiên bản, file cài đặt
- Media library (ảnh/file)
- Settings:
  - Thông tin công ty, logo, favicon
  - Menu/Header/Footer
  - SEO mặc định
  - Facebook Comments: enable/disable + appId (nếu có)
- Users (admin-only): phân quyền admin/editor
- Audit logs (ai làm gì, khi nào)

---

## 2) Yêu cầu kỹ thuật (BẮT BUỘC)

### 2.1 Stack
- Next.js (App Router) + TypeScript
- TailwindCSS + shadcn/ui
- TipTap Editor (lưu JSON trong DB)
- Supabase: Postgres + Auth + Storage + RLS

### 2.2 Deploy
- Vercel: host web (SSR/ISR)
- Supabase: DB/Auth/Storage

### 2.3 Bảo mật (critical)
- **Bật RLS cho toàn bộ bảng**.
- Public chỉ đọc `published`/`active`.
- Admin/editor mới CRUD được nội dung.
- Settings chỉ admin chỉnh.

### 2.4 SEO
- URL đẹp: theo chuyên mục, ví dụ:
  - `/cong-van/[slug]`
  - `/hs-code/[slug]`
  - `/thu-tuc-hai-quan/[slug]`
  - `/phan-mem/[slug]`
- sitemap.xml, robots.txt
- OpenGraph/Twitter meta
- canonical
- schema.org: Article + SoftwareApplication

### 2.5 Hiệu năng
- Trang public ưu tiên SSG/ISR
- next/image
- defer load Facebook SDK (không chặn render)

---

## 3) IA / Sitemap (định tuyến)

### Public
- `/` Trang chủ
- `/phan-mem` Danh sách phần mềm
- `/phan-mem/[slug]` Chi tiết phần mềm
- `/cong-van` List bài (phân trang)
- `/cong-van/[slug]` Chi tiết
- `/hs-code` List
- `/hs-code/[slug]`
- `/thu-tuc-hai-quan` List
- `/thu-tuc-hai-quan/[slug]`
- `/tim-kiem?q=...` Tìm kiếm
- `/gioi-thieu`
- `/lien-he`
- `/chinh-sach` (privacy tối thiểu)

### Admin
- `/admin/login`
- `/admin/dashboard`
- `/admin/posts` + `/admin/posts/new` + `/admin/posts/[id]`
- `/admin/categories`
- `/admin/tags`
- `/admin/software` + `/admin/software/[id]` + `/admin/software/[id]/versions`
- `/admin/media`
- `/admin/settings`
- `/admin/users` (admin-only)
- `/admin/audit-log`

---

## 4) Thiết kế UI/UX (chuẩn “modern + dễ đọc”)
- Layout rộng ~1100–1200px, responsive
- Header sticky: Logo + Menu + Search
- Cards bo tròn 2xl, shadow nhẹ
- Typography rõ ràng (font hỗ trợ tiếng Việt)
- Trang bài viết:
  - mục lục (TOC) nếu bài dài
  - callout box
  - table styling
  - code block styling
- Admin:
  - sidebar, breadcrumbs
  - bảng dữ liệu có filter/sort/search
  - autosave nháp
  - preview trước publish
  - confirm khi xoá
  - toast thông báo

---

## 5) Database (Supabase Postgres) — schema + RLS

> Agent phải cung cấp **migration SQL** + seed tối thiểu.

### 5.1 Bảng
- `profiles` (id = auth.users.id, role admin/editor)
- `categories` (seed 3 chuyên mục)
- `tags`
- `posts` (TipTap JSON + status + SEO fields + published_at)
- `post_tags`
- `post_attachments`
- `software_products`
- `software_versions`
- `download_logs` (optional nhưng nên có)
- `contact_messages`
- `settings` (key/value jsonb)
- `audit_logs`

### 5.2 RLS policies (tóm tắt)
- Public:
  - SELECT posts WHERE status='published' AND published_at <= now()
  - SELECT software_products WHERE status='active'
  - SELECT software_versions (join active products)
- Editor:
  - CRUD posts/software nhưng:
    - Không được sửa `settings` admin-only
    - Không được quản `users` admin-only
- Admin:
  - full access tất cả bảng

---

## 6) Backend/API (Next.js + Supabase)
- Server Actions hoặc Route Handlers:
  - CRUD posts/software/settings
  - upload media to Storage (signed upload)
  - generate signed download URL + ghi log download
  - search (Postgres full-text)
  - increment view_count (rate limit/cookie)

---

## 7) Facebook Comments (bình luận)
- Component `<FacebookComments />`:
  - Load Facebook SDK async 1 lần
  - `data-href` = canonical URL của bài
- Admin Settings:
  - enable/disable comments
  - appId (optional; nếu thiếu vẫn nhúng nhưng hiển thị cảnh báo trong admin)

---

## 8) Dữ liệu seed bắt buộc (để test ngay)

### 8.1 Categories (seed)
1) `cong-van` — “Công văn / Thông tư / Nghị định / Luật”
2) `hs-code` — “HS code / Xác định trước mã số”
3) `thu-tuc-hai-quan` — “Hướng dẫn thủ tục hải quan”

### 8.2 Software seed (2 phần mềm)
> Agent phải tạo 2 sản phẩm phần mềm và 1 version “latest” cho mỗi phần mềm (file installer URL để trống placeholder nếu chưa có).

#### A) Customs Extractor V2
- slug: `customs-extractor-v2`
- summary: Trích xuất danh sách hàng hóa từ file Excel tờ khai (xuất/nhập), tự làm sạch và chuẩn hóa dữ liệu.
- highlights (tối thiểu):
  - Hỗ trợ TK xuất khẩu (TKX) và nhập khẩu (TKN)
  - Tách xuất xứ theo quy tắc `#&VN` (nếu có)
  - Quét tìm dòng hàng theo HS code
  - Chuẩn hóa định dạng số VN/EN về chuẩn Excel
  - GUI hiện đại: tab xuất/nhập, dark mode, progress + log
- system_requirements (tối thiểu):
  - Windows
  - Cần Python nếu chạy bản script; nếu có bản đóng gói EXE thì nêu rõ
- CTA: “Tải phần mềm / Nhận link tải”

#### B) Customs Barcode Automation v1.3.0
- slug: `customs-barcode-automation`
- summary: Tự động tải mã vạch tờ khai hải quan; kết nối ECUS5/VNACCS; tải hàng loạt; đặt tên file thông minh.
- highlights:
  - Kết nối ECUS5/VNACCS (SQL Server)
  - Lấy mã vạch qua API/Web (fallback)
  - Tải hàng loạt + tự động theo chu kỳ
  - Lọc theo công ty
  - Đặt tên file theo MST/số HĐ/số vận đơn
  - Theme sáng/tối + auto update từ GitHub
- system_requirements:
  - Windows 10/11 64-bit
  - SQL Server với ECUS5/VNACCS
  - Internet
  - dung lượng ~100MB

---

## 9) Bài mẫu để test layout (1 bài “đủ mọi thành phần”)

> **Mục đích:** test typography, TOC, callout, table, quote, attachments, code block, related posts, FB comments.

**Category:** `thu-tuc-hai-quan`  
**Title:** Checklist hồ sơ & luồng xử lý khi mở tờ khai nhập khẩu (bài test layout)  
**Slug:** `checklist-ho-so-luong-xu-ly-to-khai-nhap-khau-test-layout`  
**Tags:** `checklist`, `tờ-khai`, `nhập-khẩu`, `hồ-sơ`, `thực-hành`  
**Excerpt:** Bài mẫu dùng để test layout: tiêu đề, mục lục, bảng, checklist, callout, trích dẫn và tài liệu đính kèm.

**Body (Markdown để import nhanh / hoặc dán vào editor):**
---
## 1) Mục tiêu
- Giảm thiếu sót hồ sơ
- Chuẩn hoá thứ tự thao tác
- Dễ bàn giao cho nhân sự mới

> Ghi chú: Đây là bài mẫu, bạn có thể xoá sau khi layout ổn.

## 2) Checklist hồ sơ (tham khảo)
- [ ] Hợp đồng / Invoice / Packing List  
- [ ] Vận đơn (B/L / AWB)  
- [ ] C/O (nếu có)  
- [ ] Catalogue / tài liệu kỹ thuật (nếu hàng mới)  
- [ ] Kết quả phân tích / xác định trước (nếu có)

## 3) Bảng tóm tắt thao tác theo luồng
| Bước | Việc cần làm | Gợi ý |
|---|---|---|
| 1 | Kiểm tra chứng từ | đối chiếu số lượng, trị giá |
| 2 | Khai báo chỉ tiêu | chuẩn hoá mô tả, HS |
| 3 | Nộp tờ khai | chụp màn hình lưu hồ sơ |
| 4 | Xử lý phân luồng | chuẩn bị bổ sung nếu vàng/đỏ |

## 4) Callout
> ✅ Tip: Luôn chuẩn hóa mô tả hàng hoá + origin ngay từ đầu để giảm sửa tờ khai.

## 5) Ví dụ cấu trúc “mô tả hàng”
```text
TÊN HÀNG + MODEL + THÀNH PHẦN + CÔNG DỤNG + #&VN (nếu cần ghi xuất xứ)
```

## 6) Tài liệu đính kèm (demo)
- “Mẫu checklist hồ sơ nhập khẩu.xlsx”
- “Quy trình nội bộ xử lý luồng vàng.pdf”

## 7) Kết luận
Bạn có thể dùng bài này để kiểm tra:
- font/spacing/heading
- table style
- code block
- hiển thị attachments
- vị trí Facebook Comments
---

---

## 10) 10 bài mẫu cho mỗi chuyên mục (30 bài)

> Yêu cầu: Agent tạo seed (script) hoặc import nhanh qua Admin.  
> Mặc định có thể để **draft**, khi cần test SEO mới publish.

### 10.1 Chuyên mục: Công văn/Thông tư/Nghị định/Luật (`cong-van`) — 10 bài

1) **Title:** Công văn là gì? Cách đọc nhanh nội dung ảnh hưởng đến doanh nghiệp XNK  
   **Slug:** `cong-van-la-gi-cach-doc-nhanh`  
   **Tags:** `công-văn`, `pháp-lý`, `xnk`  
   **Excerpt:** Khung đọc công văn trong 5 phút: đối tượng áp dụng, thời điểm hiệu lực, điểm mới.  
   **Body (outline):** định nghĩa, cấu trúc, mẹo lọc thông tin, ví dụ check-list.

2) **Title:** Thông tư – Nghị định – Luật: phân biệt để áp dụng đúng (kèm ví dụ)  
   **Slug:** `phan-biet-thong-tu-nghi-dinh-luat`  
   **Tags:** `thông-tư`, `nghị-định`, `luật`  
   **Excerpt:** 3 tầng văn bản phổ biến và cách xác định văn bản “cao hơn”.  
   **Body:** sơ đồ phân cấp, ví dụ tình huống, lưu ý cập nhật.

3) **Title:** Cách kiểm tra hiệu lực văn bản pháp luật liên quan hải quan  
   **Slug:** `cach-kiem-tra-hieu-luc-van-ban`  
   **Tags:** `hiệu-lực`, `tra-cứu`  
   **Excerpt:** Checklist tra cứu hiệu lực, văn bản sửa đổi/bổ sung, văn bản thay thế.  
   **Body:** các bước, nguồn tra cứu, lỗi thường gặp.

4) **Title:** Tổng hợp thuật ngữ hay gặp trong văn bản hải quan (bản dễ hiểu)  
   **Slug:** `thuat-ngu-hai-quan-de-hieu`  
   **Tags:** `thuật-ngữ`, `tổng-hợp`  
   **Excerpt:** Glossary: trị giá, mã loại hình, miễn giảm, kiểm tra sau thông quan…  
   **Body:** danh sách thuật ngữ + ví dụ.

5) **Title:** Mẹo lưu trữ công văn theo “hồ sơ lô hàng” để audit nhanh  
   **Slug:** `meo-luu-tru-cong-van-theo-ho-so-lo-hang`  
   **Tags:** `lưu-trữ`, `audit`, `hồ-sơ`  
   **Excerpt:** Cách đặt tên file, phân thư mục, gắn tag theo loại hình.  
   **Body:** quy chuẩn đặt tên, cấu trúc folder, checklist.

6) **Title:** Khi văn bản mới ban hành: quy trình nội bộ cập nhật & truyền thông  
   **Slug:** `quy-trinh-noi-bo-cap-nhat-van-ban-moi`  
   **Tags:** `quy-trình`, `cập-nhật`, `nội-bộ`  
   **Excerpt:** Mẫu quy trình 1 trang để doanh nghiệp cập nhật nhanh và đúng.  
   **Body:** phân vai, timeline, template thông báo.

7) **Title:** Các lỗi phổ biến khi trích dẫn công văn trong công văn trả lời/giải trình  
   **Slug:** `loi-pho-bien-khi-trich-dan-cong-van`  
   **Tags:** `giải-trình`, `trích-dẫn`  
   **Excerpt:** Trích sai số/ký hiệu/ngày; thiếu điều khoản; áp dụng sai đối tượng.  
   **Body:** lỗi + cách tránh + ví dụ.

8) **Title:** Cách theo dõi “văn bản sửa đổi” để không áp dụng nhầm quy định cũ  
   **Slug:** `cach-theo-doi-van-ban-sua-doi`  
   **Tags:** `sửa-đổi`, `bổ-sung`  
   **Excerpt:** Hướng dẫn tạo “bản đồ văn bản” (mapping) cho một chủ đề.  
   **Body:** mapping, liên kết chéo, quy trình review.

9) **Title:** Mẫu email/biên bản làm việc khi cần xác minh quy định với cơ quan HQ  
   **Slug:** `mau-email-bien-ban-lam-viec-xac-minh-quy-dinh`  
   **Tags:** `mẫu`, `liên-hệ`  
   **Excerpt:** 2 mẫu nhanh: email hỏi quy định + biên bản làm việc.  
   **Body:** template + lưu ý.

10) **Title:** “Điểm mới” trong một văn bản: cách tóm tắt để sếp duyệt nhanh  
    **Slug:** `cach-tom-tat-diem-moi-van-ban`  
    **Tags:** `tóm-tắt`, `điểm-mới`  
    **Excerpt:** Công thức 5 dòng: thay đổi gì, ảnh hưởng ai, áp dụng khi nào, cần làm gì.  
    **Body:** template + ví dụ.

---

### 10.2 Chuyên mục: HS code / Xác định trước (`hs-code`) — 10 bài

1) **Title:** Quy trình phân loại HS code: từ mô tả hàng → nhóm → phân nhóm  
   **Slug:** `quy-trinh-phan-loai-hs-code-co-ban`  
   **Tags:** `hs-code`, `phân-loại`  
   **Excerpt:** Khung làm việc 6 bước để giảm rủi ro sai mã.  
   **Body:** 6 bước + checklist chứng cứ.

2) **Title:** 5 lỗi khiến HS code dễ bị “bác” khi kiểm tra sau thông quan  
   **Slug:** `5-loi-hs-code-de-bi-bac`  
   **Tags:** `rủi-ro`, `kiểm-tra-sau-thông-quan`  
   **Excerpt:** Mô tả thiếu thông số, nhầm công dụng, nhầm vật liệu, thiếu catalogue…  
   **Body:** lỗi + cách phòng + tài liệu nên lưu.

3) **Title:** Khi nào nên xin “xác định trước mã số”?  
   **Slug:** `khi-nao-nen-xin-xac-dinh-truoc-ma-so`  
   **Tags:** `xác-định-trước`, `hồ-sơ`  
   **Excerpt:** Tình huống hàng mới, tranh chấp mã, trị giá lớn, nhập thường xuyên.  
   **Body:** lợi ích, hồ sơ, thời gian, lưu ý.

4) **Title:** Cách viết mô tả hàng hóa để hỗ trợ phân loại HS tốt hơn  
   **Slug:** `cach-viet-mo-ta-hang-hoa-ho-tro-phan-loai`  
   **Tags:** `mô-tả`, `catalogue`  
   **Excerpt:** Mẫu mô tả chuẩn: vật liệu – công dụng – cấu tạo – thông số.  
   **Body:** template + ví dụ.

5) **Title:** Catalogue tối thiểu cần có khi phân loại HS (checklist)  
   **Slug:** `checklist-catalogue-toi-thieu-phan-loai-hs`  
   **Tags:** `catalogue`, `chứng-từ`  
   **Excerpt:** Những trang nào cần chụp/đính kèm để đủ căn cứ.  
   **Body:** checklist + best practice.

6) **Title:** Hàng “combo/bộ” phân loại HS thế nào?  
   **Slug:** `hang-combo-bo-phan-loai-hs-the-nao`  
   **Tags:** `bộ-hàng`, `quy-tắc`  
   **Excerpt:** Áp dụng quy tắc phân loại cho hàng đóng bộ và hàng lắp ráp.  
   **Body:** khái niệm, quy tắc, ví dụ.

7) **Title:** Vật liệu vs công dụng: yếu tố nào quyết định HS?  
   **Slug:** `vat-lieu-vs-cong-dung-yeu-to-quyet-dinh-hs`  
   **Tags:** `phân-tích`, `quy-tắc`  
   **Excerpt:** Cách ưu tiên tiêu chí khi mô tả không rõ ràng.  
   **Body:** hướng dẫn phân tích.

8) **Title:** Case study: đổi HS làm thay đổi thuế suất — bài học hồ sơ  
   **Slug:** `case-study-doi-hs-thay-doi-thue-suat`  
   **Tags:** `case-study`, `thuế`  
   **Excerpt:** Một case demo để test layout + bảng so sánh thuế.  
   **Body:** bối cảnh, trước/sau, checklist hồ sơ.

9) **Title:** Mẫu form nội bộ “phiếu đề xuất HS code” cho phòng XNK  
   **Slug:** `mau-phieu-de-xuat-hs-code-noi-bo`  
   **Tags:** `mẫu`, `nội-bộ`  
   **Excerpt:** 1 form giúp chuẩn hoá thông tin từ sales/kỹ thuật.  
   **Body:** form fields + hướng dẫn dùng.

10) **Title:** 7 câu hỏi kỹ thuật cần trả lời trước khi chốt HS code  
    **Slug:** `7-cau-hoi-ky-thuat-truoc-khi-chot-hs`  
    **Tags:** `kỹ-thuật`, `checklist`  
    **Excerpt:** Giúp tránh thiếu dữ kiện khi làm hồ sơ giải trình.  
    **Body:** 7 câu hỏi + ví dụ.

---

### 10.3 Chuyên mục: Hướng dẫn thủ tục hải quan (`thu-tuc-hai-quan`) — 10 bài

1) **Title:** Hướng dẫn tạo bộ hồ sơ nhập khẩu “chuẩn audit”  
   **Slug:** `huong-dan-tao-bo-ho-so-nhap-khau-chuan-audit`  
   **Tags:** `hồ-sơ`, `nhập-khẩu`  
   **Excerpt:** Cấu trúc folder + checklist chứng từ.  
   **Body:** phân nhóm chứng từ, đặt tên file, thời gian lưu.

2) **Title:** Luồng xanh – vàng – đỏ: cần chuẩn bị gì cho từng luồng?  
   **Slug:** `luong-xanh-vang-do-can-chuan-bi-gi`  
   **Tags:** `phân-luồng`, `thực-hành`  
   **Excerpt:** Bảng chuẩn bị nhanh theo luồng để giảm thời gian chờ.  
   **Body:** bảng + tips.

3) **Title:** Cách chuẩn hoá mô tả hàng hoá để giảm “sửa tờ khai”  
   **Slug:** `chuan-hoa-mo-ta-hang-hoa-giam-sua-to-khai`  
   **Tags:** `mô-tả`, `tờ-khai`  
   **Excerpt:** Template mô tả và ví dụ cho hàng máy móc/linh kiện.  
   **Body:** template + ví dụ.

4) **Title:** Quy trình làm thủ tục cho hàng nhập gia công / sản xuất xuất khẩu (overview)  
   **Slug:** `quy-trinh-hang-nhap-gia-cong-sxxk-overview`  
   **Tags:** `gia-công`, `sxxk`  
   **Excerpt:** Tổng quan quy trình, điểm hay bị sai, checklist kiểm soát.  
   **Body:** overview + lưu ý.

5) **Title:** Làm gì khi thiếu chứng từ lúc mở tờ khai? (giải pháp thực tế)  
   **Slug:** `lam-gi-khi-thieu-chung-tu-luc-mo-to-khai`  
   **Tags:** `xử-lý`, `chứng-từ`  
   **Excerpt:** Các phương án xử lý phổ biến và rủi ro tương ứng.  
   **Body:** phương án + rủi ro + tip.

6) **Title:** Cách kiểm tra nhanh trị giá – số lượng – đơn giá trước khi truyền tờ khai  
   **Slug:** `kiem-tra-nhanh-tri-gia-so-luong-don-gia`  
   **Tags:** `kiểm-tra`, `trị-giá`  
   **Excerpt:** 8 bước kiểm tra để tránh sai sót cơ bản.  
   **Body:** checklist + ví dụ.

7) **Title:** Hướng dẫn quản lý “tài liệu đính kèm” cho từng lô hàng  
   **Slug:** `huong-dan-quan-ly-tai-lieu-dinh-kem-theo-lo-hang`  
   **Tags:** `quản-lý`, `tài-liệu`  
   **Excerpt:** Cách lưu PDF/ảnh/email để truy xuất 1 phút.  
   **Body:** quy chuẩn + folder structure.

8) **Title:** Trình tự xử lý khi bị yêu cầu bổ sung hồ sơ (luồng vàng/đỏ)  
   **Slug:** `trinh-tu-xu-ly-khi-bi-yeu-cau-bo-sung-ho-so`  
   **Tags:** `bổ-sung`, `luồng-vàng`, `luồng-đỏ`  
   **Excerpt:** Checklist trả lời và theo dõi lịch sử bổ sung.  
   **Body:** checklist + tips.

9) **Title:** Cách bàn giao hồ sơ giữa ca trực / nhân sự để không thất lạc  
   **Slug:** `cach-ban-giao-ho-so-giua-ca-truc`  
   **Tags:** `bàn-giao`, `quy-trình`  
   **Excerpt:** Mẫu checklist bàn giao và nguyên tắc đặt tên.  
   **Body:** checklist + template.

10) **Title:** Mẫu SOP 1 trang cho nhân sự mới làm chứng từ XNK  
    **Slug:** `mau-sop-1-trang-cho-nhan-su-moi`  
    **Tags:** `sop`, `onboarding`  
    **Excerpt:** Một SOP mẫu ngắn gọn để onboarding nhanh.  
    **Body:** SOP sections + tips.

---

## 11) Kế hoạch triển khai theo Phase (Agent bắt buộc làm theo)

### Phase 0 — Bootstrapping
- Create Next.js TS App Router
- Tailwind + shadcn/ui + base theme
- Env setup (Supabase url/key)
- Deploy Vercel (placeholder)

**Acceptance:**
- Web chạy local + deploy Vercel OK

### Phase 1 — Supabase DB + RLS + Seed
- Migration SQL: tables + indexes + RLS policies
- Seed: 3 categories + 2 software + 1 version mỗi phần mềm + bài test layout + 30 bài mẫu (draft)
- Tạo admin account + profile role=admin

**Acceptance:**
- Public không CRUD được
- Admin vào được admin area

### Phase 2 — Auth + Admin Shell
- Login, route guard
- Sidebar admin + RBAC
- Audit log cơ bản

### Phase 3 — CMS Posts (TipTap)
- CRUD posts + tags + attachments
- Draft/publish/schedule + preview
- SEO fields

### Phase 4 — Software module
- CRUD software + versions
- Upload installer (Storage) + signed URL download + download logs

### Phase 5 — Public UI + SEO
- Home blocks
- Category list + pagination
- Post detail + related
- Search
- sitemap/robots/schema

### Phase 6 — Facebook Comments
- Toggle in settings
- Async SDK load + canonical

### Phase 7 — Polishing
- Media library
- Settings fully editable (logo/menu/footer)
- Improve admin UX (autosave, toasts, empty states)
- Basic analytics counters (views, downloads)

---

## 12) Deliverables bắt buộc
1) Source code hoàn chỉnh
2) `supabase/migrations/*.sql` + hướng dẫn chạy
3) Hướng dẫn deploy Vercel + config env
4) Hướng dẫn tạo admin/editor
5) Checklist nghiệm thu tính năng
6) “HDSD Admin” (1–2 trang markdown) cực dễ hiểu

---

## 13) Notes quan trọng (để không làm sai)
- Không hardcode nội dung: mọi thứ chỉnh được trong Admin.
- Nội dung mẫu chỉ để test layout, có thể để trạng thái draft.
- Tải file phần mềm nên dùng signed URL để tránh lộ bucket public nếu muốn kiểm soát.
- Logo phải được dùng nhất quán: header + footer + favicon + OG default.
