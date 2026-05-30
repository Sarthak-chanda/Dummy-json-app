import { useEffect, useState } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import './App.css'

import Nav from './Content/Navbar/Nav'
import SearchResult from './Content/SearchResult'
import Loading from './Loading'
import NotFound from './NotFound'
import CartPage from './Content/Cartpage'
import Products from './Content/Products'
import Login from './Login/Login.jsx'
import WelcomePage from './Login/Welcome.jsx'
import Profile from './Content/Profile.jsx'

const getSavedCart = () => {
  try {
    const saved = localStorage.getItem('cart')
    return saved ? JSON.parse(saved) : []
  } catch {
    return []
  }
}

const App = () => {
  const [loading, setLoading] = useState(false)
  const [cart, setCart] = useState(getSavedCart)
  const [searchResult, setSearchResult] = useState([])
  const [hasSeenWelcome, setHasSeenWelcome] = useState(false)
  const [notfound , setNotfound] = useState(false)

  const [userdet, setUserdet] = useState({
    id: '',
    username: '',
    email: '',
    firstName: '',
    lastName: '',
    gender: '',
    image: '',
    accessToken: '',
    refreshToken: '',
  })

  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cart))
  }, [cart])

  useEffect(() => {
    if (!userdet.id) {
      setHasSeenWelcome(false)
    }
  }, [userdet.id])

  const addToCart = (product) => {
    setCart((prevCart) => {
      const existingItem = prevCart.find((item) => item.id === product.id)

      if (existingItem) {
        return prevCart.map((item) =>
          item.id === product.id
            ? { ...item, quantity: (item.quantity || 1) + 1 }
            : item
        )
      }

      return [...prevCart, { ...product, quantity: 1 }]
    })
  }

  if (!userdet.id) {
    return <Login setUserdet={setUserdet} />
  }

  if (!hasSeenWelcome) {
    return (
      <WelcomePage
        userdet={userdet}
        setUserdet={setUserdet}
        onContinue={() => setHasSeenWelcome(true)}
      />
    )
  }

  return (
    <div className="app-shell">
      <Nav
        cart={cart}
        setSearchResult={setSearchResult}
        setLoading={setLoading}
        setNotfound={setNotfound}
      />

      <Routes>
        <Route path="/" element={<Products addToCart={addToCart} />} />
        <Route path="/home" element={<Navigate to="/" replace />} />
        <Route
          path="/search"
          element={
            <SearchResult
              
              searchResult={searchResult}
              addToCart={addToCart}
              clearSearch={() => setSearchResult([])}
            />
          }
        />
        <Route path="/cart" element={<CartPage cart={cart} setCart={setCart} />} />
        <Route path="/profile" element={<Profile userdet={userdet} />} />
        <Route path="/login" element={<Login setUserdet={setUserdet} />} />
        <Route path="/welcome" element={<Navigate to="/" replace />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      {loading && (
        <div className="global-loader">
          {loading && <Loading />}
          {notfound && <NotFound />}
        </div>
      )}
    </div>
  )
}

export default App