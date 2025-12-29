import { test, expect } from '@playwright/test';

test.describe('Homepage', () => {
    test('should load homepage', async ({ page }) => {
        await page.goto('/');

        // Check page title
        await expect(page).toHaveTitle(/Golden Logistics|HSVN/);

        // Check header exists
        await expect(page.locator('header')).toBeVisible();

        // Check footer exists
        await expect(page.locator('footer')).toBeVisible();
    });

    test('should have navigation links', async ({ page }) => {
        await page.goto('/');

        // Check main navigation
        await expect(page.getByRole('link', { name: /phần mềm/i })).toBeVisible();
        await expect(page.getByRole('link', { name: /liên hệ/i })).toBeVisible();
    });

    test('should navigate to software page', async ({ page }) => {
        await page.goto('/');

        // Click on software link
        await page.getByRole('link', { name: /phần mềm/i }).first().click();

        // Verify URL changed
        await expect(page).toHaveURL(/phan-mem/);
    });
});

test.describe('Contact Page', () => {
    test('should load contact form', async ({ page }) => {
        await page.goto('/lien-he');

        // Check form fields exist
        await expect(page.getByLabel(/họ tên/i)).toBeVisible();
        await expect(page.getByLabel(/email/i)).toBeVisible();
        await expect(page.getByLabel(/tiêu đề/i)).toBeVisible();
        await expect(page.getByLabel(/nội dung/i)).toBeVisible();
    });

    test('should show validation errors', async ({ page }) => {
        await page.goto('/lien-he');

        // Submit empty form
        await page.getByRole('button', { name: /gửi/i }).click();

        // Should stay on page (form validation prevents submission)
        await expect(page).toHaveURL(/lien-he/);
    });
});

test.describe('Software Page', () => {
    test('should load software list', async ({ page }) => {
        await page.goto('/phan-mem');

        // Page should load
        await expect(page).toHaveURL(/phan-mem/);

        // Title should be visible
        await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    });
});

test.describe('Search', () => {
    test('should navigate to search results', async ({ page }) => {
        await page.goto('/tim-kiem?q=test');

        // Page should load
        await expect(page).toHaveURL(/tim-kiem/);
    });
});
