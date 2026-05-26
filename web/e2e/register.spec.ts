import { test, expect } from '@playwright/test'

// Critical user journey: account registration. The backend is mocked so the
// test is deterministic and needs no database.
test.describe('registration', () => {
  test('client-side validation blocks mismatched passwords', async ({ page }) => {
    await page.goto('/register')
    await page.locator('input[type="text"]').first().fill('tester01')
    const pwd = page.locator('input[type="password"]')
    await pwd.nth(0).fill('hunter2')
    await pwd.nth(1).fill('different')
    await page.getByRole('button', { name: /create account|register|sign up/i }).click()
    await expect(page.getByText(/passwords do not match/i)).toBeVisible()
  })

  test('surfaces a server error (e.g. username taken)', async ({ page }) => {
    await page.route('**/api/auth/register', (route) =>
      route.fulfill({ status: 409, contentType: 'application/json', body: JSON.stringify({ error: 'Username already taken' }) }),
    )
    await page.goto('/register')
    await page.locator('input[type="text"]').first().fill('takenname')
    const pwd = page.locator('input[type="password"]')
    await pwd.nth(0).fill('hunter2')
    await pwd.nth(1).fill('hunter2')
    await page.locator('input[type="date"]').fill('2000-01-01')
    await page.getByRole('button', { name: /create account|register|sign up/i }).click()
    await expect(page.getByText(/username already taken/i)).toBeVisible()
  })

  test('successful registration redirects home', async ({ page }) => {
    await page.route('**/api/auth/register', (route) =>
      route.fulfill({ status: 201, contentType: 'application/json', body: JSON.stringify({ success: true }) }),
    )
    await page.goto('/register')
    await page.locator('input[type="text"]').first().fill('freshuser')
    const pwd = page.locator('input[type="password"]')
    await pwd.nth(0).fill('hunter2')
    await pwd.nth(1).fill('hunter2')
    await page.locator('input[type="date"]').fill('2000-01-01')
    await page.getByRole('button', { name: /create account|register|sign up/i }).click()
    await expect(page).toHaveURL(/\/$/)
  })
})
