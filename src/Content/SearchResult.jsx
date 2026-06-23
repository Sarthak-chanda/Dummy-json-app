import ProductCard from './ProductCard'
import { useNavigate } from 'react-router-dom'
import './SearchResult.css'

const SearchResult = ({ searchResult, addToCart, removeFromCart, cart, wishlist, toggleWishlist, clearSearch }) => {
  const navigate = useNavigate()

  return (
    <div className="search-page">
      <div className="search-page-top">
        <h1 className="cart-page-title">Search Results</h1>
      </div>

      {searchResult.length === 0 ? (
        <div className="empty-search">
          <h2>No products found</h2>
        </div>
      ) : (
        <div className="results-grid">
          {searchResult.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              addToCart={addToCart}
              removeFromCart={removeFromCart}
              cart={cart}
              wishlist={wishlist}
              toggleWishlist={toggleWishlist}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export default SearchResult