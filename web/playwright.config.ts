import { defineConfig, devices } from '@playwright/test'

const PORT = 3000
const baseURL = `http://localhost:${PORT}`

// E2E targets the highest-risk journeys that don't require a seeded database:
// the auth/permission gate, the register flow (API mocked), and core navigation.
export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: process.env.CI ? [['github'], ['list']] : 'list',
  use: {
    baseURL,
    trace: 'on-first-retry',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
  ],
  webServer: {
    command: 'npm run dev',
    url: baseURL,
    timeout: 120_000,
    reuseExistingServer: !process.env.CI,
    // Test-only env so Prisma/NextAuth initialize without real infrastructure.
    // No queries succeed (dummy DB) but every page guards with .catch, and the
    // auth gate only needs the secret to read/validate the (absent) JWT.
    env: {
      NEXTAUTH_SECRET: 'e2e-test-secret-not-for-production',
      NEXTAUTH_URL: baseURL,
      DATABASE_URL: 'mysql://test:test@127.0.0.1:3306/test',
    },
  },
})
