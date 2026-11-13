import { defineConfig, devices } from '@playwright/test'
import path from 'node:path'
import { authFile, baseURL } from './tests/support/env'

const frontendDir = path.resolve(process.cwd(), '../cardtalogue-frontend')

export default defineConfig({
  testDir: './tests',
  fullyParallel: false,
  workers: 1,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  timeout: 45_000,
  expect: {
    timeout: 10_000,
  },
  reporter: [['list'], ['html', { open: 'never' }]],
  outputDir: 'test-results',
  globalTeardown: './tests/support/global-teardown.ts',
  use: {
    baseURL,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  projects: [
    {
      name: 'setup',
      testMatch: /auth\.setup\.ts/,
    },
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        storageState: authFile,
      },
      dependencies: ['setup'],
      testIgnore: [/auth\.setup\.ts/, /login\.spec\.ts/],
    },
    {
      name: 'public',
      use: {
        ...devices['Desktop Chrome'],
      },
      testMatch: /login\.spec\.ts/,
    },
  ],
  webServer: [
    {
      command: 'node scripts/start-backend.mjs',
      cwd: process.cwd(),
      url: 'http://localhost:8080/api/v1/health',
      reuseExistingServer: false,
      timeout: 180_000,
    },
    {
      command:
        'npm run dev -- --host localhost --port 3000 --strictPort',
      cwd: frontendDir,
      env: {
        VITE_API_BASE_URL: 'http://localhost:8080/api/v1',
      },
      url: 'http://localhost:3000',
      reuseExistingServer: false,
      timeout: 120_000,
    },
  ],
})
