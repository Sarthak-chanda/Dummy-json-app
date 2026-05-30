import { useNavigate } from 'react-router-dom'
import Cart from './Cart'
import Logo from './Logo'
import Profile from './Profile'
import Searchbar from './Searchbar'

const Nav = ({ cart, setSearchResult, setLoading, setNotfound }) => {
  const navigate = useNavigate()
  const cart_count = cart.length

  return (
    <div className="nav">
      <div onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>
        <Logo />
      </div>

      <Searchbar
        setSearchResult={setSearchResult}
        setLoading={setLoading}
        setNotfound={setNotfound}
      />

      <Cart cart_count={cart_count} />

      <div onClick={() => navigate('/profile')} style={{ cursor: 'pointer' }}>
        <Profile />
      </div>
    </div>
  )
}

export default Nav