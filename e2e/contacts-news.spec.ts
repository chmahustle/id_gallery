import { expect, test } from '@playwright/test'
import { acceptDialogs, openTab } from './helpers'

test('телефон из «Контакты и шоурумы» виден на странице контактов', async ({ page }) => {
  const phone = `+7 700 ${String(Date.now()).slice(-3)} 00 00`
  await openTab(page, 'Контакты и шоурумы')
  const contacts = page.locator('.admin-contacts')
  const first = contacts.getByLabel('Значение').first()
  const original = await first.inputValue()
  await contacts.getByLabel('Тип контакта').first().selectOption('phone')
  await first.fill(phone)
  await contacts.getByRole('button', { name: 'Сохранить контакты' }).click()
  await expect(page.getByText('Контакты сохранены')).toBeVisible()

  await page.goto('/contact')
  await expect(page.getByText(phone).first()).toBeAttached()

  /* вернуть прежнее значение */
  await openTab(page, 'Контакты и шоурумы')
  await page
    .locator('.admin-contacts')
    .getByLabel('Значение')
    .first()
    .fill(original || phone)
  await page.locator('.admin-contacts').getByRole('button', { name: 'Сохранить контакты' }).click()
  await expect(page.getByText('Контакты сохранены')).toBeVisible()
})

test('новый шоурум появляется на странице шоурумов и удаляется', async ({ page }) => {
  acceptDialogs(page)
  const name = `Тестовый шоурум ${Date.now()}`
  await openTab(page, 'Контакты и шоурумы')
  const showrooms = page.locator('.admin-showrooms')
  await showrooms.getByRole('button', { name: '+ Шоурум' }).click()
  const opened = showrooms.locator('.admin-showroom.is-open')
  await opened.getByLabel('Название').fill(name)
  await opened.getByLabel('Город').fill('Алматы')
  await opened.getByLabel('Адрес').fill('ул. Тестовая, 1')
  await showrooms.getByRole('button', { name: 'Сохранить шоурумы' }).click()
  await expect(page.getByText(/^Шоурумы сохранены/)).toBeVisible()

  await page.goto('/showrooms/')
  await expect(page.getByText(name).first()).toBeAttached()

  await openTab(page, 'Контакты и шоурумы')
  const row = page.locator('.admin-showroom').filter({ hasText: name })
  await row.getByRole('button', { name: 'Удалить шоурум' }).click()
  await page.locator('.admin-showrooms').getByRole('button', { name: 'Сохранить шоурумы' }).click()
  await expect(page.getByText(/^Шоурумы сохранены/)).toBeVisible()
  await page.goto('/showrooms/')
  await expect(page.getByText(name)).toHaveCount(0)
})

test('событие создаётся, видно в журнале и удаляется', async ({ page }) => {
  acceptDialogs(page)
  const title = `Тестовое событие ${Date.now()}`
  await openTab(page, 'События')
  await page.getByRole('button', { name: '+ Добавить новость' }).click()
  await page.getByLabel('Заголовок').fill(title)
  await page.getByLabel('Краткий анонс').fill('Анонс события')
  await page.getByLabel('Текст — абзацы через пустую строку').fill('Первый абзац.')
  await page.getByRole('button', { name: 'Создать' }).click()
  await expect(page.getByText('Новость создана')).toBeVisible()

  await page.goto('/news')
  await expect(page.getByText(title).first()).toBeAttached()

  await openTab(page, 'События')
  const item = page.locator('.admin-news-list__item').filter({ hasText: title })
  await item.getByRole('button', { name: 'Удалить' }).click()
  await expect(page.getByText('Новость удалена')).toBeVisible()
  await expect(page.locator('.admin-news-list__item').filter({ hasText: title })).toHaveCount(0)
})

test('фото события: добавить, убрать — на сайте только оставшиеся', async ({ page }) => {
  acceptDialogs(page)
  const slug = `e2e-gallery-${Date.now()}`
  const png = (name: string) => ({
    name,
    mimeType: 'image/png',
    buffer: Buffer.from(
      'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==',
      'base64',
    ),
  })
  await openTab(page, 'События')
  await page.getByRole('button', { name: '+ Добавить новость' }).click()
  await page.getByLabel('Заголовок').fill('Событие с галереей')
  await page.getByLabel('slug (необязательно)').fill(slug)
  await page.getByLabel('Текст — абзацы через пустую строку').fill('Абзац.')
  const add = page.getByLabel('+ Добавить фото')
  await add.setInputFiles(png('first.png'))
  await expect(page.getByLabel('Подпись к фото 1')).toBeVisible()
  await add.setInputFiles(png('second.png'))
  await page.getByLabel('Подпись к фото 2').fill('Вторая подпись')
  const second = await page.locator('.admin-news-gallery__item img').nth(1).getAttribute('src')
  await page.getByRole('button', { name: 'Удалить фото 1' }).click()
  await expect(page.locator('.admin-news-gallery__item')).toHaveCount(1)
  /* кнопка события не нужна — выключаем, на сайте её нет */
  await page.getByLabel('Показывать кнопку на странице события').uncheck()
  await expect(page.getByLabel('Текст кнопки')).toBeDisabled()
  await page.getByRole('button', { name: 'Создать' }).click()
  await expect(page.getByText('Новость создана')).toBeVisible()

  await page.goto(`/news/${slug}`)
  await expect(page.locator('.news-detail__actions')).toHaveCount(0)
  const hero = page.locator('.news-detail__hero img')
  await expect(hero).toHaveAttribute('src', second!)
  await expect(hero).toHaveAttribute('alt', 'Вторая подпись')
  /* заглушек из кода нет: полосы без своих фото нет */
  await expect(page.locator('.news-detail__strip')).toHaveCount(0)

  await openTab(page, 'События')
  const item = page.locator('.admin-news-list__item').filter({ hasText: 'Событие с галереей' })
  await item.first().getByRole('button', { name: 'Удалить' }).click()
  await expect(page.getByText('Новость удалена')).toBeVisible()
})
