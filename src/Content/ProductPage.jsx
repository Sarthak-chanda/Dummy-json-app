import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "./ProductPage.css";

const ProductPage = ({ addToCart }) => {
  const { p_id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [selectedImage, setSelectedImage] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`https://dummyjson.com/products/${p_id}`)
      .then(res => res.json())
      .then(data => {
        setProduct(data);
        setSelectedImage(data.images?.[0] || data.thumbnail);
        setLoading(false);
      });
  }, [p_id]);

  if (loading) return (
    <div className="pp-loading-screen">
      <div className="pp-spinner"></div>
      <p>Loading premium details...</p>
    </div>
  );

  const originalPrice = (product.price / (1 - product.discountPercentage / 100)).toFixed(2);

  return (
    <div className="premium-product-page">
      
      {/* Floating Glass Back Button (Aligned to Nav Bounds) */}
      <div className="pp-back-btn-container">
        <div className="pp-back-btn-wrapper">
          <button className="pp-back-btn" onClick={() => navigate(-1)}>
            <svg className="pp-back-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="m15 18-6-6 6-6"/>
            </svg>
            Back
          </button>
        </div>
      </div>

      <div className="pp-container">
        
        {/* ================= HERO SECTION ================= */}
        <section className="pp-hero-section">
          {/* Left: Gallery */}
          <div className="pp-gallery-card">
            <div className="pp-main-image-frame">
              <img src={selectedImage} alt={product.title} />
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

          {/* Right: Details */}
          <div className="pp-details-card">
            <div className="pp-badge-row">
              <span className="pp-brand-badge">{product.brand || "Premium"}</span>
              <span className="pp-stock-badge">{product.availabilityStatus}</span>
            </div>
            
            <h1 className="pp-title">{product.title}</h1>
            
            <div className="pp-price-block">
              <span className="pp-current-price">${product.price.toFixed(2)}</span>
              <span className="pp-original-price">${originalPrice}</span>
              <span className="pp-discount-tag">{Math.round(product.discountPercentage)}% OFF</span>
            </div>

            <div className="pp-section-block">
              <h3 className="pp-section-heading">Product Overview</h3>
              <p className="pp-description">{product.description}</p>
            </div>

            <div className="pp-action-block">
              <button className="pp-add-cart-btn" onClick={() => addToCart(product)}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="8" cy="21" r="1"/><circle cx="19" cy="21" r="1"/>
                  <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"/>
                </svg>
                Add to Cart
              </button>
            </div>
            
            <div className="pp-trust-row">
              <div className="pp-trust-item">
                <span className="icon">🛡️</span> {product.warrantyInformation}
              </div>
              <div className="pp-trust-item">
                <span className="icon">📦</span> {product.shippingInformation}
              </div>
              <div className="pp-trust-item">
                <span className="icon">↩️</span> {product.returnPolicy}
              </div>
            </div>
          </div>
        </section>

        {/* ================= SPECIFICATIONS ================= */}
        <section className="pp-specs-section">
          <h2 className="pp-main-heading">Technical Specifications</h2>
          <div className="pp-specs-grid">
            <div className="pp-spec-card">
              <span className="pp-spec-label">Weight</span>
              <span className="pp-spec-value">{product.weight} kg</span>
            </div>
            <div className="pp-spec-card">
              <span className="pp-spec-label">SKU</span>
              <span className="pp-spec-value">{product.sku}</span>
            </div>
            <div className="pp-spec-card">
              <span className="pp-spec-label">Dimensions</span>
              <span className="pp-spec-value">
                {product.dimensions ? `${product.dimensions.width} x ${product.dimensions.height} x ${product.dimensions.depth} cm` : 'N/A'}
              </span>
            </div>
            <div className="pp-spec-card">
              <span className="pp-spec-label">Minimum Order</span>
              <span className="pp-spec-value">{product.minimumOrderQuantity} units</span>
            </div>
          </div>
        </section>

        {/* ================= REVIEWS ================= */}
        <section className="pp-reviews-section">
          <h2 className="pp-main-heading">Customer Reviews <span>({product.reviews?.length || 0})</span></h2>
          <div className="pp-reviews-grid">
            {product.reviews?.map((r, i) => (
              <div key={i} className="pp-review-card">
                <div className="pp-review-header">
                  <div className="pp-reviewer-info">
                    <div className="pp-avatar">{r.reviewerName.charAt(0)}</div>
                    <strong>{r.reviewerName}</strong>
                  </div>
                  <div className="pp-star-rating">
                    ★ {r.rating}
                  </div>
                </div>
                <p className="pp-review-text">"{r.comment}"</p>
                <span className="pp-review-date">{new Date(r.date).toLocaleDateString()}</span>
              </div>
            ))}
          </div>
        </section>

      </div>
    </div>
  );
};

export default ProductPage;