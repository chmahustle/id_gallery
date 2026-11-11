import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import NavTracker from './components/NavTracker'
import { RequestModalHost } from './features/request-modal/RequestModalHost'
import { UserAuthProvider } from './auth/UserAuthContext'
import { CartProvider } from './cart/CartContext'
import { MediaProvider } from './media/MediaContext'
import { ContentProvider } from './content/ContentContext'
import { BrandsProvider } from './brands/BrandsContext'
import { NewsProvider } from './news/NewsContext'
import Home from './pages/Home'
import Admin from './pages/Admin'
import Catalog from './pages/Catalog'
import ProductPage from './pages/ProductPage'
import Brands from './pages/Brands'
import BrandDetail from './pages/BrandDetail'
import About from './pages/About'
import Account from './pages/Account'
import Contact from './pages/Contact'
import Request from './pages/Request'
import Contacts from './pages/Contacts'
import Partners from './pages/Partners'
import News from './pages/News'
import NewsDetail from './pages/NewsDetail'
import Interiors from './pages/Interiors'
import InteriorDetail from './pages/InteriorDetail'
import Showrooms from './pages/Showrooms'
import ServicesPodbor from './pages/ServicesPodbor'
import Rooms from './pages/Rooms'
import Room from './pages/Room'
import { DevUi } from './pages/DevUi'

const isDev = import.meta.env.DEV

export default function App() {
  return (
    <MediaProvider>
      <ContentProvider>
        <NewsProvider>
          <BrandsProvider>
            <UserAuthProvider>
              <CartProvider>
                <BrowserRouter>
                  <NavTracker />
                  <RequestModalHost />
                  <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/catalog" element={<Catalog />} />
                    <Route path="/catalog/:categorySlug" element={<Catalog />} />
                    <Route path="/product/:productSlug" element={<ProductPage />} />
                    <Route path="/services" element={<Navigate to="/services/podbor" replace />} />
                    <Route path="/services/podbor" element={<ServicesPodbor />} />
                    <Route path="/rooms" element={<Rooms />} />
                    <Route path="/rooms/:roomSlug" element={<Room />} />
                    <Route path="/brands" element={<Brands />} />
                    <Route path="/brands/:brandSlug" element={<BrandDetail />} />
                    <Route path="/about" element={<About />} />
                    <Route path="/interiors" element={<Interiors />} />
                    <Route
                      path="/interiors/:interiorSlug"
                      element={<InteriorDetail />}
                    />
                    <Route path="/showrooms" element={<Showrooms />} />
                    <Route path="/trade" element={<Partners />} />
                    <Route path="/partners" element={<Navigate to="/trade" replace />} />
                    <Route path="/news" element={<News />} />
                    <Route path="/news/:newsSlug" element={<NewsDetail />} />
                    <Route path="/contact" element={<Contact />} />
                    <Route path="/contacts" element={<Contacts />} />
                    <Route path="/account" element={<Account />} />
                    <Route path="/request" element={<Request />} />
                    <Route path="/admin" element={<Admin />} />
                    {isDev ? <Route path="/dev/ui" element={<DevUi />} /> : null}
                    <Route path="*" element={<Navigate to="/" replace />} />
                  </Routes>
                </BrowserRouter>
              </CartProvider>
            </UserAuthProvider>
          </BrandsProvider>
        </NewsProvider>
      </ContentProvider>
    </MediaProvider>
  )
}
