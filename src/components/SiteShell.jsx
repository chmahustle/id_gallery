import Header from './Header'
import Footer from './Footer'
import ScrollTop from './ScrollTop'

export default function SiteShell({ variant = 'overlay', children }) {
  return (
    <div className={`page page--${variant}`}>
      <a href="#main" className="skip-link">
        Перейти к содержимому
      </a>
      <Header variant={variant} />
      <main id="main">{children}</main>
      <Footer />
      <ScrollTop />
    </div>
  )
}
