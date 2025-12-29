# Plan: Admin UX & Analytics Enhancements

## 1. Refactor Admin Sidebar (Giao diện bên trái)
Hiện tại Sidebar đang liệt kê phẳng (flat list) gây rối mắt khi nhiều chức năng. Cần gom nhóm và làm gọn.

### Giải pháp:
- **Grouping**: Gom các menu thành nhóm logic:
    - **Tổng quan**: Dashboard
    - **Nội dung**: Bài viết, Chuyên mục, Tags, Media
    - **Sản phẩm**: Phần mềm
    - **Tương tác**: Liên hệ, Chatbot/RAG
    - **Hệ thống**: Người dùng, Cấu hình, Audit Logs
- **UI Component**: Dùng `Collapsible` (Accordion) cho các nhóm.
- **Micro-interactions**: Active state rõ ràng, hover effect.

### File cần sửa:
- `src/components/admin/AdminSidebar.tsx`

## 2. Hệ thống Analytics (Theo dõi lượng truy cập)

### 2.1 Database Schema
Bảng `analytics_visits`:
```sql
create table analytics_visits (
  id uuid default gen_random_uuid() primary key,
  post_id uuid references posts(id) on delete set null,
  page_path text not null,
  visitor_hash text, -- Identify unique visitor session
  view_duration int default 0,
  referrer text, -- Nguồn truy cập (Google, Facebook, Direct...)
  device_type text, -- Mobile/Desktop/Tablet
  browser text,
  created_at timestamptz default now()
);
create index idx_analytics_post_id on analytics_visits(post_id);
create index idx_analytics_created_at on analytics_visits(created_at);
```

### 2.2 Tracking System
- **Client Component (`ViewTracker.tsx`)**:
    - Gửi thông tin REFERRER và USER AGENT lên server.
    - Server sẽ parse User Agent để xác định Device Type.

### 2.3 Admin Dashboard (Nâng cao)
- **Traffic Overview**:
    - Tabs: Hôm nay, Tuần này, Tháng này, Năm nay.
    - Chart: Line chart hiển thị lượt truy cập theo thời gian thực.
- **Top Content**:
    - Bảng xếp hạng bài viết xem nhiều nhất (trong khoảng thời gian chọn).
    - Chỉ số: Lượt xem, Thời gian đọc trung bình.
- **Insights bổ sung**:
    - Nguồn truy cập (Referrer breakdown).
    - Thiết bị (Mobile vs Desktop).

## 3. Thực hiện

### Bước 1: Admin Sidebar Refactor
- Update `AdminSidebar.tsx` với cấu trúc Accordion Grouping.

### Bước 2: Analytics Backend
- SQL Migration `create_analytics_table`.
- API `/api/track/view` (Parse UA, Record).
- API `/api/admin/analytics` (Aggregate data cho Dashboard).

### Bước 3: Analytics Frontend
- `ViewTracker` component (Client side).
- `ArticleHeader` (Public): Hiển thị view count.

### Bước 4: Admin Dashboard Charts
- Cài đặt `recharts`.
- Build các widget: `TrafficChart`, `TopPostsTable`, `DeviceStats`.
- Tích hợp vào `/admin/dashboard`.
