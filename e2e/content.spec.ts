import { expect, test, type Page } from '@playwright/test'
import { openTab } from './helpers'

/* PNG 1×1 — для замены фото */
const PNG = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
  'base64',
)

/** Открыть настройки первого экрана главной: нажать на заголовок на холсте */
async function openHero(page: Page) {
  await openTab(page, 'Тексты и фото')
  await page.locator('.cv').getByRole('heading', { level: 1 }).first().click()
  return page.getByLabel('Настройки блока')
}

test('«Вернуть исходное» возвращает текст из кода', async ({ page }) => {
  let sheet = await openHero(page)
  const field = sheet.locator('.admin-field--title.is-selected')
  await field.locator('textarea').fill('Временный заголовок')
  await field.getByRole('button', { name: 'Сохранить' }).click()
  await expect(page.getByText('Сохранено: Первый экран — заголовок')).toBeVisible()

  sheet = await openHero(page)
  await sheet
    .locator('.admin-field--title.is-selected')
    .getByRole('button', { name: 'Вернуть исходное' })
    .click()
  await expect(page.getByText('Возвращено исходное: Первый экран — заголовок')).toBeVisible()
  /* после сброса правки нет: кнопки возврата больше нет, в поле — текст из кода */
  const restored = sheet.locator('.admin-field--title.is-selected')
  await expect(restored.getByRole('button', { name: 'Вернуть исходное' })).toHaveCount(0)
  const original = await restored.locator('textarea').inputValue()
  expect(original).not.toBe('Временный заголовок')

  await page.goto('/')
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(original)
})

test('замена фото первого экрана видна на сайте', async ({ page }) => {
  const sheet = await openHero(page)
  const photo = sheet.locator('.admin-field--image').first()
  await photo.locator('input[type="file"]').setInputFiles({
    name: 'hero.png',
    mimeType: 'image/png',
    buffer: PNG,
  })
  await expect(page.getByText('Сохранено: Первый экран — фото')).toBeVisible()
  await expect(photo.locator('img')).toHaveAttribute('src', /^\/uploads\/admin-.+\.png$/)

  await page.goto('/')
  await expect(page.locator('img[src^="/uploads/admin-"]').first()).toBeAttached()

  /* вернуть фото из кода, чтобы не мешать другим проверкам */
  const again = await openHero(page)
  await again
    .locator('.admin-field--image')
    .first()
    .getByRole('button', { name: 'Вернуть исходное' })
    .click()
  await expect(page.getByText('Возвращено исходное: Первый экран — фото')).toBeVisible()
})

test.describe('перетаскивание', () => {
  /* высокое окно: оба блока на экране одновременно */
  test.use({ viewport: { width: 1440, height: 1800 } })

  test('перестановка блоков главной перетаскиванием', async ({ page, request }) => {
    await openTab(page, 'Тексты и фото')
    const tags = page.locator('.cv__tag.is-movable')
    await expect(tags.nth(1)).toBeVisible()
    const first = ((await tags.nth(0).textContent()) || '').replace(/\d+$/, '').replace('⠿', '')
    const second = ((await tags.nth(1).textContent()) || '').replace(/\d+$/, '').replace('⠿', '')

    /* первый блок — в середину области, второй тянем выше него */
    await tags.nth(0).evaluate((el) => el.scrollIntoView({ block: 'center' }))
    /* прокрутка плавная — дождаться, пока блок встанет на место */
    let last = -1
    await expect
      .poll(async () => {
        const y = (await tags.nth(0).boundingBox())?.y ?? -1
        const stable = y === last
        last = y
        return stable
      })
      .toBe(true)
    const from = await tags.nth(1).boundingBox()
    if (!from) throw new Error('блок не найден')
    await page.mouse.move(from.x + 20, from.y + 5)
    await page.mouse.down()
    await page.mouse.move(from.x + 20, from.y - 20, { steps: 5 })
    /* при начале перетаскивания открывается окно настроек, холст сужается —
       место первого блока берём после этого */
    await expect(page.locator('.cv__box.is-dragging')).toHaveCount(1)
    await page.waitForTimeout(600)
    const to = await tags.nth(0).boundingBox()
    if (!to) throw new Error('блок не найден')
    /* в верхнюю половину первого блока, подальше от края: у края холст прокручивается сам */
    await page.mouse.move(to.x + 20, to.y + 30, { steps: 10 })
    await page.mouse.up()
    await expect(page.getByText('Порядок блоков сохранён')).toBeVisible()
    await expect(tags.nth(0)).toContainText(second.trim())
    await expect(tags.nth(1)).toContainText(first.trim())

    const { values } = await (await request.get('/api/content')).json()
    expect(JSON.parse(values['home.order']).length).toBeGreaterThan(1)

    /* вернуть исходный порядок */
    await page.getByRole('button', { name: 'Исходный порядок' }).click()
    await expect(page.getByText('Возвращён исходный порядок блоков')).toBeVisible()
    await expect(tags.nth(0)).toContainText(first.trim())
  })
})
