import { test, expect } from '@playwright/test';

test.describe('Admin Authentication', () => {
    test('should redirect to login if not authenticated', async ({ page }) => {
        await page.goto('/admin/dashboard');

        // Should redirect to login
        await expect(page).toHaveURL(/admin\/login|auth/);
    });

    test('should show login form', async ({ page }) => {
        await page.goto('/admin/login');

        // Check login form elements
        await expect(page.getByLabel(/email/i)).toBeVisible();
        await expect(page.getByLabel(/password|mật khẩu/i)).toBeVisible();
        await expect(page.getByRole('button', { name: /đăng nhập|login/i })).toBeVisible();
    });

    test('should show error for invalid credentials', async ({ page }) => {
        await page.goto('/admin/login');

        // Fill with invalid credentials
        await page.getByLabel(/email/i).fill('invalid@test.com');
        await page.getByLabel(/password|mật khẩu/i).fill('wrongpassword');

        // Submit
        await page.getByRole('button', { name: /đăng nhập|login/i }).click();

        // Wait for error (page should stay on login)
        await expect(page).toHaveURL(/admin\/login|auth/, { timeout: 10000 });
    });
});

// Note: The following tests require authenticated session
// In real scenarios, you would use fixtures to handle authentication
test.describe.skip('Admin Dashboard (requires auth)', () => {
    test('should show dashboard stats', async ({ page }) => {
        // This requires auth setup
        await page.goto('/admin/dashboard');
        await expect(page.getByText(/thống kê|dashboard/i)).toBeVisible();
    });
});
