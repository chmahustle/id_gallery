import { expect, test } from '@playwright/test'
import { acceptDialogs, openTab } from './helpers'

/* PNG 1×1 — для загрузки фото */
const PNG = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
  'base64',
)

test('товар с фото и исполнением сохраняется целиком', async ({ page }) => {
  const name = `Кресло с фото ${Date.now()}`
  await openTab(page, 'Товары')
  await page.getByRole('button', { name: '+ Добавить товар' }).click()
  await page.getByLabel('Название', { exact: true }).first().fill(name)

  /* фото товара: загрузка, кнопка кадра появляется под фото */
  await page.getByLabel('Добавить фото').setInputFiles({
    name: 'photo.png',
    mimeType: 'image/png',
    buffer: PNG,
  })
  await expect(page.locator('.admin-photos img')).toHaveCount(1)
  await expect(
    page.locator('.admin-photos').getByRole('button', { name: 'Кадр на сайте' }),
  ).toBeVisible()

  /* исполнение с названием и цветом */
  await page.getByRole('button', { name: '+ Цвет или исполнение' }).click()
  await page.getByPlaceholder('Название, например «Кожа Nabuk, табак»').fill('Бархат синий')

  await page.getByRole('button', { name: 'Сохранить товар' }).click()
  await expect(page.getByText(`Товар сохранён: ${name}`)).toBeVisible()

  /* открыть снова: всё на месте */
  await page.getByPlaceholder('Поиск по названию').fill(name)
  await page.locator('.admin-products__row').filter({ hasText: name }).click()
  await expect(page.locator('.admin-photos img')).toHaveAttribute(
    'src',
    /^\/uploads\/admin-.+\.png$/,
  )
  await expect(page.getByPlaceholder('Название, например «Кожа Nabuk, табак»')).toHaveValue(
    'Бархат синий',
  )
})

test('правка товара из кода и возврат к версии из кода', async ({ page }) => {
  acceptDialogs(page)
  await openTab(page, 'Товары')
  const row = page
    .locator('.admin-products__row')
    .filter({ hasNotText: /новый|изменён/ })
    .first()
  const original = (await row.locator('strong').textContent()) || ''
  await row.click()
  const slug = await page.getByLabel('Адрес страницы (латиницей)').inputValue()
  const changed = `${original} (правка)`
  await page.getByLabel('Название', { exact: true }).first().fill(changed)
  await page.getByRole('button', { name: 'Сохранить товар' }).click()
  await expect(page.getByText(`Товар сохранён: ${changed}`)).toBeVisible()

  await page.goto(`/product/${slug}`)
  await expect(page.getByRole('heading', { level: 1 })).toContainText(changed)

  await openTab(page, 'Товары')
  await page.getByPlaceholder('Поиск по названию').fill(changed)
  await page.locator('.admin-products__row').filter({ hasText: changed }).click()
  await page.getByRole('button', { name: 'Вернуть версию из кода' }).click()
  await expect(page.getByText('Возвращена версия из кода')).toBeVisible()

  await page.goto(`/product/${slug}`)
  /* в заголовке страницы — бренд и название; правки больше нет */
  const heading = page.getByRole('heading', { level: 1 })
  await expect(heading).toContainText(original)
  await expect(heading).not.toContainText('(правка)')
})
