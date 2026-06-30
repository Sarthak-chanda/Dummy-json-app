import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import ProductCard from "./ProductCard";
import "./ProductPage.css";

const ProductPage = ({ addToCart, removeFromCart, cart = [], wishlist = [], toggleWishlist }) => {
  const { p_id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [selectedImage, setSelectedImage] = useState("");
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);
  const [openFaq, setOpenFaq] = useState(null);

  useEffect(() => {
    setLoading(true);
    fetch(`https://dummyjson.com/products/${p_id}`)
      .then(res => res.json())
      .then(data => {
        setProduct(data);
        setSelectedImage(data.images?.[0] || data.thumbnail);
        
        // Fetch random related products (suggestions)
        fetch(`https://dummyjson.com/products?limit=12&skip=${Math.floor(Math.random() * 80)}`)
          .then(res => res.json())
          .then(relData => {
            setRelatedProducts(relData.products.filter(p => String(p.id) !== String(p_id)));
          })
          .catch(() => setRelatedProducts([]));

        setLoading(false);
        window.scrollTo(0, 0);
      });
  }, [p_id]);

  if (loading) return (
    <div className="pp-loading-screen">
      <div className="pp-spinner"></div>
      <p>Loading premium details...</p>
    </div>
  );

  const originalPrice = (product.price / (1 - product.discountPercentage / 100)).toFixed(2);
  const isAdded = cart.some(item => String(item.id) === String(p_id));
  const isLiked = wishlist.some(item => String(item.id) === String(p_id));

  const handleCartClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (isAdded) {
      setIsRemoving(true);
      setTimeout(() => {
        if (removeFromCart) {
          removeFromCart(product);
        }
        setIsRemoving(false);
        if ('vibrate' in navigator) navigator.vibrate(50);
      }, 500);
      return;
    }
    
    setIsAdding(true);
    setTimeout(() => {
      addToCart(product);
      setIsAdding(false);
      if ('vibrate' in navigator) navigator.vibrate(50);
    }, 500);
  };

  const toggleFaq = (index) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  const faqs = [
    { question: "What is the warranty period?", answer: product.warrantyInformation || "Standard 1-year warranty." },
    { question: "What is the return policy?", answer: product.returnPolicy || "30-day money back guarantee." },
    { question: "How long does shipping take?", answer: product.shippingInformation || "Ships within 24 hours." },
    { question: "What are the dimensions?", answer: product.dimensions ? `${product.dimensions.width} x ${product.dimensions.height} x ${product.dimensions.depth} cm` : "Compact design." }
  ];

  return (
    <div className="premium-product-page">
      <div className="pp-container">
        
        {/* ================= TOP SECTION ================= */}
        <div className="pp-top-section">
          
          {/* Left: Image Gallery */}
          <div className="pp-image-gallery">
            <div className="pp-main-image-frame">
              <img src={selectedImage} alt={product.title} decoding="async" />
              <button 
                className={`pp-wishlist-float ${isLiked ? 'active' : ''}`} 
                onClick={() => toggleWishlist(product)}
              >
                <svg viewBox="0 0 24 24" width="24" height="24" fill={isLiked ? "#ff4d4f" : "none"} stroke={isLiked ? "#ff4d4f" : "#475569"} strokeWidth="2.5">
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                </svg>
              </button>
            </div>
            
            <div className="pp-thumbnail-strip">
              {product.images?.map((img, i) => (
                <div key={i} className="pp-thumb-container">
                  <button 
                    className={`pp-thumb-btn ${selectedImage === img ? "active" : ""}`} 
                    onClick={() => setSelectedImage(img)}
                  >
                    <img src={img} alt={`Thumbnail ${i}`} loading="lazy" decoding="async" />
                  </button>
                  <span className="pp-thumb-label">View {i + 1}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right: Details & Action */}
          <div className="pp-details-column">
            <h1 className="pp-title">{product.title}</h1>
            <p className="pp-category">{product.category.replace("-", " ")}</p>
            
            <div className="pp-rating-row">
              <div className="pp-stars">
                {[...Array(5)].map((_, index) => (
                  <span key={index} className={index < Math.round(product.rating) ? "star filled" : "star empty"}>★</span>
                ))}
              </div>
              <span className="pp-rating-score">{product.rating}</span>
              <span className="pp-reviews-count">| {product.reviews?.length || 0} Reviews</span>
            </div>

            <div className="pp-price-block">
              <span className="pp-original-price">${originalPrice}</span>
              <div className="pp-current-price-row">
                <span className="pp-current-price">${product.price.toFixed(2)}</span>
                <span className="pp-save-badge">Save {Math.round(product.discountPercentage)}%</span>
              </div>
            </div>

            <p className="pp-description">{product.description}</p>

            <button 
              className={`pp-main-action-btn ${isAdded ? 'remove' : ''} ${isAdding ? 'adding' : ''} ${isRemoving ? 'removing' : ''}`} 
              onClick={handleCartClick}
              disabled={isAdding || isRemoving}
            >
              {isAdding ? "Adding..." : isRemoving ? "Removing..." : isAdded ? "Remove" : "Add to Cart"}
            </button>

            <p className="pp-shipping-note">Free 2-Day Shipping</p>

            <div className="pp-trust-grid-2x2">
              <div className="pp-trust-item">
                <span className="icon">🔒</span> Secure Checkout
              </div>
              <div className="pp-trust-item">
                <span className="icon">🚚</span> Fast Shipping
              </div>
              <div className="pp-trust-item">
                <span className="icon">💰</span> 30-Day Money Back
              </div>
              <div className="pp-trust-item">
                <span className="icon">🛡️</span> {product.warrantyInformation || "2-Year Warranty"}
              </div>
            </div>
          </div>
        </div>

        {/* ================= MIDDLE SECTION ================= */}
        <div className="pp-middle-section">
          <h2>Why {product.title}?</h2>
          <div className="pp-features-row">
            <div className="pp-feature-card">
              <div className="pp-feature-icon">✨</div>
              <div className="pp-feature-text">
                <h3>Premium Quality</h3>
                <p>{product.brand || "Top-tier"} materials and construction.</p>
              </div>
            </div>
            <div className="pp-feature-card">
              <div className="pp-feature-icon">📦</div>
              <div className="pp-feature-text">
                <h3>{product.shippingInformation || "Fast Shipping"}</h3>
                <p>Reliable logistics right to your doorstep.</p>
              </div>
            </div>
            <div className="pp-feature-card">
              <div className="pp-feature-icon">🔄</div>
              <div className="pp-feature-text">
                <h3>{product.returnPolicy || "Easy Returns"}</h3>
                <p>Hassle-free guarantee if you're not satisfied.</p>
              </div>
            </div>
          </div>
        </div>

        {/* ================= REVIEWS SECTION ================= */}
        <div className="pp-reviews-section">
          <h2>Customer Reviews</h2>
          <div className="pp-reviews-row">
            {product.reviews?.length > 0 ? product.reviews.map((r, i) => (
              <div key={i} className="pp-review-card">
                <div className="pp-review-header">
                  <div className="pp-avatar">
                    <img src={`https://ui-avatars.com/api/?name=${r.reviewerName}&background=random`} alt={r.reviewerName} />
                  </div>
                  <div className="pp-review-stars">
                    {[...Array(5)].map((_, index) => (
                      <span key={index} className={index < Math.round(r.rating) ? "star filled" : "star empty"}>★</span>
                    ))}
                    <span className="score">{r.rating}</span>
                  </div>
                </div>
                <p className="pp-review-text">"{r.comment}"</p>
                <p className="pp-reviewer-name">{r.reviewerName}</p>
              </div>
            )) : (
              <p className="pp-no-reviews">No reviews yet.</p>
            )}
          </div>
        </div>

        {/* ================= FAQ SECTION ================= */}
        <div className="pp-faq-section">
          <h2>Frequently Asked Questions</h2>
          <div className="pp-faq-list">
            {faqs.map((faq, i) => (
              <div key={i} className={`pp-faq-item ${openFaq === i ? 'open' : ''}`}>
                <div className="pp-faq-question" onClick={() => toggleFaq(i)}>
                  {faq.question}
                  <span className="arrow">↓</span>
                </div>
                <div className="pp-faq-answer">
                  <p>{faq.answer}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ================= RELATED PRODUCTS ================= */}
        {relatedProducts.length > 0 && (
          <div className="pp-related-section">
            <div className="pp-related-header">
              <h2>Suggestions</h2>
            </div>
            <div className="pp-related-row">
              {relatedProducts.map(rel => (
                <ProductCard 
                  key={rel.id}
                  product={rel}
                  addToCart={addToCart}
                  removeFromCart={removeFromCart}
                  cart={cart}
                  wishlist={wishlist}
                  toggleWishlist={toggleWishlist}
                />
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default ProductPage;