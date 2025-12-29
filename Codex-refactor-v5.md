# Codex Refactor Plan v5

> Mục tiêu: sau khi hoàn thiện các hạng mục kỹ thuật ở v4, vòng v5 sẽ đưa hệ thống CMS vào kỷ nguyên AI-first: hỗ trợ tác giả bằng công cụ tạo nội dung thông minh, tự động phân loại/SEO, tăng tương tác khách hàng với trợ lý ảo, và cung cấp phân tích dự đoán để tối ưu vận hành.

## 0. Trạng thái thực hiện v4 (đánh giá nhanh)
- **Scheduling CMS:** chưa thấy thay đổi ở `src/lib/schemas.ts` hay `src/components/admin/PostForm.tsx` -> vẫn chỉ có `draft/published/archived`.
- **Category/Tag CRUD:** chưa có route mới dưới `src/app/admin/(dashboard)/categories` hoặc `tags` -> các nút vẫn dẫn 404.
- **Module phần mềm:** `SoftwareForm` chưa có highlights/FAQ; `VersionManager` vẫn yêu cầu điền URL thủ công.
- **Footer/Contact dynamic:** file `src/components/layout/SharedFooter.tsx` vẫn hardcode nội dung.
→ Kết luận: Agent Antigravity chưa triển khai các hạng mục chính của v4, cần quay lại checklist v4 trước khi sang v5.

## 1. AI Content Assistant cho biên tập viên
1. **LLM drafting panel**
   - Tạo component `AIWritingAssistant` (client) dùng OpenAI/GPT-4o-mini (hoặc Azure OpenAI) với các prompt mẫu: tóm tắt văn bản, tạo outline, gợi ý title/slug/seo description.
   - UI: bật/tắt panel trong PostForm; hiển thị lịch sử phiên bản.
   - Server action proxy (`src/app/api/ai/content/route.ts`) để giữ key an toàn, limit tốc độ theo user.
2. **AI tone checker + localization**
   - Dùng model embeddings để kiểm tra tone/độ dài; cảnh báo nếu title vượt chuẩn SEO.
   - Cho phép sinh nội dung tiếng Anh để phục vụ bản dịch sau này.
3. **Autofill**
   - Nút “Generate excerpt/meta description” trong PostForm gọi API và ghi trực tiếp vào form.

## 2. Tự động phân loại & metadata
1. **Auto-tagging**
   - Sử dụng embeddings (Supabase pgvector) để map nội dung sang tag đề xuất. Tạo bảng `ai_tag_suggestions` lưu score.
   - Khi tác giả mở PostForm, hiển thị danh sách “Tag gợi ý” với confidence.
2. **Category recommendation**
   - Model phân loại 3 category chính (công văn, HS code, thủ tục) dựa trên title + nội dung. Cho phép “Áp dụng” chỉ bằng 1 click.
3. **Knowledge Graph / Related content**
   - Build vector index (Supabase Vector) để gợi ý bài viết liên quan, thay cho logic filter tĩnh hiện tại (`src/components/layout/RelatedPosts.tsx`).

## 3. Trợ lý khách truy cập (AI Copilot)
1. **Chatbot tư vấn hải quan**
   - Trang public hiển thị widget “Hỏi Golden Copilot” (Floating button). Backend: kết hợp kiến thức từ bài viết + tài liệu PDF (Customs docs) qua RAG (Supabase Storage + embeddings).
   - Bot hỗ trợ trả lời câu hỏi, gợi ý phần mềm phù hợp; log câu hỏi vào `chat_sessions` để team xem thống kê.
2. **Smart Contact Form**
   - Sau khi khách gõ nội dung, AI phân tích intent (support/demo/quote) -> tự gán tag trong `contact_messages`, đề xuất phản hồi mẫu cho admin (ContactActions).
3. **Voice / Multimodal input**
   - Cho phép ghi âm + Whisper API để chuyển giọng nói thành text, hữu ích cho nhân sự hiện trường.

## 4. Cá nhân hóa trải nghiệm & đề xuất phần mềm
1. **Recommendation Engine**
   - Thu thập sự kiện (view bài, tải phần mềm). Dùng matrix factorization/embeddings để đề xuất bài viết và phần mềm liên quan trên trang chủ + trang chi tiết phần mềm.
2. **Smart CTA**
   - Từ hành vi người dùng (ví dụ đọc nhiều về HS), hiển thị CTA động (đăng ký demo, tải checklist). Lưu cấu hình trong settings mới `personalization_rules`.
3. **A/B testing nhẹ**
   - Hạ tầng toggle (feature flag) cho hero/CTA; thu thập kết quả vào bảng `experiments`. Sử dụng script nhỏ trên client để phân nhóm cookie.

## 5. AI-powered media & SEO
1. **Image enhancer**
   - Khi upload ảnh, cho phép gọi API (ví dụ Replicate/Clipdrop) crop/tối ưu, tạo nhiều size. Lưu metadata trong `media_files`.
2. **Alt text generator**
   - Sử dụng Vision model tạo mô tả alt cho ảnh (đặc biệt OG image) -> hỗ trợ SEO.
3. **Structured data validator**
   - Server action kiểm tra schema Article/Software JSON-LD, cảnh báo nếu thiếu field.

## 6. Đa ngôn ngữ & dịch thuật AI
1. **Pipeline dịch**
   - Lưu bản tiếng Việt (gốc) + EN. Sử dụng GPT-4o-mini hoặc DeepL API để đề xuất bản dịch -> biên tập viên chỉnh.
   - Sửa schema `posts` + `software_products` thêm cột JSONB `translations` hoặc bảng phụ.
2. **URL & SEO**
   - Thiết kế `/en/...` routes, `hreflang` metadata.
   - Allow fallback nếu bản dịch chưa sẵn.

## 7. AI analytics & dự báo
1. **Dashboard thông minh**
   - Card “Top câu hỏi khách hàng” từ chatbot/contact AI intent.
   - Dự báo lượng tải phần mềm dựa trên lịch sử (ARIMA/lightweight ML) để chuẩn bị resource.
2. **Anomaly detection**
   - Theo dõi đột biến truy cập/tải -> gửi notification.

## 8. Roadmap & nền tảng kỹ thuật
1. Chuẩn hóa API key management (environment secrets, rotation) + usage logging.
2. Thiết lập background job runner (Supabase Edge Functions + cron) cho tác vụ AI batch (embedding, training, scheduled publish).
3. Viết tài liệu governance (qui định dùng AI: review nội dung trước khi publish, disclaimers ở chatbot).

## 9. Kiểm thử & launch
1. Test unit/integration cho AI endpoints (mock LLM responses).
2. Pen-test chatbot & upload endpoints.
3. Beta nội bộ với nhóm biên tập, thu feedback rồi rollout public.
