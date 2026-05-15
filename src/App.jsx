import { useEffect, useMemo, useState } from 'react'
import './App.css'
import Nav from './Content/Navbar/Nav'
import SearchResult from './Content/SearchResult'
import Loading from './Loading'
import NotFound from './NotFound'
import CartPage from './Content/Cartpage'
import Products from './Content/Products'
import Login from './Login/Login'
import WelcomePage from './Login/Welcome' // Assuming it's in the same folder

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
  const [notFound, setNotFound] = useState(false)
  const [cart, setCart] = useState(getSavedCart)
  const [searchResult, setSearchResult] = useState([])
  const [showCart, setShowCart] = useState(false)
  
  // Controls if we are seeing the Welcome screen or the actual Products
  const [hasSeenWelcome, setHasSeenWelcome] = useState(false)

  const [userdet, setUserdet] = useState({
    id: '',
    username: '',
    email: "",
    firstName: "",
    lastName: "",
    gender: "",
    image: "",
    accessToken: "", 
    refreshToken: "" 
  })

  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cart))
  }, [cart])

  // If user logs out, reset the welcome screen state too
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

  const activeView = useMemo(() => {
    if (loading) return 'loading'
    if (notFound) return 'notfound'
    if (showCart) return 'cart'
    if (searchResult.length > 0) return 'search'
    return 'home'
  }, [loading, notFound, showCart, searchResult.length])

  // --- PAGINATION LOGIC ---
  
  // STEP 1: If no user is logged in, show ONLY Login
  if (!userdet.id) {
    return <Login setUserdet={setUserdet} />
  }

  // STEP 2: If logged in but hasn't dismissed Welcome page, show ONLY Welcome
  if (!hasSeenWelcome) {
    return (
      <WelcomePage 
        userdet={userdet} 
        setUserdet={setUserdet} 
        onContinue={() => setHasSeenWelcome(true)} 
      />
    )
  }

  // STEP 3: If logged in AND welcomed, show the full Store app
  return (
    <div className="app-shell">
      <Nav
        cart={cart}
        setSearchResult={setSearchResult}
        setShowCart={setShowCart}
        setLoading={setLoading}
        setNotFound={setNotFound}
      />

      {activeView === 'loading' && <Loading />}
      {activeView === 'notfound' && <NotFound />}

      <div
        className="home-stage"
        style={{ display: activeView === 'home' ? 'block' : 'none' }}
      >
        <Products addToCart={addToCart} />
      </div>

      {activeView === 'search' && (
        <SearchResult
          searchResult={searchResult}
          addToCart={addToCart}
          clearSearch={() => {
            setSearchResult([])
            setNotFound(false)
            window.scrollTo({ top: 0, behavior: 'smooth' })
          }}
        />
      )}

      {activeView === 'cart' && (
        <CartPage
          cart={cart}
          setCart={setCart}
          setShowCart={setShowCart}
        />
      )}
    </div>
  )
}

export default App