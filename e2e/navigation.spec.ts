import { expect, test } from '@playwright/test'
import { acceptDialogs, openTab } from './helpers'

test('пункт верхней строки шапки переименовывается и возвращается', async ({ page }) => {
  await openTab(page, 'Меню и подвал')
  const top = page.locator('.admin-field').filter({ hasText: 'Верхняя строка шапки' })
  const first = top.getByLabel('Название ссылки').first()
  const original = await first.inputValue()
  await first.fill('Тестовый раздел')
  await top.getByRole('button', { name: 'Сохранить строку' }).click()
  await expect(page.getByText('Верхняя строка сохранена')).toBeVisible()

  await page.goto('/')
  await expect(page.getByRole('link', { name: 'Тестовый раздел' }).first()).toBeAttached()

  await openTab(page, 'Меню и подвал')
  await page
    .locator('.admin-field')
    .filter({ hasText: 'Верхняя строка шапки' })
    .getByRole('button', { name: 'Вернуть как было в коде' })
    .click()
  await expect(page.getByText('Возвращено исходное')).toBeVisible()
  await page.goto('/')
  await expect(page.getByRole('link', { name: original }).first()).toBeAttached()
})

test('новый тип мебели появляется в каталоге и удаляется', async ({ page }) => {
  acceptDialogs(page)
  await openTab(page, 'Типы и комнаты')
  const types = page.locator('.admin-field').filter({ hasText: 'Типы мебели' })
  await types.getByRole('button', { name: '+ Тип' }).click()
  await types.getByPlaceholder('Например, Ковры').last().fill('Ковры')
  await types.getByPlaceholder('Ковёр').last().fill('Ковёр')
  await types.getByRole('button', { name: 'Сохранить типы' }).click()
  await expect(page.getByText('Типы сохранены')).toBeVisible()
  await expect(types.getByText('/catalog/kovry')).toBeVisible()

  await page.goto('/catalog/kovry')
  await expect(page.getByRole('heading', { level: 1 })).toContainText(/ковры/i)

  await openTab(page, 'Типы и комнаты')
  await page
    .locator('.admin-field')
    .filter({ hasText: 'Типы мебели' })
    .getByRole('button', { name: 'Вернуть как было в коде' })
    .click()
  await expect(page.getByText('Возвращено исходное')).toBeVisible()
})
