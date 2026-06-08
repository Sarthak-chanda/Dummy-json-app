import { useEffect, useState } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import './App.css'

import Nav from './Content/Navbar/Nav'
import SearchResult from './Content/SearchResult'
import Loading from './Loading'
import NotFound from './NotFound'
import Cartpage from './Content/Cartpage.jsx'
import Products from './Content/Products'
import Login from './Login/Login.jsx'
import WelcomePage from './Login/Welcome.jsx'
import ProfilePage from './Content/ProfilePage.jsx'
import ProductPage from './Content/ProductPage.jsx'

// Safe local storage initialization helper for Cart
const getSavedCart = () => {
  try {
    const saved = localStorage.getItem('cart')
    return saved ? JSON.parse(saved) : []
  } catch {
    return []
  }
}

// FIX: Safe, synchronous initial hydration helper for authenticating User Data
const getSavedUserDet = () => {
  try {
    const saved = localStorage.getItem('userdet')
    if (saved) {
      const parsed = JSON.parse(saved);
      // Map properties cleanly to match the shape expected throughout your routing structures
      return {
        id: parsed.userId || parsed.id || '',
        username: parsed.username || '',
        email: parsed.email || '',
        firstName: parsed.firstName || '',
        lastName: parsed.lastName || '',
        gender: parsed.gender || '',
        image: parsed.image || '',
        accessToken: parsed.accessToken || '',
        refreshToken: parsed.refreshToken || '',
      }
    }
  } catch (error) {
    console.error("Failed parsing user session from local storage:", error)
  }
  
  return {
    id: '',
    username: '',
    email: '',
    firstName: '',
    lastName: '',
    gender: '',
    image: '',
    accessToken: '',
    refreshToken: '',
  }
}

const App = () => {
  const [loading, setLoading] = useState(false)
  const [cart, setCart] = useState(getSavedCart)
  const [searchResult, setSearchResult] = useState([])
  const [hasSeenWelcome, setHasSeenWelcome] = useState(false)
  const [notfound , setNotfound] = useState(false)
  
  // FIX: Initialize user data synchronously directly from localStorage on load
  const [userdet, setUserdet] = useState(getSavedUserDet)
  
  // Initialize logindata using parsed user profile structure directly
  const [logindata, setLogindata] = useState(() => {
    try {
      const saved = localStorage.getItem('userdet')
      return saved ? JSON.parse(saved) : null
    } catch {
      return null
    }
  })

  // Sync cart adjustments to disk
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cart))
  }, [cart])

  // Synchronize state values if the active user profile changes or clears out
  useEffect(() => {
    if (!userdet.id) {
      setHasSeenWelcome(false)
      setLogindata(null)
    } else {
      setLogindata(userdet)
    }
  }, [userdet])

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

  // Intercept layout if user credentials do not exist on the client machine
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
        userdet={userdet}
        cart={cart}
        setSearchResult={setSearchResult}
        setLoading={setLoading}
        setNotfound={setNotfound}
      />

      <Routes>
        <Route path="/" element={<Products addToCart={addToCart} />} />
        <Route path="/home" element={<Navigate to="/" replace />} />
        <Route
          path="/searchresult/:p_name"
          element={
            <SearchResult
              searchResult={searchResult}
              addToCart={addToCart}
              clearSearch={() => setSearchResult([])}
            />
          }
        />
        <Route path="/:userid/:username/cart" element={<Cartpage cart={cart} setCart={setCart} />} />
        <Route path="/p/:p_name/:p_id" element={<ProductPage addToCart={addToCart} />} />
        <Route path="/:username/profile" element={<ProfilePage userdet={userdet} />} />
        <Route path="/login" element={<Login setUserdet={setUserdet} />} />
        <Route path="/welcome" element={<WelcomePage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      {loading && (
        <div className="global-loader">
          <Loading />
          {notfound && <NotFound />}
        </div>
      )}
    </div>
  )
}

export default App