import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
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
import About from './pages/About'
import Contacts from './pages/Contacts'
import Partners from './pages/Partners'
import News from './pages/News'
import NewsDetail from './pages/NewsDetail'

export default function App() {
  return (
    <MediaProvider>
      <ContentProvider>
        <NewsProvider>
          <BrandsProvider>
            <CartProvider>
              <BrowserRouter>
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/catalog" element={<Catalog />} />
                  <Route path="/catalog/:categorySlug" element={<Catalog />} />
                  <Route path="/product/:productSlug" element={<ProductPage />} />
                  <Route path="/brands" element={<Brands />} />
                  <Route path="/about" element={<About />} />
                  <Route path="/partners" element={<Partners />} />
                  <Route path="/news" element={<News />} />
                  <Route path="/news/:newsSlug" element={<NewsDetail />} />
                  <Route path="/contacts" element={<Contacts />} />
                  <Route path="/admin" element={<Admin />} />
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </BrowserRouter>
            </CartProvider>
          </BrandsProvider>
        </NewsProvider>
      </ContentProvider>
    </MediaProvider>
  )
}
