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
ADMIN_LOGIN=admin
ADMIN_PASSWORD=admin123
```

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

## Правила оформления

Заголовки секций: на главной и витринных страницах H2 (LT Amber Medium, капс, 40–56px); на внутренних страницах (бренд, товар, интерьеры) подпись секции с линией (компонент `SectionLabel`: LT Amber Regular, капс, 14px). H1 страницы всегда LT Amber Medium, капс.
