import { Link } from 'react-router-dom'
import { brands } from '../data/brands'
import { featureFlags } from '../data/featureFlags'
import { getApprovedLegalLinks } from '../data/legal'
import { footerHeadings, footerNav } from '../data/navigation'
import { site as siteData } from '../data/site'
import { FooterLogo } from './FooterLogo'
import NewsletterForm from './NewsletterForm'
import { Button } from './ui/Button'
import './Footer.css'

const YEAR = new Date().getFullYear()

export default function Footer() {
  const legalLinks = getApprovedLegalLinks()
  const visible = (links) =>
    links.filter((link) => !link.flag || Boolean(featureFlags[link.flag]))
  const catalogLinks = visible(footerNav.catalog)
  const companyLinks = visible(footerNav.company)
  const serviceLinks = visible(footerNav.services)

  return (
    <footer className="footer">
      <div className="footer__inner">
        <div className="footer__top">
          <div className="footer__grid footer__grid--4">
            <div className="footer__col">
              <h3 className="footer__heading">{footerHeadings.catalog}</h3>
              <ul>
                {catalogLinks.map((link) => (
                  <li key={link.href}>
                    <Button
                      className="footer__link"
                      as="link"
                      to={link.href}
                      variant="link"
                      subtle
                    >
                      {link.label}
                    </Button>
                  </li>
                ))}
              </ul>
            </div>

            <div className="footer__col">
              <h3 className="footer__heading">{footerHeadings.brands}</h3>
              <ul>
                {brands.map((brand) => (
                  <li key={brand.slug}>
                    <Button
                      className="footer__link"
                      as="link"
                      to={`/brands/${brand.slug}`}
                      variant="link"
                      subtle
                    >
                      {brand.name}
                    </Button>
                  </li>
                ))}
              </ul>
            </div>

            <div className="footer__col">
              <h3 className="footer__heading">{footerHeadings.company}</h3>
              <ul>
                {companyLinks.map((link) => (
                  <li key={`${link.label}-${link.href}`}>
                    <Button
                      className="footer__link"
                      as="link"
                      to={link.href}
                      variant="link"
                      subtle
                    >
                      {link.label}
                    </Button>
                  </li>
                ))}
              </ul>
            </div>

            <div className="footer__col">
              <h3 className="footer__heading">{footerHeadings.services}</h3>
              <ul>
                {serviceLinks.map((link) => (
                  <li key={`${link.label}-${link.href}`}>
                    <Button
                      className="footer__link"
                      as="link"
                      to={link.href}
                      variant="link"
                      subtle
                    >
                      {link.label}
                    </Button>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {featureFlags.showNewsletter ? (
            <div className="footer__newsletter">
              <NewsletterForm
                className="footer__subscribe-wrap"
                headingClassName="footer__heading"
                title="Подписаться на рассылку"
              />
            </div>
          ) : null}
        </div>

        <div className="footer__bottom">
          <div className="footer__mark" aria-hidden="true">
            <FooterLogo />
          </div>
          <div className="footer__copy-row">
            <p className="footer__copy">
              © {YEAR} {siteData.name}
            </p>
            {legalLinks.length > 0 ? (
              <div className="footer__legal">
                {legalLinks.map((item) => (
                  <Link
                    key={item.href + item.label}
                    className="footer__policy"
                    to={item.href}
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </footer>
  )
}
