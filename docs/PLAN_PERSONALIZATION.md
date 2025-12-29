# Implementation Plan: Personalization End-to-End

## Mục tiêu

Xây dựng hệ thống cá nhân hóa hoàn chỉnh từ tracking user events đến hiển thị recommended content và A/B testing.

---

## Giai đoạn 1: Database Setup (30 phút)

### Chạy migrations

```bash
# Trong Supabase Dashboard > SQL Editor, chạy theo thứ tự:
1. supabase/migrations/04_add_user_events.sql
2. supabase/migrations/05_add_experiments.sql
```

### Bảng được tạo

| Bảng | Mô tả |
|------|-------|
| `user_events` | Lưu page views, clicks, scroll depth |
| `user_sessions` | Session tracking với fingerprint |
| `experiments` | A/B test definitions |
| `experiment_assignments` | User assignments to variants |
| `experiment_results` | Conversion tracking |

---

## Giai đoạn 2: Tracking Integration (1 giờ)

### 2.1 Mount useTracking hook

```typescript
// Thêm vào src/app/[category]/[slug]/page.tsx và phan-mem/[slug]/page.tsx
import { useTracking } from '@/hooks/useTracking';

// Trong component
useTracking({
    pageType: 'article',
    entityId: post.id,
    entityType: 'post',
});
```

### 2.2 Update /api/track endpoint

Đảm bảo API xử lý đúng schema mới:
- `POST /api/track` - log events
- `GET /api/track?sessionId=xxx` - get recommendations

---

## Giai đoạn 3: Recommendations Engine (2 giờ)

### 3.1 Tạo recommendation service

```typescript
// src/lib/recommendation-service.ts
// Logic: dựa trên history (categories viewed) → recommend similar posts
```

### 3.2 Update RecommendedPosts component

- Thêm fallback khi chưa có tracking data
- Show random popular posts nếu new user

---

## Giai đoạn 4: A/B Testing Framework (1.5 giờ)

### 4.1 Mount useExperiment hook

```typescript
// src/components/SmartCTA.tsx
import { useExperiment } from '@/hooks/useExperiment';

const { variant } = useExperiment('homepage-cta');
// variant = 'control' | 'variant_a' | 'variant_b'
```

### 4.2 Admin UI cho experiments

- Tạo `/admin/experiments` page
- CRUD experiments
- View results với charts

---

## Verification Checklist

- [ ] Migrations chạy thành công
- [ ] Page views được log vào user_events
- [ ] Sessions được tạo và tracked
- [ ] RecommendedPosts hiển thị đúng
- [ ] A/B test variants phân bổ đúng
- [ ] Conversion tracking hoạt động

---

## Dependencies

- Supabase (đã có)
- No external services needed
- No additional npm packages

## Estimated Time

**Total: 5-6 giờ**
