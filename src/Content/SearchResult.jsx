import ProductCard from "./ProductCard";



const SearchResult = ({
  searchResult,
  addToCart,
  clearSearch,
}) => {
  return (
    <div className="search-page">
      <div className="search-page-top">
        <button
          className="simple-back-btn"
          onClick={clearSearch}
        >
          ← Back
        </button>

        <h1 className="cart-page-title">
          Search Results
        </h1>
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
  );
};

export default SearchResult;