import { useNavigate } from "react-router-dom";
import ProductCard from "./ProductCard";
import "./WishlistPage.css";

const WishlistPage = ({ wishlist, toggleWishlist, addToCart, removeFromCart, cart }) => {
  const navigate = useNavigate();

  const removeFromWishlist = (id) => {
    const product = wishlist.find(p => p.id === id);
    if (product) {
      toggleWishlist(product);
    }
  };

  const handleAddToCart = (product) => {
    addToCart(product);
    // Optionally remove from wishlist after adding to cart
    // toggleWishlist(product);
  };

  return (
    <div className="pet-cart-page wishlist-page">
      <div className="pet-cart-container">
        
        {/* App Header Bar matching CartPage */}
        <header className="pet-cart-header">
          <h1 className="pet-cart-title">My Wishlist</h1>
          <button className="header-more-btn" aria-label="More options">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/>
            </svg>
          </button>
        </header>

        {wishlist.length === 0 ? (
          <div className="pet-empty-state">
            <div className="empty-icon">❤️</div>
            <h2>Your wishlist is empty</h2>
            <p>Save items that you like in your wishlist to review them later.</p>
            <button className="shop-now-btn" onClick={() => navigate("/")}>
              Shop Now
            </button>
          </div>
        ) : (
          <div className="pet-cart-items-list">
            {wishlist.map((product) => (
              <div key={product.id} className="pet-cart-item-card">
                
                {/* Decorative background container block for image */}
                <div className="pet-cart-image-frame">
                  <img
                    className="pet-cart-img"
                    src={product.thumbnail}
                    alt={product.title}
                    loading="lazy"
                    decoding="async"
                  />
                </div>

                {/* Core product information sheet */}
                <div className="pet-cart-item-details">
                  <div className="item-meta-header">
                    <h3 className="pet-item-title">{product.title}</h3>
                    <p className="pet-item-brand">{product.brand || 'Premium Quality'}</p>
                    <span className="pet-item-price">${(product.price).toFixed(2)}</span>
                  </div>

                  {/* Actions: Add to Cart & Remove */}
                  <div className="item-interactive-footer">
                    <button 
                      className="pet-checkout-primary-btn" 
                      style={{ marginTop: 0, padding: '8px 16px', borderRadius: '12px' }}
                      onClick={() => handleAddToCart(product)}
                    >
                      Add to Cart
                    </button>

                    <button 
                      className="inline-remove-btn" 
                      onClick={() => removeFromWishlist(product.id)}
                      title="Remove from wishlist"
                    >
                      Remove
                    </button>
                  </div>
                </div>

              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default WishlistPage;
