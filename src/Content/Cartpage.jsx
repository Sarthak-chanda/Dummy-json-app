import { useNavigate } from 'react-router-dom';
import './CartPage.css';

export default function CartPage({ cart = [], setCart }) {
  const navigate = useNavigate();

  const increaseQty = (id) => {
    setCart(
      cart.map((item) =>
        item.id === id
          ? { ...item, quantity: (item.quantity || 1) + 1 }
          : item
      )
    )
  };

  const decreaseQty = (id) => {
    setCart(
      cart.map((item) =>
        item.id === id && (item.quantity || 1) > 1
          ? { ...item, quantity: (item.quantity || 1) - 1 }
          : item
      )
    )
  };

  const removeFromCart = (id) => {
    setCart(cart.filter((item) => item.id !== id));
  };

  // Compute precise mathematical values matching the layout structure
  const subTotal = cart.reduce(
    (sum, item) => sum + item.price * (item.quantity || 1),
    0
  );
  
  const shippingAndTax = cart.length > 0 ? 5.00 : 0.00;
  const grandTotal = subTotal + shippingAndTax;

  return (
    <div className="pet-cart-page">
      <div className="pet-cart-container">
        
        {/* App Header Bar mimicking the UI design */}
        <header className="pet-cart-header">
          <h1 className="pet-cart-title">My Cart</h1>
          <button className="header-more-btn" aria-label="More options">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/>
            </svg>
          </button>
        </header>

        {cart.length === 0 ? (
          <div className="pet-empty-state">
            <div className="empty-icon">🛒</div>
            <h2>Your cart feels light!</h2>
            <p>Add products from the store to customize your order.</p>
            <button className="shop-now-btn" onClick={() => navigate('/')}>Explore Products</button>
          </div>
        ) : (
          <div className="pet-cart-layout-grid">
            
            {/* Left Main Stream: Content Cards */}
            <div className="pet-cart-items-list">
              {cart.map((product) => (
                <div key={product.id} className="pet-cart-item-card">
                  
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
                      <p className="pet-item-brand">{product.brand || 'The Blue Buffalo'}</p>
                      <span className="pet-item-price">${(product.price).toFixed(2)}</span>
                    </div>

                    {/* Quantity Manipulation & Quick Trash Actions */}
                    <div className="item-interactive-footer">
                      <div className="pet-quantity-stepper">
                        <button 
                          className="stepper-btn minus" 
                          onClick={() => decreaseQty(product.id)}
                          disabled={(product.quantity || 1) <= 1}
                        >
                          —
                        </button>
                        <span className="stepper-value">{product.quantity || 1}</span>
                        <button 
                          className="stepper-btn plus" 
                          onClick={() => increaseQty(product.id)}
                        >
                          +
                        </button>
                      </div>

                      <button 
                        className="inline-remove-btn" 
                        onClick={() => removeFromCart(product.id)}
                        title="Remove item"
                      >
                        Delete
                      </button>
                    </div>
                  </div>

                </div>
              ))}
            </div>

            {/* Right Sticky Sidebar: Checkout Breakdown Summary */}
            <div className="pet-cart-summary-card">
              <div className="summary-invoice-sheet">
                <div className="invoice-row">
                  <span className="invoice-label">Sub total</span>
                  <span className="invoice-value">${subTotal.toFixed(2)}</span>
                </div>
                <div className="invoice-row">
                  <span className="invoice-label">Shipping & tax</span>
                  <span className="invoice-value">${shippingAndTax.toFixed(2)}</span>
                </div>
                
                <div className="invoice-divider-dotted" />
                
                <div className="invoice-row total-row">
                  <span className="invoice-label-bold">Total</span>
                  <span className="invoice-value-bold">${grandTotal.toFixed(2)}</span>
                </div>
              </div>

              <button 
                className="pet-checkout-primary-btn"
                onClick={() => alert('Proceeding to secure checkout gateway...')}
              >
                Checkout Now
              </button>
            </div>

          </div>
        )}

      </div>
    </div>
  );
}