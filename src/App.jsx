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
import HomePage from './Content/HomePage'
import Products from './Content/Products'
import OfferPage from './Content/OfferPage'
import Login from './Login/Login.jsx'
import WelcomePage from './Login/Welcome.jsx'
import ProfilePage from './Content/ProfilePage.jsx'
import ProductPage from './Content/ProductPage.jsx'
import Footer from './Content/Footer.jsx'
import DummyDisclaimerPage from './Content/DummyDisclaimerPage.jsx'

// --- STORAGE HELPERS ---

const getSavedCart = (userId) => {
  if (!userId) return [];
  try {
    const saved = localStorage.getItem(`userid_${userId}_cart`);
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
}

const getSavedWishlist = (userId) => {
  if (!userId) return [];
  try {
    const saved = localStorage.getItem(`userid_${userId}_wishlist`);
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
}

const getSavedUserDet = () => {
  try {
    const saved = localStorage.getItem('userdet')
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed.id) {
        const persistent = localStorage.getItem(`userid_${parsed.id}_userdata`);
        if (persistent) {
          const fullData = JSON.parse(persistent);
          // Ensure emailPrefix is always present
          if (!fullData.emailPrefix && fullData.email) {
            fullData.emailPrefix = fullData.email.split('@')[0];
          }
          return fullData;
        }
      }
      return {
        id: parsed.id || '',
        username: parsed.username || '',
        email: parsed.email || '',
        emailPrefix: parsed.email ? parsed.email.split('@')[0] : '',
        image: parsed.image || '',
        accessToken: parsed.accessToken || '',
        phone: parsed.phone || '',
        location: parsed.location || '',
        addresses: parsed.addresses || [],
        firstName: parsed.firstName || '',
        lastName: parsed.lastName || '',
        gender: parsed.gender || '',
      }
    }
  } catch (error) {
    console.error("Failed parsing user session:", error)
  }
  return { id: '', username: '', email: '', emailPrefix: '', image: '', accessToken: '', phone: '', location: '', addresses: [], firstName: '', lastName: '', gender: '' };
}

const ScrollToTop = () => {
  const { pathname } = useLocation();
  useEffect(() => { window.scrollTo(0, 0); }, [pathname]);
  return null;
};

// --- MAIN COMPONENT ---

const App = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [authLoading, setAuthLoading] = useState(true);
  
  const [userdet, setUserdet] = useState(getSavedUserDet());
  const [cart, setCart] = useState(() => getSavedCart(userdet.id));
  const [wishlist, setWishlist] = useState(() => getSavedWishlist(userdet.id));
  
  const [searchResult, setSearchResult] = useState([]);
  const [hasSeenWelcome, setHasSeenWelcome] = useState(false);
  const [notfound , setNotfound] = useState(false);

  const handleSessionUpdate = async (session) => {
    if (!session) return;
    const user = session.user;
    const emailPrefix = user.email ? user.email.split('@')[0] : '';
    
    // 1. Fetch profile from Supabase profiles table (The Source of Truth)
    let dbProfile = null;
    try {
      const { data, error } = await supabase
        .from('Profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();
      
      if (data) dbProfile = data;
    } catch (err) {
      console.error("Error fetching db profile:", err);
    }

    // 2. Fetch Addresses from Supabase
    let dbAddresses = [];
    try {
        const { data } = await supabase.from('addresses').select('*').eq('profile_id', user.id);
        if (data) dbAddresses = data;
    } catch (err) {
        console.error("Error fetching addresses:", err);
    }

    // 3. Build the mapped data prioritizing DB over local storage
    const mappedData = {
      id: user.id,
      username: dbProfile?.name || user.user_metadata?.full_name || user.user_metadata?.name || '',
      email: user.email,
      emailPrefix: emailPrefix,
      image: user.user_metadata?.avatar_url || '',
      accessToken: session.access_token,
      phone: dbProfile?.phone || '',
      location: dbProfile?.location || localStorage.getItem(`userid_${user.id}_location`) || '',
      addresses: dbAddresses,
      firstName: user.user_metadata?.first_name || '',
      lastName: user.user_metadata?.last_name || '',
      gender: '',
    };
    
    // 4. Update state and localStorage for persistence
    localStorage.setItem('userdet', JSON.stringify(mappedData));
    localStorage.setItem(`userid_${user.id}_userdata`, JSON.stringify(mappedData));
    
    setUserdet(mappedData);
    setCart(getSavedCart(user.id));
    setWishlist(getSavedWishlist(user.id));
  };

  useEffect(() => {
    const initAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) await handleSessionUpdate(session);
      setAuthLoading(false);
    };

    initAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if ((event === 'SIGNED_IN' || event === 'USER_UPDATED') && session) {
        await handleSessionUpdate(session);
        setAuthLoading(false);
      } else if (event === 'SIGNED_OUT') {
        const resetUser = { id: '', username: '', email: '', emailPrefix: '', image: '', accessToken: '', phone: '', location: '', addresses: [], firstName: '', lastName: '', gender: '' };
        setUserdet(resetUser);
        localStorage.removeItem('userdet');
        setCart([]);
        setWishlist([]);
        setAuthLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // --- SYNC EFFECTS ---

  // Sync Profile to LocalStorage only if we have a valid ID (prevents resetting on logout)
  useEffect(() => {
    if (userdet.id) {
      localStorage.setItem('userdet', JSON.stringify(userdet));
      localStorage.setItem(`userid_${userdet.id}_userdata`, JSON.stringify(userdet));
    }
  }, [userdet]);

  // Sync Cart
  useEffect(() => {
    if (userdet.id) {
      localStorage.setItem(`userid_${userdet.id}_cart`, JSON.stringify(cart));
    }
  }, [cart, userdet.id]);

  // Sync Wishlist
  useEffect(() => {
    if (userdet.id) {
      localStorage.setItem(`userid_${userdet.id}_wishlist`, JSON.stringify(wishlist));
    }
  }, [wishlist, userdet.id]);





  // --- ACTIONS ---

  const addToCart = (product) => {
    if (!userdet.id) { navigate("/login"); return; }
    setCart((prev) => {
      const exist = prev.find(item => item.id === product.id);
      if (exist) return prev.map(item => item.id === product.id ? { ...item, quantity: (item.quantity || 1) + 1 } : item);
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const removeFromCart = (product) => {
    if (!userdet.id) return;
    setCart((prev) => prev.filter(item => String(item.id) !== String(product.id)));
  };

  const toggleWishlist = (product) => {
    if (!userdet.id) { navigate("/login"); return; }
    setWishlist((prev) => {
      const exist = prev.find(item => item.id === product.id);
      return exist ? prev.filter(item => item.id !== product.id) : [...prev, product];
    });
  };

  const hideNav = location.pathname === '/login' || location.pathname === '/welcome';
  useEffect(() => { const t = setTimeout(() => setLoading(false), 1500); return () => clearTimeout(t); }, []);

  return (
    <div className="app-shell global-marble-bg">
      <ScrollToTop />
      {!hideNav && <Nav userdet={userdet} cart={cart} wishlist={wishlist} setSearchResult={setSearchResult} setLoading={setLoading} setNotfound={setNotfound} />}
      <div className={location.pathname !== '/' && !hideNav ? "pt-[60px]" : ""}>
        <Routes>
          <Route path="/" element={<HomePage addToCart={addToCart} removeFromCart={removeFromCart} cart={cart} wishlist={wishlist} toggleWishlist={toggleWishlist} />} />
          <Route path="/products" element={<Products addToCart={addToCart} removeFromCart={removeFromCart} cart={cart} wishlist={wishlist} toggleWishlist={toggleWishlist} />} />
          <Route path="/categories" element={<Categories addToCart={addToCart} removeFromCart={removeFromCart} cart={cart} wishlist={wishlist} toggleWishlist={toggleWishlist} />} />
          <Route path="/offer/:offerId" element={<OfferPage addToCart={addToCart} removeFromCart={removeFromCart} cart={cart} wishlist={wishlist} toggleWishlist={toggleWishlist} />} />
          <Route path="/category/:categoryName" element={<CategoryPage addToCart={addToCart} removeFromCart={removeFromCart} cart={cart} wishlist={wishlist} toggleWishlist={toggleWishlist} />} />
          <Route path="/home" element={<Navigate to="/" replace />} />
          <Route path="/searchresult/:p_name" element={<SearchResult searchResult={searchResult} addToCart={addToCart} removeFromCart={removeFromCart} cart={cart} wishlist={wishlist} toggleWishlist={toggleWishlist} clearSearch={() => setSearchResult([])} />} />
          <Route path="/:emailPrefix/cart" element={<Cartpage cart={cart} setCart={setCart} />} />
          <Route path="/:emailPrefix/wishlist" element={<WishlistPage wishlist={wishlist} toggleWishlist={toggleWishlist} addToCart={addToCart} removeFromCart={removeFromCart} />} />
          <Route path="/p/:p_name/:p_id" element={<ProductPage addToCart={addToCart} removeFromCart={removeFromCart} cart={cart} wishlist={wishlist} toggleWishlist={toggleWishlist} />} />
          <Route path="/:emailPrefix/profile" element={userdet.id ? <ProfilePage userdet={userdet} setUserdet={setUserdet} cart={cart} wishlist={wishlist} /> : <Navigate to="/login" replace />} />
          <Route path="/login" element={<Login setUserdet={setUserdet} authLoading={authLoading} />} />
          <Route path="/welcome" element={<WelcomePage userdet={userdet} setUserdet={setUserdet} onContinue={() => setHasSeenWelcome(true)} authLoading={authLoading} />} />
          <Route path="/disclaimer" element={<DummyDisclaimerPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
      {loading && <div className="global-loader"><Loading />{notfound && <NotFound />}</div>}
      {!hideNav && <Footer userdet={userdet} />}
    </div>
  )
}

export default App