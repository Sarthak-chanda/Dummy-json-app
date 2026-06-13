import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./ProductCard.css";

const ProductCard = ({ product, addToCart, cart = [], wishlist = [], toggleWishlist }) => {
  const navigate = useNavigate();
  // State for the dynamically sampled center color
  const [accentColor, setAccentColor] = useState("rgba(0, 0, 0, 0.05)");
  
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

  // Advanced Color Extraction: Finds the most frequent color while ignoring background
  useEffect(() => {
    const img = new Image();
    img.crossOrigin = "Anonymous"; 
    img.src = product.thumbnail;
    
    img.onload = () => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      const size = 40; // Small grid for speed
      canvas.width = size;
      canvas.height = size;
      
      ctx.drawImage(img, 0, 0, size, size);
      try {
        const imageData = ctx.getImageData(0, 0, size, size).data;
        const colorCounts = {};
        let maxCount = 0;
        let dominantColor = [0, 0, 0];

        for (let i = 0; i < imageData.length; i += 4) {
          const r = imageData[i];
          const g = imageData[i + 1];
          const b = imageData[i + 2];
          const a = imageData[i + 3];

          // SKIP: Transparent or Background-colored pixels (Near White/Gray)
          if (a < 128 || (r > 235 && g > 235 && b > 235)) continue;

          // Bin colors to group similar shades (e.g., 10px buckets)
          const key = `${Math.floor(r/15)},${Math.floor(g/15)},${Math.floor(b/15)}`;
          colorCounts[key] = (colorCounts[key] || 0) + 1;

          if (colorCounts[key] > maxCount) {
            maxCount = colorCounts[key];
            dominantColor = [r, g, b];
          }
        }

        // If no dominant color found (e.g. all white image), fallback to center sample
        if (maxCount === 0) {
          const pixel = ctx.getImageData(size/2, size/2, 1, 1).data;
          setAccentColor(`rgba(${pixel[0]}, ${pixel[1]}, ${pixel[2]}, 0.2)`);
        } else {
          setAccentColor(`rgba(${dominantColor[0]}, ${dominantColor[1]}, ${dominantColor[2]}, 0.2)`);
        }
      } catch (e) {
        setAccentColor("rgba(0, 0, 0, 0.04)");
      }
    };
  }, [product.thumbnail]);

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
    if (now - lastTap.current < 300) {
      toggleWishlist(product);
      if ('vibrate' in navigator) navigator.vibrate([50, 30, 50]);
    }
    lastTap.current = now;
  };

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
    if (Math.abs(distanceX) > Math.abs(distanceY) && Math.abs(distanceX) > 40) {
      setIsSwiping(true);
      if (distanceX > 0 && currentIndex < images.length - 1) setCurrentIndex(prev => prev + 1);
      else if (distanceX < 0 && currentIndex > 0) setCurrentIndex(prev => prev - 1);
    }
    touchStartX.current = 0; touchEndX.current = 0;
    setTimeout(() => setIsSwiping(false), 50); 
  };

  const handleCardClick = () => {
    if (!isSwiping) navigate(`/p/${encodeURIComponent(product.title)}/${product.id}`);
  };

  const originalPrice = product.discountPercentage > 0 
    ? Math.round(product.price / (1 - product.discountPercentage / 100)) 
    : product.price;

  return (
    <div 
      className="ec-product-card" 
      onClick={handleCardClick}
      style={{ 
        // 45deg from top-left is 135deg in CSS. 
        // Gradients from sampled center color to a variable theme background.
        background: `linear-gradient(135deg, ${accentColor} 0%, var(--ec-card-bg, #ffffff) 100%)` 
      }}
    >
      
      {/* Image container with its own solid background to "exclude" it from the card gradient */}
      <div 
        className="ec-pc-image-section"
        style={{ background: 'var(--ec-image-bg, #f4f5f7)' }}
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
        
        <button className={`ec-pc-badge heart-icon ${isLiked ? 'active' : ''}`} onClick={handleLikeClick}>
          <svg viewBox="0 0 24 24" fill={isLiked ? "#ff4d4f" : "none"} stroke={isLiked ? "#ff4d4f" : "#94a3b8"} strokeWidth="2.5">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
          </svg>
        </button>

        <div className="ec-pc-carousel-track" style={{ transform: `translateX(-${currentIndex * 100}%)` }}>
          {images.map((img, index) => (
            <div className="ec-pc-slide" key={index}>
              <img src={img} alt={product.title} draggable="false" />
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
        
        <h3 className="ec-pc-title">{product.title}</h3>

        <div className="ec-pc-price-row">
          <span className="current-price">${product.price.toFixed(2)}</span>
          {product.discountPercentage > 0 && (
            <span className="original-price">${originalPrice.toFixed(2)}</span>
          )}
        </div>

        <button className={`ec-pc-add-to-cart-btn ${isAdded ? 'added' : ''}`} onClick={handleCartClick}>
          <span className="icon">{isAdded ? '✓' : '+'}</span>
          <span className="text">{isAdded ? 'Added' : 'Add to Cart'}</span>
        </button>
      </div>

    </div>
  );
};

export default ProductCard;