import { Link } from 'react-router-dom'
import { SectionLabel } from '../../components/ui'
import type { BrandAuthor } from '../../types'

type BrandAuthorsProps = {
  authors: BrandAuthor[]
}

/** Один автор: большое фото слева, текст справа (та же высота) */
function AuthorSolo({ author }: { author: BrandAuthor }) {
  return (
    <div
      className={[
        'brand-page__author-solo',
        author.photo ? '' : 'brand-page__author-solo--text',
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {author.photo ? (
        <Link
          className="brand-page__solo-photo-link"
          to={author.link}
          aria-label={`Товары автора: ${author.name}`}
        >
          <img
            className="brand-page__solo-photo"
            src={author.photo}
            alt={`${author.name}, ${author.role}`}
            loading="lazy"
          />
        </Link>
      ) : null}
      <div className="brand-page__solo-text">
        <div className="brand-page__solo-top">
          <p className="brand-page__solo-role">{author.role}</p>
          <p className="brand-page__solo-name">{author.name}</p>
        </div>
        <div className="brand-page__solo-bottom">
          {author.bio ? (
            <p className="brand-page__solo-bio">{author.bio}</p>
          ) : null}
        </div>
      </div>
    </div>
  )
}

/** Авторы: цветная полоса на всю ширину страницы, внутри обычный контейнер */
export function BrandAuthors({ authors }: BrandAuthorsProps) {
  return (
    <section
      className="brand-page__authors-band"
      aria-labelledby="brand-authors-title"
    >
      <div className="brand-page__authors-inner">
        <div className="brand-page__showcase-head">
          <SectionLabel id="brand-authors-title">Авторы</SectionLabel>
        </div>
        {authors.length === 1 ? (
          <AuthorSolo author={authors[0]!} />
        ) : (
          <ul className="brand-page__authors">
            {authors.map((author, index) => (
              <li
                key={`${author.name}-${index}`}
                className={[
                  'brand-page__author',
                  author.photo ? '' : 'brand-page__author--text',
                ]
                  .filter(Boolean)
                  .join(' ')}
              >
                {author.photo ? (
                  <Link
                    className="brand-page__author-photo-link"
                    to={author.link}
                    aria-label={`Товары автора: ${author.name}`}
                  >
                    <img
                      className="brand-page__author-photo"
                      src={author.photo}
                      alt={`${author.name}, ${author.role}`}
                      loading="lazy"
                    />
                  </Link>
                ) : null}
                <div className="brand-page__author-body">
                  <p className="brand-page__author-name">{author.name}</p>
                  <p className="brand-page__author-role">{author.role}</p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  )
}
