import { useEffect, useState } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import { supabase } from './Login/supabaseClient'
import './App.css'

import Nav from './Content/Navbar/Nav'
import SearchResult from './Content/SearchResult'
import Loading from './Loading'
import NotFound from './NotFound'
import Cartpage from './Content/Cartpage.jsx'
import WishlistPage from './Content/WishlistPage.jsx'
import CategoryPage from './Content/CategoryPage.jsx'
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

const getSavedWishlist = () => {
  try {
    const saved = localStorage.getItem('wishlist')
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
      const emailPrefix = parsed.email ? parsed.email.split('@')[0] : '';
      
      // Map properties cleanly to match the shape expected throughout your routing structures
      return {
        id: parsed.userId || parsed.id || '',
        username: parsed.username || '',
        email: parsed.email || '',
        emailPrefix: emailPrefix,
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
    emailPrefix: '',
    firstName: '',
    lastName: '',
    gender: '',
    image: '',
    accessToken: '',
    refreshToken: '',
  }
}

const App = () => {
  const [loading, setLoading] = useState(true)
  const [cart, setCart] = useState(getSavedCart)
  const [wishlist, setWishlist] = useState(getSavedWishlist)
  const [searchResult, setSearchResult] = useState([])
  const [hasSeenWelcome, setHasSeenWelcome] = useState(false)
  const [notfound , setNotfound] = useState(false)
  
  // FIX: Initialize user data synchronously directly from localStorage on load
  const [userdet, setUserdet] = useState(getSavedUserDet)
  
  // Initial loading pulse for page refreshes
  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1500);
    return () => clearTimeout(timer);
  }, []);

  // Supabase Cart Sync
  useEffect(() => {
    const syncCartWithSupabase = async () => {
      if (!userdet.id) return;

      try {
        const { data, error } = await supabase
          .from('carts')
          .select('cart_items')
          .eq('user_id', userdet.id)
          .maybeSingle();

        if (data && data.cart_items) {
          setCart(data.cart_items);
        }
      } catch (err) {
        console.error("Error fetching cart from Supabase:", err);
      }
    };

    syncCartWithSupabase();
  }, [userdet.id]);

  useEffect(() => {
    const updateSupabaseCart = async () => {
      if (!userdet.id) return;

      try {
        await supabase
          .from('carts')
          .upsert({ user_id: userdet.id, cart_items: cart }, { onConflict: 'user_id' });
      } catch (err) {
        console.error("Error updating cart in Supabase:", err);
      }
    };

    const timeoutId = setTimeout(updateSupabaseCart, 2000); 
    return () => clearTimeout(timeoutId);
  }, [cart, userdet.id]);

  // Supabase Wishlist Sync
  useEffect(() => {
    const syncWishlistWithSupabase = async () => {
      if (!userdet.id) return;

      try {
        const { data, error } = await supabase
          .from('wishlists')
          .select('wishlist_items')
          .eq('user_id', userdet.id)
          .maybeSingle();

        if (data && data.wishlist_items) {
          setWishlist(data.wishlist_items);
        }
      } catch (err) {
        console.error("Error fetching wishlist from Supabase:", err);
      }
    };

    syncWishlistWithSupabase();
  }, [userdet.id]);

  useEffect(() => {
    const updateSupabaseWishlist = async () => {
      if (!userdet.id) return;

      try {
        await supabase
          .from('wishlists')
          .upsert({ user_id: userdet.id, wishlist_items: wishlist }, { onConflict: 'user_id' });
      } catch (err) {
        console.error("Error updating wishlist in Supabase:", err);
      }
    };

    const timeoutId = setTimeout(updateSupabaseWishlist, 2000); 
    return () => clearTimeout(timeoutId);
  }, [wishlist, userdet.id]);

  // Initialize logindata using parsed user profile structure directly
  const [logindata, setLogindata] = useState(() => {
    try {
      const saved = localStorage.getItem('userdet')
      return saved ? JSON.parse(saved) : null
    } catch {
      return null
    }
  })

  // Sync states to disk
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cart))
  }, [cart])

  useEffect(() => {
    localStorage.setItem('wishlist', JSON.stringify(wishlist))
  }, [wishlist])

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
    if (!userdet.id) {
      window.location.href = "/login";
      return;
    }

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

  const toggleWishlist = (product) => {
    if (!userdet.id) {
      window.location.href = "/login";
      return;
    }

    setWishlist((prev) => {
      const isExist = prev.find(item => item.id === product.id);
      if (isExist) {
        return prev.filter(item => item.id !== product.id);
      }
      return [...prev, product];
    });
  }

  return (
    <div className="app-shell">
      <Nav
        userdet={userdet}
        cart={cart}
        wishlist={wishlist}
        setSearchResult={setSearchResult}
        setLoading={setLoading}
        setNotfound={setNotfound}
      />

      <Routes>
        <Route path="/" element={<Products addToCart={addToCart} cart={cart} wishlist={wishlist} toggleWishlist={toggleWishlist} />} />
        <Route path="/category/:categoryName" element={<CategoryPage addToCart={addToCart} cart={cart} wishlist={wishlist} toggleWishlist={toggleWishlist} />} />
        <Route path="/home" element={<Navigate to="/" replace />} />
        <Route
          path="/searchresult/:p_name"
          element={
            <SearchResult
              searchResult={searchResult}
              addToCart={addToCart}
              cart={cart}
              wishlist={wishlist}
              toggleWishlist={toggleWishlist}
              clearSearch={() => setSearchResult([])}
            />
          }
        />
        <Route path="/:emailPrefix/cart" element={<Cartpage cart={cart} setCart={setCart} />} />
        <Route path="/:emailPrefix/wishlist" element={<WishlistPage wishlist={wishlist} toggleWishlist={toggleWishlist} addToCart={addToCart} />} />
        <Route path="/p/:p_name/:p_id" element={<ProductPage addToCart={addToCart} cart={cart} wishlist={wishlist} toggleWishlist={toggleWishlist} />} />
        <Route 
          path="/:emailPrefix/profile" 
          element={userdet.id ? <ProfilePage userdet={userdet} cart={cart} wishlist={wishlist} /> : <Navigate to="/login" replace />} 
        />
        <Route path="/login" element={<Login setUserdet={setUserdet} />} />
        <Route path="/welcome" element={<WelcomePage userdet={userdet} setUserdet={setUserdet} onContinue={() => setHasSeenWelcome(true)} />} />
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