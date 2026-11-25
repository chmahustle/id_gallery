import path from 'node:path'
import { Router } from 'express'
import multer from 'multer'
import { requireAuth } from './auth.js'
import { UPLOAD_ROOT } from './media.js'
import { isAllowedType, storedName } from './uploadName.js'

/** Загрузка файлов из админки: фото (до 20 МБ) и документы PDF (до 50 МБ) */
const MAX_FILE = 50 * 1024 * 1024
const IMAGE_LIMIT = 20 * 1024 * 1024

const upload = multer({
  storage: multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, UPLOAD_ROOT),
    filename: (_req, file, cb) => cb(null, storedName('admin', file.mimetype)),
  }),
  limits: { fileSize: MAX_FILE, files: 1 },
  fileFilter: (_req, file, cb) => {
    if (isAllowedType(file.mimetype, ['image', 'pdf'])) cb(null, true)
    else
      cb(Object.assign(new Error('Можно загружать фото (JPG, PNG, WebP) или PDF'), { status: 400 }))
  },
})

const router = Router()

router.post('/', requireAuth, upload.single('file'), (req, res) => {
  const file = req.file
  if (!file) {
    res.status(400).json({ error: 'Файл не получен' })
    return
  }
  if (file.mimetype.startsWith('image/') && file.size > IMAGE_LIMIT) {
    res.status(400).json({ error: 'Фото больше 20 МБ' })
    return
  }
  res.json({
    url: `/uploads/${path.basename(file.filename)}`,
    name: file.originalname,
    mime: file.mimetype,
  })
})

export default router
