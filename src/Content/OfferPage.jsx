import { useState, useMemo, useEffect, Fragment } from "react";
import { useNavigate, useParams } from "react-router-dom";
import ProductCard from "./ProductCard";
import "./OfferPage.css";
import "./Banner.css";
import Loading from "../Loading";
import { useOffersManager } from "../hooks/useOffersManager";

const OfferPage = ({ addToCart, cart, wishlist, toggleWishlist }) => {
  const navigate = useNavigate();
  const { offerId } = useParams();
  const { getOfferById, loading, sortProducts, offers } = useOffersManager();
  
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [showAllCategories, setShowAllCategories] = useState(false);
  const [sortOrder, setSortOrder] = useState('discount'); // Default sort for offers
  const [columns, setColumns] = useState(4);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      setIsMobile(width < 1024);
      // approximate columns based on max-width 1600, padding, and 280px min-width + 2rem gap
      const containerWidth = Math.min(width - 64, 1600);
      const cols = Math.max(1, Math.floor(containerWidth / (280 + 32)));
      setColumns(cols);
    };
    handleResize(); // Init on mount
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const activeOffer = getOfferById(offerId);

  // If loading, show loader. If not loading and no offer found, show a fallback.
  if (loading) return <Loading />;
  
  if (!activeOffer) {
    return (
      <div className="offer-page-container flex flex-col items-center justify-center min-h-[60vh] text-center p-8">
        <h1 className="text-3xl font-bold mb-4">Offer Not Found</h1>
        <p className="text-slate-500 mb-8">This campaign may have ended or the link is broken.</p>
        <button onClick={() => navigate("/")} className="px-6 py-3 bg-slate-900 text-white rounded-xl font-semibold">
          Return to Shop
        </button>
      </div>
    );
  }

  const offerProducts = activeOffer.products || [];

  const categories = ["All", ...new Set(offerProducts.map(p => p.category))];
  const displayedCategories = showAllCategories ? categories : categories.slice(0, 8);

  // Using useMemo because sortProducts mutates/creates a new array and we want to avoid unnecessary re-sorts
  const filteredByCategory = useMemo(() => {
    let result = offerProducts.filter(p => {
      return selectedCategory === "All" || p.category === selectedCategory;
    });
    return sortProducts(result, sortOrder);
  }, [offerProducts, selectedCategory, sortOrder, sortProducts]);

  const injectionFrequency = isMobile ? 10 : 5 * columns;
  const otherOffers = offers?.filter(o => o.id !== offerId) || [];
  let offerIndexCounter = 0;

  return (
    <div className="offer-page-container">
      {/* Top Banner - Reusing Homepage Hero Classes */}
      <div className="products-hero" onClick={() => navigate("/")} style={{ cursor: 'pointer' }}>
        <picture>
           <source media="(max-width: 768px)" srcSet={activeOffer.images.mobile} />
           <img src={activeOffer.images.desktop} alt="offer banner" className="hero-bg-img" />
        </picture>
        <div 
          className="hero-overlay" 
          style={{ 
            background: `linear-gradient(65deg, ${activeOffer.gradient} 0%, rgba(15, 23, 42, 0.4) 40%, rgba(15, 23, 42, 0) 100%)` 
          }} 
        />
        <div className="hero-inner-content">
          <div className="banner-text-area">
            <div className="offer-badge" style={{ background: '#ff4d4f', color: 'white', display: 'inline-block', padding: '4px 12px', borderRadius: '50px', fontSize: '0.75rem', fontWeight: '800', textTransform: 'uppercase', marginBottom: '0.8rem' }}>
              {activeOffer.badge}
            </div>
            <h1 className="banner-main-title">{activeOffer.title}</h1>
            <p className="banner-sub-text">{activeOffer.subtitle}</p>
          </div>
        </div>
      </div>

      {/* Modern Category & Sort Bar */}
      <div className="offer-controls-section">
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
        
        <div className="offer-sort-wrapper">
          <span className="sort-label">Sort by:</span>
          <select 
            className="offer-sort-select" 
            value={sortOrder} 
            onChange={(e) => setSortOrder(e.target.value)}
          >
            <option value="discount">Biggest Discount</option>
            <option value="rating">Highest Rated</option>
            <option value="reviews">Most Reviewed</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
          </select>
        </div>
      </div>

      <div className="offer-grid">
        {filteredByCategory.length > 0 ? (
          filteredByCategory.map((product, index) => {
            const isInjectionPoint = (index + 1) % injectionFrequency === 0;
            let bannerContent = null;
            
            if (isInjectionPoint && otherOffers.length > 0) {
              const offerToInject = otherOffers[offerIndexCounter % otherOffers.length];
              offerIndexCounter++;
              bannerContent = (
                // Reusing Homepage Interstitial Classes
                <div className="interstitial-section" style={{ gridColumn: '1 / -1' }} key={`banner-${index}`}>
                  <div className="interstitial-banner">
                    <picture>
                       <source media="(max-width: 768px)" srcSet={offerToInject.images.mobile} />
                       <img src={offerToInject.images.desktop} alt={offerToInject.title} className="banner-bg-img" />
                    </picture>
                    <div className="banner-overlay" style={{ background: `linear-gradient(90deg, ${offerToInject.gradient} 0%, rgba(15, 23, 42, 0.4) 100%)` }} />
                    <div className="banner-inner-content">
                      <div className="banner-text-area">
                        <h2 className="banner-main-title">{offerToInject.title}</h2>
                        <p className="banner-sub-text">{offerToInject.subtitle}</p>
                      </div>
                      <div className="banner-cta-area">
                        <button className="banner-cta" onClick={() => {
                            window.scrollTo(0, 0);
                            navigate(`/offer/${offerToInject.id}`);
                        }}>
                          {offerToInject.cta}
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            }

            return (
              <Fragment key={product.id}>
                <ProductCard 
                  product={product}
                  addToCart={addToCart}
                  cart={cart}
                  wishlist={wishlist}
                  toggleWishlist={toggleWishlist}
                />
                {bannerContent}
              </Fragment>
            );
          })
        ) : (
          <div className="no-offers">
            <h2>No deals found</h2>
            <p>We couldn't find any products for this category. Please try another one.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default OfferPage;
