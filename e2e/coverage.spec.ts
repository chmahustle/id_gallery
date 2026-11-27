import { expect, test, type Page } from '@playwright/test'
import { acceptDialogs, openTab } from './helpers'

/** Конструктор: открыть страницу и блок (по подписи блока на холсте) */
async function openBlock(page: Page, pageLabel: string, block: string | RegExp) {
  await openTab(page, 'Тексты и фото')
  await page
    .getByRole('navigation', { name: 'Страницы сайта' })
    .getByRole('button', { name: pageLabel, exact: true })
    .click()
  await page.locator('.cv__tag').filter({ hasText: block }).first().click()
  return page.getByLabel('Настройки блока')
}

test.describe('главная', () => {
  test('полоса брендов: убрать бренд и вернуть все', async ({ page }) => {
    const sheet = await openBlock(page, 'Главная', 'Бренды')
    const first = sheet.locator('.admin-pick__row').first()
    const name = ((await first.locator('strong').textContent()) || '').trim()
    await first.getByRole('button', { name: 'Убрать из полосы' }).click()
    await expect(page.getByText('Бренды в полосе сохранены')).toBeVisible()

    await page.goto('/')
    const strip = page.locator('.home-brands__list')
    await expect(strip.locator('li').first()).toBeAttached()
    await expect(strip.getByText(name, { exact: true })).toHaveCount(0)

    const again = await openBlock(page, 'Главная', 'Бренды')
    await again.getByRole('button', { name: 'Показывать все бренды каталога' }).click()
    await expect(page.locator('.admin__banner')).toHaveText('Показываются все бренды каталога')
    await page.goto('/')
    await expect(page.locator('.home-brands__list').getByText(name, { exact: true })).toBeAttached()
  })

  test('«По комнатам»: убрать товар и вернуть автоматический выбор', async ({ page }) => {
    const sheet = await openBlock(page, 'Главная', 'По комнатам')
    const first = sheet.locator('.admin-pick__list li').first()
    const name = ((await first.locator('strong').textContent()) || '').trim()
    await first.getByRole('button', { name: 'Убрать' }).click()
    await expect(page.getByText('Товары блока «По комнатам» сохранены')).toBeVisible()

    await page.goto('/')
    const grid = page.locator('.home-featured__grid')
    await expect(grid.locator('li').first()).toBeAttached()
    await expect(grid.getByText(name, { exact: true })).toHaveCount(0)

    const again = await openBlock(page, 'Главная', 'По комнатам')
    await again.getByRole('button', { name: 'Вернуть автоматический выбор' }).click()
    await expect(page.getByText('Товары блока «По комнатам» сохранены')).toBeVisible()
    await page.goto('/')
    await expect(
      page.locator('.home-featured__grid').getByText(name, { exact: true }),
    ).toBeAttached()
  })

  test('«Кнопки и подписи»: текст кнопки первого экрана', async ({ page }) => {
    await openTab(page, 'Тексты и фото')
    await page.getByRole('button', { name: /^Кнопки и подписи/ }).click()
    const sheet = page.getByLabel('Настройки блока')
    const field = sheet.locator('.admin-field').filter({ hasText: 'Кнопка 1' }).first()
    const text = field.getByLabel('Текст кнопки')
    const original = await text.inputValue()
    await text.fill('Тестовая кнопка')
    await field.getByRole('button', { name: 'Сохранить' }).click()
    await expect(page.getByText('Сохранено: Первый экран — кнопка 1')).toBeVisible()

    await page.goto('/')
    await expect(page.getByRole('link', { name: 'Тестовая кнопка' }).first()).toBeVisible()

    await openTab(page, 'Тексты и фото')
    await page.getByRole('button', { name: /^Кнопки и подписи/ }).click()
    await page
      .getByLabel('Настройки блока')
      .locator('.admin-field')
      .filter({ hasText: 'Кнопка 1' })
      .first()
      .getByRole('button', { name: 'Вернуть исходное' })
      .click()
    await page.goto('/')
    await expect(page.getByRole('link', { name: original }).first()).toBeVisible()
  })

  test('«Для поисковиков»: заголовок вкладки браузера', async ({ page }) => {
    const title = `Тестовый заголовок вкладки ${Date.now()}`
    await openTab(page, 'Тексты и фото')
    await page.getByRole('button', { name: /^Для поисковиков/ }).click()
    const sheet = page.getByLabel('Настройки блока')
    const field = sheet.locator('.admin-field').filter({ hasText: 'Заголовок' }).first()
    await field.locator('textarea').fill(title)
    await field.getByRole('button', { name: 'Сохранить' }).click()
    await expect(page.getByText('Сохранено: Для поисковиков — заголовок')).toBeVisible()
    /* превью «Так страница выглядит в поиске» показывает новый заголовок */
    await expect(sheet.locator('.admin-seo__title')).toHaveText(title)

    await page.goto('/')
    await expect(page).toHaveTitle(title)
  })
})

test('вакансия из конструктора появляется на странице «Карьера»', async ({ page }) => {
  const title = `Тестовая вакансия ${Date.now()}`
  const sheet = await openBlock(page, 'Карьера', /ваканси/i)
  await sheet.getByRole('button', { name: '+ Вакансия' }).click()
  await sheet.getByPlaceholder('Название вакансии').last().fill(title)
  await sheet.getByRole('button', { name: 'Сохранить вакансии' }).click()
  await expect(page.getByText('Вакансии сохранены')).toBeVisible()

  await page.goto('/career/')
  await expect(page.locator('.career-vacancies__title').filter({ hasText: title })).toBeVisible()

  const again = await openBlock(page, 'Карьера', /ваканси/i)
  await again.getByRole('button', { name: 'Удалить вакансию' }).last().click()
  await again.getByRole('button', { name: 'Сохранить вакансии' }).click()
  await expect(page.getByText('Вакансии сохранены')).toBeVisible()
  await page.goto('/career/')
  await expect(page.getByText(title)).toHaveCount(0)
})

test.describe('страница бренда', () => {
  test('подборка товаров: убрать товар и вернуть автоматический выбор', async ({ page }) => {
    await openTab(page, 'Бренды')
    await page.locator('.admin-products__row').first().click()
    const href =
      (await page.getByRole('link', { name: /Страница бренда/ }).getAttribute('href')) || ''
    const picker = page.locator('.admin-pick').filter({ hasText: 'Товары в подборке' })
    const first = picker.locator('.admin-pick__row').first()
    const name = ((await first.locator('strong').textContent()) || '').trim()
    await first.getByRole('button', { name: 'Убрать' }).click()
    await expect(page.getByText('Подборка товаров сохранена')).toBeVisible()

    await page.goto(href)
    const section = page.locator('[aria-labelledby="brand-featured-title"]')
    await expect(section).toBeAttached()
    await expect(section.getByText(name, { exact: true })).toHaveCount(0)

    await openTab(page, 'Бренды')
    await page.locator('.admin-products__row').first().click()
    await page
      .locator('.admin-pick')
      .filter({ hasText: 'Товары в подборке' })
      .getByRole('button', { name: 'Вернуть автоматический выбор' })
      .click()
    await expect(page.getByText('Подборка товаров сохранена')).toBeVisible()
  })

  test('каталог бренда: добавить с файлом и убрать', async ({ page }) => {
    const title = `Тестовый каталог ${Date.now()}`
    await openTab(page, 'Бренды')
    await page.locator('.admin-products__row').first().click()
    const href =
      (await page.getByRole('link', { name: /Страница бренда/ }).getAttribute('href')) || ''
    const picker = page.locator('.admin-pick').filter({ hasText: 'Каталоги' }).last()
    await picker.getByPlaceholder('Название (семейство, не год)').fill(title)
    await picker.getByLabel('Файл PDF').setInputFiles({
      name: 'catalog.pdf',
      mimeType: 'application/pdf',
      buffer: Buffer.from('%PDF-1.4\n%%EOF\n'),
    })
    await expect(picker.getByText('Файл ✓')).toBeVisible()
    await picker.getByRole('button', { name: 'Добавить каталог' }).click()
    await expect(page.getByText('Каталоги бренда сохранены')).toBeVisible()

    await page.goto(href)
    await expect(page.getByText(title).first()).toBeAttached()

    await openTab(page, 'Бренды')
    await page.locator('.admin-products__row').first().click()
    const row = page.locator('.admin-pick__row').filter({ hasText: title })
    await row.getByRole('button', { name: 'Убрать' }).click()
    await expect(page.getByText('Каталоги бренда сохранены')).toBeVisible()
    await page.goto(href)
    await expect(page.getByText(title)).toHaveCount(0)
  })
})

test.describe('меню, подвал, комнаты', () => {
  test('заголовок колонки подвала', async ({ page }) => {
    await openTab(page, 'Меню и подвал')
    const footer = page
      .locator('.admin-field')
      .filter({ hasText: 'Колонка брендов собирается сама' })
    await footer.getByPlaceholder('Заголовок колонки').first().fill('Тестовый каталог')
    await footer.getByRole('button', { name: 'Сохранить подвал' }).click()
    await expect(page.getByText('Подвал сохранён')).toBeVisible()

    await page.goto('/')
    await expect(
      page.locator('.footer__heading').filter({ hasText: 'Тестовый каталог' }),
    ).toBeAttached()

    await openTab(page, 'Меню и подвал')
    await page
      .locator('.admin-field')
      .filter({ hasText: 'Колонка брендов собирается сама' })
      .getByRole('button', { name: 'Вернуть как было в коде' })
      .click()
    await expect(page.getByText('Возвращено исходное')).toBeVisible()
  })

  test('заголовок колонки полного меню', async ({ page }) => {
    await openTab(page, 'Меню и подвал')
    const menu = page.locator('.admin-field').filter({ hasText: 'Полное меню' })
    await menu.getByPlaceholder('Заголовок колонки').first().fill('Тестовая колонка')
    await menu.getByRole('button', { name: 'Сохранить меню' }).click()
    await expect(page.getByText('Меню сохранено')).toBeVisible()

    await page.goto('/')
    await page.getByRole('button', { name: /меню/i }).first().click()
    await expect(page.getByText('Тестовая колонка').first()).toBeVisible()

    await openTab(page, 'Меню и подвал')
    await page
      .locator('.admin-field')
      .filter({ hasText: 'Полное меню' })
      .getByRole('button', { name: 'Вернуть как было в коде' })
      .click()
    await expect(page.getByText('Возвращено исходное')).toBeVisible()
  })

  test('название комнаты видно во вкладках «По комнатам» на главной', async ({ page }) => {
    await openTab(page, 'Типы и комнаты')
    const rooms = page.locator('.admin-field').filter({ hasText: 'Комнаты' }).last()
    await rooms.getByPlaceholder('Например, Прихожая').first().fill('Тестовая комната')
    await rooms.getByRole('button', { name: 'Сохранить комнаты' }).click()
    await expect(page.getByText('Комнаты сохранены')).toBeVisible()

    await page.goto('/')
    await expect(page.getByRole('tab', { name: 'Тестовая комната' })).toBeVisible()

    await openTab(page, 'Типы и комнаты')
    await page
      .locator('.admin-field')
      .filter({ hasText: 'Комнаты' })
      .last()
      .getByRole('button', { name: 'Вернуть как было в коде' })
      .click()
    await expect(page.getByText('Возвращено исходное')).toBeVisible()
  })
})

test('у выбранного цвета на странице товара — его фото и размеры', async ({ page }) => {
  acceptDialogs(page)
  const slug = `test-variants-${Date.now()}`
  const saved = await page.request.put(`/api/products/${slug}`, {
    data: {
      published: true,
      data: {
        name: 'Диван с цветами',
        brand: 'Тест',
        brandSlug: 'visionnaire',
        category: 'Диваны',
        categorySlug: 'sofas',
        shortDescription: '',
        status: 'approved',
        images: ['/images/main.jpg'],
        image: '/images/main.jpg',
        variants: [
          {
            id: 'v1',
            name: 'Бархат синий',
            swatch: '#223355',
            images: ['/images/blue.jpg'],
            image: '/images/blue.jpg',
            status: 'approved',
          },
          {
            id: 'v2',
            name: 'Кожа табак',
            swatch: '#8a5a3b',
            images: ['/images/tobacco.jpg', '/images/tobacco-2.jpg'],
            image: '/images/tobacco.jpg',
            dimensions: { value: '240 × 100 × 80', status: 'approved' },
            status: 'approved',
          },
        ],
      },
    },
  })
  expect(saved.ok()).toBe(true)

  await page.goto(`/product/${slug}`)
  await page.getByRole('option', { name: 'Кожа табак' }).click()
  await expect(page.locator('img[src="/images/tobacco.jpg"]').first()).toBeAttached()
  /* у цвета все его фото и его размеры */
  await expect(page.locator('img[src="/images/tobacco-2.jpg"]').first()).toBeAttached()
  await expect(page.getByText('Для исполнения: Кожа табак')).toBeVisible()
  await expect(page.getByText('240 × 100 × 80')).toBeVisible()
  await page.getByRole('option', { name: 'Бархат синий' }).click()
  await expect(page.locator('img[src="/images/blue.jpg"]').first()).toBeAttached()

  await page.request.delete(`/api/products/${slug}`)
})
