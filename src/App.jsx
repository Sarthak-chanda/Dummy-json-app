import { useEffect, useState } from 'react'
import { Navigate, Route, Routes, useLocation, useNavigate } from 'react-router-dom'
import { supabase } from './Login/supabaseClient'
import './App.css'

import Nav from './Content/Navbar/Nav'
import SearchResult from './Content/SearchResult'
import Loading from './Loading'
import NotFound from './NotFound'
import Cartpage from './Content/Cartpage.jsx'
import WishlistPage from './Content/WishlistPage.jsx'
import CategoryPage from './Content/CategoryPage.jsx'
import Categories from './Content/Categories.jsx'
import Products from './Content/Products'
import OfferPage from './Content/OfferPage'
import Login from './Login/Login.jsx'
import WelcomePage from './Login/Welcome.jsx'
import ProfilePage from './Content/ProfilePage.jsx'
import ProductPage from './Content/ProductPage.jsx'

// Safe local storage initialization helper for Cart
const getSavedCart = (emailPrefix) => {
  if (!emailPrefix) return [];
  try {
    const saved = localStorage.getItem(`cart_${emailPrefix}`);
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
}

const getSavedWishlist = (emailPrefix) => {
  if (!emailPrefix) return [];
  try {
    const saved = localStorage.getItem(`wishlist_${emailPrefix}`);
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
}

// FIX: Safe, synchronous initial hydration helper for authenticating User Data
const getSavedUserDet = () => {
  try {
    const saved = localStorage.getItem('userdet')
    if (saved) {
      const parsed = JSON.parse(saved);
      const emailPrefix = parsed.email ? parsed.email.split('@')[0] : '';
      
      return {
        id: parsed.id || parsed.userId || '',
        username: parsed.username || parsed.full_name || parsed.name || '',
        email: parsed.email || '',
        emailPrefix: emailPrefix,
        firstName: parsed.firstName || '',
        lastName: parsed.lastName || '',
        gender: parsed.gender || '',
        image: parsed.image || parsed.avatar_url || '',
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

const ScrollToTop = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
};

const App = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  
  // FIX: Initialize user data synchronously directly from localStorage on load
  const initialUserDet = getSavedUserDet();
  const [userdet, setUserdet] = useState(initialUserDet);
  const [authLoading, setAuthLoading] = useState(true);

  // Initialize cart and wishlist using the parsed emailPrefix
  const [cart, setCart] = useState(() => getSavedCart(initialUserDet.emailPrefix));
  const [wishlist, setWishlist] = useState(() => getSavedWishlist(initialUserDet.emailPrefix));
  
  const [searchResult, setSearchResult] = useState([]);
  const [hasSeenWelcome, setHasSeenWelcome] = useState(false);
  const [notfound , setNotfound] = useState(false);

  // Listen for Auth changes (needed for Social Login redirect)
  useEffect(() => {
    const initAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        handleSessionUpdate(session);
      }
      setAuthLoading(false);
    };

    const handleSessionUpdate = (session) => {
      const user = session.user;
      const emailPrefix = user.email ? user.email.split('@')[0] : '';
      const mappedData = {
        id: user.id,
        username: user.user_metadata?.full_name || user.user_metadata?.name || 'Marketplace User',
        email: user.email,
        emailPrefix: emailPrefix,
        image: user.user_metadata?.avatar_url || '',
        accessToken: session.access_token,
      };
      localStorage.setItem('userdet', JSON.stringify(mappedData));
      setUserdet(mappedData);
      
      // Update local storage items based on new user
      setCart(getSavedCart(emailPrefix));
      setWishlist(getSavedWishlist(emailPrefix));
    };

    initAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if ((event === 'SIGNED_IN' || event === 'USER_UPDATED') && session) {
        handleSessionUpdate(session);
        setAuthLoading(false);
      } else if (event === 'SIGNED_OUT') {
        setAuthLoading(false);
        setCart([]);
        setWishlist([]);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // Hide Nav on Login and Welcome pages
  const hideNav = location.pathname === '/login' || location.pathname === '/welcome';
  
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

  // Sync states to disk using isolated prefix
  useEffect(() => {
    if (userdet.emailPrefix) {
      localStorage.setItem(`cart_${userdet.emailPrefix}`, JSON.stringify(cart));
    }
  }, [cart, userdet.emailPrefix]);

  useEffect(() => {
    if (userdet.emailPrefix) {
      localStorage.setItem(`wishlist_${userdet.emailPrefix}`, JSON.stringify(wishlist));
    }
  }, [wishlist, userdet.emailPrefix]);

  const addToCart = (product) => {
    if (!userdet.id) {
      navigate("/login");
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
      navigate("/login");
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
      <ScrollToTop />
      {!hideNav && (
        <Nav
          userdet={userdet}
          cart={cart}
          wishlist={wishlist}
          setSearchResult={setSearchResult}
          setLoading={setLoading}
          setNotfound={setNotfound}
        />
      )}

      <div className={location.pathname !== '/' && !hideNav ? "pt-[60px]" : ""}>
        <Routes>
          <Route path="/" element={<Products addToCart={addToCart} cart={cart} wishlist={wishlist} toggleWishlist={toggleWishlist} />} />
          <Route path="/categories" element={<Categories />} />
          <Route path="/offer/:offerId" element={<OfferPage addToCart={addToCart} cart={cart} wishlist={wishlist} toggleWishlist={toggleWishlist} />} />
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
            element={userdet.id ? <ProfilePage userdet={userdet} setUserdet={setUserdet} cart={cart} wishlist={wishlist} /> : <Navigate to="/login" replace />} 
          />
          <Route path="/login" element={<Login setUserdet={setUserdet} authLoading={authLoading} />} />
          <Route path="/welcome" element={<WelcomePage userdet={userdet} setUserdet={setUserdet} onContinue={() => setHasSeenWelcome(true)} authLoading={authLoading} />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>

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