import { expect, test } from '@playwright/test'
import { acceptDialogs, openTab } from './helpers'

test('текст из конструктора появляется на главной', async ({ page }) => {
  const title = `Тестовый заголовок ${Date.now()}`
  await openTab(page, 'Тексты и фото')
  /* на холсте — копия страницы: нажатие на заголовок открывает его настройки */
  await page.locator('.cv').getByRole('heading', { level: 1 }).first().click()
  const sheet = page.getByLabel('Настройки блока')
  const field = sheet.locator('.admin-field--title.is-selected textarea')
  await field.fill(title)
  await sheet
    .locator('.admin-field--title.is-selected')
    .getByRole('button', { name: 'Сохранить' })
    .click()
  await expect(page.getByText('Сохранено: Первый экран — заголовок')).toBeVisible()

  await page.goto('/')
  await expect(page.getByRole('heading', { level: 1 })).toContainText(title)
})

test('новый товар появляется на сайте', async ({ page }) => {
  const name = `Тестовый диван ${Date.now()}`
  await openTab(page, 'Товары')
  await page.getByRole('button', { name: '+ Добавить товар' }).click()
  await page.getByLabel('Название', { exact: true }).first().fill(name)
  await page.getByLabel('Бренд').first().selectOption({ index: 1 })
  await page.getByLabel('Тип').first().selectOption({ index: 1 })
  await page.getByRole('button', { name: 'Сохранить товар' }).click()
  await expect(page.getByText(`Товар сохранён: ${name}`)).toBeVisible()

  /* в поиске каталога — карточка товара со ссылкой на его страницу */
  await page.goto(`/catalog?q=${encodeURIComponent(name)}`)
  const card = page.locator('a[href^="/product/"]').filter({ hasText: name }).first()
  await expect(card).toBeVisible()
  await card.click()
  await expect(page.getByRole('heading', { level: 1 })).toContainText(name)
})

test('удалённый интерьер пропадает с сайта и возвращается', async ({ page, request }) => {
  acceptDialogs(page)
  await openTab(page, 'Интерьеры')
  const remove = page.getByRole('button', { name: /^Удалить интерьер «/ }).first()
  const label = (await remove.getAttribute('aria-label')) || ''
  const title = label.replace(/^Удалить интерьер «|»$/g, '')
  await remove.click()
  await expect(page.getByText('Интерьер сохранён')).toBeVisible()
  await expect(page.getByRole('button', { name: /Вернуть удалённые \(1\)/ })).toBeVisible()

  /* адрес удалённого интерьера — из сохранённой записи */
  const { values } = await (await request.get('/api/content')).json()
  const deleted = JSON.parse(values['interiors.records']).find(
    (item: { deleted?: boolean; title?: string }) => item.deleted && item.title === title,
  )
  expect(deleted?.slug).toBeTruthy()
  const card = page.locator(`a[href="/interiors/${deleted.slug}/"]`)

  await page.goto('/interiors')
  /* страница загрузилась: видна хотя бы одна карточка другого интерьера */
  await expect(
    page.locator('a[href^="/interiors/"]:not([href="/interiors/"])').first(),
  ).toBeVisible()
  await expect(card).toHaveCount(0)

  await openTab(page, 'Интерьеры')
  await page.getByRole('button', { name: /Вернуть удалённые/ }).click()
  await expect(page.getByText('Интерьер сохранён')).toBeVisible()
  await expect(page.getByRole('button', { name: `Удалить интерьер «${title}»` })).toBeVisible()
  await page.goto('/interiors')
  await expect(card).toBeVisible()
})

test('кадр фото сохраняется и применяется на сайте', async ({ page }) => {
  await openTab(page, 'Интерьеры')
  await page.locator('.admin-products__row').first().click()
  await page.getByRole('button', { name: 'Кадр на сайте' }).click()
  const dialog = page.getByRole('dialog', { name: 'Кадр фото' })
  await dialog.getByRole('button', { name: 'Приблизить' }).click()
  await dialog.getByRole('button', { name: 'Приблизить' }).click()
  await dialog.getByRole('button', { name: 'Применить кадр' }).click()
  await expect(page.getByRole('button', { name: 'Кадр настроен' })).toBeVisible()
  await page.getByRole('button', { name: 'Сохранить интерьер' }).click()
  await expect(page.getByText('Интерьер сохранён')).toBeVisible()

  const link = page.getByRole('link', { name: /Страница интерьера/ })
  const href = (await link.getAttribute('href')) || ''
  await page.goto(href)
  const hero = page.locator('img[src*="#frame="]').first()
  await expect(hero).toBeVisible()
  /* сайт применил кадр: снимок приближен */
  await expect(hero).toHaveCSS('scale', '1.2')
})
