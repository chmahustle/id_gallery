# ID Gallery

React (Vite) фронтенд + Express API + PostgreSQL.

## Требования

- Node.js 20+
- PostgreSQL 14+

## База

```bash
createdb id_gallery   # или: psql -d postgres -c "CREATE DATABASE id_gallery;"
```

В `.env` (см. `.env.example`):

```env
DATABASE_URL=postgresql:///id_gallery?host=/var/run/postgresql
PORT=3001
ADMIN_LOGIN=admin
ADMIN_PASSWORD=admin123
```

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
