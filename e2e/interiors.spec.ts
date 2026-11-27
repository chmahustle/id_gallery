import { expect, test } from '@playwright/test'
import { openTab } from './helpers'

/* PNG 1×1 — фото нового интерьера */
const PNG = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
  'base64',
)

test('новый интерьер появляется в списке на сайте', async ({ page }) => {
  const title = `Тестовая гостиная ${Date.now()}`
  await openTab(page, 'Интерьеры')
  await page.getByRole('button', { name: '+ Добавить интерьер' }).click()
  await page.getByLabel('Заголовок').fill(title)
  await page.locator('.admin-interior__photo input[type="file"]').setInputFiles({
    name: 'room.png',
    mimeType: 'image/png',
    buffer: PNG,
  })
  await expect(page.locator('.admin-interior__photo img')).toHaveAttribute('src', /^\/uploads\//)
  await page.getByRole('button', { name: 'Сохранить интерьер' }).click()
  await expect(page.getByText('Интерьер сохранён')).toBeVisible()

  const href = await page.getByRole('link', { name: /Страница интерьера/ }).getAttribute('href')
  await page.goto('/interiors')
  await expect(page.locator(`a[href="${href}"]`).first()).toBeAttached()
  await page.goto(href || '/')
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(title)
})

test('точка товара на фото видна на странице интерьера', async ({ page }) => {
  await openTab(page, 'Интерьеры')
  await page.locator('.admin-products__row').first().click()

  /* поставить точку в центр фото и выбрать для неё товар */
  const frame = page.locator('.admin-spots__frame')
  await frame.scrollIntoViewIfNeeded()
  const box = await frame.boundingBox()
  if (!box) throw new Error('фото не найдено')
  const before = await page.locator('.admin-spot').count()
  await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2)
  await expect(page.locator('.admin-spot')).toHaveCount(before + 1)
  const select = page.getByLabel(`Товар точки ${before + 1}`)
  await select.selectOption({ index: 1 })
  const productName = ((await select.locator('option:checked').textContent()) || '').split(' · ')[0]

  await page.getByRole('button', { name: 'Сохранить интерьер' }).click()
  await expect(page.getByText('Интерьер сохранён')).toBeVisible()

  const href = await page.getByRole('link', { name: /Страница интерьера/ }).getAttribute('href')
  await page.goto(href || '/')
  await expect(
    page.getByRole('button', { name: new RegExp(`· ${productName}$`) }).first(),
  ).toBeAttached()
})
