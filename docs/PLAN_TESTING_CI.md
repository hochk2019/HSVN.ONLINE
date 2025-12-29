# Implementation Plan: Test & CI Expansion

## Mục tiêu

Thiết lập bộ test hoàn chỉnh với Vitest (unit tests) và Playwright (E2E tests), tích hợp CI/CD pipeline.

---

## Giai đoạn 1: Vitest Setup (45 phút)

### 1.1 Cài đặt dependencies

```bash
npm install -D vitest @vitejs/plugin-react jsdom @testing-library/react @testing-library/jest-dom
```

### 1.2 Cấu hình Vitest

```typescript
// vitest.config.ts
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
    plugins: [react()],
    test: {
        environment: 'jsdom',
        globals: true,
        setupFiles: ['./src/test/setup.ts'],
        include: ['src/**/*.test.{ts,tsx}'],
    },
    resolve: {
        alias: { '@': './src' },
    },
});
```

### 1.3 Test setup file

```typescript
// src/test/setup.ts
import '@testing-library/jest-dom';
```

---

## Giai đoạn 2: Unit Tests (2 giờ)

### 2.1 Server Actions Tests

| File | Test cases |
|------|------------|
| `post-actions.test.ts` | createPost, updatePost, deletePost |
| `software-actions.test.ts` | createSoftware, createVersion |
| `contact-actions.test.ts` | submitContactForm, rate limit |

### 2.2 Schema Validation Tests

```typescript
// src/lib/schemas.test.ts (đã có, mở rộng)
- Test all Zod schemas
- Test edge cases (empty, max length, special chars)
```

### 2.3 Utility Tests

```typescript
// src/lib/utils.test.ts
- formatDate, formatFileSize, generateSlug
- cn (classnames helper)
```

---

## Giai đoạn 3: Playwright E2E Setup (1 giờ)

### 3.1 Cài đặt

```bash
npm init playwright@latest
```

### 3.2 Cấu hình

```typescript
// playwright.config.ts
import { defineConfig } from '@playwright/test';

export default defineConfig({
    testDir: './e2e',
    baseURL: 'http://localhost:3000',
    webServer: {
        command: 'npm run dev',
        port: 3000,
        reuseExistingServer: !process.env.CI,
    },
});
```

---

## Giai đoạn 4: E2E Test Cases (2 giờ)

### 4.1 Public Site Tests

| Test | Mô tả |
|------|-------|
| `home.spec.ts` | Homepage loads, navigation works |
| `article.spec.ts` | Article pages render, comments work |
| `software.spec.ts` | Software pages, download buttons |
| `contact.spec.ts` | Form submission, validation |

### 4.2 Admin Tests

| Test | Mô tả |
|------|-------|
| `admin-auth.spec.ts` | Login, logout, protected routes |
| `admin-posts.spec.ts` | CRUD posts, editor |
| `admin-software.spec.ts` | CRUD software, versions |

---

## Giai đoạn 5: CI/CD Pipeline (1 giờ)

### 5.1 GitHub Actions

```yaml
# .github/workflows/ci.yml
name: CI

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'npm'
      - run: npm ci
      - run: npm run lint
      - run: npm run typecheck
      - run: npm run test
      
  e2e:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
      - run: npm ci
      - run: npx playwright install --with-deps
      - run: npm run test:e2e
```

### 5.2 Package.json scripts

```json
{
    "scripts": {
        "test": "vitest run",
        "test:watch": "vitest",
        "test:e2e": "playwright test",
        "test:e2e:ui": "playwright test --ui",
        "typecheck": "tsc --noEmit"
    }
}
```

---

## Giai đoạn 6: QA Checklist Update (30 phút)

### Cập nhật docs/QA-CHECKLIST.md

- [ ] Add AI Writing Assistant test cases
- [ ] Add Chatbot test cases
- [ ] Add Tracking/Personalization test cases
- [ ] Add Preview feature test cases
- [ ] Add VersionManager upload test cases

---

## Verification Checklist

- [ ] `npm run test` passes
- [ ] `npm run test:e2e` passes locally
- [ ] GitHub Actions CI runs successfully
- [ ] Coverage report generated
- [ ] QA checklist updated

---

## Dependencies

```json
{
    "devDependencies": {
        "vitest": "^2.0.0",
        "@vitejs/plugin-react": "^4.0.0",
        "jsdom": "^25.0.0",
        "@testing-library/react": "^16.0.0",
        "@testing-library/jest-dom": "^6.0.0",
        "@playwright/test": "^1.48.0"
    }
}
```

## Estimated Time

**Total: 7-8 giờ**
