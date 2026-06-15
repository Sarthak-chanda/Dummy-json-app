import { useEffect, useState, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "./ProductPage.css";

const ProductPage = ({ addToCart, cart = [], wishlist = [], toggleWishlist }) => {
  const { p_id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [selectedImage, setSelectedImage] = useState("");
  const [loading, setLoading] = useState(true);
  const reviewsRef = useRef(null);

  useEffect(() => {
    fetch(`https://dummyjson.com/products/${p_id}`)
      .then(res => res.json())
      .then(data => {
        setProduct(data);
        setSelectedImage(data.images?.[0] || data.thumbnail);
        setLoading(false);
      });
  }, [p_id]);

  const scrollToReviews = () => {
    reviewsRef.current?.scrollIntoView({ behavior: 'smooth' });
  };


  if (loading) return (
    <div className="pp-loading-screen">
      <div className="pp-spinner"></div>
      <p>Loading premium details...</p>
    </div>
  );

  const originalPrice = (product.price / (1 - product.discountPercentage / 100)).toFixed(2);
  const isAdded = cart.some(item => item.id === parseInt(p_id));
  const isLiked = wishlist.some(item => item.id === parseInt(p_id));

  return (
    <div className="premium-product-page">
      <div className="pp-container">
        
        {/* ================= HERO SECTION ================= */}
        <div className="pp-mobile-hero">
          <div className="pp-main-image-frame">
            <img src={selectedImage} alt={product.title} />
          </div>
          
          <div className="pp-image-controls">
            <button 
              className={`pp-wishlist-float ${isLiked ? 'active' : ''}`} 
              onClick={() => toggleWishlist(product)}
            >
              <svg viewBox="0 0 24 24" width="24" height="24" fill={isLiked ? "#ff4d4f" : "none"} stroke={isLiked ? "#ff4d4f" : "white"} strokeWidth="2.5">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
              </svg>
            </button>
          </div>

          <div className="pp-thumbnail-strip">
            {product.images?.map((img, i) => (
              <button 
                key={i} 
                className={`pp-thumb-btn ${selectedImage === img ? "active" : ""}`} 
                onClick={() => setSelectedImage(img)}
              >
                <img src={img} alt={`Thumbnail ${i}`} />
              </button>
            ))}
          </div>
        </div>

        <div className="pp-main-layout">
          {/* Header Info */}
          <div className="pp-header-card">
            <div className="pp-brand-row">
              <span className="pp-brand-name">{product.brand || "Premium"}</span>
              <div className="pp-rating-chip" onClick={scrollToReviews} style={{ cursor: 'pointer' }}>
                ★ {product.rating}
              </div>
            </div>
            <h1 className="pp-title">{product.title}</h1>
            
            <div className="pp-price-section">
              <div className="pp-price-wrap">
                <span className="pp-current-price">${product.price.toFixed(2)}</span>
                <span className="pp-original-price">${originalPrice}</span>
              </div>
              <span className="pp-discount-badge">{Math.round(product.discountPercentage)}% OFF</span>
            </div>
          </div>

          {/* Action Card (Sidebar on desktop, inline on mobile) */}
          <div className="pp-action-card">
            <div className="pp-stock-status">
              <div className={`pp-status-dot ${product.stock > 0 ? 'in-stock' : 'out-of-stock'}`}></div>
              <span>{product.availabilityStatus} ({product.stock} units left)</span>
            </div>
            
            <button 
              className={`pp-main-action-btn ${isAdded ? 'added' : ''}`} 
              onClick={() => addToCart(product)}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="8" cy="21" r="1"/><circle cx="19" cy="21" r="1"/>
                <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"/>
              </svg>
              {isAdded ? "Added to Cart" : "Add to Cart"}
            </button>
          </div>

          {/* Description */}
          <div className="pp-info-card">
            <h3 className="pp-section-title">Description</h3>
            <p className="pp-description">{product.description}</p>
          </div>

          {/* Trust Elements */}
          <div className="pp-trust-grid">
            <div className="pp-trust-card">
              <span className="pp-trust-icon">🛡️</span>
              <p>{product.warrantyInformation}</p>
            </div>
            <div className="pp-trust-card">
              <span className="pp-trust-icon">📦</span>
              <p>{product.shippingInformation}</p>
            </div>
            <div className="pp-trust-card">
              <span className="pp-trust-icon">↩️</span>
              <p>{product.returnPolicy}</p>
            </div>
          </div>

          {/* Specifications */}
          <section className="pp-specs-section">
            <h3 className="pp-section-title">Specifications</h3>
            <div className="pp-specs-list">
              <div className="pp-spec-item">
                <span>Weight</span>
                <strong>{product.weight} kg</strong>
              </div>
              <div className="pp-spec-item">
                <span>SKU</span>
                <strong>{product.sku}</strong>
              </div>
              <div className="pp-spec-item">
                <span>Dimensions</span>
                <strong>{product.dimensions ? `${product.dimensions.width}x${product.dimensions.height}x${product.dimensions.depth}cm` : 'N/A'}</strong>
              </div>
            </div>
          </section>
        </div>

        {/* Reviews Section */}
        <section className="pp-reviews-section" ref={reviewsRef}>
          <h3 className="pp-section-title">Customer Reviews <span>({product.reviews?.length || 0})</span></h3>
          <div className="pp-reviews-list">
            {product.reviews?.map((r, i) => (
              <div key={i} className="pp-review-card">
                <div className="pp-review-header">
                  <div className="pp-reviewer">
                    <div className="pp-avatar">{r.reviewerName.charAt(0)}</div>
                    <div>
                      <strong>{r.reviewerName}</strong>
                      <div className="pp-review-meta">
                        <div className="pp-review-stars">
                          {[...Array(5)].map((_, index) => (
                            <span key={index} className={index < Math.round(r.rating) ? "star filled" : "star empty"}>
                              ★
                            </span>
                          ))}
                        </div>
                        <span className="pp-rating-num">{r.rating}</span>
                      </div>
                    </div>
                  </div>
                  <span className="pp-review-date">{new Date(r.date).toLocaleDateString()}</span>
                </div>
                <p className="pp-review-text">"{r.comment}"</p>
              </div>
            ))}
          </div>
        </section>

      </div>
    </div>
  );
};

export default ProductPage;