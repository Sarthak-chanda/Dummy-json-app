import { useEffect, useState, useRef, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import ProductCard from "./ProductCard";
import "./HomePage.css";
import "./Banner.css";
import CategorySection from "./CategorySection";
import Loading from "../Loading";
import { useProductManager } from "../hooks/useProductManager";
import { useOffersManager } from "../hooks/useOffersManager";
import recommendationImg from "/image/Recomendation.webp";
import TrustBanner from "./TrustBanner";

const BudgetFriendlyContainer = ({ products, getProductsByPriceRange, sortProducts, addToCart, removeFromCart, cart, wishlist, toggleWishlist }) => {
  const [sortOrder, setSortOrder] = useState('price-asc');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState(null);
  
  const rowRef = useRef(null);
  const dropdownRef = useRef(null);
  const isDown = useRef(false);
  const startX = useRef(0);
  const scrollLeft = useRef(0);
  const [isDragging, setIsDragging] = useState(false);

  // Default Budget Friendly Range ($0 - $50) with memoization to stabilize reference
  const displayProducts = useMemo(() => {
    let list = getProductsByPriceRange(0, 50);
    if (sortProducts) {
      return sortProducts(list, sortOrder);
    }
    if (sortOrder === 'price-desc') return [...list].reverse();
    return list;
  }, [products, sortOrder]);

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
    
    const row = rowRef.current;
    const cards = row.children;
    if (!cards || cards.length === 0) return;
    
    // Find the first actual product card to get its real rendered width
    let firstCard = null;
    for (let i = 0; i < cards.length; i++) {
      if (cards[i].classList && (cards[i].classList.contains('ec-product-card') || cards[i].classList.contains('product-card'))) {
        firstCard = cards[i];
        break;
      }
    }
    
    // Fallback to 280px (standard desktop card width) if layout is not fully computed yet
    const cardWidth = firstCard ? (firstCard.clientWidth || 280) : 280;
    const style = window.getComputedStyle(row);
    const gap = parseFloat(style.gap) || 24; // fallback to 1.5rem (24px)
    
    const estimatedCardWidth = cardWidth + gap;
    const scrollPosition = row.scrollLeft;
    
    let activeIndex = Math.floor((scrollPosition + (estimatedCardWidth / 2)) / estimatedCardWidth);
    activeIndex = Math.max(0, Math.min(activeIndex, Math.min(displayProducts.length - 1, 19)));
    
    const newCategory = displayProducts[activeIndex]?.category;
    if (newCategory) {
      setActiveCategory(prev => prev !== newCategory ? newCategory : prev);
    }
  };

  // Sync active category instantly when products or sort order change
  useEffect(() => {
    if (displayProducts.length > 0) {
      // Set to first product's category immediately to avoid fallback delays
      setActiveCategory(displayProducts[0].category);
      
      // Schedule a precise measurement once the browser has completed layout and paint
      const timer = setTimeout(() => {
        updateActiveCategory();
      }, 50);
      return () => clearTimeout(timer);
    } else {
      setActiveCategory(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [displayProducts]);

  // Setup native scroll listener for reliable mobile updates
  useEffect(() => {
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
  // Unique and stylistic shopping image
  const bgImage = "https://images.unsplash.com/photo-1528698827591-e19ccd7bc23d?auto=format&fit=crop&w=1600&q=80";

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
      updateActiveCategory(); // Force immediate update on drag scroll
    }
  };

  return (
    <div 
      className="budget-friendly-container recommendation-section" 
      style={{ 
        backgroundImage: `
          radial-gradient(circle at 50% 30%, transparent 35%, rgba(248, 250, 252, 0.7) 95%),
          radial-gradient(rgba(14, 165, 165, 0.05) 1.5px, transparent 1.5px),
          radial-gradient(rgba(89, 86, 233, 0.04) 1.5px, transparent 1.5px),
          linear-gradient(-45deg, rgba(240, 253, 250, 0.15), rgba(224, 242, 254, 0.2), rgba(245, 243, 255, 0.15), rgba(236, 254, 255, 0.2)),
          url('${bgImage}')
        `,
        position: 'relative',
        borderRadius: 0,
        border: 'none',
        boxShadow: 'none',
        paddingBottom: '120px',
        marginBottom: 0
      }}
    >
      {/* Decorative Floating Textured Elements to match recommendation section */}
      <div className="decorative-blob blob-1" />
      <div className="decorative-blob blob-2" />
      <div className="decorative-blob blob-3" />
      <div className="decorative-blob blob-4" />

      {/* Dynamic color hint overlay (very subtle) */}
      <div 
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: getDynamicColor(),
          opacity: 0.15,
          transition: 'background-color 0.8s ease-in-out',
          zIndex: 1
        }}
      />

      {/* Strong fade-out overlay at the bottom to merge perfectly with the page background */}
      <div 
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: -1, /* -1 to ensure no 1px gaps */
          background: 'linear-gradient(to bottom, transparent 0%, transparent 75%, #f8fafc 100%)',
          zIndex: 11,
          pointerEvents: 'none'
        }}
      />

      {/* Constrained Inner Content Area to align with the page grid */}
      <div style={{ maxWidth: '1600px', margin: '0 auto', padding: '0 1.5rem', position: 'relative', zIndex: 20 }}>
        <div className="budget-header" style={{ position: 'relative', zIndex: 22 }}>
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
          style={{ position: 'relative', zIndex: 10 }}
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
                removeFromCart={removeFromCart}
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
    </div>
  );
};

const InterstitialBanner = ({ offer }) => {
  const navigate = useNavigate();
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

const RecommendationSection = ({ products, addToCart, removeFromCart, cart, wishlist, toggleWishlist }) => {
  const navigate = useNavigate();
  const [cardsPerPage, setCardsPerPage] = useState(4);
  const [currentPage, setCurrentPage] = useState(0);
  const trackRef = useRef(null);

  // Filter top rated products (12 items)
  const recommendedProducts = useMemo(() => {
    return [...products]
      .sort((a, b) => (b.rating || 0) - (a.rating || 0))
      .slice(0, 12);
  }, [products]);

  // Adjust items per page depending on viewport size
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 640) {
        setCardsPerPage(1);
      } else if (window.innerWidth < 1024) {
        setCardsPerPage(2);
      } else if (window.innerWidth < 1440) {
        setCardsPerPage(3);
      } else {
        setCardsPerPage(4);
      }
    };
    
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const totalPages = Math.ceil(recommendedProducts.length / cardsPerPage);

  useEffect(() => {
    if (currentPage >= totalPages) {
      setCurrentPage(Math.max(0, totalPages - 1));
    }
  }, [totalPages, currentPage]);

  if (recommendedProducts.length === 0) return null;

  // Group recommended products into pages
  const pages = [];
  for (let i = 0; i < recommendedProducts.length; i += cardsPerPage) {
    pages.push(recommendedProducts.slice(i, i + cardsPerPage));
  }

  // Touch Swipe Gesture Handlers
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);

  const handleTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e) => {
    touchEndX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (!touchStartX.current || !touchEndX.current) return;
    const diff = touchStartX.current - touchEndX.current;
    const threshold = 50;
    
    if (Math.abs(diff) > threshold) {
      if (diff > 0 && currentPage < totalPages - 1) {
        setCurrentPage(prev => prev + 1);
      } else if (diff < 0 && currentPage > 0) {
        setCurrentPage(prev => prev - 1);
      }
    }
    touchStartX.current = 0;
    touchEndX.current = 0;
  };

  return (
    <div className="recommendation-section">
      {/* Decorative Floating Textured Elements */}
      <div className="decorative-blob blob-1" />
      <div className="decorative-blob blob-2" />
      <div className="decorative-blob blob-3" />
      <div className="decorative-blob blob-4" />

      <div className="recommendation-container">
        
        {/* Section Header: Title & View All */}
        <div className="recommendation-header-row">
          <h2 className="recommendation-title">Recommended for You</h2>
          <button className="recommendation-view-all" onClick={() => navigate('/categories')}>
            View All
          </button>
        </div>

        {/* Carousel Window */}
        <div 
          className="recommendation-carousel-viewport"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          <div 
            className="recommendation-carousel-track"
            style={{ transform: `translateX(-${currentPage * 100}%)` }}
            ref={trackRef}
          >
            {pages.map((pageProducts, pageIdx) => (
              <div className="recommendation-carousel-page" key={pageIdx}>
                {pageProducts.map(product => (
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
            ))}
          </div>
        </div>

        {/* Carousel Page dots at the bottom with a background pill */}
        <div className="recommendation-indicators-bottom-wrapper">
          <div className="recommendation-indicators-bottom">
            {Array.from({ length: totalPages }).map((_, idx) => (
              <span 
                key={idx} 
                className={`recommendation-dot ${idx === currentPage ? 'active' : ''}`}
                onClick={() => setCurrentPage(idx)}
              />
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};

const HomePage = ({ addToCart, removeFromCart, cart, wishlist, toggleWishlist }) => {
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

      <CategorySection 
        addToCart={addToCart} 
        removeFromCart={removeFromCart}
        cart={cart} 
        wishlist={wishlist} 
        toggleWishlist={toggleWishlist} 
      />

      <div className="products-content-wrapper">
        {/* Banner between Category and Recommendation */}
        <div className="interstitial-section">
          <InterstitialBanner offer={offers[5] || offers[0]} />
        </div>
      </div> {/* CLOSE content wrapper */}

      {/* Recommendation Section - Edge-to-Edge Full Width */}
      <RecommendationSection
        products={products}
        addToCart={addToCart}
        removeFromCart={removeFromCart}
        cart={cart}
        wishlist={wishlist}
        toggleWishlist={toggleWishlist}
      />

      <div className="products-content-wrapper"> {/* REOPEN content wrapper */}
      </div> {/* CLOSE content wrapper */}
      
      {/* Trust Banner Section - Edge-to-Edge Full Width */}
      <TrustBanner />

      <div className="products-content-wrapper"> {/* REOPEN content wrapper */}
        {/* 1 Banner after TrustBanner */}
        <div className="interstitial-section">
          <InterstitialBanner offer={offers[6] || offers[0]} />
        </div>

      </div> {/* CLOSE content wrapper */}

      {/* Budget Friendly Section - Edge-to-Edge Full Width */}
      <BudgetFriendlyContainer 
        products={products}
        getProductsByPriceRange={getProductsByPriceRange}
        sortProducts={sortProducts}
        addToCart={addToCart}
        removeFromCart={removeFromCart}
        cart={cart}
        wishlist={wishlist}
        toggleWishlist={toggleWishlist}
      />

      <div className="products-content-wrapper"> {/* REOPEN content wrapper */}
        {/* Banner after Budget Friendly Section */}
        <div className="interstitial-section">
          <InterstitialBanner offer={offers[7] || offers[0]} />
        </div>
      </div>
    </div>
  );
};

export default HomePage;