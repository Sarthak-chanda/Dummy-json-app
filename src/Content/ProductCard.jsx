import { useState } from "react";

const ProductCard = ({ product, addToCart, isRowCard = false }) => {
  const [isAdded, setIsAdded] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const handleCartClick = (e) => {
    e.stopPropagation();

    const btn = e.currentTarget;
    btn.classList.add("tapped");
    setIsAdded(true);
    addToCart(product);

    window.setTimeout(() => {
      btn.classList.remove("tapped");
    }, 400);
  };

  const handleMoreClick = (e) => {
    e.stopPropagation();
    setIsOpen((prev) => !prev);
  };

  return (
    <div className={`product-card ${isOpen ? "open" : ""} ${isRowCard ? "row-card" : ""}`}>
      <div className="product-top">
        <img
          src={product.thumbnail}
          alt={product.title}
          className="product-main-image"
          draggable="false"
        />

        <div className="product-summary">
          <h2>{product.title}</h2>

          <div className="product-inline">
            <span className="product-label">Price:</span>
            <span>${product.price}</span>
          </div>

          <div className="product-inline">
            <span className="product-label">Rating:</span>
            <span>★ {product.rating}</span>
          </div>
        </div>
      </div>

      <div className={`product-more ${isOpen ? "show" : ""}`}>
        <p>
          <strong>Description:</strong> {product.description}
        </p>

        <div className="image-strip">
          {product.images?.map((img, index) => (
            <img key={index} src={img} alt={`${product.title} thumbnail ${index + 1}`} draggable="false" />
          ))}
        </div>
      </div>

      <div className="card-actions">
        <button type="button" className="more-btn" onClick={handleMoreClick}>
          {isOpen ? "Less" : "...More"}
        </button>

        <button
          type="button"
          className={`cart-btn ${isAdded ? "added-state" : ""}`}
          onClick={handleCartClick}
          disabled={isAdded}
        >
          {isAdded ? "✓ Added" : "Add to Cart"}
        </button>
      </div>
    </div>
  );
};

export default ProductCard;