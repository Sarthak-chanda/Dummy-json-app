export default function CartPage({ cart = [], setCart, setShowCart }) {
  const increaseQty = (id) => {
    setCart(
      cart.map((item) =>
        item.id === id
          ? { ...item, quantity: (item.quantity || 1) + 1 }
          : item
      )
    )
  }

  const decreaseQty = (id) => {
    setCart(
      cart.map((item) =>
        item.id === id
          ? { ...item, quantity: Math.max(1, (item.quantity || 1) - 1) }
          : item
      )
    )
  }

  const removeFromCart = (id) => setCart(cart.filter((item) => item.id !== id))
  const cartTotal = cart.reduce(
    (sum, item) => sum + item.price * (item.quantity || 1),
    0
  )

  const handleBack = () => {
    setShowCart(false)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <div className="cart-page">
      <div className="cart-page-top">
        <button className="simple-back-btn" onClick={handleBack}>
          ← Back
        </button>
        <h1 className="cart-page-title">My Cart</h1>
      </div>

      {cart.length === 0 ? (
        <div className="empty-cart">
          <h2>Your cart is empty</h2>
        </div>
      ) : (
        <>
          <div className="cart-items">
            {cart.map((product) => (
              <div key={product.id} className="cart-item">
                <div className="cart-image-wrapper">
                  <img
                    className="cart-image"
                    src={product.thumbnail}
                    alt={product.title}
                  />
                </div>

                <div className="cart-item-details">
                  <div className="cart-item-top">
                    <div>
                      <h3 className="cart-item-title">{product.title}</h3>
                      <p className="cart-item-category">{product.category}</p>
                    </div>
                    <button
                      className="trash-btn"
                      onClick={() => removeFromCart(product.id)}
                    >
                      🗑
                    </button>
                  </div>

                  <div className="cart-item-bottom">
                    <div className="quantity-box">
                      <span className="qty-label">Qty</span>
                      <button
                        className="qty-btn"
                        onClick={() => decreaseQty(product.id)}
                      >
                        -
                      </button>
                      <strong className="qty-number">
                        {product.quantity || 1}
                      </strong>
                      <button
                        className="qty-btn"
                        onClick={() => increaseQty(product.id)}
                      >
                        +
                      </button>
                    </div>

                    <div className="item-price">
                      ${(product.price * (product.quantity || 1)).toFixed(2)}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="cart-summary">
            <div className="summary-row">
              <span>Total Price</span>
              <strong>${cartTotal.toFixed(2)}</strong>
            </div>
          </div>
        </>
      )}
    </div>
  )
}