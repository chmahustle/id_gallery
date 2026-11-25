import { expect, test } from '@playwright/test'
import { ADMIN } from './helpers'

/* эти проверки — без сохранённого входа */
test.use({ storageState: { cookies: [], origins: [] } })

test('без входа админка показывает только форму входа', async ({ page }) => {
  await page.goto('/admin')
  await expect(page.getByRole('heading', { name: 'Админка ID Gallery' })).toBeVisible()
  await expect(page.getByRole('tablist')).toHaveCount(0)
})

test('неверный пароль — ошибка, админка не открывается', async ({ page }) => {
  await page.goto('/admin')
  await page.getByLabel('Логин').fill(ADMIN.login)
  await page.getByLabel('Пароль').fill('wrong-password-123')
  await page.getByRole('button', { name: 'Войти' }).click()
  await expect(page.getByText('Неверный логин или пароль')).toBeVisible()
  await expect(page.getByRole('tablist')).toHaveCount(0)
})
