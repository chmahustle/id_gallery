import { expect, test as setup } from '@playwright/test'
import { ADMIN } from './helpers'

/* один вход на все тесты: cookie сохраняется в e2e/.auth/admin.json */
setup('вход администратора', async ({ page }) => {
  await page.goto('/admin')
  await page.getByLabel('Логин').fill(ADMIN.login)
  await page.getByLabel('Пароль').fill(ADMIN.password)
  await page.getByRole('button', { name: 'Войти' }).click()
  await expect(page.getByRole('tablist', { name: 'Разделы админки' })).toBeVisible()
  await page.context().storageState({ path: 'e2e/.auth/admin.json' })
})
