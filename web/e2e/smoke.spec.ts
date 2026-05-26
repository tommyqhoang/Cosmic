import { test, expect } from '@playwright/test'

// Smoke: the public landing page renders and core navigation works. Guards
// against build/render regressions in the shared layout.
test.describe('landing', () => {
  test('home page renders', async ({ page }) => {
    await page.goto('/')
    await expect(page).toHaveTitle(/ShinyMS/i)
    await expect(page.locator('body')).toBeVisible()
  })

  test('can navigate to register and login from the header', async ({ page }) => {
    await page.goto('/')
    await page.locator('a[href="/register"]').first().click()
    await expect(page).toHaveURL(/\/register/)

    await page.goto('/')
    await page.locator('a[href="/login"]').first().click()
    await expect(page).toHaveURL(/\/login/)
  })
})
