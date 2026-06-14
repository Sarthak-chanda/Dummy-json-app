import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Cart from './Cart'
import WishlistIcon from './WishlistIcon'
import Logo from './Logo'
import Profile from './Profile'
import Searchbar from './Searchbar'
import './Nav.css'

const Nav = ({ cart, wishlist = [], setSearchResult, setLoading, setNotfound, userdet }) => {
  const navigate = useNavigate()
  const cart_count = cart?.length || 0
  const wishlist_count = wishlist?.length || 0

  // Scroll state for the floating pill effect
  const [isScrolled, setIsScrolled] = useState(false)
  // Search state for the mobile morphing layout
  const [isSearchActive, setIsSearchActive] = useState(false)
  // Burger menu state
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  // Prevent body scroll when menu is open
  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isMenuOpen])

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setIsScrolled(true)
      } else {
        setIsScrolled(false)
      }
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <>
      {/* Mobile Menu Backdrop */}
      <div 
        className={`mobile-menu-backdrop ${isMenuOpen ? 'active' : ''}`} 
        onClick={() => setIsMenuOpen(false)}
      ></div>

      {/* Mobile Control Panel (Floating Bottom) */}
      <div className={`mobile-control-panel ${isScrolled ? 'visible' : ''}`}>
        <button className="control-btn" onClick={() => navigate(-1)} aria-label="Go back">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="m15 18-6-6 6-6"/>
          </svg>
        </button>
        
        <button className="control-btn" onClick={() => { navigate('/'); window.scrollTo(0, 0); }} aria-label="Home">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
            <polyline points="9 22 9 12 15 12 15 22"/>
          </svg>
        </button>
        
        <button className="control-btn" onClick={() => setIsSearchActive(true)} aria-label="Search">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8"/>
            <path d="m21 21-4.3-4.3"/>
          </svg>
        </button>
      </div>

      <div className={`nav ${isScrolled ? 'scrolled' : ''} ${isSearchActive ? 'search-mode' : ''}`}>
        
        {/* LEFT: Burger */}
        <div className="nav-left">
          <button className="burger-menu-btn" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              {isMenuOpen ? (
                <path d="M18 6L6 18M6 6l12 12"/>
              ) : (
                <>
                  <line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/>
                </>
              )}
            </svg>
          </button>
        </div>

        {/* LOGO */}
        <div className="nav-logo" onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>
          <Logo />
        </div>

        {/* CENTER: Search Area */}
        <div className="nav-center">
          <button className="close-search-btn" onClick={() => setIsSearchActive(false)}>
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="m15 18-6-6 6-6"/>
            </svg>
          </button>
          
          <Searchbar
            setSearchResult={setSearchResult}
            setLoading={setLoading}
            setNotfound={setNotfound}
          />
        </div>

        {/* RIGHT: Actions */}
        <div className="nav-right">
          <div className="desktop-nav-items">
            <WishlistIcon count={wishlist_count} userdet={userdet} />
            <Cart cart_count={cart_count} userdet={userdet} />
          </div>

          <div 
            className="nav-profile-btn" 
            onClick={() => {
              if (userdet?.id) {
                navigate(`/${userdet.emailPrefix}/profile`)
              } else {
                navigate('/login')
              }
            }}
            style={{ cursor: 'pointer' }}
          >
            <Profile image={userdet?.image} />
          </div>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      <div className={`mobile-menu ${isMenuOpen ? 'open' : ''}`}>
        <div className="mobile-menu-header">
          <div className="mobile-user-profile">
            <div className="mobile-avatar">
              <Profile image={userdet?.image} />
            </div>
            <div className="mobile-user-info">
              {userdet?.id ? (
                <>
                  <h4>{userdet.username || 'User'}</h4>
                  <p>{userdet.email}</p>
                </>
              ) : (
                <>
                  <h4>Welcome Guest</h4>
                  <p onClick={() => { navigate('/login'); setIsMenuOpen(false); }} style={{ color: '#2563eb', cursor: 'pointer', fontWeight: 600 }}>Sign in to your account</p>
                </>
              )}
            </div>
          </div>
          <button className="mobile-menu-close" onClick={() => setIsMenuOpen(false)}>
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 6L6 18M6 6l12 12"/>
            </svg>
          </button>
        </div>

        <div className="mobile-menu-content">
          <div className="mobile-menu-section">
            <label>Shopping</label>
            <div className="mobile-menu-item" onClick={() => { navigate('/'); setIsMenuOpen(false); }}>
              <div className="item-icon"><svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg></div>
              <span>Home</span>
              <div className="item-arrow"><svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg></div>
            </div>
            <div className="mobile-menu-item" onClick={() => { 
              if (userdet?.id) {
                navigate(`/${userdet.emailPrefix}/wishlist`)
              } else {
                navigate('/login')
              }
              setIsMenuOpen(false); 
            }}>
              <div className="item-icon">
                <svg viewBox="0 0 24 24" width="22" height="22" fill={wishlist_count > 0 ? "#ff4d4f" : "none"} stroke={wishlist_count > 0 ? "#ff4d4f" : "currentColor"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                </svg>
              </div>
              <span>Wishlist</span>
              {wishlist_count > 0 && <span className="item-badge">{wishlist_count}</span>}
              <div className="item-arrow"><svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg></div>
            </div>
            <div className="mobile-menu-item" onClick={() => { 
              if (userdet?.id) {
                navigate(`/${userdet.emailPrefix}/cart`)
              } else {
                navigate('/login')
              }
              setIsMenuOpen(false); 
            }}>
              <div className="item-icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="8" cy="21" r="1" /><circle cx="19" cy="21" r="1" /><path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12" /></svg>
              </div>
              <span>My Cart</span>
              {cart_count > 0 && <span className="item-badge green">{cart_count}</span>}
              <div className="item-arrow"><svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg></div>
            </div>
          </div>

          <div className="mobile-menu-section">
            <label>Account</label>
            <div className="mobile-menu-item" onClick={() => {
              if (userdet?.id) {
                navigate(`/${userdet.emailPrefix}/profile`)
              } else {
                navigate('/login')
              }
              setIsMenuOpen(false);
            }}>
              <div className="item-icon"><svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg></div>
              <span>Profile Settings</span>
              <div className="item-arrow"><svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg></div>
            </div>
            {userdet?.id && (
              <div className="mobile-menu-item logout" onClick={() => {
                localStorage.removeItem('userdet');
                window.location.reload();
                setIsMenuOpen(false);
              }}>
                <div className="item-icon"><svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg></div>
                <span>Logout</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  )
}

export default Nav
