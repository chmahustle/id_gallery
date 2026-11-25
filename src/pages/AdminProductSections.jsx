import { swatchBackground } from '../lib/swatch'
import { FrameButton } from './AdminFrame'
import { FRAMES } from './adminFrames'

/*
 * Блоки формы товара (вкладка «Товары»). Все получают одно и то же:
 * form — данные формы, patch — изменить поля, setEditing — изменить
 * состояние редактора целиком, busy — идёт загрузка, uploadTo — загрузить
 * файл и передать адрес.
 */

/* где на сайте стоят фото товара */
const PRODUCT_FRAMES = [...FRAMES.card43, { label: 'Галерея на странице товара', ratio: 3 / 2 }]

/** Товар — фото товара: порядок, кадр, загрузка */
export function ProductPhotos({ form, patch, setEditing, busy, uploadTo }) {
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
              <button
                type="button"
                className="admin__danger"
                onClick={() => patch({ images: form.images.filter((_, j) => j !== i) })}
              >
                Убрать
              </button>
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
                setEditing((prev) => ({
                  ...prev,
                  form: { ...prev.form, images: [...prev.form.images, url] },
                })),
              )
            }
          }}
        />
      </label>
    </section>
  )
}

/** Товар — цвета и исполнения: образец, название, фото в этом цвете */
export function ProductVariants({ form, patch, setEditing, busy, uploadTo }) {
  return (
    <section className="admin-field">
      <h3>Цвета и исполнения</h3>
      <p className="admin-field__hint">
        Образец — фото ткани, кожи или дерева (или просто цвет). Фото товара в этом исполнении
        показываются на сайте, когда покупатель выбирает этот цвет.
      </p>
      {form.variants.map((variant, i) => {
        const setVariant = (update) =>
          setEditing((prev) => {
            const next = [...prev.form.variants]
            next[i] = { ...next[i], ...update(next[i]) }
            return { ...prev, form: { ...prev.form, variants: next } }
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
                    <button
                      type="button"
                      aria-label="Убрать фото"
                      onClick={() =>
                        setVariant((v) => ({ images: v.images.filter((_, k) => k !== j) }))
                      }
                    >
                      ×
                    </button>
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
                {[
                  ['dimensions', 'Размеры'],
                  ['materials', 'Материалы'],
                ].map(([key, label]) => (
                  <div key={key} className="admin-spec">
                    <label>
                      {label}
                      <input
                        value={variant[key].value}
                        onChange={(e) =>
                          setVariant((v) => ({ [key]: { ...v[key], value: e.target.value } }))
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

            <button
              type="button"
              className="admin__danger admin-finish__remove"
              aria-label="Убрать исполнение"
              onClick={() => patch({ variants: form.variants.filter((_, j) => j !== i) })}
            >
              ×
            </button>
          </article>
        )
      })}
      <button
        type="button"
        className="admin__ghost"
        onClick={() =>
          patch({
            variants: [
              ...form.variants,
              {
                id: '',
                name: '',
                swatch: '',
                images: [],
                dimensions: { value: '', approved: false },
                materials: { value: '', approved: false },
              },
            ],
          })
        }
      >
        + Цвет или исполнение
      </button>
    </section>
  )
}

/** Товар — образцы материалов для «Характеристик» */
export function ProductMaterials({ form, patch, setEditing, busy, uploadTo }) {
  return (
    <section className="admin-field">
      <h3>Материалы</h3>
      <p className="admin-field__hint">
        Образцы материалов: фото фактуры, название и короткое пояснение. На сайте — в
        «Характеристиках».
      </p>
      <div className="admin-materials">
        {form.materialSwatches.map((item, i) => {
          const setItem = (update) =>
            setEditing((prev) => {
              const next = [...prev.form.materialSwatches]
              next[i] = { ...next[i], ...update }
              return { ...prev, form: { ...prev.form, materialSwatches: next } }
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
              <button
                type="button"
                className="admin__danger admin-finish__remove"
                aria-label="Убрать материал"
                onClick={() =>
                  patch({ materialSwatches: form.materialSwatches.filter((_, j) => j !== i) })
                }
              >
                ×
              </button>
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
export function ProductDocuments({ form, patch, setEditing, busy, uploadTo }) {
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
                  setEditing((prev) => {
                    const next = [...prev.form.documents]
                    const format = /\.pdf$/i.test(file.name) ? 'PDF' : 'Изображение'
                    next[i] = { ...next[i], url, format }
                    return { ...prev, form: { ...prev.form, documents: next } }
                  }),
                )
              }}
            />
          </label>
          <button
            type="button"
            className="admin__danger"
            onClick={() => patch({ documents: form.documents.filter((_, j) => j !== i) })}
          >
            Убрать
          </button>
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
