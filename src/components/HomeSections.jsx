import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useCart } from '../cart/CartContext'
import { catalogPath, productPath } from '../catalog/catalog'
import {
  about,
  advantages,
  catalogCategories,
  partnerTypes,
  productFilters,
  products,
  services,
  showrooms,
  toIsoDate,
} from '../content'
import { useBrands } from '../brands/BrandsContext'
import { useNews } from '../news/NewsContext'
import './HomeSections.css'

export default function HomeSections() {
  const { addItem } = useCart()
  const { items: brandLogos } = useBrands()
  const { items: news, newsPath } = useNews()
  const [category, setCategory] = useState('Все')
  const [status, setStatus] = useState('Все')
  const categoryOptions = ['Все', ...catalogCategories.map((c) => c.label)]
  const statusOptions = ['Все', ...productFilters]

  const visibleProducts = useMemo(() => {
    return products.filter((item) => {
      const categoryOk = category === 'Все' || item.category === category
      const statusOk = status === 'Все' || item.status === status
      return categoryOk && statusOk
    })
  }, [category, status])

  return (
    <>
      <section className="home-block" id="about" aria-labelledby="about-title">
        <div className="home-block__grid home-block__grid--about">
          <div>
            <h2 id="about-title">{about.title}</h2>
            <p>{about.lead}</p>
            <Link className="btn" to={about.href}>
              {about.cta}
            </Link>
          </div>
          <img src={about.image} alt="Интерьер шоурума ID Gallery в Москве" loading="lazy" />
        </div>
      </section>

      <section className="home-block" id="advantages" aria-labelledby="adv-title">
        <h2 id="adv-title">Наши преимущества</h2>
        <div className="cards cards--4">
          {advantages.map((item) => (
            <a key={item.title} className="card" href={item.href}>
              <h3>{item.title}</h3>
              <p>{item.text}</p>
            </a>
          ))}
        </div>
      </section>

      <section className="home-block" id="showrooms" aria-labelledby="show-title">
        <h2 id="show-title">Флагманские салоны</h2>
        <div className="showrooms">
          {showrooms.map((item) => (
            <a key={item.title} className="showrooms__item" href="#products">
              <img src={item.image} alt={`${item.title} — шоурум ID Gallery`} loading="lazy" />
              <span>{item.title}</span>
            </a>
          ))}
        </div>
      </section>

      <section className="home-block" id="brands" aria-labelledby="brands-title">
        <div className="home-block__head">
          <h2 id="brands-title">Бренды</h2>
        </div>
        <ul className="brands">
          {brandLogos
            .filter((item) => item.logo)
            .map((item) => (
              <li key={item.name}>
                <Link
                  to={catalogPath(null, { brand: item.filter })}
                  aria-label={`Смотреть товары ${item.name}`}
                >
                  <img src={item.logo} alt={item.name} loading="lazy" />
                </Link>
              </li>
            ))}
        </ul>
        <p className="home-block__more">
          <Link to="/brands">Все бренды</Link>
        </p>
      </section>

      <section className="home-block" id="catalog" aria-labelledby="catalog-title">
        <h2 id="catalog-title">Каталог</h2>
        <ul className="chips" aria-label="Категории каталога">
          {catalogCategories.map((cat) => (
            <li key={cat.label}>
              <Link to={cat.href || catalogPath(cat.slug)}>{cat.label}</Link>
              {cat.children ? (
                <span className="chips__sub">{cat.children.join(' · ')}</span>
              ) : null}
            </li>
          ))}
        </ul>
      </section>

      <section className="home-block" id="products" aria-labelledby="products-title">
        <div className="home-block__head">
          <h2 id="products-title">Популярные товары / Товары в наличии</h2>
        </div>
        <div className="filter-row" role="group" aria-label="Фильтр по категориям">
          {categoryOptions.map((name) => (
            <button
              key={name}
              type="button"
              aria-pressed={category === name}
              className={category === name ? 'is-active' : undefined}
              onClick={() => setCategory(name)}
            >
              {name}
            </button>
          ))}
        </div>
        <div className="filter-row" role="group" aria-label="Фильтр по статусу">
          {statusOptions.map((name) => (
            <button
              key={name}
              type="button"
              aria-pressed={status === name}
              className={status === name ? 'is-active' : undefined}
              onClick={() => setStatus(name)}
            >
              {name}
            </button>
          ))}
        </div>
        {visibleProducts.length === 0 ? (
          <p className="empty-state" role="status">
            По выбранным фильтрам товаров нет. Сбросьте фильтр или выберите другую категорию.
          </p>
        ) : (
          <div className="product-rail">
            {visibleProducts.map((item) => (
              <article key={item.slug || `${item.brand}-${item.name}`} className="product-card">
                <Link to={productPath(item.slug)}>
                  <img
                    src={item.image}
                    alt={`${item.name}, ${item.brand} — шоурум ID Gallery`}
                    loading="lazy"
                  />
                </Link>
                <p className="product-card__brand">{item.brand}</p>
                <h3>
                  <Link to={productPath(item.slug)}>{item.name}</Link>
                </h3>
                <p className="product-card__meta">
                  <span>{item.status}</span>
                  <span>{item.price}</span>
                </p>
                <div className="product-card__actions">
                  <button type="button" onClick={() => addItem(item)}>
                    В корзину
                  </button>
                  <Link to={productPath(item.slug)}>Подробнее</Link>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      <section className="home-block" id="news" aria-labelledby="news-title">
        <div className="home-block__head">
          <h2 id="news-title">Новости и события</h2>
          <Link to="/news">Перейти в новости</Link>
        </div>
        <div className="cards cards--3">
          {news.slice(0, 3).map((item) => (
            <article key={item.slug} className="card card--news">
              <time dateTime={toIsoDate(item.date)}>{item.date}</time>
              <h3>
                <Link to={newsPath(item.slug)}>{item.title}</Link>
              </h3>
              <p>{item.excerpt}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="home-block" id="services" aria-labelledby="services-title">
        <h2 id="services-title">Сервисы</h2>
        <div className="cards cards--3">
          {services.map((item) => (
            <article key={item.title} className="card">
              <h3>{item.title}</h3>
              <p>{item.text}</p>
              <Link className="btn btn--ghost" to="/contacts">
                Оставить заявку
              </Link>
            </article>
          ))}
        </div>
      </section>

      <section className="home-block" id="partners" aria-labelledby="partners-title">
        <h2 id="partners-title">Партнёрам</h2>
        <p className="home-block__lead">
          Сотрудничество для архитекторов, дизайнеров и девелоперов — каталоги, 3D-модели и
          персональные экскурсии.
        </p>
        <div className="cards cards--2">
          {partnerTypes.slice(0, 2).map((item) => (
            <article key={item.title} className="card">
              <h3>{item.title}</h3>
              <ul>
                {item.perks.map((perk) => (
                  <li key={perk}>{perk}</li>
                ))}
              </ul>
              <Link className="btn btn--ghost" to="/partners">
                Подробнее
              </Link>
            </article>
          ))}
        </div>
        <p className="home-block__more">
          <Link to="/partners">Все условия для партнёров</Link>
        </p>
      </section>

      <section className="home-block" id="catalogs" aria-labelledby="catalogs-title">
        <h2 id="catalogs-title">Каталоги</h2>
        <p>Превью каталогов брендов и запрос на скачивание.</p>
        <Link className="btn" to="/contacts">
          Запросить каталог
        </Link>
      </section>

      <section className="home-block" id="models" aria-labelledby="models-title">
        <h2 id="models-title">3D-модели</h2>
        <p>Превью 3D-моделей брендов для проектной работы.</p>
        <Link className="btn" to="/contacts">
          Запросить 3D-модели
        </Link>
      </section>
    </>
  )
}
