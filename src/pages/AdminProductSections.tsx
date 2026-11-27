import { swatchBackground } from '../lib/swatch'
import { FrameButton } from './AdminFrame'
import { FRAMES } from './adminFrames'
import {
  emptyVariant,
  type MaterialForm,
  type ProductForm,
  type SpecInput,
  type VariantForm,
} from './adminProductForm'
import { AdminIconButton } from './AdminIconButton'

/*
 * Блоки формы товара (вкладка «Товары»). Все получают одно и то же:
 * form — данные формы, patch — изменить поля, updateForm — изменить форму
 * по её последнему состоянию (для загрузок), busy — идёт загрузка,
 * uploadTo — загрузить файл и передать адрес.
 */
export type ProductSectionProps = {
  form: ProductForm
  patch: (update: Partial<ProductForm>) => void
  updateForm: (change: (form: ProductForm) => ProductForm) => void
  busy: boolean
  uploadTo: (file: File, onUrl: (url: string) => void) => Promise<void>
}

/* размеры и материалы у отдельного исполнения */
const VARIANT_SPECS: ['dimensions' | 'materials', string][] = [
  ['dimensions', 'Размеры'],
  ['materials', 'Материалы'],
]

/* где на сайте стоят фото товара */
const PRODUCT_FRAMES = [...FRAMES.card43, { label: 'Галерея на странице товара', ratio: 3 / 2 }]

/** Товар — фото товара: порядок, кадр, загрузка */
export function ProductPhotos({ form, patch, updateForm, busy, uploadTo }: ProductSectionProps) {
  return (
    <section className="admin-field">
      <h3>Фото</h3>
      <p className="admin-field__hint">
        Первое фото — главное, оно же в карточке каталога. Формат 4:3, без логотипов в кадре.
      </p>
      <ul className="admin-photos">
        {form.images.map((src, i) => (
          <li key={`${src}-${i}`}>
            <img src={src} alt="" />
            <div>
              <FrameButton
                src={src}
                aspects={PRODUCT_FRAMES}
                onChange={(next) =>
                  patch({ images: form.images.map((item, j) => (j === i ? next : item)) })
                }
              />
              <button
                type="button"
                disabled={i === 0}
                aria-label="Сдвинуть влево"
                onClick={() => {
                  const next = [...form.images]
                  ;[next[i - 1], next[i]] = [next[i], next[i - 1]]
                  patch({ images: next })
                }}
              >
                ←
              </button>
              <button
                type="button"
                disabled={i === form.images.length - 1}
                aria-label="Сдвинуть вправо"
                onClick={() => {
                  const next = [...form.images]
                  ;[next[i + 1], next[i]] = [next[i], next[i + 1]]
                  patch({ images: next })
                }}
              >
                →
              </button>
              <AdminIconButton
                icon="delete"
                size="sm"
                label={`Удалить фото ${i + 1}`}
                onClick={() => patch({ images: form.images.filter((_, j) => j !== i) })}
              />
            </div>
          </li>
        ))}
      </ul>
      <label className="admin-field__upload">
        Добавить фото
        <input
          type="file"
          accept="image/*"
          multiple
          disabled={busy}
          onChange={async (e) => {
            const files = [...(e.target.files || [])]
            e.target.value = ''
            for (const file of files) {
              await uploadTo(file, (url) =>
                updateForm((current) => ({ ...current, images: [...current.images, url] })),
              )
            }
          }}
        />
      </label>
    </section>
  )
}

/** Товар — цвета и исполнения: образец, название, фото в этом цвете */
export function ProductVariants({ form, patch, updateForm, busy, uploadTo }: ProductSectionProps) {
  return (
    <section className="admin-field">
      <h3>Цвета и исполнения</h3>
      <p className="admin-field__hint">
        Образец — фото ткани, кожи или дерева (или просто цвет). Фото товара в этом исполнении
        показываются на сайте, когда покупатель выбирает этот цвет.
      </p>
      {form.variants.map((variant, i) => {
        const setVariant = (update: (current: VariantForm) => Partial<VariantForm>) =>
          updateForm((current) => {
            const next = [...current.variants]
            next[i] = { ...next[i], ...update(next[i]) }
            return { ...current, variants: next }
          })
        const isColor = /^#/.test(variant.swatch)
        return (
          <article key={i} className="admin-finish">
            <div className="admin-finish__swatch">
              <label
                className="admin-swatch"
                style={{ background: swatchBackground({ swatch: variant.swatch }) }}
                title="Загрузить фото образца"
              >
                {!variant.swatch ? <span>Образец</span> : null}
                <input
                  type="file"
                  accept="image/*"
                  disabled={busy}
                  onChange={async (e) => {
                    const file = e.target.files?.[0]
                    e.target.value = ''
                    if (file) await uploadTo(file, (url) => setVariant(() => ({ swatch: url })))
                  }}
                />
              </label>
              <label className="admin-swatch__color" title="Или выбрать цвет">
                <input
                  type="color"
                  value={isColor ? variant.swatch : '#b9ac94'}
                  onChange={(e) => setVariant(() => ({ swatch: e.target.value }))}
                />
                цвет
              </label>
            </div>

            <div className="admin-finish__body">
              <input
                className="admin-finish__name"
                placeholder="Название, например «Кожа Nabuk, табак»"
                value={variant.name}
                onChange={(e) => setVariant(() => ({ name: e.target.value }))}
              />
              <div className="admin-finish__photos">
                {variant.images.map((src, j) => (
                  <span key={`${src}-${j}`} className="admin-finish__photo">
                    <img src={src} alt="" />
                    <FrameButton
                      short
                      src={src}
                      aspects={PRODUCT_FRAMES}
                      onChange={(next) =>
                        setVariant((v) => ({
                          images: v.images.map((item, k) => (k === j ? next : item)),
                        }))
                      }
                    />
                    <AdminIconButton
                      icon="delete"
                      size="sm"
                      label="Убрать фото"
                      onClick={() =>
                        setVariant((v) => ({ images: v.images.filter((_, k) => k !== j) }))
                      }
                    />
                  </span>
                ))}
                <label className="admin-finish__add-photo">
                  + фото в этом цвете
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    disabled={busy}
                    onChange={async (e) => {
                      const files = [...(e.target.files || [])]
                      e.target.value = ''
                      for (const file of files) {
                        await uploadTo(file, (url) =>
                          setVariant((v) => ({ images: [...v.images, url] })),
                        )
                      }
                    }}
                  />
                </label>
              </div>
              <details className="admin-finish__more">
                <summary>Размеры и материалы этого исполнения</summary>
                {VARIANT_SPECS.map(([key, label]) => (
                  <div key={key} className="admin-spec">
                    <label>
                      {label}
                      <input
                        value={variant[key].value}
                        onChange={(e) =>
                          setVariant((v) => ({
                            [key]: { ...v[key], value: e.target.value } satisfies SpecInput,
                          }))
                        }
                      />
                    </label>
                    <label className="admin-check">
                      <input
                        type="checkbox"
                        checked={variant[key].approved}
                        onChange={(e) =>
                          setVariant((v) => ({
                            [key]: { ...v[key], approved: e.target.checked },
                          }))
                        }
                      />
                      подтверждено
                    </label>
                  </div>
                ))}
              </details>
            </div>

            <AdminIconButton
              icon="delete"
              className="admin-finish__remove"
              label="Убрать исполнение"
              onClick={() => patch({ variants: form.variants.filter((_, j) => j !== i) })}
            />
          </article>
        )
      })}
      <button
        type="button"
        className="admin__ghost"
        onClick={() =>
          patch({
            variants: [...form.variants, emptyVariant()],
          })
        }
      >
        + Цвет или исполнение
      </button>
    </section>
  )
}

/** Товар — образцы материалов для «Характеристик» */
export function ProductMaterials({ form, patch, updateForm, busy, uploadTo }: ProductSectionProps) {
  return (
    <section className="admin-field">
      <h3>Материалы</h3>
      <p className="admin-field__hint">
        Образцы материалов: фото фактуры, название и короткое пояснение. На сайте — в
        «Характеристиках».
      </p>
      <div className="admin-materials">
        {form.materialSwatches.map((item, i) => {
          const setItem = (update: Partial<MaterialForm>) =>
            updateForm((current) => {
              const next = [...current.materialSwatches]
              next[i] = { ...next[i], ...update }
              return { ...current, materialSwatches: next }
            })
          return (
            <article key={i} className="admin-material">
              <label
                className="admin-swatch"
                style={{ background: swatchBackground({ swatch: item.image }) }}
                title="Загрузить фото материала"
              >
                {!item.image ? <span>Фото</span> : null}
                <input
                  type="file"
                  accept="image/*"
                  disabled={busy}
                  onChange={async (e) => {
                    const file = e.target.files?.[0]
                    e.target.value = ''
                    if (file) await uploadTo(file, (url) => setItem({ image: url }))
                  }}
                />
              </label>
              <div className="admin-material__body">
                <input
                  placeholder="Материал, например «Орех каналетто»"
                  value={item.name}
                  onChange={(e) => setItem({ name: e.target.value })}
                />
                <input
                  placeholder="Пояснение: каркас, столешница…"
                  value={item.note}
                  onChange={(e) => setItem({ note: e.target.value })}
                />
              </div>
              <AdminIconButton
                icon="delete"
                className="admin-finish__remove"
                label="Убрать материал"
                onClick={() =>
                  patch({ materialSwatches: form.materialSwatches.filter((_, j) => j !== i) })
                }
              />
            </article>
          )
        })}
      </div>
      <button
        type="button"
        className="admin__ghost"
        onClick={() =>
          patch({
            materialSwatches: [...form.materialSwatches, { name: '', image: '', note: '' }],
          })
        }
      >
        + Материал
      </button>
    </section>
  )
}

/** Товар — документы: паспорта, сертификаты (PDF или фото) */
export function ProductDocuments({ form, patch, updateForm, busy, uploadTo }: ProductSectionProps) {
  return (
    <section className="admin-field">
      <h3>Документы</h3>
      {form.documents.map((doc, i) => (
        <div key={i} className="admin-variant">
          <input
            placeholder="Название, например «Технический паспорт»"
            value={doc.title}
            onChange={(e) => {
              const next = [...form.documents]
              next[i] = { ...doc, title: e.target.value }
              patch({ documents: next })
            }}
          />
          <label className="admin-variant__file">
            {doc.url ? 'Файл загружен' : 'Загрузить PDF'}
            <input
              type="file"
              accept="application/pdf,image/*"
              disabled={busy}
              onChange={async (e) => {
                const file = e.target.files?.[0]
                e.target.value = ''
                if (!file) return
                await uploadTo(file, (url) =>
                  updateForm((current) => {
                    const next = [...current.documents]
                    const format = /\.pdf$/i.test(file.name) ? 'PDF' : 'Изображение'
                    next[i] = { ...next[i], url, format }
                    return { ...current, documents: next }
                  }),
                )
              }}
            />
          </label>
          <AdminIconButton
            icon="delete"
            label="Удалить документ"
            onClick={() => patch({ documents: form.documents.filter((_, j) => j !== i) })}
          />
        </div>
      ))}
      <button
        type="button"
        className="admin__ghost"
        onClick={() =>
          patch({ documents: [...form.documents, { title: '', url: '', format: 'PDF' }] })
        }
      >
        + Документ
      </button>
    </section>
  )
}
