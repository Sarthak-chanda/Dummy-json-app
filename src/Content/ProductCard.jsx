import { useState, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "./ProductCard.css";

const ProductCard = ({ product, addToCart, cart = [], wishlist = [], toggleWishlist }) => {
  const {p_name ,p_id} = useParams();
  const navigate = useNavigate();
  
  const isAdded = cart.some(item => item.id === product.id);
  const isLiked = wishlist.some(item => item.id === product.id);
  
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isSwiping, setIsSwiping] = useState(false);
  const lastTap = useRef(0);

  const touchStartX = useRef(0);
  const touchStartY = useRef(0);
  const touchEndX = useRef(0);
  const touchEndY = useRef(0);

  const images = product.images?.length > 0 ? product.images : [product.thumbnail];

  const handleCartClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product);
    if ('vibrate' in navigator) navigator.vibrate(50);
  };

  const handleLikeClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist(product);
  };

  const handleDoubleTap = (e) => {
    const now = Date.now();
    const DOUBLE_PRESS_DELAY = 300;
    if (now - lastTap.current < DOUBLE_PRESS_DELAY) {
      toggleWishlist(product);
      if ('vibrate' in navigator) navigator.vibrate([50, 30, 50]);
    }
    lastTap.current = now;
  };

  // --- Optimized Touch Logic ---
  const handleTouchStart = (e) => {
    touchStartX.current = e.targetTouches[0].clientX;
    touchStartY.current = e.targetTouches[0].clientY;
    setIsSwiping(false);
  };

  const handleTouchMove = (e) => {
    touchEndX.current = e.targetTouches[0].clientX;
    touchEndY.current = e.targetTouches[0].clientY;
  };

  const handleTouchEnd = () => {
    if (!touchStartX.current || !touchEndX.current) return;

    const distanceX = touchStartX.current - touchEndX.current;
    const distanceY = touchStartY.current - touchEndY.current;
    const swipeThreshold = 40; 

    if (Math.abs(distanceX) > Math.abs(distanceY) && Math.abs(distanceX) > swipeThreshold) {
      setIsSwiping(true);
      if (distanceX > 0 && currentIndex < images.length - 1) {
        setCurrentIndex((prev) => prev + 1);
      } else if (distanceX < 0 && currentIndex > 0) {
        setCurrentIndex((prev) => prev - 1);
      }
    }
    
    touchStartX.current = 0;
    touchEndX.current = 0;
    touchStartY.current = 0;
    touchEndY.current = 0;
    
    setTimeout(() => setIsSwiping(false), 50); 
  };

  // Triggers navigation for the entire card
  const handleCardClick = () => {
    if (!isSwiping) {
      navigate(`/p/${encodeURIComponent(product.title)}/${product.id}`);
    }
  };

  const originalPrice = product.discountPercentage > 0 
    ? Math.round(product.price / (1 - product.discountPercentage / 100)) 
    : product.price;

  return (
    <div className="ec-product-card" onClick={handleCardClick}>
      
      <div 
        className="ec-pc-image-section"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onClick={handleDoubleTap}
      >
        {product.discountPercentage > 0 && (
          <div className="ec-pc-badge discount">
            {Math.round(product.discountPercentage)}% OFF
          </div>
        )}
        
        <button 
          className={`ec-pc-badge heart-icon ${isLiked ? 'active' : ''}`}
          onClick={handleLikeClick}
          aria-label="Add to wishlist"
        >
          <svg viewBox="0 0 24 24" fill={isLiked ? "#ff4d4f" : "none"} stroke={isLiked ? "#ff4d4f" : "#94a3b8"} strokeWidth="2.5">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
          </svg>
        </button>

        <div 
          className="ec-pc-carousel-track"
          style={{ transform: `translateX(-${currentIndex * 100}%)` }}
        >
          {images.map((img, index) => (
            <div className="ec-pc-slide" key={index}>
              <img src={img} alt={`${product.title}`} draggable="false" />
            </div>
          ))}
        </div>

        {images.length > 1 && (
          <div className="ec-pc-indicators">
            {images.map((_, index) => (
              <span key={index} className={`dot ${index === currentIndex ? 'active' : ''}`} />
            ))}
          </div>
        )}
      </div>

      <div className="ec-pc-info-section">
        <div className="ec-pc-meta-row">
          <span className="ec-pc-brand">{product.brand || 'e CART'}</span>
          <span className="ec-pc-category">{product.category}</span>
        </div>
        
        <h3 className="ec-pc-title" title={product.title}>{product.title}</h3>

        <div className="ec-pc-price-row">
          <span className="current-price">${product.price.toFixed(2)}</span>
          {product.discountPercentage > 0 && (
            <span className="original-price">${originalPrice.toFixed(2)}</span>
          )}
        </div>

        <button 
          className={`ec-pc-add-to-cart-btn ${isAdded ? 'added' : ''}`} 
          onClick={handleCartClick}
        >
          <span className="icon">{isAdded ? '✓' : '+'}</span>
          <span className="text">{isAdded ? 'Added' : 'Add to Cart'}</span>
        </button>
      </div>

    </div>
  );
};

export default ProductCard;