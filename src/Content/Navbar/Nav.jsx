import Cart from "./Cart";
import Logo from "./Logo";
import Profile from "./Profile";
import Searchbar from "./Searchbar";

const Nav = ({ cart, setSearchResult, setLoading, setNotFound, setShowCart }) => {
  const cart_count = cart.length;

  return (
    <div className="nav">
      <Logo />
      <Searchbar
        setSearchResult={setSearchResult}
        setLoading={setLoading}
        setNotFound={setNotFound}
        setShowCart={setShowCart}
      />
      <Cart
        cart_count={cart_count}
        setShowCart={setShowCart}
        setNotFound={setNotFound}
        setLoading={setLoading}
      />
      <Profile />
    </div>
  );
};

export default Nav;