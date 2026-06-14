import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import ProductCard from "./ProductCard";
import "./Products.css";
import Loading from "../Loading";

const banners = [
  {
    title: "New Season Arrivals",
    subtitle: "Discover the latest trends in modern fashion and lifestyle essentials.",
    bg: "#1e293b",
    img: "https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=1600&q=80",
    gradient: "rgba(15, 23, 42, 0.95)",
    cta: "Explore Now"
  },
  {
    title: "Summer Sale is Live!",
    subtitle: "Get up to 50% off on all seasonal fashion and accessories.",
    bg: "#0c0a09",
    img: "https://images.pexels.com/photos/5868272/pexels-photo-5868272.jpeg?auto=compress&cs=tinysrgb&w=1600",
    gradient: "rgba(69, 10, 10, 0.95)",
    cta: "Get the Deal"
  },
  {
    title: "Next-Gen Tech",
    subtitle: "Explore the latest smartphones and gadgets from top brands.",
    bg: "#020617",
    img: "https://images.unsplash.com/photo-1498049794561-7780e7231661?auto=format&fit=crop&w=1600&q=80",
    gradient: "rgba(2, 6, 23, 0.95)",
    cta: "Upgrade Now"
  },
  {
    title: "Beauty & Wellness",
    subtitle: "Premium skincare and fragrances to elevate your daily routine.",
    bg: "#2d1b2d",
    img: "https://images.pexels.com/photos/3762882/pexels-photo-3762882.jpeg?auto=compress&cs=tinysrgb&w=1600",
    gradient: "rgba(45, 27, 45, 0.95)",
    cta: "Shop Beauty"
  },
  {
    title: "Home Essentials",
    subtitle: "Create your perfect space with modern decor and furniture.",
    bg: "#2a2118",
    img: "https://images.pexels.com/photos/1571460/pexels-photo-1571460.jpeg?auto=compress&cs=tinysrgb&w=1600",
    gradient: "rgba(42, 33, 24, 0.95)",
    cta: "Redecorate Now"
  },
  {
    title: "Outdoor Adventures",
    subtitle: "Gear up for your next journey with our sports collection.",
    bg: "#062118",
    img: "https://images.unsplash.com/photo-1551632811-561732d1e306?auto=format&fit=crop&w=1600&q=80",
    gradient: "rgba(6, 33, 24, 0.95)",
    cta: "Get Ready"
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
  const touchStartX = useRef(null);
  const bannerTimerRef = useRef(null);

  const resetBannerTimer = () => {
    if (bannerTimerRef.current) clearInterval(bannerTimerRef.current);
    bannerTimerRef.current = setInterval(() => {
      setCurrentBanner((prev) => (prev + 1) % banners.length);
    }, 5000);
  };

  useEffect(() => {
    resetBannerTimer();
    return () => {
      if (bannerTimerRef.current) clearInterval(bannerTimerRef.current);
    };
  }, []);

  const handleIndicatorClick = (index) => {
    setCurrentBanner(index);
    resetBannerTimer();
  };

  const handleDragStart = (e) => {
    touchStartX.current = e.touches ? e.touches[0].clientX : e.clientX;
  };

  const handleDragMove = (e) => {
    // We don't necessarily need move logic for a simple swipe detection on end, 
    // but preventing default can help with browser "back" gestures if needed.
  };

  const handleDragEnd = (e) => {
    if (touchStartX.current === null) return;
    
    // Support both mouse and touch end coordinates
    const clientX = e.changedTouches ? e.changedTouches[0].clientX : e.clientX;
    const deltaX = touchStartX.current - clientX;
    const threshold = 50; // pixels needed to trigger swipe

    if (Math.abs(deltaX) > threshold) {
      if (deltaX > 0) {
        // Swipe Left -> Next
        setCurrentBanner((prev) => (prev + 1) % banners.length);
      } else {
        // Swipe Right -> Prev
        setCurrentBanner((prev) => (prev === 0 ? banners.length - 1 : prev - 1));
      }
      resetBannerTimer();
    }
    touchStartX.current = null;
  };

  const handleMouseLeaveBanner = (e) => {
    if (touchStartX.current !== null) {
      handleDragEnd(e);
    }
  };

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

  // Helper to render diverse interstitial banners without repetition
  const renderInterstitial = (index) => {
    const variant = Math.floor(index / 5) % 4; 
    
    switch(variant) {
      case 0: {
        const data = {
          title: "Highly Rated",
          subtitle: "Top products loved by our community with 4.5+ stars.",
          img: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=1200&q=80",
          gradient: "rgba(15, 23, 42, 0.95)"
        };
        return (
          <div className="interstitial-banner rating">
            <img src={data.img} alt="highly rated" className="banner-bg-img" />
            <div className="banner-overlay" style={{ background: `linear-gradient(90deg, ${data.gradient} 0%, rgba(15, 23, 42, 0.4) 100%)` }} />
            <div className="banner-inner-content">
              <div className="banner-text-area">
                <h2 className="banner-main-title">{data.title}</h2>
                <p className="banner-sub-text">{data.subtitle}</p>
              </div>
              <div className="banner-cta-area">
                <button className="banner-cta" onClick={() => navigate(`/offer/${encodeURIComponent(data.title)}`, { state: { banner: data } })}>
                  View Best Sellers
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
                </button>
              </div>
            </div>
          </div>
        );
      }
      case 1: {
        const data = {
          title: "Budget Friendly",
          subtitle: "Find amazing value products at every price point.",
          img: "https://images.unsplash.com/photo-1555529669-e69e7aa0ba9a?auto=format&fit=crop&w=1200&q=80",
          gradient: "rgba(255, 255, 255, 0.95)"
        };
        return (
          <div className="interstitial-banner filter">
            <img src={data.img} alt="budget friendly" className="banner-bg-img" />
            <div className="banner-overlay" style={{ background: 'linear-gradient(90deg, rgba(255, 255, 255, 0.95) 0%, rgba(255, 255, 255, 0.5) 40%, rgba(255, 255, 255, 0) 100%)' }} />
            <div className="banner-inner-content">
              <div className="banner-text-area">
                <h2 className="banner-main-title">{data.title}</h2>
                <p className="banner-sub-text">{data.subtitle}</p>
              </div>
              <div className="banner-cta-area price-pills">
                <button className="pill-btn" onClick={() => navigate(`/offer/${encodeURIComponent(data.title)}`, { state: { banner: data } })}>Under $20</button>
                <button className="pill-btn" onClick={() => navigate(`/offer/${encodeURIComponent(data.title)}`, { state: { banner: data } })}>$20 - $50</button>
                <button className="pill-btn" onClick={() => navigate(`/offer/${encodeURIComponent(data.title)}`, { state: { banner: data } })}>$50 - $100</button>
              </div>
            </div>
          </div>
        );
      }
      case 2: {
        const data = {
          title: "Exclusive Perks",
          subtitle: "Join our rewards program for early access to sales.",
          img: "https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?auto=format&fit=crop&w=1200&q=80",
          gradient: "rgba(2, 6, 23, 0.95)"
        };
        return (
          <div className="interstitial-banner perks">
            <img src={data.img} alt="exclusive perks" className="banner-bg-img" />
            <div className="banner-overlay" style={{ background: `linear-gradient(90deg, ${data.gradient} 0%, rgba(2, 6, 23, 0.4) 100%)` }} />
            <div className="banner-inner-content">
              <div className="banner-text-area">
                <h2 className="banner-main-title">{data.title}</h2>
                <p className="banner-sub-text">{data.subtitle}</p>
              </div>
              <div className="banner-cta-area">
                <button className="banner-cta" onClick={() => navigate(`/offer/${encodeURIComponent(data.title)}`, { state: { banner: data } })}>
                  Learn More
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
                </button>
              </div>
            </div>
          </div>
        );
      }
      case 3: {
        const data = {
          title: "Self-Care Sunday",
          subtitle: "Premium beauty and wellness essentials for your routine.",
          img: "https://images.unsplash.com/photo-1540555700478-4be289fbecee?auto=format&fit=crop&w=1200&q=80",
          gradient: "rgba(17, 24, 39, 0.95)"
        };
        return (
          <div className="interstitial-banner wellness">
            <img src={data.img} alt="self care" className="banner-bg-img" />
            <div className="banner-overlay" style={{ background: `linear-gradient(90deg, ${data.gradient} 0%, rgba(17, 24, 39, 0.4) 100%)` }} />
            <div className="banner-inner-content">
              <div className="banner-text-area">
                <h2 className="banner-main-title">{data.title}</h2>
                <p className="banner-sub-text">{data.subtitle}</p>
              </div>
              <div className="banner-cta-area">
                <button className="banner-cta" onClick={() => navigate(`/offer/${encodeURIComponent(data.title)}`, { state: { banner: data } })}>
                  Shop Beauty
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
                </button>
              </div>
            </div>
          </div>
        );
      }
      default: return null;
    }
  };

  return (
    <div className="products-container">
      
      {/* Hero Banner - FULL WIDTH DEMO STYLE */}
      <div 
        className="products-hero" 
        style={{ backgroundColor: banners[currentBanner].bg }}
        onMouseDown={handleDragStart}
        onMouseMove={handleDragMove}
        onMouseUp={handleDragEnd}
        onMouseLeave={handleMouseLeaveBanner}
        onTouchStart={handleDragStart}
        onTouchMove={handleDragMove}
        onTouchEnd={handleDragEnd}
      >
        <img src={banners[currentBanner].img} alt="banner" className="hero-bg-img" />
        <div 
          className="hero-overlay" 
          style={{ 
            background: `linear-gradient(65deg, ${banners[currentBanner].gradient} 0%, rgba(15, 23, 42, 0.4) 40%, rgba(15, 23, 42, 0) 100%)` 
          }} 
        />
        <div className="hero-inner-content">
          <div className="banner-text-area">
            <h1 className="banner-main-title">{banners[currentBanner].title}</h1>
            <p className="banner-sub-text">{banners[currentBanner].subtitle}</p>
          </div>

          <div className="banner-cta-area">
            <button className="banner-cta" onClick={() => navigate(`/offer/${encodeURIComponent(banners[currentBanner].title)}`, { state: { banner: banners[currentBanner] } })}>
              {banners[currentBanner].cta}
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="9 18 15 12 9 6"/>
              </svg>
            </button>
          </div>

          <div className="banner-indicators-bottom">
            {banners.map((_, i) => (
              <span 
                key={i} 
                className={`indicator ${i === currentBanner ? 'active' : ''}`} 
                onClick={() => handleIndicatorClick(i)}
              />
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
                {renderInterstitial(index)}
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
  
  const rowRef = useRef(null);
  const isDown = useRef(false);
  const startX = useRef(0);
  const scrollLeft = useRef(0);
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
    setTimeout(() => setIsDragging(false), 50);
  };

  const handleMouseMove = (e) => {
    if (!isDown.current || !rowRef.current || expanded) return;
    e.preventDefault();
    
    const x = e.pageX - rowRef.current.offsetLeft;
    const walk = (x - startX.current);
    
    if (Math.abs(walk) > 5 && !isDragging) {
      setIsDragging(true);
    }
    
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