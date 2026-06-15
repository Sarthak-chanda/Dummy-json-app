import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import ProductCard from "./ProductCard";
import "./Products.css";
import "./Banner.css";
import Loading from "../Loading";
import { useProductManager } from "../hooks/useProductManager";
import { useOffersManager } from "../hooks/useOffersManager";

const BudgetFriendlyContainer = ({ getProductsByPriceRange, sortProducts, addToCart, cart, wishlist, toggleWishlist }) => {
  const [sortOrder, setSortOrder] = useState('price-asc');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState(null);
  
  const rowRef = useRef(null);
  const dropdownRef = useRef(null);
  const isDown = useRef(false);
  const startX = useRef(0);
  const scrollLeft = useRef(0);
  const [isDragging, setIsDragging] = useState(false);

  // Default Budget Friendly Range ($0 - $50)
  let displayProducts = getProductsByPriceRange(0, 50);
  if (sortProducts) {
    displayProducts = sortProducts(displayProducts, sortOrder);
  } else {
    // Fallback if sortProducts isn't passed
    if (sortOrder === 'price-desc') displayProducts = [...displayProducts].reverse();
  }

  const sortOptions = [
    { value: 'price-asc', label: 'Price: Low to High' },
    { value: 'price-desc', label: 'Price: High to Low' },
    { value: 'rating', label: 'Highest Rated' },
    { value: 'reviews', label: 'Most Reviewed' },
    { value: 'discount', label: 'Biggest Discount' },
    { value: 'name-asc', label: 'Name: A to Z' }
  ];

  const currentSortLabel = sortOptions.find(opt => opt.value === sortOrder)?.label;

  // Handle clicks outside the custom dropdown to close it
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Update active category on scroll
  const updateActiveCategory = () => {
    if (!rowRef.current || displayProducts.length === 0) return;
    
    const scrollPosition = rowRef.current.scrollLeft;
    // Estimate card width (280px min-width + 1.5rem gap)
    const estimatedCardWidth = 304; 
    let activeIndex = Math.floor((scrollPosition + (estimatedCardWidth / 2)) / estimatedCardWidth);
    
    // Safety bounds (showing max 20 products now)
    activeIndex = Math.max(0, Math.min(activeIndex, Math.min(displayProducts.length - 1, 19)));
    
    const newCategory = displayProducts[activeIndex]?.category;
    setActiveCategory(prev => prev !== newCategory ? newCategory : prev);
  };

  // Setup native scroll listener for reliable mobile updates
  useEffect(() => {
    updateActiveCategory(); // Run once on mount or product change
    const row = rowRef.current;
    if (!row) return;

    row.addEventListener('scroll', updateActiveCategory, { passive: true });
    return () => row.removeEventListener('scroll', updateActiveCategory);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [displayProducts]);

  // Dynamically hash category to a unique color
  const getDynamicColor = () => {
    const categoryToUse = activeCategory || (displayProducts.length > 0 ? displayProducts[0].category : null);
    
    if (!categoryToUse) return "rgba(14, 165, 165, 0.5)"; 

    let hash = 0;
    for (let i = 0; i < categoryToUse.length; i++) {
      hash = categoryToUse.charCodeAt(i) + ((hash << 5) - hash);
    }
    const hue = Math.abs(hash) % 360;
    // Return a vibrant, semi-transparent color for the gradient base
    return `hsla(${hue}, 80%, 45%, 0.65)`;
  };

  const dynamicGradient = `linear-gradient(135deg, ${getDynamicColor()} 0%, rgba(248, 250, 252, 0.95) 70%, rgba(248, 250, 252, 1) 100%)`;
  // Using a generic shopping/deals image from Unsplash as the base background
  const bgImage = "https://images.unsplash.com/photo-1555529669-e69e7aa0ba9a?auto=format&fit=crop&w=1200&q=80";

  const handleMouseDown = (e) => {
    if (!rowRef.current) return;
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
    if (!isDown.current || !rowRef.current) return;
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
    <div 
      className="budget-friendly-container" 
      style={{ 
        backgroundImage: `${dynamicGradient}, url(${bgImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        transition: 'background 0.5s ease-out'
      }}
    >
      <div className="budget-header">
        <div className="budget-title-area">
          <h2>Budget Friendly</h2>
          <p>Find amazing value products under $50.</p>
        </div>
        <div className="budget-controls">
          <div className="custom-dropdown-container" ref={dropdownRef}>
            <div 
              className={`sort-wrapper ${isDropdownOpen ? 'active' : ''}`} 
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            >
              <svg className="sort-icon" viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="5" x2="12" y2="19"></line>
                <polyline points="19 12 12 19 5 12"></polyline>
              </svg>
              <span className="current-sort-label">{currentSortLabel}</span>
              <svg className={`dropdown-arrow ${isDropdownOpen ? 'open' : ''}`} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="6 9 12 15 18 9"></polyline>
              </svg>
            </div>
            
            {isDropdownOpen && (
              <div className="custom-dropdown-list">
                {sortOptions.map(option => (
                  <div 
                    key={option.value}
                    className={`custom-dropdown-item ${sortOrder === option.value ? 'selected' : ''}`}
                    onClick={() => {
                      setSortOrder(option.value);
                      setIsDropdownOpen(false);
                      if (rowRef.current) rowRef.current.scrollLeft = 0; // Reset scroll on sort change
                    }}
                  >
                    {option.label}
                    {sortOrder === option.value && (
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{color: '#0ea5a5'}}>
                        <polyline points="20 6 9 17 4 12"></polyline>
                      </svg>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
      
      <div 
        ref={rowRef}
        className={`products-row-container budget-row ${isDragging ? "dragging" : ""}`}
        onMouseDown={handleMouseDown}
        onMouseLeave={handleMouseLeave}
        onMouseUp={handleMouseUp}
        onMouseMove={handleMouseMove}
      >
        {displayProducts.length > 0 ? (
          displayProducts.slice(0, 20).map(product => (
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
          <p className="budget-empty-state">No products found in this range.</p>
        )}
      </div>
    </div>
  );
};

const Products = ({ addToCart, cart, wishlist, toggleWishlist }) => {
  const navigate = useNavigate();
  const { products, loading, groupedProducts, hotDeals, getProductsByPriceRange, sortProducts } = useProductManager();
  const { offers, loading: offersLoading } = useOffersManager();
  
  const [currentBanner, setCurrentBanner] = useState(0);
  const touchStartX = useRef(null);
  const bannerTimerRef = useRef(null);

  const activeBanners = offers.slice(0, 5); // Use first 5 for top carousel

  const resetBannerTimer = () => {
    if (bannerTimerRef.current) clearInterval(bannerTimerRef.current);
    if (activeBanners.length === 0) return;
    
    bannerTimerRef.current = setInterval(() => {
      setCurrentBanner((prev) => (prev + 1) % activeBanners.length);
    }, 5000);
  };

  useEffect(() => {
    resetBannerTimer();
    return () => {
      if (bannerTimerRef.current) clearInterval(bannerTimerRef.current);
    };
  }, [activeBanners.length]);

  const handleIndicatorClick = (index) => {
    setCurrentBanner(index);
    resetBannerTimer();
  };

  const handleDragStart = (e) => {
    touchStartX.current = e.touches ? e.touches[0].clientX : e.clientX;
  };

  const handleDragMove = (e) => {};

  const handleDragEnd = (e) => {
    if (touchStartX.current === null || activeBanners.length === 0) return;
    
    const clientX = e.changedTouches ? e.changedTouches[0].clientX : e.clientX;
    const deltaX = touchStartX.current - clientX;
    const threshold = 50; 

    if (Math.abs(deltaX) > threshold) {
      if (deltaX > 0) {
        setCurrentBanner((prev) => (prev + 1) % activeBanners.length);
      } else {
        setCurrentBanner((prev) => (prev === 0 ? activeBanners.length - 1 : prev - 1));
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

  if (loading || offersLoading) {
    return <Loading />;
  }

  const categoryEntries = Object.entries(groupedProducts);

  const renderInterstitial = (index) => {
    // Determine which type of interstitial to show
    const isBudgetSection = index === 4 || index === 14; 
    
    if (isBudgetSection) {
      return (
        <BudgetFriendlyContainer 
          getProductsByPriceRange={getProductsByPriceRange}
          sortProducts={sortProducts}
          addToCart={addToCart}
          cart={cart}
          wishlist={wishlist}
          toggleWishlist={toggleWishlist}
        />
      );
    }

    // Pick an offer from the remaining config to display as an inline banner
    // We offset by 5 since the first 5 are in the hero carousel
    const offerIndex = 5 + (index % Math.max(1, offers.length - 5));
    const offer = offers[offerIndex] || offers[0]; // fallback
    
    if (!offer) return null;

    return (
      <div className="interstitial-banner">
        <picture>
          <source media="(max-width: 768px)" srcSet={offer.images.mobile} />
          <img src={offer.images.desktop} alt={offer.title} className="banner-bg-img" />
        </picture>
        <div className="banner-overlay" style={{ background: `linear-gradient(90deg, ${offer.gradient} 0%, rgba(15, 23, 42, 0.4) 100%)` }} />
        <div className="banner-inner-content">
          <div className="banner-text-area">
            <h2 className="banner-main-title">{offer.title}</h2>
            <p className="banner-sub-text">{offer.subtitle}</p>
          </div>
          <div className="banner-cta-area">
            <button className="banner-cta" onClick={() => navigate(`/offer/${offer.id}`)}>
              {offer.cta}
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
            </button>
          </div>
        </div>
      </div>
    );
  };

  const activeHero = activeBanners[currentBanner] || offers[0];

  return (
    <div className="products-container">
      
      {/* Hero Banner - FULL WIDTH DEMO STYLE */}
      {activeHero && (
        <div 
          className="products-hero" 
          onMouseDown={handleDragStart}
          onMouseMove={handleDragMove}
          onMouseUp={handleDragEnd}
          onMouseLeave={handleMouseLeaveBanner}
          onTouchStart={handleDragStart}
          onTouchMove={handleDragMove}
          onTouchEnd={handleDragEnd}
        >
          {/* Responsive image loading using picture element */}
          <picture>
            <source media="(max-width: 768px)" srcSet={activeHero.images.mobile} />
            <img src={activeHero.images.desktop} alt="banner" className="hero-bg-img" />
          </picture>
          <div 
            className="hero-overlay" 
            style={{ 
              background: `linear-gradient(65deg, ${activeHero.gradient} 0%, rgba(15, 23, 42, 0.4) 40%, rgba(15, 23, 42, 0) 100%)` 
            }} 
          />
          <div className="hero-inner-content">
            <div className="banner-text-area">
              <h1 className="banner-main-title">{activeHero.title}</h1>
              <p className="banner-sub-text">{activeHero.subtitle}</p>
            </div>

            <div className="banner-cta-area">
              <button className="banner-cta" onClick={() => navigate(`/offer/${activeHero.id}`)}>
                {activeHero.cta}
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="9 18 15 12 9 6"/>
                </svg>
              </button>
            </div>

            <div className="banner-indicators-bottom">
              {activeBanners.map((_, i) => (
                <span 
                  key={i} 
                  className={`indicator ${i === currentBanner ? 'active' : ''}`} 
                  onClick={() => handleIndicatorClick(i)}
                />
              ))}
            </div>
          </div>
        </div>
      )}

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
            
            {/* Inject dynamic interstitial sections every 5 categories */}
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