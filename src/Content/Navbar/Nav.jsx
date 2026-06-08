import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Cart from './Cart'
import Logo from './Logo'
import Profile from './Profile'
import Searchbar from './Searchbar'
import './Nav.css'

const Nav = ({ cart, setSearchResult, setLoading, setNotfound, userdet }) => {
  const navigate = useNavigate()
  const cart_count = cart?.length || 0

  // Scroll state for the floating pill effect
  const [isScrolled, setIsScrolled] = useState(false)
  // Search state for the mobile morphing layout
  const [isSearchActive, setIsSearchActive] = useState(false)

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
    <div className={`nav ${isScrolled ? 'scrolled' : ''} ${isSearchActive ? 'search-mode' : ''}`}>
      
      {/* LEFT: Logo */}
      <div className="nav-left" onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>
        <Logo />
      </div>

      {/* CENTER: Morphing Search Area */}
      <div className="nav-center">
        {/* Back button to close search on mobile */}
        <button className="close-search-btn" onClick={() => setIsSearchActive(false)}>
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="m15 18-6-6 6-6"/>
          </svg>
        </button>
        
        <Searchbar
          setSearchResult={setSearchResult}
          setLoading={setLoading}
          setNotfound={setNotfound}
        />
      </div>

      {/* RIGHT: Cart, Profile, and Mobile Search Trigger */}
      <div className="nav-right">
        {/* Search trigger button (Visible only on tablets/mobile) */}
        <button className="mobile-search-btn" onClick={() => setIsSearchActive(true)}>
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8"/>
            <path d="m21 21-4.3-4.3"/>
          </svg>
        </button>

        <Cart cart_count={cart_count} userdet={userdet} />
        
        {/* Profile Wrapper */}
        <div onClick={() => navigate(`/${userdet?.username}/profile`)}>
          <Profile />
        </div>
      </div>
      
    </div>
  )
}

export default Nav