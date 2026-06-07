import { useState } from "react";
import { Link } from "react-router-dom";
import "./ProductCard.css";

const ProductCard = ({ product, addToCart }) => {
  const [isAdded, setIsAdded] = useState(false);

  const handleCartClick = (e) => {
    e.preventDefault();
    e.stopPropagation();

    addToCart(product);
    setIsAdded(true);

    setTimeout(() => {
      setIsAdded(false);
    }, 1500);
  };

  // Calculate an estimated original price to mimic Amazon/Flipkart's strikethrough retail price style
  const originalPrice = product.discountPercentage > 0 
    ? Math.round(product.price / (1 - product.discountPercentage / 100)) 
    : product.price;

  return (
    <Link
      to={`/p/${encodeURIComponent(product.title)}/${product.id}`}
      className="product-card-link"
    >
      <div className="product-card">
        <div className="product-image-wrapper">
          <img
            src={product.thumbnail}
            alt={product.title}
            className="product-main-image"
          />
          {product.discountPercentage > 0 && (
            <span className="discount-badge-tag">
              {Math.round(product.discountPercentage)}% OFF
            </span>
          )}
        </div>

        <div className="product-content">
          <span className="product-brand">{product.brand}</span>
          <h3 className="product-title" title={product.title}>
            {product.title}
          </h3>

          <div className="product-rating-row">
            <span className="rating-stars">
              {"★".repeat(Math.round(product.rating))}${"☆".repeat(5 - Math.round(product.rating))}
            </span>
            <span className="rating-value">{product.rating}</span>
          </div>

          <div className="product-price-block">
            <div className="price-row">
              <span className="product-price">${product.price}</span>
              {product.discountPercentage > 0 && (
                <span className="product-original-price">${originalPrice}</span>
              )}
            </div>
            <span className={`stock-status ${product.stock <= 10 ? "low-stock" : ""}`}>
              {product.stock > 10 ? "In Stock" : `Only ${product.stock} left!`}
            </span>
          </div>

          <button
            className={`cart-btn ${isAdded ? "added-state" : ""}`}
            onClick={handleCartClick}
          >
            {isAdded ? "✓ Added to Cart" : "Add to Cart"}
          </button>
        </div>
      </div>
    </Link>
  );
};

export default ProductCard;