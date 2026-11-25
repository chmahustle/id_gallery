import fs from 'node:fs/promises'
import path from 'node:path'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { login, startTestServer, TEST_LOGIN } from './testServer.js'

const started = await startTestServer()
const base = started?.base ?? ''

describe.skipIf(!started)('API сервера', () => {
  /* внутри блока сервер точно запущен */
  const ctx = started!
  let cookie = ''

  beforeAll(async () => {
    await ctx.pool.query('DELETE FROM admin_sessions')
    await ctx.pool.query("DELETE FROM content_overrides WHERE id LIKE 'test.%'")
    await ctx.pool.query("DELETE FROM products WHERE slug LIKE 'test-%'")
    cookie = (await login(base)).cookie
  })

  afterAll(async () => {
    await ctx.pool.query("DELETE FROM content_overrides WHERE id LIKE 'test.%'")
    await ctx.pool.query("DELETE FROM products WHERE slug LIKE 'test-%'")
    await ctx.close()
  })

  const send = (
    method: string,
    url: string,
    body?: unknown,
    headers: Record<string, string> = {},
  ) =>
    fetch(`${base}${url}`, {
      method,
      headers: { 'content-type': 'application/json', ...headers },
      body: body === undefined ? undefined : JSON.stringify(body),
    })

  describe('вход администратора', () => {
    it('пускает с логином и паролем из окружения', () => {
      expect(cookie).toMatch(/^id_gallery_admin=[a-f0-9]{64}$/)
    })

    it('не пускает с неверным паролем', async () => {
      const result = await login(base, TEST_LOGIN, 'wrong-password-123')
      expect(result.status).toBe(401)
    })

    it('сообщает о входе по cookie', async () => {
      const response = await fetch(`${base}/api/auth/me`, { headers: { cookie } })
      expect(await response.json()).toEqual({ authed: true, configured: true })
    })

    it('cookie сессии недоступна скриптам и не уходит с чужих сайтов', async () => {
      const response = await send('POST', '/api/auth/login', {
        login: TEST_LOGIN,
        password: process.env.ADMIN_PASSWORD,
      })
      const header = response.headers.get('set-cookie') || ''
      expect(header).toMatch(/HttpOnly/i)
      expect(header).toMatch(/SameSite=Strict/i)
    })

    it('после выхода сессия не действует', async () => {
      const own = (await login(base)).cookie
      await send('POST', '/api/auth/logout', undefined, { cookie: own })
      const response = await fetch(`${base}/api/auth/me`, { headers: { cookie: own } })
      expect((await response.json()).authed).toBe(false)
    })

    it('после смены пароля старые сессии не действуют', async () => {
      const own = (await login(base)).cookie
      const saved = process.env.ADMIN_PASSWORD
      process.env.ADMIN_PASSWORD = 'another-strong-password-7'
      try {
        const response = await fetch(`${base}/api/auth/me`, { headers: { cookie: own } })
        expect((await response.json()).authed).toBe(false)
      } finally {
        process.env.ADMIN_PASSWORD = saved
      }
    })

    it('со слабым паролем в окружении вход отключён', async () => {
      const saved = process.env.ADMIN_PASSWORD
      process.env.ADMIN_PASSWORD = 'admin123'
      try {
        const result = await login(base, TEST_LOGIN, 'admin123')
        expect(result.status).toBe(503)
      } finally {
        process.env.ADMIN_PASSWORD = saved
      }
    })
  })

  describe('права и защита', () => {
    it('без входа изменения запрещены', async () => {
      const response = await send('PUT', '/api/content/test.field', { value: 'x' })
      expect(response.status).toBe(401)
    })

    it('запрос с чужого сайта отклоняется', async () => {
      const response = await send(
        'PUT',
        '/api/content/test.field',
        { value: 'x' },
        { cookie, origin: 'https://evil.example' },
      )
      expect(response.status).toBe(403)
    })

    it('запрос со своего адреса проходит', async () => {
      const response = await send(
        'PUT',
        '/api/content/test.field',
        { value: 'Текст' },
        { cookie, origin: base },
      )
      expect(response.status).toBe(200)
      const values = (await (await fetch(`${base}/api/content`)).json()).values
      expect(values['test.field']).toBe('Текст')
    })

    it('CORS не разрешён', async () => {
      const response = await fetch(`${base}/api/content`, {
        headers: { origin: 'https://evil.example' },
      })
      expect(response.headers.get('access-control-allow-origin')).toBeNull()
    })

    it('отдаёт заголовки безопасности', async () => {
      const response = await fetch(`${base}/api/health`)
      expect(response.headers.get('x-content-type-options')).toBe('nosniff')
      expect(response.headers.get('x-frame-options')).toBe('SAMEORIGIN')
      expect(response.headers.get('x-powered-by')).toBeNull()
    })

    it('не принимает неверный id поля', async () => {
      const response = await send('PUT', '/api/content/..%2Fetc', { value: 'x' }, { cookie })
      expect(response.status).toBe(400)
    })
  })

  describe('загрузка файлов', () => {
    const upload = (name: string, type: string, body = 'data') => {
      const form = new FormData()
      form.append('file', new Blob([body], { type }), name)
      return fetch(`${base}/api/upload`, { method: 'POST', body: form, headers: { cookie } })
    }

    it('расширение берётся из типа файла, а не из имени', async () => {
      const response = await upload('x.html', 'image/png')
      const data = await response.json()
      expect(response.status).toBe(200)
      expect(data.url).toMatch(/^\/uploads\/admin-\d+-[a-f0-9]+\.png$/)
      await fs.rm(path.join(process.env.UPLOAD_DIR || 'uploads', path.basename(data.url)), {
        force: true,
      })
    })

    it('не принимает html', async () => {
      const response = await upload('x.html', 'text/html')
      expect(response.status).toBe(400)
    })

    it('без входа загрузка запрещена', async () => {
      const form = new FormData()
      form.append('file', new Blob(['x'], { type: 'image/png' }), 'x.png')
      const response = await fetch(`${base}/api/upload`, { method: 'POST', body: form })
      expect(response.status).toBe(401)
    })
  })

  describe('товары', () => {
    const product = {
      name: 'Тестовый диван',
      brandSlug: 'test-brand',
      categorySlug: 'sofas',
      price: '100000',
    }

    it('цена скрыта от посетителей и видна в админке', async () => {
      const saved = await send(
        'PUT',
        '/api/products/test-sofa',
        { data: product, published: true },
        { cookie },
      )
      expect(saved.status).toBe(200)
      const find = async (headers: Record<string, string>) =>
        (await (await fetch(`${base}/api/products`, { headers })).json()).items.find(
          (item: { slug: string; data: { price?: string } }) => item.slug === 'test-sofa',
        )
      expect((await find({})).data.price).toBeUndefined()
      expect((await find({ cookie })).data.price).toBe('100000')
    })

    it('не сохраняет товар без названия', async () => {
      const response = await send(
        'PUT',
        '/api/products/test-empty',
        { data: { ...product, name: ' ' }, published: true },
        { cookie },
      )
      expect(response.status).toBe(400)
    })
  })
})
