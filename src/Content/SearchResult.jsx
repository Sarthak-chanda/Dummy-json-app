import ProductCard from './ProductCard'
import { useNavigate } from 'react-router-dom'
import './SearchResult.css'

const SearchResult = ({ searchResult, addToCart, clearSearch }) => {
  const navigate = useNavigate()

  const handleBack = () => {
    if (clearSearch) clearSearch()
    navigate(-1)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <div className="search-page">
      {/* Floating Glass Back Button (Aligned to Nav Bounds) */}
      <div className="pp-back-btn-container">
        <div className="pp-back-btn-wrapper">
          <button className="simple-back-btn" onClick={handleBack}>
             <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
               <path d="m15 18-6-6 6-6"/>
             </svg>
             Back
          </button>
        </div>
      </div>

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
            />
          ))}
        </div>
      )}
    </div>
  )
}

export default SearchResult