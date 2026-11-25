# ID Gallery

React (Vite) фронтенд + Express API + PostgreSQL.

## TODO: шрифты woff2

В `public/fonts` пока лежат исходники **OTF/TTF** (LT Amber Condensed Regular/Medium, Pliant Light/Regular).  
Нужно конвертировать в **woff2**, обновить `@font-face` в `src/styles/fonts.css` и preload в `index.html`.  
До конвертации используется временный fallback-стек `system-ui, "Segoe UI", sans-serif` (без Arial/Helvetica).

## Требования

- Node.js 20+
- PostgreSQL 14+

## База

По умолчанию API сам поднимает встроенный PostgreSQL на порту **54329**
(данные в `.data/pg/`), если в `.env` указан URL на этот порт.

В `.env` (см. `.env.example`):

```env
DATABASE_URL=postgresql://postgres:password@127.0.0.1:54329/id_gallery
PORT=3001
ADMIN_LOGIN=ваш-логин
ADMIN_PASSWORD=надёжный-пароль-от-12-символов
```

Администратор один — его логин и пароль задаются только в `.env`. Пароль короче
12 символов или из примера не принимается: вход в админку будет отключён.
После смены пароля и перезапуска сервера старые входы перестают действовать.

Можно использовать свой PostgreSQL — тогда задайте свой `DATABASE_URL`
и `USE_EMBEDDED_PG=0`.

Таблицы создаются автоматически при старте API (`server/schema.sql`).

## Запуск

```bash
npm install
npm run dev
```

- сайт: http://localhost:5173  
- API: http://localhost:3001  
- админка: http://localhost:5173/admin  

Тексты и URL медиа — в PostgreSQL; загруженные файлы — в `uploads/`.

Демо-товары (`src/data/demoProducts.ts`) включаются переменной `VITE_DEMO_DATA=true` в `.env`; чтобы убрать демо, выключите переменную или удалите этот файл.

## Админка

`/admin`, вход — `ADMIN_LOGIN` / `ADMIN_PASSWORD` из окружения.

- **Тексты и фото** — заголовки, тексты и фото текущих страниц (главная, услуги, бренды, интерьеры, профессионалам, о галерее, контакты, карьера). Список полей — `src/content/editable.ts`; чтобы сделать поле редактируемым, добавьте строку туда. Правки хранятся в таблице `content_overrides`.
- **Товары** — добавление, правка, скрытие товаров: фото, исполнения, характеристики (на сайте только подтверждённые), комнаты, документы, уход. Хранятся в таблице `products`; товар с тем же адресом, что в коде, заменяет его.
- **Контакты**, **События**, **Бренды** — как раньше.

Загруженные файлы — в `uploads/` (в Docker — том `uploads`). Правки применяются к сайту при загрузке страницы.

## Docker

```bash
cp .env.docker.example .env.docker   # задайте пароли
docker compose --env-file .env.docker up -d --build
```

- сайт и админка: `http://сервер:8080` (порт — `APP_PORT`)
- PostgreSQL 16 — отдельный контейнер, данные в томе `pgdata`; загрузки — в томе `uploads`
- демо-данные включаются при сборке: `VITE_DEMO_DATA=true`
- по HTTPS (домен + сертификат за nginx) задайте `COOKIE_SECURE=1` и `TRUST_PROXY=1`
- обновление: `git pull && docker compose --env-file .env.docker up -d --build`
- резервная копия базы: `docker compose exec db pg_dump -U id_gallery id_gallery > backup.sql`

## Правила оформления

Заголовки секций: на главной и витринных страницах H2 (LT Amber Medium, капс, 40–56px); на внутренних страницах (бренд, товар, интерьеры) подпись секции с линией (компонент `SectionLabel`: LT Amber Regular, капс, 14px). H1 страницы всегда LT Amber Medium, капс.
