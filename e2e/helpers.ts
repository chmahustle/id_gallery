import type { Page } from '@playwright/test'

/* тестовый администратор — как в server/test/testServer.ts */
export const ADMIN = { login: 'tester', password: 'test-password-strong-42' }

/** Открыть вкладку админки по названию */
export async function openTab(page: Page, name: string) {
  await page.goto('/admin')
  await page.getByRole('tab', { name }).click()
}

/** Подтверждать window.confirm в этом тесте */
export function acceptDialogs(page: Page) {
  page.on('dialog', (dialog) => void dialog.accept())
}
