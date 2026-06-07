import ProductCard from './ProductCard'
import { useNavigate } from 'react-router-dom'

const SearchResult = ({ searchResult, addToCart, clearSearch }) => {
  const navigate = useNavigate()

  const handleBack = () => {
    if (clearSearch) clearSearch()
    navigate(-1)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <div className="search-page">
      <div className="search-page-top">
        <button className="simple-back-btn" onClick={handleBack}>
          ← Back
        </button>

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
            />
          ))}
        </div>
      )}
    </div>
  )
}

export default SearchResult