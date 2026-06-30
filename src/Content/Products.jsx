import { useEffect, useState, useRef, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import ProductCard from "./ProductCard";
import "./Products.css";
import "./Banner.css";
import Loading from "../Loading";
import { useProductManager } from "../hooks/useProductManager";
import { useOffersManager } from "../hooks/useOffersManager";

const InterstitialBanner = ({ offer }) => {
  const navigate = useNavigate();
  if (!offer) return null;
  return (
    <div className="interstitial-banner">
      <picture>
        <source media="(max-width: 768px)" srcSet={offer.images.mobile} />
        <img src={offer.images.desktop} alt={offer.title} className="banner-bg-img" loading="lazy" decoding="async" />
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

const Products = ({ addToCart, removeFromCart, cart, wishlist, toggleWishlist }) => {
  const { loading, groupedProducts } = useProductManager();
  const { offers, loading: offersLoading } = useOffersManager();

  // Pick random offers from any available campaigns for the interstitial slots
  const randomIndices = useMemo(() => {
    if (!offers || offers.length === 0) return [];
    return Array.from({ length: 50 }, () => Math.floor(Math.random() * offers.length));
  }, [offers]);

  if (loading || offersLoading) {
    return <Loading />;
  }

  const categoryEntries = Object.entries(groupedProducts);

  const renderInterstitial = (index) => {
    const slotIndex = Math.floor(index / 5);
    const offerIndex = randomIndices[slotIndex] !== undefined ? randomIndices[slotIndex] : 0;
    const offer = offers[offerIndex] || offers[0]; // fallback
    
    if (!offer) return null;

    return <InterstitialBanner offer={offer} />;
  };

  return (
    <div className="products-container" style={{ padding: '2rem 1rem' }}>
      <div className="products-content-wrapper">
        {/* Categories Grid Rows with Interstitial Banners */}
        {categoryEntries.map(([category, categoryProducts], index) => (
          <div key={category}>
            <CategoryRow
              category={category}
              products={categoryProducts}
              addToCart={addToCart}
              removeFromCart={removeFromCart}
              cart={cart}
              wishlist={wishlist}
              toggleWishlist={toggleWishlist}
            />
            
            {/* Inject dynamic interstitial sections every 5 categories */}
            {(index + 1) % 5 === 0 && (
              <div className="interstitial-section" style={{ margin: '3rem 0' }}>
                {renderInterstitial(index)}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

function CategoryRow({ category, products, addToCart, removeFromCart, cart, wishlist, toggleWishlist }) {
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
    <section className="category-group" style={{ marginBottom: '4rem' }}>
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
            removeFromCart={removeFromCart}
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