import { test, expect } from '@playwright/test'

// Critical permission journey: the admin console must never render for an
// unauthenticated visitor — middleware should redirect them to /login.
test.describe('admin auth gate', () => {
  test('unauthenticated visit to /admin/dashboard redirects to /login', async ({ page }) => {
    await page.goto('/admin/dashboard')
    await expect(page).toHaveURL(/\/login/)
  })

  test('unauthenticated visit to /admin/users redirects to /login', async ({ page }) => {
    await page.goto('/admin/users')
    await expect(page).toHaveURL(/\/login/)
  })

  test('the account page is also gated', async ({ page }) => {
    await page.goto('/account')
    await expect(page).toHaveURL(/\/login/)
  })
})
