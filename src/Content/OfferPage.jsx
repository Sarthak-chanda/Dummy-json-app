import { useEffect, useState } from "react";
import { useNavigate, useLocation, useParams } from "react-router-dom";
import ProductCard from "./ProductCard";
import "./OfferPage.css";
import Loading from "../Loading";

const OfferPage = ({ addToCart, cart, wishlist, toggleWishlist }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { offerValue } = useParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [showAllCategories, setShowAllCategories] = useState(false);

  // Retrieve the passed banner data from location state, or use a default based on the URL parameter
  const activeBanner = location.state?.banner || {
    title: offerValue ? decodeURIComponent(offerValue) : "Unlock Extraordinary Savings",
    subtitle: "Curated deals across all categories. Up to 40% off for a limited time.",
    img: "https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?auto=format&fit=crop&w=1600&q=80",
    gradient: "rgba(15, 23, 42, 0.95)"
  };

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
      {/* Top Banner - Sync with Home Page Selection */}
      <div className="offer-hero-banner" onClick={() => navigate("/")}>
        <img src={activeBanner.img} alt="offer banner" className="hero-bg-img" />
        <div 
          className="offer-hero-overlay" 
          style={{ 
            background: `linear-gradient(90deg, ${activeBanner.gradient} 0%, rgba(15, 23, 42, 0.6) 35%, rgba(15, 23, 42, 0.1) 100%)` 
          }} 
        />
        <div className="offer-hero-content">
          <div className="banner-text-area">
            <div className="offer-badge">Flash Sale</div>
            <h1>{activeBanner.title}</h1>
            <p>{activeBanner.subtitle}</p>
          </div>
          
          {/* Back to Home removed as requested */}
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