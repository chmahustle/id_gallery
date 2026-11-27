import { expect, test } from '@playwright/test'
import { acceptDialogs, openTab } from './helpers'

test('текст бренда виден на его странице, «вернуть версию из кода» убирает правку', async ({
  page,
}) => {
  acceptDialogs(page)
  const intro = `Тестовый подзаголовок ${Date.now()}`
  await openTab(page, 'Бренды')
  await page.locator('.admin-products__row').first().click()
  await page.getByLabel('Подзаголовок первого экрана').fill(intro)
  await page.getByRole('button', { name: 'Сохранить бренд' }).click()
  await expect(page.getByText(/^Бренд сохранён:/)).toBeVisible()

  const href =
    (await page.getByRole('link', { name: /Страница бренда/ }).getAttribute('href')) || ''
  await page.goto(href)
  await expect(page.locator('.brand-page__lead')).toHaveText(intro)

  await openTab(page, 'Бренды')
  await page.locator('.admin-products__row').first().click()
  await page.getByRole('button', { name: 'Вернуть версию из кода' }).click()
  await expect(page.getByText('Возвращена версия из кода')).toBeVisible()
  await page.goto(href)
  await expect(page.locator('.brand-page__lead')).not.toHaveText(intro)
})

test('автор с моделью появляется на странице бренда', async ({ page }) => {
  await openTab(page, 'Бренды')
  await page.locator('.admin-products__row').first().click()
  const authors = page.locator('.admin-authors')
  await authors.getByRole('button', { name: '+ Автор' }).click()
  const author = authors.locator('.admin-author').last()
  await author.getByPlaceholder('ФИО').fill('ФИО')
  await expect(author.getByText('Не виден на сайте')).toBeVisible()
  await author.getByLabel('Добавить модель автора').selectOption({ index: 1 })
  await expect(author.getByText('Не виден на сайте')).toHaveCount(0)
  await authors.getByRole('button', { name: 'Сохранить авторов' }).click()
  await expect(page.getByText(/^Авторы сохранены/)).toBeVisible()

  const href =
    (await page.getByRole('link', { name: /Страница бренда/ }).getAttribute('href')) || ''
  await page.goto(href)
  await expect(page.locator('#brand-authors')).toBeAttached()
  await expect(page.getByText('ФИО', { exact: true }).first()).toBeAttached()
})
