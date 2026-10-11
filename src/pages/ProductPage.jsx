import { useEffect, useMemo, useState } from 'react'
import { Link, Navigate, useParams } from 'react-router-dom'
import { useCart } from '../cart/CartContext'
import {
  buildWhatsAppLeadUrl,
  catalogPath,
  formatPrice,
  getProductBySlug,
  getRelatedProducts,
  productPath,
} from '../catalog/catalog'
import { useContent } from '../content/ContentContext'
import SiteShell from '../components/SiteShell'
import './ProductPage.css'

function ProductGallery({ images, name, brand }) {
  const [activeImage, setActiveImage] = useState(0)
  const current = images[activeImage] || images[0]

  return (
    <div className="product-page__gallery">
      <div className="product-page__main-image">
        <img src={current} alt={`${name}, ${brand}`} />
      </div>
      {images.length > 1 ? (
        <ul className="product-page__thumbs">
          {images.map((src, index) => (
            <li key={`${index}-${src}`}>
              <button
                type="button"
                className={index === activeImage ? 'is-active' : undefined}
                onClick={() => setActiveImage(index)}
                aria-label={`Фото ${index + 1}`}
              >
                <img src={src} alt="" />
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  )
}

export default function ProductPage() {
  const { productSlug } = useParams()
  const { content, ready } = useContent()
  const { addItem } = useCart()
  const product = getProductBySlug(productSlug)

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [productSlug])

  useEffect(() => {
    if (!product) return undefined
    document.title = `${product.name} — ID Gallery`
    return () => {
      document.title = 'ID Gallery'
    }
  }, [product])

  const related = useMemo(
    () => (product ? getRelatedProducts(product) : []),
    [product],
  )

  const images = product?.images?.length
    ? product.images
    : product?.image
      ? [product.image]
      : []

  if (!ready) {
    return <div className="page" aria-busy="true" />
  }

  if (!product) {
    return <Navigate to="/catalog" replace />
  }

  const whatsapp = content.contacts.whatsapp
  const kpUrl = buildWhatsAppLeadUrl(
    whatsapp,
    `Здравствуйте! Хочу запросить коммерческое предложение по товару:\n${product.brand} — ${product.name} (арт. ${product.sku})`,
  )
  const tourUrl = buildWhatsAppLeadUrl(
    whatsapp,
    `Здравствуйте! Хочу записаться на персональную экскурсию. Интересует: ${product.brand} — ${product.name}.`,
  )

  return (
    <SiteShell variant="solid">
      <div className="product-page">
        <nav className="product-page__crumbs" aria-label="Хлебные крошки">
          <Link to="/catalog">Каталог</Link>
          <span>/</span>
          <Link to={catalogPath(product.categorySlug)}>{product.category}</Link>
          {product.subcategory ? (
            <>
              <span>/</span>
              <Link
                to={catalogPath(product.categorySlug, {
                  sub: product.subcategory,
                })}
              >
                {product.subcategory}
              </Link>
            </>
          ) : null}
        </nav>

        <div className="product-page__layout">
          <ProductGallery
            key={product.slug}
            images={images}
            name={product.name}
            brand={product.brand}
          />

          <div className="product-page__info">
            <p className="product-page__brand">{product.brand}</p>
            <h1>{product.name}</h1>
            <p className="product-page__sku">Артикул {product.sku}</p>
            <p className="product-page__status-row">
              <span>{product.status}</span>
              <span>{formatPrice(product)}</span>
            </p>
            <p className="product-page__desc">{product.description}</p>

            <div className="product-page__actions">
              <button
                type="button"
                className="product-page__btn product-page__btn--primary"
                onClick={() => addItem(product)}
              >
                В корзину
              </button>
              <a
                className="product-page__btn"
                href={kpUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                Запросить КП
              </a>
              <a
                className="product-page__btn"
                href={tourUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                Записаться на экскурсию
              </a>
              {product.pdfUrl ? (
                <a
                  className="product-page__btn"
                  href={product.pdfUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Скачать PDF-каталог бренда
                </a>
              ) : null}
            </div>

            {product.specs && Object.keys(product.specs).length ? (
              <div className="product-page__specs">
                <h2>Характеристики</h2>
                <dl>
                  {Object.entries(product.specs).map(([key, value]) => (
                    <div key={key}>
                      <dt>{key}</dt>
                      <dd>{value}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            ) : null}
          </div>
        </div>

        {related.length ? (
          <section className="product-related" aria-labelledby="related-title">
            <h2 id="related-title">С этим товаром смотрят</h2>
            <div className="product-related__grid">
              {related.map((item) => (
                <article key={item.slug}>
                  <Link to={productPath(item.slug)}>
                    <img
                      src={item.image}
                      alt={`${item.name}, ${item.brand}`}
                      loading="lazy"
                    />
                    <p>{item.brand}</p>
                    <h3>{item.name}</h3>
                    <span>{formatPrice(item)}</span>
                  </Link>
                </article>
              ))}
            </div>
          </section>
        ) : null}
      </div>
    </SiteShell>
  )
}
