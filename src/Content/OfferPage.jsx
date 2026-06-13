import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import ProductCard from "./ProductCard";
import "./OfferPage.css";
import Loading from "../Loading";

const OfferPage = ({ addToCart, cart, wishlist, toggleWishlist }) => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [showAllCategories, setShowAllCategories] = useState(false);

  useEffect(() => {
    const fetchOffers = async () => {
      try {
        setLoading(true);
        let allProducts = [];
        const saved = sessionStorage.getItem("products");
        
        if (saved) {
          allProducts = JSON.parse(saved);
        } else {
          const response = await fetch("https://dummyjson.com/products?limit=194");
          const data = await response.json();
          allProducts = data.products;
          sessionStorage.setItem("products", JSON.stringify(allProducts));
        }

        const discounted = allProducts.filter(p => p.discountPercentage > 12);
        setProducts(discounted);
      } catch (error) {
        console.error("Error fetching offers:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchOffers();
  }, []);

  const categories = ["All", ...new Set(products.map(p => p.category))];
  const displayedCategories = showAllCategories ? categories : categories.slice(0, 8);

  const filteredProducts = products.filter(p => {
    return selectedCategory === "All" || p.category === selectedCategory;
  });

  if (loading) return <Loading />;

  return (
    <div className="offer-page-container">
      {/* Top Banner - Clickable */}
      <div className="offer-hero-banner" onClick={() => navigate("/")}>
        <div className="offer-hero-overlay" />
        <div className="offer-hero-content">
          <div className="offer-badge">Flash Sale</div>
          <h1>Unlock Extraordinary Savings</h1>
          <p>Curated deals across all categories. Up to 40% off for a limited time.</p>
        </div>
      </div>

      {/* Modern Category Filter Bar */}
      <div className="offer-filter-wrapper">
        <div className={`offer-category-bar ${showAllCategories ? 'expanded' : ''}`}>
          {displayedCategories.map(cat => (
            <button 
              key={cat} 
              className={`cat-pill ${selectedCategory === cat ? 'active' : ''}`}
              onClick={() => setSelectedCategory(cat)}
            >
              {cat.replace("-", " ")}
            </button>
          ))}
          {categories.length > 8 && (
            <button 
              className="cat-show-more"
              onClick={(e) => {
                e.stopPropagation();
                setShowAllCategories(!showAllCategories);
              }}
            >
              {showAllCategories ? "Show Less" : "Show More"}
            </button>
          )}
        </div>
      </div>

      <div className="offer-grid">
        {filteredProducts.length > 0 ? (
          filteredProducts.map(product => (
            <ProductCard 
              key={product.id}
              product={product}
              addToCart={addToCart}
              cart={cart}
              wishlist={wishlist}
              toggleWishlist={toggleWishlist}
            />
          ))
        ) : (
          <div className="no-offers">
            <h2>No deals found</h2>
            <p>Our scouts are searching for new offers. Check back soon!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default OfferPage;