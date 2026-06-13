import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import ProductCard from "./ProductCard";
import "./Products.css";
import Loading from "../Loading";

const banners = [
  {
    title: "Discover Amazing Products",
    subtitle: "Shop electronics, beauty, fashion, and more.",
    bg: "#020617",
    img: "https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?auto=format&fit=crop&w=1600&q=80"
  },
  {
    title: "Summer Sale is Live!",
    subtitle: "Get up to 50% off on all seasonal fashion.",
    bg: "#0c0a09",
    img: "https://images.pexels.com/photos/5868272/pexels-photo-5868272.jpeg?auto=compress&cs=tinysrgb&w=1600"
  },
  {
    title: "Next-Gen Tech",
    subtitle: "Explore the latest smartphones and gadgets.",
    bg: "#020617",
    img: "https://images.unsplash.com/photo-1498049794561-7780e7231661?auto=format&fit=crop&w=1600&q=80"
  }
];

const funzoneBanners = [
  {
    title: "🎮 Gamer's Haven",
    subtitle: "Level up your setup with premium peripherals.",
    img: "https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=1200&q=80",
    bg: "#4338ca"
  },
  {
    title: "💄 Beauty Bliss",
    subtitle: "Glow up with our exclusive skincare collection.",
    img: "https://images.unsplash.com/photo-1596462502278-27bfdc4033c8?auto=format&fit=crop&w=1200&q=80",
    bg: "#db2777"
  }
];

const Products = ({ addToCart, cart, wishlist, toggleWishlist }) => {
  const navigate = useNavigate();
  const [products, setProducts] = useState(() => {
    try {
      const saved = sessionStorage.getItem("products");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [loading, setLoading] = useState(products.length === 0);
  const [currentBanner, setCurrentBanner] = useState(0);

  useEffect(() => {
    const bannerInterval = setInterval(() => {
      setCurrentBanner((prev) => (prev + 1) % banners.length);
    }, 5000);
    return () => clearInterval(bannerInterval);
  }, []);

  useEffect(() => {
    if (products.length > 0) {
      setLoading(false);
      return;
    }

    const fetchProducts = async () => {
      try {
        setLoading(true);
        const response = await fetch(
          "https://dummyjson.com/products?limit=194"
        );
        const data = await response.json();

        setProducts(data.products);
        sessionStorage.setItem("products", JSON.stringify(data.products));
      } catch (error) {
        console.error("Error fetching marketplace catalog:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []); 

  const groupedProducts = products.reduce((acc, product) => {
    const category = product.category;
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(product);
    return acc;
  }, {});

  const hotDeals = products.filter(p => p.discountPercentage > 15).slice(0, 15);

  if (loading) {
    return <Loading />;
  }

  const categoryEntries = Object.entries(groupedProducts);

  return (
    <div className="products-container">
      
      {/* Hero Banner - Full Width with 2-Row Layout */}
      <div className="products-hero" style={{ backgroundColor: banners[currentBanner].bg }}>
        <img src={banners[currentBanner].img} alt="banner" className="hero-bg-img" />
        <div className="hero-overlay" />
        <div className="hero-inner-content">
          <h1 className="banner-main-title">{banners[currentBanner].title}</h1>
          
          <div className="banner-bottom-row">
            <p className="banner-sub-text">{banners[currentBanner].subtitle}</p>
            <button className="banner-cta" onClick={() => navigate("/offers")}>
              Explore
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/>
              </svg>
            </button>
          </div>

          <div className="banner-indicators-bottom">
            {banners.map((_, i) => (
              <span key={i} className={`indicator ${i === currentBanner ? 'active' : ''}`} />
            ))}
          </div>
        </div>
      </div>

      <div className="products-content-wrapper">
        {/* Hot Deals Section */}
        {hotDeals.length > 0 && (
          <CategoryRow
            category="🔥 Hot Deals"
            products={hotDeals}
            addToCart={addToCart}
            cart={cart}
            wishlist={wishlist}
            toggleWishlist={toggleWishlist}
          />
        )}

        {/* Categories Grid Rows with Interstitial Banners */}
        {categoryEntries.map(([category, categoryProducts], index) => (
          <div key={category}>
            <CategoryRow
              category={category}
              products={categoryProducts}
              addToCart={addToCart}
              cart={cart}
              wishlist={wishlist}
              toggleWishlist={toggleWishlist}
            />
            
            {/* Inject dynamic interstitial sections every 5-6 categories */}
            {(index + 1) % 5 === 0 && (
              <div className="interstitial-section">
                {Math.floor(index / 5) % 3 === 0 ? (
                  <div className="interstitial-rating-banner">
                    <div className="rating-info">
                      <h2>Highly Rated</h2>
                      <p>Top products loved by our community with 4.5+ stars.</p>
                      <button onClick={() => navigate("/offers")}>View Best Sellers</button>
                    </div>
                    <div className="rating-stars">
                      {"★".repeat(5)}
                    </div>
                  </div>
                ) : Math.floor(index / 5) % 3 === 1 ? (
                  <div className="interstitial-price-filter">
                    <h3>Budget Friendly?</h3>
                    <div className="price-pills">
                      <button onClick={() => navigate("/offers")}>Under $20</button>
                      <button onClick={() => navigate("/offers")}>$20 - $50</button>
                      <button onClick={() => navigate("/offers")}>$50 - $100</button>
                    </div>
                  </div>
                ) : (
                  <div className="funzone-banner alternative">
                    <img src="https://images.unsplash.com/photo-1555529669-e69e7aa0ba9a?auto=format&fit=crop&w=800&q=80" alt="offers" />
                    <div className="funzone-content">
                      <h2>Exclusive Perks</h2>
                      <p>Join our rewards program for early access to sales.</p>
                      <button onClick={() => navigate("/offers")}>Learn More</button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

function CategoryRow({ category, products, addToCart, cart, wishlist, toggleWishlist }) {
  const [expanded, setExpanded] = useState(false);
  
  // Use Refs for tracking coordinates to prevent massive re-render spam
  const rowRef = useRef(null);
  const isDown = useRef(false);
  const startX = useRef(0);
  const scrollLeft = useRef(0);
  
  // Only trigger state when we are SURE it's a drag, not a click
  const [isDragging, setIsDragging] = useState(false); 

  const displayedProducts = expanded ? products : products.slice(0, 12);

  const handleMouseDown = (e) => {
    if (!rowRef.current || expanded) return;
    isDown.current = true;
    startX.current = e.pageX - rowRef.current.offsetLeft;
    scrollLeft.current = rowRef.current.scrollLeft;
  };

  const handleMouseLeave = () => {
    isDown.current = false;
    setIsDragging(false);
  };

  const handleMouseUp = () => {
    isDown.current = false;
    // Tiny timeout ensures the click event has time to fire before pointer-events are restored
    setTimeout(() => setIsDragging(false), 50);
  };

  const handleMouseMove = (e) => {
    if (!isDown.current || !rowRef.current || expanded) return;
    e.preventDefault();
    
    const x = e.pageX - rowRef.current.offsetLeft;
    const walk = (x - startX.current);
    
    // DRAG THRESHOLD: Only block clicks if the mouse actually moves more than 5 pixels
    if (Math.abs(walk) > 5 && !isDragging) {
      setIsDragging(true);
    }
    
    // If we passed the threshold, scroll the container
    if (isDragging) {
      rowRef.current.scrollLeft = scrollLeft.current - walk * 2;
    }
  };

  return (
    <section className="category-group">
      <div className="category-header">
        <h1>{category.replace("-", " ")}</h1>
        {products.length > 12 && (
          <button
            className="category-toggle-btn"
            onClick={() => setExpanded(!expanded)}
          >
            {expanded ? "Show Less" : "View All"}
          </button>
        )}
      </div>

      <div 
        ref={rowRef}
        className={`${expanded ? "products-grid" : "products-row-container"} ${isDragging ? "dragging" : ""}`}
        onMouseDown={handleMouseDown}
        onMouseLeave={handleMouseLeave}
        onMouseUp={handleMouseUp}
        onMouseMove={handleMouseMove}
      >
        {displayedProducts.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            addToCart={addToCart}
            cart={cart}
            wishlist={wishlist}
            toggleWishlist={toggleWishlist}
          />
        ))}
      </div>
    </section>
  );
}

export default Products;