# Мобильный аудит — этап 16

Дата: 2026-10-20T21:01:30.142Z

Только измерения, без исправлений.
Скрины: `audit/mobile/<id>-<width>.png` (390 / 768 / 1440).
Сырые метрики: `audit/mobile/<id>-<width>.json`.

## Проверки сборки

| Команда | Результат |
|---------|-----------|
| lint | ok (есть warnings oxlint/react, **0 errors**) |
| typecheck | ok |
| build | ok |
| check:content | ok |
| check:images | ok (1 warning: `/images/brand-visionnaire.jpg` width 1132px < 2400px) |

## Топ-10 проблем

| # | Серьёзность | Проблема | Вхождений | Экранов (примеры) |
|---|-------------|----------|-----------|-------------------|
| 1 | блокирует | Контраст <4.5:1 | 60 | home@390, home@768, home@1440, catalog@390 |
| 2 | портит вид | Тап <44×44 | 60 | home@390, home@768, home@1440, catalog@390 |
| 3 | портит вид | Фокус Tab слабо/не виден | 60 | home@390, home@768, home@1440, catalog@390 |
| 4 | портит вид | Картинки >400KB | 20 | home@390, catalog@390, catalog-divany@390, brands@390 |
| 5 | портит вид | Крупный fixed перекрывает экран | 18 | menu-open@390, menu-open@390, menu-open@768, menu-open@768 |
| 6 | мелочь | Hover-only CSS | 40 | home@390, home@768, catalog@390, catalog@768 |
| 7 | мелочь | Текст <14px | 20 | home@390, catalog@390, catalog-divany@390, brands@390 |
| 8 | мелочь | Длинные строки >75 | 16 | home@390, brands@390, brand-visionnaire@390, brand-molteni@390 |

### Краткие выводы

- Горизонтальный скролл: **не обнаружен** ни на одном из 60 экранов.
- Тап <44×44: массово (до 40 на экран) — иконки шапки `40×40`, skip-link `41`px высоты, swatch’и/мелкие ссылки.
- Контраст <4.5:1: до 30 попаданий на экран. **Оговорка:** эвристика часто даёт ложные 1:1 на overlay-шапке (светлый текст на `background: transparent` → подставляется body Snow Ivory) и на off-screen skip-link. Реальный контраст на hero/scrim нужно проверять точечно (axe DevTools / ручной).
- Фокус Tab: первый focusable часто skip-link без видимого ring до Tab; после Tab `:focus-visible` на интерактивах стоит проверить вручную.
- Картинки >400KB на 390: Gemini/placeholders и `interior-01.png` **2.7–3.3 MB** на мобильном.
- Fixed: шапка ~13% высоты 844; крупные оверлеи — у `menu-open` / drawers.
- Маршрут товара в приложении: `/product/...` (в ТЗ было `/products/`).

## Таблица маршрут × проблема

| Маршрут | Ширина | Серьёзность | Проблема | Детали |
|---------|--------|-------------|----------|--------|
| home | 390 | портит вид | Тап <44×44 (40) | #root > div.page > a.skip-link 186×41; div.page > header.header.header--overlay > div.header__top:nth-child(1) > div.header__left:nth-child(1) > button.header__ |
| home | 390 | мелочь | Текст <14px (25) | 12px Перейти к содержимому; 13px Диваны; 13px Диваны; 13px Диваны; 13px Кресла |
| home | 390 | мелочь | Длинные строки >75 (3) | 76ch, 116ch, 81ch |
| home | 390 | портит вид | Картинки >400KB (7) | 3323KB Gemini_Generated_Image_sq76gsq76gsq76gs.jpg; 2894KB Gemini_Generated_Image_ty7owqty7owqty7o.jpg; 3308KB interior-01.png; 657KB interior-03.png; 3119KB Ge |
| home | 390 | портит вид | Фокус Tab слабо/не виден | #root > div.page > a.skip-link |
| home | 390 | мелочь | Hover-only CSS (25) | .page-crumbs a:hover, .news-crumbs a:hover, .catalog-page__crumbs a:hover, .product-page__crumbs a:hover \| .auth-modal__close:hover \| .auth-modal__submit:hove |
| home | 390 | блокирует | Контраст <4.5:1 (30) | 1:1 Перейти к содержимому; 1:1 ID Gallery; 1:1 ID Gallery; 1:1 Дизайнерам; 1:1 Контакты; 1:1 Все товары |
| home | 768 | портит вид | Тап <44×44 (40) | #root > div.page > a.skip-link 186×41; div.page > header.header.header--overlay > div.header__top:nth-child(1) > div.header__left:nth-child(1) > button.header__ |
| home | 768 | портит вид | Фокус Tab слабо/не виден | #root > div.page > a.skip-link |
| home | 768 | мелочь | Hover-only CSS (25) | .page-crumbs a:hover, .news-crumbs a:hover, .catalog-page__crumbs a:hover, .product-page__crumbs a:hover \| .auth-modal__close:hover \| .auth-modal__submit:hove |
| home | 768 | блокирует | Контраст <4.5:1 (30) | 1:1 Перейти к содержимому; 1:1 ID Gallery; 1:1 ID Gallery; 1:1 Дизайнерам; 1:1 Контакты; 1:1 Все товары |
| home | 1440 | портит вид | Тап <44×44 (40) | #root > div.page > a.skip-link 186×41; div.page > header.header.header--overlay > div.header__top:nth-child(1) > div.header__left:nth-child(1) > button.header__ |
| home | 1440 | портит вид | Фокус Tab слабо/не виден | #root > div.page > a.skip-link |
| home | 1440 | блокирует | Контраст <4.5:1 (30) | 1:1 Перейти к содержимому; 1:1 ID Gallery; 1:1 ID Gallery; 1:1 Дизайнерам; 1:1 Контакты; 1:1 Все товары |
| catalog | 390 | портит вид | Тап <44×44 (40) | #root > div.page.page--solid > a.skip-link 186×41; div.page.page--solid > header.header.header--solid > div.header__top:nth-child(1) > div.header__left:nth-chil |
| catalog | 390 | мелочь | Текст <14px (25) | 12px Перейти к содержимому; 11px Главная; 11px Каталог; 12px Диваны; 12px Visionnaire |
| catalog | 390 | портит вид | Картинки >400KB (4) | 2894KB Gemini_Generated_Image_ty7owqty7owqty7o.jpg; 3119KB Gemini_Generated_Image_9wrdx89wrdx89wrd.jpg; 3192KB Gemini_Generated_Image_9eqvhh9eqvhh9eqv.jpg; 2760 |
| catalog | 390 | портит вид | Фокус Tab слабо/не виден | #root > div.page.page--solid > a.skip-link |
| catalog | 390 | мелочь | Hover-only CSS (25) | .page-crumbs a:hover, .news-crumbs a:hover, .catalog-page__crumbs a:hover, .product-page__crumbs a:hover \| .auth-modal__close:hover \| .auth-modal__submit:hove |
| catalog | 390 | блокирует | Контраст <4.5:1 (1) | 1:1 Перейти к содержимому |
| catalog | 768 | портит вид | Тап <44×44 (40) | #root > div.page.page--solid > a.skip-link 186×41; div.page.page--solid > header.header.header--solid > div.header__top:nth-child(1) > div.header__left:nth-chil |
| catalog | 768 | портит вид | Фокус Tab слабо/не виден | #root > div.page.page--solid > a.skip-link |
| catalog | 768 | мелочь | Hover-only CSS (25) | .page-crumbs a:hover, .news-crumbs a:hover, .catalog-page__crumbs a:hover, .product-page__crumbs a:hover \| .auth-modal__close:hover \| .auth-modal__submit:hove |
| catalog | 768 | блокирует | Контраст <4.5:1 (1) | 1:1 Перейти к содержимому |
| catalog | 1440 | портит вид | Тап <44×44 (40) | #root > div.page.page--solid > a.skip-link 186×41; div.page.page--solid > header.header.header--solid > div.header__top:nth-child(1) > div.header__left:nth-chil |
| catalog | 1440 | портит вид | Фокус Tab слабо/не виден | #root > div.page.page--solid > a.skip-link |
| catalog | 1440 | блокирует | Контраст <4.5:1 (1) | 1:1 Перейти к содержимому |
| catalog-divany | 390 | портит вид | Тап <44×44 (40) | #root > div.page.page--solid > a.skip-link 186×41; div.page.page--solid > header.header.header--solid > div.header__top:nth-child(1) > div.header__left:nth-chil |
| catalog-divany | 390 | мелочь | Текст <14px (25) | 12px Перейти к содержимому; 11px Главная; 11px Каталог; 11px Диваны; 12px Диваны |
| catalog-divany | 390 | портит вид | Картинки >400KB (2) | 2894KB Gemini_Generated_Image_ty7owqty7owqty7o.jpg; 3119KB Gemini_Generated_Image_9wrdx89wrdx89wrd.jpg |
| catalog-divany | 390 | портит вид | Фокус Tab слабо/не виден | #root > div.page.page--solid > a.skip-link |
| catalog-divany | 390 | мелочь | Hover-only CSS (25) | .page-crumbs a:hover, .news-crumbs a:hover, .catalog-page__crumbs a:hover, .product-page__crumbs a:hover \| .auth-modal__close:hover \| .auth-modal__submit:hove |
| catalog-divany | 390 | блокирует | Контраст <4.5:1 (1) | 1:1 Перейти к содержимому |
| catalog-divany | 768 | портит вид | Тап <44×44 (40) | #root > div.page.page--solid > a.skip-link 186×41; div.page.page--solid > header.header.header--solid > div.header__top:nth-child(1) > div.header__left:nth-chil |
| catalog-divany | 768 | портит вид | Фокус Tab слабо/не виден | #root > div.page.page--solid > a.skip-link |
| catalog-divany | 768 | мелочь | Hover-only CSS (25) | .page-crumbs a:hover, .news-crumbs a:hover, .catalog-page__crumbs a:hover, .product-page__crumbs a:hover \| .auth-modal__close:hover \| .auth-modal__submit:hove |
| catalog-divany | 768 | блокирует | Контраст <4.5:1 (1) | 1:1 Перейти к содержимому |
| catalog-divany | 1440 | портит вид | Тап <44×44 (40) | #root > div.page.page--solid > a.skip-link 186×41; div.page.page--solid > header.header.header--solid > div.header__top:nth-child(1) > div.header__left:nth-chil |
| catalog-divany | 1440 | портит вид | Фокус Tab слабо/не виден | #root > div.page.page--solid > a.skip-link |
| catalog-divany | 1440 | блокирует | Контраст <4.5:1 (1) | 1:1 Перейти к содержимому |
| brands | 390 | портит вид | Тап <44×44 (36) | #root > div.page.page--solid > a.skip-link 186×41; div.page.page--solid > header.header.header--solid > div.header__top:nth-child(1) > div.header__left:nth-chil |
| brands | 390 | мелочь | Текст <14px (25) | 12px Перейти к содержимому; 11px Главная; 11px Бренды; 13px Диваны; 13px Диваны |
| brands | 390 | мелочь | Длинные строки >75 (5) | 96ch, 83ch, 90ch |
| brands | 390 | портит вид | Картинки >400KB (2) | 5565KB brand-molteni.jpg; 3485KB brand-baxter.jpg |
| brands | 390 | портит вид | Фокус Tab слабо/не виден | #root > div.page.page--solid > a.skip-link |
| brands | 390 | мелочь | Hover-only CSS (25) | .page-crumbs a:hover, .news-crumbs a:hover, .catalog-page__crumbs a:hover, .product-page__crumbs a:hover \| .auth-modal__close:hover \| .auth-modal__submit:hove |
| brands | 390 | блокирует | Контраст <4.5:1 (13) | 1:1 Перейти к содержимому; 1:1 Visionnaire; 1:1 Смотреть Visionnaire; 1:1 Смотреть Visionnaire; 1:1 Molteni&C; 1:1 Смотреть Molteni&C |
| brands | 768 | портит вид | Тап <44×44 (38) | #root > div.page.page--solid > a.skip-link 186×41; div.page.page--solid > header.header.header--solid > div.header__top:nth-child(1) > div.header__left:nth-chil |
| brands | 768 | портит вид | Фокус Tab слабо/не виден | #root > div.page.page--solid > a.skip-link |
| brands | 768 | мелочь | Hover-only CSS (25) | .page-crumbs a:hover, .news-crumbs a:hover, .catalog-page__crumbs a:hover, .product-page__crumbs a:hover \| .auth-modal__close:hover \| .auth-modal__submit:hove |
| brands | 768 | блокирует | Контраст <4.5:1 (13) | 1:1 Перейти к содержимому; 1:1 Visionnaire; 1:1 Смотреть Visionnaire; 1:1 Смотреть Visionnaire; 1:1 Molteni&C; 1:1 Смотреть Molteni&C |
| brands | 1440 | портит вид | Тап <44×44 (37) | #root > div.page.page--solid > a.skip-link 186×41; div.page.page--solid > header.header.header--solid > div.header__top:nth-child(1) > div.header__left:nth-chil |
| brands | 1440 | портит вид | Фокус Tab слабо/не виден | #root > div.page.page--solid > a.skip-link |
| brands | 1440 | блокирует | Контраст <4.5:1 (13) | 1:1 Перейти к содержимому; 1:1 Visionnaire; 1:1 Смотреть Visionnaire; 1:1 Смотреть Visionnaire; 1:1 Molteni&C; 1:1 Смотреть Molteni&C |
| brand-visionnaire | 390 | портит вид | Тап <44×44 (29) | #root > div.page.page--overlay > a.skip-link 186×41; div.page.page--overlay > header.header.header--overlay > div.header__top:nth-child(1) > div.header__left:nt |
| brand-visionnaire | 390 | мелочь | Текст <14px (25) | 12px Перейти к содержимому; 13px Диваны; 13px Диваны; 13px Диваны; 13px Кресла |
| brand-visionnaire | 390 | мелочь | Длинные строки >75 (2) | 108ch, 154ch |
| brand-visionnaire | 390 | портит вид | Картинки >400KB (1) | 5565KB brand-molteni.jpg |
| brand-visionnaire | 390 | портит вид | Фокус Tab слабо/не виден | #root > div.page.page--overlay > a.skip-link |
| brand-visionnaire | 390 | мелочь | Hover-only CSS (25) | .page-crumbs a:hover, .news-crumbs a:hover, .catalog-page__crumbs a:hover, .product-page__crumbs a:hover \| .auth-modal__close:hover \| .auth-modal__submit:hove |
| brand-visionnaire | 390 | блокирует | Контраст <4.5:1 (13) | 1:1 Перейти к содержимому; 1:1 ID Gallery; 1:1 ID Gallery; 1:1 Дизайнерам; 1:1 Контакты; 1:1 Все товары |
| brand-visionnaire | 768 | портит вид | Тап <44×44 (31) | #root > div.page.page--overlay > a.skip-link 186×41; div.page.page--overlay > header.header.header--overlay > div.header__top:nth-child(1) > div.header__left:nt |
| brand-visionnaire | 768 | портит вид | Фокус Tab слабо/не виден | #root > div.page.page--overlay > a.skip-link |
| brand-visionnaire | 768 | мелочь | Hover-only CSS (25) | .page-crumbs a:hover, .news-crumbs a:hover, .catalog-page__crumbs a:hover, .product-page__crumbs a:hover \| .auth-modal__close:hover \| .auth-modal__submit:hove |
| brand-visionnaire | 768 | блокирует | Контраст <4.5:1 (13) | 1:1 Перейти к содержимому; 1:1 ID Gallery; 1:1 ID Gallery; 1:1 Дизайнерам; 1:1 Контакты; 1:1 Все товары |
| brand-visionnaire | 1440 | портит вид | Тап <44×44 (30) | #root > div.page.page--overlay > a.skip-link 186×41; div.page.page--overlay > header.header.header--overlay > div.header__top:nth-child(1) > div.header__left:nt |
| brand-visionnaire | 1440 | портит вид | Фокус Tab слабо/не виден | #root > div.page.page--overlay > a.skip-link |
| brand-visionnaire | 1440 | блокирует | Контраст <4.5:1 (13) | 1:1 Перейти к содержимому; 1:1 ID Gallery; 1:1 ID Gallery; 1:1 Дизайнерам; 1:1 Контакты; 1:1 Все товары |
| brand-molteni | 390 | портит вид | Тап <44×44 (29) | #root > div.page.page--overlay > a.skip-link 186×41; div.page.page--overlay > header.header.header--overlay > div.header__top:nth-child(1) > div.header__left:nt |
| brand-molteni | 390 | мелочь | Текст <14px (25) | 12px Перейти к содержимому; 13px Диваны; 13px Диваны; 13px Диваны; 13px Кресла |
| brand-molteni | 390 | мелочь | Длинные строки >75 (2) | 90ch, 132ch |
| brand-molteni | 390 | портит вид | Картинки >400KB (2) | 5565KB brand-molteni.jpg; 3485KB brand-baxter.jpg |
| brand-molteni | 390 | портит вид | Фокус Tab слабо/не виден | #root > div.page.page--overlay > a.skip-link |
| brand-molteni | 390 | мелочь | Hover-only CSS (25) | .page-crumbs a:hover, .news-crumbs a:hover, .catalog-page__crumbs a:hover, .product-page__crumbs a:hover \| .auth-modal__close:hover \| .auth-modal__submit:hove |
| brand-molteni | 390 | блокирует | Контраст <4.5:1 (13) | 1:1 Перейти к содержимому; 1:1 ID Gallery; 1:1 ID Gallery; 1:1 Дизайнерам; 1:1 Контакты; 1:1 Все товары |
| brand-molteni | 768 | портит вид | Тап <44×44 (31) | #root > div.page.page--overlay > a.skip-link 186×41; div.page.page--overlay > header.header.header--overlay > div.header__top:nth-child(1) > div.header__left:nt |
| brand-molteni | 768 | портит вид | Фокус Tab слабо/не виден | #root > div.page.page--overlay > a.skip-link |
| brand-molteni | 768 | мелочь | Hover-only CSS (25) | .page-crumbs a:hover, .news-crumbs a:hover, .catalog-page__crumbs a:hover, .product-page__crumbs a:hover \| .auth-modal__close:hover \| .auth-modal__submit:hove |
| brand-molteni | 768 | блокирует | Контраст <4.5:1 (13) | 1:1 Перейти к содержимому; 1:1 ID Gallery; 1:1 ID Gallery; 1:1 Дизайнерам; 1:1 Контакты; 1:1 Все товары |
| brand-molteni | 1440 | портит вид | Тап <44×44 (30) | #root > div.page.page--overlay > a.skip-link 186×41; div.page.page--overlay > header.header.header--overlay > div.header__top:nth-child(1) > div.header__left:nt |
| brand-molteni | 1440 | портит вид | Фокус Tab слабо/не виден | #root > div.page.page--overlay > a.skip-link |
| brand-molteni | 1440 | блокирует | Контраст <4.5:1 (13) | 1:1 Перейти к содержимому; 1:1 ID Gallery; 1:1 ID Gallery; 1:1 Дизайнерам; 1:1 Контакты; 1:1 Все товары |
| brand-baxter | 390 | портит вид | Тап <44×44 (29) | #root > div.page.page--overlay > a.skip-link 186×41; div.page.page--overlay > header.header.header--overlay > div.header__top:nth-child(1) > div.header__left:nt |
| brand-baxter | 390 | мелочь | Текст <14px (25) | 12px Перейти к содержимому; 13px Диваны; 13px Диваны; 13px Диваны; 13px Кресла |
| brand-baxter | 390 | мелочь | Длинные строки >75 (2) | 77ch, 101ch |
| brand-baxter | 390 | портит вид | Картинки >400KB (1) | 3485KB brand-baxter.jpg |
| brand-baxter | 390 | портит вид | Фокус Tab слабо/не виден | #root > div.page.page--overlay > a.skip-link |
| brand-baxter | 390 | мелочь | Hover-only CSS (25) | .page-crumbs a:hover, .news-crumbs a:hover, .catalog-page__crumbs a:hover, .product-page__crumbs a:hover \| .auth-modal__close:hover \| .auth-modal__submit:hove |
| brand-baxter | 390 | блокирует | Контраст <4.5:1 (13) | 1:1 Перейти к содержимому; 1:1 ID Gallery; 1:1 ID Gallery; 1:1 Дизайнерам; 1:1 Контакты; 1:1 Все товары |
| brand-baxter | 768 | портит вид | Тап <44×44 (31) | #root > div.page.page--overlay > a.skip-link 186×41; div.page.page--overlay > header.header.header--overlay > div.header__top:nth-child(1) > div.header__left:nt |
| brand-baxter | 768 | портит вид | Фокус Tab слабо/не виден | #root > div.page.page--overlay > a.skip-link |
| brand-baxter | 768 | мелочь | Hover-only CSS (25) | .page-crumbs a:hover, .news-crumbs a:hover, .catalog-page__crumbs a:hover, .product-page__crumbs a:hover \| .auth-modal__close:hover \| .auth-modal__submit:hove |
| brand-baxter | 768 | блокирует | Контраст <4.5:1 (13) | 1:1 Перейти к содержимому; 1:1 ID Gallery; 1:1 ID Gallery; 1:1 Дизайнерам; 1:1 Контакты; 1:1 Все товары |
| brand-baxter | 1440 | портит вид | Тап <44×44 (30) | #root > div.page.page--overlay > a.skip-link 186×41; div.page.page--overlay > header.header.header--overlay > div.header__top:nth-child(1) > div.header__left:nt |
| brand-baxter | 1440 | портит вид | Фокус Tab слабо/не виден | #root > div.page.page--overlay > a.skip-link |
| brand-baxter | 1440 | блокирует | Контраст <4.5:1 (13) | 1:1 Перейти к содержимому; 1:1 ID Gallery; 1:1 ID Gallery; 1:1 Дизайнерам; 1:1 Контакты; 1:1 Все товары |
| brand-bonaldo | 390 | портит вид | Тап <44×44 (29) | #root > div.page.page--overlay > a.skip-link 186×41; div.page.page--overlay > header.header.header--overlay > div.header__top:nth-child(1) > div.header__left:nt |
| brand-bonaldo | 390 | мелочь | Текст <14px (25) | 12px Перейти к содержимому; 13px Диваны; 13px Диваны; 13px Диваны; 13px Кресла |
| brand-bonaldo | 390 | мелочь | Длинные строки >75 (3) | 83ch, 111ch, 78ch |
| brand-bonaldo | 390 | портит вид | Картинки >400KB (1) | 2760KB Gemini_Generated_Image_bts5zcbts5zcbts5.jpg |
| brand-bonaldo | 390 | портит вид | Фокус Tab слабо/не виден | #root > div.page.page--overlay > a.skip-link |
| brand-bonaldo | 390 | мелочь | Hover-only CSS (25) | .page-crumbs a:hover, .news-crumbs a:hover, .catalog-page__crumbs a:hover, .product-page__crumbs a:hover \| .auth-modal__close:hover \| .auth-modal__submit:hove |
| brand-bonaldo | 390 | блокирует | Контраст <4.5:1 (13) | 1:1 Перейти к содержимому; 1:1 ID Gallery; 1:1 ID Gallery; 1:1 Дизайнерам; 1:1 Контакты; 1:1 Все товары |
| brand-bonaldo | 768 | портит вид | Тап <44×44 (31) | #root > div.page.page--overlay > a.skip-link 186×41; div.page.page--overlay > header.header.header--overlay > div.header__top:nth-child(1) > div.header__left:nt |
| brand-bonaldo | 768 | портит вид | Фокус Tab слабо/не виден | #root > div.page.page--overlay > a.skip-link |
| brand-bonaldo | 768 | мелочь | Hover-only CSS (25) | .page-crumbs a:hover, .news-crumbs a:hover, .catalog-page__crumbs a:hover, .product-page__crumbs a:hover \| .auth-modal__close:hover \| .auth-modal__submit:hove |
| brand-bonaldo | 768 | блокирует | Контраст <4.5:1 (13) | 1:1 Перейти к содержимому; 1:1 ID Gallery; 1:1 ID Gallery; 1:1 Дизайнерам; 1:1 Контакты; 1:1 Все товары |
| brand-bonaldo | 1440 | портит вид | Тап <44×44 (30) | #root > div.page.page--overlay > a.skip-link 186×41; div.page.page--overlay > header.header.header--overlay > div.header__top:nth-child(1) > div.header__left:nt |
| brand-bonaldo | 1440 | портит вид | Фокус Tab слабо/не виден | #root > div.page.page--overlay > a.skip-link |
| brand-bonaldo | 1440 | блокирует | Контраст <4.5:1 (13) | 1:1 Перейти к содержимому; 1:1 ID Gallery; 1:1 ID Gallery; 1:1 Дизайнерам; 1:1 Контакты; 1:1 Все товары |
| product-sofa | 390 | портит вид | Тап <44×44 (40) | #root > div.page.page--solid > a.skip-link 186×41; div.page.page--solid > header.header.header--solid > div.header__top:nth-child(1) > div.header__left:nth-chil |
| product-sofa | 390 | мелочь | Текст <14px (25) | 12px Перейти к содержимому; 11px Главная; 11px Каталог; 11px Диваны; 11px Модель 01 |
| product-sofa | 390 | мелочь | Длинные строки >75 (1) | 83ch |
| product-sofa | 390 | портит вид | Картинки >400KB (4) | 2894KB Gemini_Generated_Image_ty7owqty7owqty7o.jpg; 3119KB Gemini_Generated_Image_9wrdx89wrdx89wrd.jpg; 2760KB Gemini_Generated_Image_bts5zcbts5zcbts5.jpg; 3192 |
| product-sofa | 390 | портит вид | Фокус Tab слабо/не виден | #root > div.page.page--solid > a.skip-link |
| product-sofa | 390 | мелочь | Hover-only CSS (25) | .page-crumbs a:hover, .news-crumbs a:hover, .catalog-page__crumbs a:hover, .product-page__crumbs a:hover \| .auth-modal__close:hover \| .auth-modal__submit:hove |
| product-sofa | 390 | блокирует | Контраст <4.5:1 (1) | 1:1 Перейти к содержимому |
| product-sofa | 768 | портит вид | Тап <44×44 (40) | #root > div.page.page--solid > a.skip-link 186×41; div.page.page--solid > header.header.header--solid > div.header__top:nth-child(1) > div.header__left:nth-chil |
| product-sofa | 768 | портит вид | Фокус Tab слабо/не виден | #root > div.page.page--solid > a.skip-link |
| product-sofa | 768 | мелочь | Hover-only CSS (25) | .page-crumbs a:hover, .news-crumbs a:hover, .catalog-page__crumbs a:hover, .product-page__crumbs a:hover \| .auth-modal__close:hover \| .auth-modal__submit:hove |
| product-sofa | 768 | блокирует | Контраст <4.5:1 (1) | 1:1 Перейти к содержимому |
| product-sofa | 1440 | портит вид | Тап <44×44 (40) | #root > div.page.page--solid > a.skip-link 186×41; div.page.page--solid > header.header.header--solid > div.header__top:nth-child(1) > div.header__left:nth-chil |
| product-sofa | 1440 | портит вид | Фокус Tab слабо/не виден | #root > div.page.page--solid > a.skip-link |
| product-sofa | 1440 | блокирует | Контраст <4.5:1 (1) | 1:1 Перейти к содержимому |
| product-sofa-preview | 390 | портит вид | Тап <44×44 (40) | #root > div.page.page--solid > a.skip-link 186×41; div.page.page--solid > header.header.header--solid > div.header__top:nth-child(1) > div.header__left:nth-chil |
| product-sofa-preview | 390 | мелочь | Текст <14px (25) | 12px Перейти к содержимому; 11px Главная; 11px Каталог; 11px Диваны; 11px Модель 01 |
| product-sofa-preview | 390 | мелочь | Длинные строки >75 (1) | 76ch |
| product-sofa-preview | 390 | портит вид | Картинки >400KB (4) | 2894KB Gemini_Generated_Image_ty7owqty7owqty7o.jpg; 3119KB Gemini_Generated_Image_9wrdx89wrdx89wrd.jpg; 2760KB Gemini_Generated_Image_bts5zcbts5zcbts5.jpg; 3192 |
| product-sofa-preview | 390 | портит вид | Фокус Tab слабо/не виден | #root > div.page.page--solid > a.skip-link |
| product-sofa-preview | 390 | мелочь | Hover-only CSS (25) | .page-crumbs a:hover, .news-crumbs a:hover, .catalog-page__crumbs a:hover, .product-page__crumbs a:hover \| .auth-modal__close:hover \| .auth-modal__submit:hove |
| product-sofa-preview | 390 | блокирует | Контраст <4.5:1 (1) | 1:1 Перейти к содержимому |
| product-sofa-preview | 768 | портит вид | Тап <44×44 (40) | #root > div.page.page--solid > a.skip-link 186×41; div.page.page--solid > header.header.header--solid > div.header__top:nth-child(1) > div.header__left:nth-chil |
| product-sofa-preview | 768 | портит вид | Фокус Tab слабо/не виден | #root > div.page.page--solid > a.skip-link |
| product-sofa-preview | 768 | мелочь | Hover-only CSS (25) | .page-crumbs a:hover, .news-crumbs a:hover, .catalog-page__crumbs a:hover, .product-page__crumbs a:hover \| .auth-modal__close:hover \| .auth-modal__submit:hove |
| product-sofa-preview | 768 | блокирует | Контраст <4.5:1 (1) | 1:1 Перейти к содержимому |
| product-sofa-preview | 1440 | портит вид | Тап <44×44 (40) | #root > div.page.page--solid > a.skip-link 186×41; div.page.page--solid > header.header.header--solid > div.header__top:nth-child(1) > div.header__left:nth-chil |
| product-sofa-preview | 1440 | портит вид | Фокус Tab слабо/не виден | #root > div.page.page--solid > a.skip-link |
| product-sofa-preview | 1440 | блокирует | Контраст <4.5:1 (1) | 1:1 Перейти к содержимому |
| interiors | 390 | портит вид | Тап <44×44 (30) | #root > div.page.page--overlay > a.skip-link 186×41; div.page.page--overlay > header.header.header--overlay > div.header__top:nth-child(1) > div.header__left:nt |
| interiors | 390 | мелочь | Текст <14px (25) | 12px Перейти к содержимому; 13px Диваны; 13px Диваны; 13px Диваны; 13px Кресла |
| interiors | 390 | мелочь | Длинные строки >75 (1) | 92ch |
| interiors | 390 | портит вид | Картинки >400KB (4) | 3323KB Gemini_Generated_Image_sq76gsq76gsq76gs.jpg; 3119KB Gemini_Generated_Image_9wrdx89wrdx89wrd.jpg; 2760KB Gemini_Generated_Image_bts5zcbts5zcbts5.jpg; 2894 |
| interiors | 390 | портит вид | Фокус Tab слабо/не виден | #root > div.page.page--overlay > a.skip-link |
| interiors | 390 | мелочь | Hover-only CSS (25) | .page-crumbs a:hover, .news-crumbs a:hover, .catalog-page__crumbs a:hover, .product-page__crumbs a:hover \| .auth-modal__close:hover \| .auth-modal__submit:hove |
| interiors | 390 | блокирует | Контраст <4.5:1 (12) | 1:1 Перейти к содержимому; 1:1 ID Gallery; 1:1 ID Gallery; 1:1 Дизайнерам; 1:1 Контакты; 1:1 Все товары |
| interiors | 768 | портит вид | Тап <44×44 (32) | #root > div.page.page--overlay > a.skip-link 186×41; div.page.page--overlay > header.header.header--overlay > div.header__top:nth-child(1) > div.header__left:nt |
| interiors | 768 | портит вид | Фокус Tab слабо/не виден | #root > div.page.page--overlay > a.skip-link |
| interiors | 768 | мелочь | Hover-only CSS (25) | .page-crumbs a:hover, .news-crumbs a:hover, .catalog-page__crumbs a:hover, .product-page__crumbs a:hover \| .auth-modal__close:hover \| .auth-modal__submit:hove |
| interiors | 768 | блокирует | Контраст <4.5:1 (12) | 1:1 Перейти к содержимому; 1:1 ID Gallery; 1:1 ID Gallery; 1:1 Дизайнерам; 1:1 Контакты; 1:1 Все товары |
| interiors | 1440 | портит вид | Тап <44×44 (31) | #root > div.page.page--overlay > a.skip-link 186×41; div.page.page--overlay > header.header.header--overlay > div.header__top:nth-child(1) > div.header__left:nt |
| interiors | 1440 | портит вид | Фокус Tab слабо/не виден | #root > div.page.page--overlay > a.skip-link |
| interiors | 1440 | блокирует | Контраст <4.5:1 (12) | 1:1 Перейти к содержимому; 1:1 ID Gallery; 1:1 ID Gallery; 1:1 Дизайнерам; 1:1 Контакты; 1:1 Все товары |
| interior-gostinaya | 390 | портит вид | Тап <44×44 (40) | #root > div.page.page--overlay > a.skip-link 186×41; div.page.page--overlay > header.header.header--overlay > div.header__top:nth-child(1) > div.header__left:nt |
| interior-gostinaya | 390 | мелочь | Текст <14px (25) | 12px Перейти к содержимому; 12px Диваны; 12px Visionnaire; 12px Диваны; 12px Baxter |
| interior-gostinaya | 390 | портит вид | Картинки >400KB (3) | 3119KB Gemini_Generated_Image_9wrdx89wrdx89wrd.jpg; 2894KB Gemini_Generated_Image_ty7owqty7owqty7o.jpg; 2760KB Gemini_Generated_Image_bts5zcbts5zcbts5.jpg |
| interior-gostinaya | 390 | портит вид | Фокус Tab слабо/не виден | #root > div.page.page--overlay > a.skip-link |
| interior-gostinaya | 390 | мелочь | Hover-only CSS (25) | .page-crumbs a:hover, .news-crumbs a:hover, .catalog-page__crumbs a:hover, .product-page__crumbs a:hover \| .auth-modal__close:hover \| .auth-modal__submit:hove |
| interior-gostinaya | 390 | блокирует | Контраст <4.5:1 (12) | 1:1 Перейти к содержимому; 1:1 ID Gallery; 1:1 ID Gallery; 1:1 Дизайнерам; 1:1 Контакты; 1:1 Все товары |
| interior-gostinaya | 768 | портит вид | Тап <44×44 (40) | #root > div.page.page--overlay > a.skip-link 186×41; div.page.page--overlay > header.header.header--overlay > div.header__top:nth-child(1) > div.header__left:nt |
| interior-gostinaya | 768 | портит вид | Фокус Tab слабо/не виден | #root > div.page.page--overlay > a.skip-link |
| interior-gostinaya | 768 | мелочь | Hover-only CSS (25) | .page-crumbs a:hover, .news-crumbs a:hover, .catalog-page__crumbs a:hover, .product-page__crumbs a:hover \| .auth-modal__close:hover \| .auth-modal__submit:hove |
| interior-gostinaya | 768 | блокирует | Контраст <4.5:1 (12) | 1:1 Перейти к содержимому; 1:1 ID Gallery; 1:1 ID Gallery; 1:1 Дизайнерам; 1:1 Контакты; 1:1 Все товары |
| interior-gostinaya | 1440 | портит вид | Тап <44×44 (40) | #root > div.page.page--overlay > a.skip-link 186×41; div.page.page--overlay > header.header.header--overlay > div.header__top:nth-child(1) > div.header__left:nt |
| interior-gostinaya | 1440 | портит вид | Фокус Tab слабо/не виден | #root > div.page.page--overlay > a.skip-link |
| interior-gostinaya | 1440 | блокирует | Контраст <4.5:1 (12) | 1:1 Перейти к содержимому; 1:1 ID Gallery; 1:1 ID Gallery; 1:1 Дизайнерам; 1:1 Контакты; 1:1 Все товары |
| showrooms | 390 | портит вид | Тап <44×44 (30) | #root > div.page.page--overlay > a.skip-link 186×41; div.page.page--overlay > header.header.header--overlay > div.header__top:nth-child(1) > div.header__left:nt |
| showrooms | 390 | мелочь | Текст <14px (25) | 12px Перейти к содержимому; 13px Диваны; 13px Диваны; 13px Диваны; 13px Кресла |
| showrooms | 390 | мелочь | Длинные строки >75 (2) | 133ch, 98ch |
| showrooms | 390 | портит вид | Картинки >400KB (4) | 3323KB Gemini_Generated_Image_sq76gsq76gsq76gs.jpg; 2760KB Gemini_Generated_Image_bts5zcbts5zcbts5.jpg; 3119KB Gemini_Generated_Image_9wrdx89wrdx89wrd.jpg; 5565 |
| showrooms | 390 | портит вид | Фокус Tab слабо/не виден | #root > div.page.page--overlay > a.skip-link |
| showrooms | 390 | мелочь | Hover-only CSS (25) | .page-crumbs a:hover, .news-crumbs a:hover, .catalog-page__crumbs a:hover, .product-page__crumbs a:hover \| .auth-modal__close:hover \| .auth-modal__submit:hove |
| showrooms | 390 | блокирует | Контраст <4.5:1 (15) | 1:1 Перейти к содержимому; 1:1 ID Gallery; 1:1 ID Gallery; 1:1 Дизайнерам; 1:1 Контакты; 1:1 Все товары |
| showrooms | 768 | портит вид | Тап <44×44 (32) | #root > div.page.page--overlay > a.skip-link 186×41; div.page.page--overlay > header.header.header--overlay > div.header__top:nth-child(1) > div.header__left:nt |
| showrooms | 768 | портит вид | Фокус Tab слабо/не виден | #root > div.page.page--overlay > a.skip-link |
| showrooms | 768 | мелочь | Hover-only CSS (25) | .page-crumbs a:hover, .news-crumbs a:hover, .catalog-page__crumbs a:hover, .product-page__crumbs a:hover \| .auth-modal__close:hover \| .auth-modal__submit:hove |
| showrooms | 768 | блокирует | Контраст <4.5:1 (15) | 1:1 Перейти к содержимому; 1:1 ID Gallery; 1:1 ID Gallery; 1:1 Дизайнерам; 1:1 Контакты; 1:1 Все товары |
| showrooms | 1440 | портит вид | Тап <44×44 (31) | #root > div.page.page--overlay > a.skip-link 186×41; div.page.page--overlay > header.header.header--overlay > div.header__top:nth-child(1) > div.header__left:nt |
| showrooms | 1440 | портит вид | Фокус Tab слабо/не виден | #root > div.page.page--overlay > a.skip-link |
| showrooms | 1440 | блокирует | Контраст <4.5:1 (15) | 1:1 Перейти к содержимому; 1:1 ID Gallery; 1:1 ID Gallery; 1:1 Дизайнерам; 1:1 Контакты; 1:1 Все товары |
| trade | 390 | портит вид | Тап <44×44 (30) | #root > div.page.page--overlay > a.skip-link 186×41; div.page.page--overlay > header.header.header--overlay > div.header__top:nth-child(1) > div.header__left:nt |
| trade | 390 | мелочь | Текст <14px (25) | 12px Перейти к содержимому; 13px Диваны; 13px Диваны; 13px Диваны; 13px Кресла |
| trade | 390 | мелочь | Длинные строки >75 (3) | 105ch, 91ch, 80ch |
| trade | 390 | портит вид | Картинки >400KB (4) | 3485KB brand-baxter.jpg; 3192KB Gemini_Generated_Image_9eqvhh9eqvhh9eqv.jpg; 2894KB Gemini_Generated_Image_ty7owqty7owqty7o.jpg; 5565KB brand-molteni.jpg |
| trade | 390 | портит вид | Фокус Tab слабо/не виден | #root > div.page.page--overlay > a.skip-link |
| trade | 390 | мелочь | Hover-only CSS (25) | .page-crumbs a:hover, .news-crumbs a:hover, .catalog-page__crumbs a:hover, .product-page__crumbs a:hover \| .auth-modal__close:hover \| .auth-modal__submit:hove |
| trade | 390 | блокирует | Контраст <4.5:1 (15) | 1:1 Перейти к содержимому; 1:1 ID Gallery; 1:1 ID Gallery; 1:1 Дизайнерам; 1:1 Контакты; 1:1 Все товары |
| trade | 768 | портит вид | Тап <44×44 (32) | #root > div.page.page--overlay > a.skip-link 186×41; div.page.page--overlay > header.header.header--overlay > div.header__top:nth-child(1) > div.header__left:nt |
| trade | 768 | портит вид | Фокус Tab слабо/не виден | #root > div.page.page--overlay > a.skip-link |
| trade | 768 | мелочь | Hover-only CSS (25) | .page-crumbs a:hover, .news-crumbs a:hover, .catalog-page__crumbs a:hover, .product-page__crumbs a:hover \| .auth-modal__close:hover \| .auth-modal__submit:hove |
| trade | 768 | блокирует | Контраст <4.5:1 (15) | 1:1 Перейти к содержимому; 1:1 ID Gallery; 1:1 ID Gallery; 1:1 Дизайнерам; 1:1 Контакты; 1:1 Все товары |
| trade | 1440 | портит вид | Тап <44×44 (31) | #root > div.page.page--overlay > a.skip-link 186×41; div.page.page--overlay > header.header.header--overlay > div.header__top:nth-child(1) > div.header__left:nt |
| trade | 1440 | портит вид | Фокус Tab слабо/не виден | #root > div.page.page--overlay > a.skip-link |
| trade | 1440 | блокирует | Контраст <4.5:1 (15) | 1:1 Перейти к содержимому; 1:1 ID Gallery; 1:1 ID Gallery; 1:1 Дизайнерам; 1:1 Контакты; 1:1 Все товары |
| about | 390 | портит вид | Тап <44×44 (29) | #root > div.page.page--overlay > a.skip-link 186×41; div.page.page--overlay > header.header.header--overlay > div.header__top:nth-child(1) > div.header__left:nt |
| about | 390 | мелочь | Текст <14px (25) | 12px Перейти к содержимому; 13px Диваны; 13px Диваны; 13px Диваны; 13px Кресла |
| about | 390 | мелочь | Длинные строки >75 (2) | 111ch, 125ch |
| about | 390 | портит вид | Картинки >400KB (2) | 3485KB brand-baxter.jpg; 3119KB Gemini_Generated_Image_9wrdx89wrdx89wrd.jpg |
| about | 390 | портит вид | Фокус Tab слабо/не виден | #root > div.page.page--overlay > a.skip-link |
| about | 390 | мелочь | Hover-only CSS (25) | .page-crumbs a:hover, .news-crumbs a:hover, .catalog-page__crumbs a:hover, .product-page__crumbs a:hover \| .auth-modal__close:hover \| .auth-modal__submit:hove |
| about | 390 | блокирует | Контраст <4.5:1 (12) | 1:1 Перейти к содержимому; 1:1 ID Gallery; 1:1 ID Gallery; 1:1 Дизайнерам; 1:1 Контакты; 1:1 Все товары |
| about | 768 | портит вид | Тап <44×44 (31) | #root > div.page.page--overlay > a.skip-link 186×41; div.page.page--overlay > header.header.header--overlay > div.header__top:nth-child(1) > div.header__left:nt |
| about | 768 | портит вид | Фокус Tab слабо/не виден | #root > div.page.page--overlay > a.skip-link |
| about | 768 | мелочь | Hover-only CSS (25) | .page-crumbs a:hover, .news-crumbs a:hover, .catalog-page__crumbs a:hover, .product-page__crumbs a:hover \| .auth-modal__close:hover \| .auth-modal__submit:hove |
| about | 768 | блокирует | Контраст <4.5:1 (12) | 1:1 Перейти к содержимому; 1:1 ID Gallery; 1:1 ID Gallery; 1:1 Дизайнерам; 1:1 Контакты; 1:1 Все товары |
| about | 1440 | портит вид | Тап <44×44 (30) | #root > div.page.page--overlay > a.skip-link 186×41; div.page.page--overlay > header.header.header--overlay > div.header__top:nth-child(1) > div.header__left:nt |
| about | 1440 | портит вид | Фокус Tab слабо/не виден | #root > div.page.page--overlay > a.skip-link |
| about | 1440 | блокирует | Контраст <4.5:1 (12) | 1:1 Перейти к содержимому; 1:1 ID Gallery; 1:1 ID Gallery; 1:1 Дизайнерам; 1:1 Контакты; 1:1 Все товары |
| contact | 390 | портит вид | Тап <44×44 (31) | #root > div.page.page--overlay > a.skip-link 186×41; div.page.page--overlay > header.header.header--overlay > div.header__top:nth-child(1) > div.header__left:nt |
| contact | 390 | мелочь | Текст <14px (25) | 12px Перейти к содержимому; 13px Диваны; 13px Диваны; 13px Диваны; 13px Кресла |
| contact | 390 | мелочь | Длинные строки >75 (1) | 87ch |
| contact | 390 | портит вид | Картинки >400KB (2) | 5565KB brand-molteni.jpg; 3485KB brand-baxter.jpg |
| contact | 390 | портит вид | Фокус Tab слабо/не виден | #root > div.page.page--overlay > a.skip-link |
| contact | 390 | мелочь | Hover-only CSS (25) | .page-crumbs a:hover, .news-crumbs a:hover, .catalog-page__crumbs a:hover, .product-page__crumbs a:hover \| .auth-modal__close:hover \| .auth-modal__submit:hove |
| contact | 390 | блокирует | Контраст <4.5:1 (12) | 1:1 Перейти к содержимому; 1:1 ID Gallery; 1:1 ID Gallery; 1:1 Дизайнерам; 1:1 Контакты; 1:1 Все товары |
| contact | 768 | портит вид | Тап <44×44 (33) | #root > div.page.page--overlay > a.skip-link 186×41; div.page.page--overlay > header.header.header--overlay > div.header__top:nth-child(1) > div.header__left:nt |
| contact | 768 | портит вид | Фокус Tab слабо/не виден | #root > div.page.page--overlay > a.skip-link |
| contact | 768 | мелочь | Hover-only CSS (25) | .page-crumbs a:hover, .news-crumbs a:hover, .catalog-page__crumbs a:hover, .product-page__crumbs a:hover \| .auth-modal__close:hover \| .auth-modal__submit:hove |
| contact | 768 | блокирует | Контраст <4.5:1 (12) | 1:1 Перейти к содержимому; 1:1 ID Gallery; 1:1 ID Gallery; 1:1 Дизайнерам; 1:1 Контакты; 1:1 Все товары |
| contact | 1440 | портит вид | Тап <44×44 (32) | #root > div.page.page--overlay > a.skip-link 186×41; div.page.page--overlay > header.header.header--overlay > div.header__top:nth-child(1) > div.header__left:nt |
| contact | 1440 | портит вид | Фокус Tab слабо/не виден | #root > div.page.page--overlay > a.skip-link |
| contact | 1440 | блокирует | Контраст <4.5:1 (12) | 1:1 Перейти к содержимому; 1:1 ID Gallery; 1:1 ID Gallery; 1:1 Дизайнерам; 1:1 Контакты; 1:1 Все товары |
| menu-open | 390 | портит вид | Тап <44×44 (40) | #root > div.page > a.skip-link 186×41; div.page > header.header.header--overlay > div.header__top:nth-child(1) > div.header__left:nth-child(1) > button.header__ |
| menu-open | 390 | мелочь | Текст <14px (25) | 12px Перейти к содержимому; 13px Диваны; 13px Диваны; 13px Диваны; 13px Кресла |
| menu-open | 390 | мелочь | Длинные строки >75 (3) | 76ch, 116ch, 81ch |
| menu-open | 390 | портит вид | Картинки >400KB (7) | 3323KB Gemini_Generated_Image_sq76gsq76gsq76gs.jpg; 2894KB Gemini_Generated_Image_ty7owqty7owqty7o.jpg; 3308KB interior-01.png; 657KB interior-03.png; 3119KB Ge |
| menu-open | 390 | портит вид | Крупный fixed перекрывает экран | #root > div.page > button.menu-backdrop.is-open:nth-child(4) 100% высоты (844px) |
| menu-open | 390 | портит вид | Крупный fixed перекрывает экран | #root > div.page > div.menu-clip.is-open:nth-child(5) 100% высоты (844px) |
| menu-open | 390 | портит вид | Фокус Tab слабо/не виден | #root > div.page > a.skip-link |
| menu-open | 390 | мелочь | Hover-only CSS (25) | .page-crumbs a:hover, .news-crumbs a:hover, .catalog-page__crumbs a:hover, .product-page__crumbs a:hover \| .auth-modal__close:hover \| .auth-modal__submit:hove |
| menu-open | 390 | блокирует | Контраст <4.5:1 (30) | 1:1 Перейти к содержимому; 1:1 ID Gallery; 1:1 ID Gallery; 1:1 Дизайнерам; 1:1 Контакты; 1:1 Все товары |
| menu-open | 768 | портит вид | Тап <44×44 (40) | #root > div.page > a.skip-link 186×41; div.page > header.header.header--overlay > div.header__top:nth-child(1) > div.header__left:nth-child(1) > button.header__ |
| menu-open | 768 | портит вид | Крупный fixed перекрывает экран | #root > div.page > button.menu-backdrop.is-open:nth-child(4) 100% высоты (1024px) |
| menu-open | 768 | портит вид | Крупный fixed перекрывает экран | #root > div.page > div.menu-clip.is-open:nth-child(5) 100% высоты (1024px) |
| menu-open | 768 | портит вид | Фокус Tab слабо/не виден | #root > div.page > a.skip-link |
| menu-open | 768 | мелочь | Hover-only CSS (25) | .page-crumbs a:hover, .news-crumbs a:hover, .catalog-page__crumbs a:hover, .product-page__crumbs a:hover \| .auth-modal__close:hover \| .auth-modal__submit:hove |
| menu-open | 768 | блокирует | Контраст <4.5:1 (30) | 1:1 Перейти к содержимому; 1:1 ID Gallery; 1:1 ID Gallery; 1:1 Дизайнерам; 1:1 Контакты; 1:1 Все товары |
| menu-open | 1440 | портит вид | Тап <44×44 (40) | #root > div.page > a.skip-link 186×41; div.page > header.header.header--overlay > div.header__top:nth-child(1) > div.header__left:nth-child(1) > button.header__ |
| menu-open | 1440 | портит вид | Крупный fixed перекрывает экран | #root > div.page > button.menu-backdrop.is-open:nth-child(4) 87.7% высоты (789px) |
| menu-open | 1440 | портит вид | Крупный fixed перекрывает экран | #root > div.page > div.menu-clip.is-open:nth-child(5) 87.7% высоты (789px) |
| menu-open | 1440 | портит вид | Фокус Tab слабо/не виден | #root > div.page > a.skip-link |
| menu-open | 1440 | блокирует | Контраст <4.5:1 (30) | 1:1 Перейти к содержимому; 1:1 ID Gallery; 1:1 ID Gallery; 1:1 Дизайнерам; 1:1 Контакты; 1:1 Все товары |
| catalog-filters | 390 | портит вид | Тап <44×44 (40) | #root > div.page.page--solid > a.skip-link 186×41; div.page.page--solid > header.header.header--solid > div.header__top:nth-child(1) > div.header__left:nth-chil |
| catalog-filters | 390 | мелочь | Текст <14px (25) | 12px Перейти к содержимому; 11px Главная; 11px Каталог; 12px Диваны; 12px Visionnaire |
| catalog-filters | 390 | портит вид | Картинки >400KB (4) | 2894KB Gemini_Generated_Image_ty7owqty7owqty7o.jpg; 3119KB Gemini_Generated_Image_9wrdx89wrdx89wrd.jpg; 3192KB Gemini_Generated_Image_9eqvhh9eqvhh9eqv.jpg; 2760 |
| catalog-filters | 390 | портит вид | Крупный fixed перекрывает экран | #main > button.catalog-drawer__backdrop.is-open:nth-child(3) 100% высоты (844px) |
| catalog-filters | 390 | портит вид | Крупный fixed перекрывает экран | #catalog-filters 100% высоты (844px) |
| catalog-filters | 390 | портит вид | Фокус Tab слабо/не виден | #root > div.page.page--solid > a.skip-link |
| catalog-filters | 390 | мелочь | Hover-only CSS (25) | .page-crumbs a:hover, .news-crumbs a:hover, .catalog-page__crumbs a:hover, .product-page__crumbs a:hover \| .auth-modal__close:hover \| .auth-modal__submit:hove |
| catalog-filters | 390 | блокирует | Контраст <4.5:1 (1) | 1:1 Перейти к содержимому |
| catalog-filters | 768 | портит вид | Тап <44×44 (40) | #root > div.page.page--solid > a.skip-link 186×41; div.page.page--solid > header.header.header--solid > div.header__top:nth-child(1) > div.header__left:nth-chil |
| catalog-filters | 768 | портит вид | Крупный fixed перекрывает экран | #main > button.catalog-drawer__backdrop.is-open:nth-child(3) 100% высоты (1024px) |
| catalog-filters | 768 | портит вид | Крупный fixed перекрывает экран | #catalog-filters 100% высоты (1024px) |
| catalog-filters | 768 | портит вид | Фокус Tab слабо/не виден | #root > div.page.page--solid > a.skip-link |
| catalog-filters | 768 | мелочь | Hover-only CSS (25) | .page-crumbs a:hover, .news-crumbs a:hover, .catalog-page__crumbs a:hover, .product-page__crumbs a:hover \| .auth-modal__close:hover \| .auth-modal__submit:hove |
| catalog-filters | 768 | блокирует | Контраст <4.5:1 (1) | 1:1 Перейти к содержимому |
| catalog-filters | 1440 | портит вид | Тап <44×44 (40) | #root > div.page.page--solid > a.skip-link 186×41; div.page.page--solid > header.header.header--solid > div.header__top:nth-child(1) > div.header__left:nth-chil |
| catalog-filters | 1440 | портит вид | Крупный fixed перекрывает экран | #main > button.catalog-drawer__backdrop.is-open:nth-child(3) 100% высоты (900px) |
| catalog-filters | 1440 | портит вид | Крупный fixed перекрывает экран | #catalog-filters 100% высоты (900px) |
| catalog-filters | 1440 | портит вид | Фокус Tab слабо/не виден | #root > div.page.page--solid > a.skip-link |
| catalog-filters | 1440 | блокирует | Контраст <4.5:1 (1) | 1:1 Перейти к содержимому |
| finishes-drawer | 390 | портит вид | Тап <44×44 (40) | #root > div.page.page--solid > a.skip-link 186×41; div.page.page--solid > header.header.header--solid > div.header__top:nth-child(1) > div.header__left:nth-chil |
| finishes-drawer | 390 | мелочь | Текст <14px (25) | 12px Перейти к содержимому; 11px Главная; 11px Каталог; 11px Диваны; 11px Модель 01 |
| finishes-drawer | 390 | мелочь | Длинные строки >75 (1) | 83ch |
| finishes-drawer | 390 | портит вид | Картинки >400KB (4) | 2894KB Gemini_Generated_Image_ty7owqty7owqty7o.jpg; 3119KB Gemini_Generated_Image_9wrdx89wrdx89wrd.jpg; 2760KB Gemini_Generated_Image_bts5zcbts5zcbts5.jpg; 3192 |
| finishes-drawer | 390 | портит вид | Крупный fixed перекрывает экран | #main > button.finishes-drawer__backdrop.is-open 100% высоты (844px) |
| finishes-drawer | 390 | портит вид | Крупный fixed перекрывает экран | #main > aside.finishes-drawer.is-open 100% высоты (844px) |
| finishes-drawer | 390 | портит вид | Фокус Tab слабо/не виден | #root > div.page.page--solid > a.skip-link |
| finishes-drawer | 390 | мелочь | Hover-only CSS (25) | .page-crumbs a:hover, .news-crumbs a:hover, .catalog-page__crumbs a:hover, .product-page__crumbs a:hover \| .auth-modal__close:hover \| .auth-modal__submit:hove |
| finishes-drawer | 390 | блокирует | Контраст <4.5:1 (1) | 1:1 Перейти к содержимому |
| finishes-drawer | 768 | портит вид | Тап <44×44 (40) | #root > div.page.page--solid > a.skip-link 186×41; div.page.page--solid > header.header.header--solid > div.header__top:nth-child(1) > div.header__left:nth-chil |
| finishes-drawer | 768 | портит вид | Крупный fixed перекрывает экран | #main > button.finishes-drawer__backdrop.is-open 100% высоты (1024px) |
| finishes-drawer | 768 | портит вид | Крупный fixed перекрывает экран | #main > aside.finishes-drawer.is-open 100% высоты (1024px) |
| finishes-drawer | 768 | портит вид | Фокус Tab слабо/не виден | #root > div.page.page--solid > a.skip-link |
| finishes-drawer | 768 | мелочь | Hover-only CSS (25) | .page-crumbs a:hover, .news-crumbs a:hover, .catalog-page__crumbs a:hover, .product-page__crumbs a:hover \| .auth-modal__close:hover \| .auth-modal__submit:hove |
| finishes-drawer | 768 | блокирует | Контраст <4.5:1 (1) | 1:1 Перейти к содержимому |
| finishes-drawer | 1440 | портит вид | Тап <44×44 (40) | #root > div.page.page--solid > a.skip-link 186×41; div.page.page--solid > header.header.header--solid > div.header__top:nth-child(1) > div.header__left:nth-chil |
| finishes-drawer | 1440 | портит вид | Крупный fixed перекрывает экран | #main > button.finishes-drawer__backdrop.is-open 100% высоты (900px) |
| finishes-drawer | 1440 | портит вид | Крупный fixed перекрывает экран | #main > aside.finishes-drawer.is-open 100% высоты (900px) |
| finishes-drawer | 1440 | портит вид | Фокус Tab слабо/не виден | #root > div.page.page--solid > a.skip-link |
| finishes-drawer | 1440 | блокирует | Контраст <4.5:1 (1) | 1:1 Перейти к содержимому |
| footer | 390 | портит вид | Тап <44×44 (18) | #root > div.page.page--overlay > a.skip-link 186×41; #root > div.page.page--overlay > header.header.header--overlay > div.header__top:nth-child(1) > a.header__l |
| footer | 390 | мелочь | Текст <14px (25) | 12px Перейти к содержимому; 13px Диваны; 13px Диваны; 13px Диваны; 13px Кресла |
| footer | 390 | мелочь | Длинные строки >75 (2) | 111ch, 125ch |
| footer | 390 | портит вид | Картинки >400KB (2) | 3485KB brand-baxter.jpg; 3119KB Gemini_Generated_Image_9wrdx89wrdx89wrd.jpg |
| footer | 390 | портит вид | Фокус Tab слабо/не виден | #root > div.page.page--overlay > a.skip-link |
| footer | 390 | мелочь | Hover-only CSS (25) | .page-crumbs a:hover, .news-crumbs a:hover, .catalog-page__crumbs a:hover, .product-page__crumbs a:hover \| .auth-modal__close:hover \| .auth-modal__submit:hove |
| footer | 390 | блокирует | Контраст <4.5:1 (3) | 1:1 Перейти к содержимому; 1:1 ID Gallery; 1:1 ID Gallery |
| footer | 768 | портит вид | Тап <44×44 (18) | #root > div.page.page--overlay > a.skip-link 186×41; #root > div.page.page--overlay > header.header.header--overlay > div.header__top:nth-child(1) > a.header__l |
| footer | 768 | портит вид | Фокус Tab слабо/не виден | #root > div.page.page--overlay > a.skip-link |
| footer | 768 | мелочь | Hover-only CSS (25) | .page-crumbs a:hover, .news-crumbs a:hover, .catalog-page__crumbs a:hover, .product-page__crumbs a:hover \| .auth-modal__close:hover \| .auth-modal__submit:hove |
| footer | 768 | блокирует | Контраст <4.5:1 (3) | 1:1 Перейти к содержимому; 1:1 ID Gallery; 1:1 ID Gallery |
| footer | 1440 | портит вид | Тап <44×44 (18) | #root > div.page.page--overlay > a.skip-link 186×41; #root > div.page.page--overlay > header.header.header--overlay > div.header__top:nth-child(1) > a.header__l |
| footer | 1440 | портит вид | Фокус Tab слабо/не виден | #root > div.page.page--overlay > a.skip-link |
| footer | 1440 | блокирует | Контраст <4.5:1 (12) | 1:1 Перейти к содержимому; 1:1 ID Gallery; 1:1 ID Gallery; 1:1 Дизайнерам; 1:1 Контакты; 1:1 Все товары |

## Сводка по экранам

| id | path | width | hScroll | smallTaps | lowContrast | heavyImg | findings | file |
|----|------|-------|---------|-----------|-------------|----------|----------|------|
| home | / | 390 | false | 40 | 30 | 7 | 7 | home-390.png |
| home | / | 768 | false | 40 | 30 | 0 | 4 | home-768.png |
| home | / | 1440 | false | 40 | 30 | 0 | 3 | home-1440.png |
| catalog | /catalog/ | 390 | false | 40 | 1 | 4 | 6 | catalog-390.png |
| catalog | /catalog/ | 768 | false | 40 | 1 | 0 | 4 | catalog-768.png |
| catalog | /catalog/ | 1440 | false | 40 | 1 | 0 | 3 | catalog-1440.png |
| catalog-divany | /catalog/divany/ | 390 | false | 40 | 1 | 2 | 6 | catalog-divany-390.png |
| catalog-divany | /catalog/divany/ | 768 | false | 40 | 1 | 0 | 4 | catalog-divany-768.png |
| catalog-divany | /catalog/divany/ | 1440 | false | 40 | 1 | 0 | 3 | catalog-divany-1440.png |
| brands | /brands/ | 390 | false | 36 | 13 | 2 | 7 | brands-390.png |
| brands | /brands/ | 768 | false | 38 | 13 | 0 | 4 | brands-768.png |
| brands | /brands/ | 1440 | false | 37 | 13 | 0 | 3 | brands-1440.png |
| brand-visionnaire | /brands/visionnaire/ | 390 | false | 29 | 13 | 1 | 7 | brand-visionnaire-390.png |
| brand-visionnaire | /brands/visionnaire/ | 768 | false | 31 | 13 | 0 | 4 | brand-visionnaire-768.png |
| brand-visionnaire | /brands/visionnaire/ | 1440 | false | 30 | 13 | 0 | 3 | brand-visionnaire-1440.png |
| brand-molteni | /brands/molteni/ | 390 | false | 29 | 13 | 2 | 7 | brand-molteni-390.png |
| brand-molteni | /brands/molteni/ | 768 | false | 31 | 13 | 0 | 4 | brand-molteni-768.png |
| brand-molteni | /brands/molteni/ | 1440 | false | 30 | 13 | 0 | 3 | brand-molteni-1440.png |
| brand-baxter | /brands/baxter/ | 390 | false | 29 | 13 | 1 | 7 | brand-baxter-390.png |
| brand-baxter | /brands/baxter/ | 768 | false | 31 | 13 | 0 | 4 | brand-baxter-768.png |
| brand-baxter | /brands/baxter/ | 1440 | false | 30 | 13 | 0 | 3 | brand-baxter-1440.png |
| brand-bonaldo | /brands/bonaldo/ | 390 | false | 29 | 13 | 1 | 7 | brand-bonaldo-390.png |
| brand-bonaldo | /brands/bonaldo/ | 768 | false | 31 | 13 | 0 | 4 | brand-bonaldo-768.png |
| brand-bonaldo | /brands/bonaldo/ | 1440 | false | 30 | 13 | 0 | 3 | brand-bonaldo-1440.png |
| product-sofa | /product/model-01-sofa/ | 390 | false | 40 | 1 | 4 | 7 | product-sofa-390.png |
| product-sofa | /product/model-01-sofa/ | 768 | false | 40 | 1 | 0 | 4 | product-sofa-768.png |
| product-sofa | /product/model-01-sofa/ | 1440 | false | 40 | 1 | 0 | 3 | product-sofa-1440.png |
| product-sofa-preview | /product/model-01-sofa/?preview=full | 390 | false | 40 | 1 | 4 | 7 | product-sofa-preview-390.png |
| product-sofa-preview | /product/model-01-sofa/?preview=full | 768 | false | 40 | 1 | 0 | 4 | product-sofa-preview-768.png |
| product-sofa-preview | /product/model-01-sofa/?preview=full | 1440 | false | 40 | 1 | 0 | 3 | product-sofa-preview-1440.png |
| interiors | /interiors/ | 390 | false | 30 | 12 | 4 | 7 | interiors-390.png |
| interiors | /interiors/ | 768 | false | 32 | 12 | 0 | 4 | interiors-768.png |
| interiors | /interiors/ | 1440 | false | 31 | 12 | 0 | 3 | interiors-1440.png |
| interior-gostinaya | /interiors/gostinaya/ | 390 | false | 40 | 12 | 3 | 6 | interior-gostinaya-390.png |
| interior-gostinaya | /interiors/gostinaya/ | 768 | false | 40 | 12 | 0 | 4 | interior-gostinaya-768.png |
| interior-gostinaya | /interiors/gostinaya/ | 1440 | false | 40 | 12 | 0 | 3 | interior-gostinaya-1440.png |
| showrooms | /showrooms/ | 390 | false | 30 | 15 | 4 | 7 | showrooms-390.png |
| showrooms | /showrooms/ | 768 | false | 32 | 15 | 0 | 4 | showrooms-768.png |
| showrooms | /showrooms/ | 1440 | false | 31 | 15 | 0 | 3 | showrooms-1440.png |
| trade | /trade/ | 390 | false | 30 | 15 | 4 | 7 | trade-390.png |
| trade | /trade/ | 768 | false | 32 | 15 | 0 | 4 | trade-768.png |
| trade | /trade/ | 1440 | false | 31 | 15 | 0 | 3 | trade-1440.png |
| about | /about/ | 390 | false | 29 | 12 | 2 | 7 | about-390.png |
| about | /about/ | 768 | false | 31 | 12 | 0 | 4 | about-768.png |
| about | /about/ | 1440 | false | 30 | 12 | 0 | 3 | about-1440.png |
| contact | /contact/ | 390 | false | 31 | 12 | 2 | 7 | contact-390.png |
| contact | /contact/ | 768 | false | 33 | 12 | 0 | 4 | contact-768.png |
| contact | /contact/ | 1440 | false | 32 | 12 | 0 | 3 | contact-1440.png |
| menu-open | / | 390 | false | 40 | 30 | 7 | 9 | menu-open-390.png |
| menu-open | / | 768 | false | 40 | 30 | 0 | 6 | menu-open-768.png |
| menu-open | / | 1440 | false | 40 | 30 | 0 | 5 | menu-open-1440.png |
| catalog-filters | /catalog/ | 390 | false | 40 | 1 | 4 | 8 | catalog-filters-390.png |
| catalog-filters | /catalog/ | 768 | false | 40 | 1 | 0 | 6 | catalog-filters-768.png |
| catalog-filters | /catalog/ | 1440 | false | 40 | 1 | 0 | 5 | catalog-filters-1440.png |
| finishes-drawer | /product/model-01-sofa/ | 390 | false | 40 | 1 | 4 | 9 | finishes-drawer-390.png |
| finishes-drawer | /product/model-01-sofa/ | 768 | false | 40 | 1 | 0 | 6 | finishes-drawer-768.png |
| finishes-drawer | /product/model-01-sofa/ | 1440 | false | 40 | 1 | 0 | 5 | finishes-drawer-1440.png |
| footer | /about/ | 390 | false | 18 | 3 | 2 | 7 | footer-390.png |
| footer | /about/ | 768 | false | 18 | 3 | 0 | 4 | footer-768.png |
| footer | /about/ | 1440 | false | 18 | 12 | 0 | 3 | footer-1440.png |

## Покрытие

Маршруты: `/`, `/catalog/`, `/catalog/divany/`, `/brands/`, 4 бренда, `/product/model-01-sofa/` (+ `?preview=full`), `/interiors/`, `/interiors/gostinaya/`, `/showrooms/`, `/trade/`, `/about/`, `/contact/`.

Спецэкраны: `menu-open`, `catalog-filters`, `finishes-drawer`, `footer` — на 390/768/1440.

## Метод

1. CDP Chrome, full-page PNG.
2. scrollWidth vs innerWidth + элементы with right > innerWidth.
3. a/button/input/swatch/… getBoundingClientRect < 44×44.
4. font-size < 14px (кроме коротких uppercase labels); строки >75 на ≤500px.
5. img natural vs render, отсутствие width/height attrs, HEAD size >400KB (на 390).
6. H1/H2: px, clip (scrollWidth>clientWidth).
7. fixed/sticky + % высоты viewport.
8. Hover-only: CSS `:hover` без `:focus`/`:focus-visible`/`:active`.
9. Focus: focus() на первом focusable, проверка outline/box-shadow.
10. Контраст: упрощённый WCAG relative luminance (не полный axe tree).
