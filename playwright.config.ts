import { defineConfig, devices } from '@playwright/test'

/**
 * Браузерные проверки админки и сайта. Перед запуском нужна сборка
 * (npm run test:e2e делает её сама) и PostgreSQL, как для npm test.
 */
const PORT = Number(process.env.E2E_PORT || 3098)

export default defineConfig({
  testDir: 'e2e',
  /* тесты меняют общую базу — по очереди */
  workers: 1,
  fullyParallel: false,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? 'github' : 'list',
  timeout: 30_000,
  use: {
    baseURL: `http://localhost:${PORT}`,
    locale: 'ru-RU',
    trace: 'retain-on-failure',
  },
  projects: [
    { name: 'setup', testMatch: /auth\.setup\.ts/ },
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'], storageState: 'e2e/.auth/admin.json' },
      dependencies: ['setup'],
    },
  ],
  webServer: {
    command: 'node --import tsx server/test/e2eServer.ts',
    url: `http://localhost:${PORT}/api/health`,
    reuseExistingServer: false,
    timeout: 90_000,
    env: { E2E_PORT: String(PORT) },
    /* мягкая остановка: встроенная база успевает выключиться */
    gracefulShutdown: { signal: 'SIGTERM', timeout: 15_000 },
  },
})
