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

  if (loading) return <div className="product-loading">Loading details...</div>;

  const originalPrice = (product.price / (1 - product.discountPercentage/100)).toFixed(2);

  return (
    <div className="product-page">
      <div className="product-container">
        <button className="back-btn" onClick={() => navigate(-1)}>← Back to Shop</button>

        <section className="product-hero">
          <div className="gallery-section">
            <div className="image-list">
              {product.images?.map((img, i) => (
                <img key={i} src={img} className={selectedImage === img ? "active-thumb" : ""} onClick={() => setSelectedImage(img)} />
              ))}
            </div>
            <div className="main-image">
              <img src={selectedImage} alt={product.title} />
            </div>
          </div>

          <div className="details-section">
            <p className="brand-name">{product.brand} | SKU: {product.sku}</p>
            <h1>{product.title}</h1>
            
            <div className="price-row">
              <span className="current-price">${product.price.toFixed(2)}</span>
              <span className="original-price">${originalPrice}</span>
              <span className="discount-tag">{Math.round(product.discountPercentage)}% OFF</span>
            </div>

            <p className="description">{product.description}</p>
            
            {/* Added technical specs from the data */}
            <div className="specs-grid">
               <p><strong>Weight:</strong> {product.weight}kg</p>
               <p><strong>Warranty:</strong> {product.warrantyInformation}</p>
               <p><strong>Shipping:</strong> {product.shippingInformation}</p>
            </div>

            <div className="purchase-cta">
              <button className="ec-pc-add-to-cart-btn" onClick={() => addToCart(product)}>Add to Cart</button>
            </div>

            <div className="trust-badges">
              <span>{product.availabilityStatus}</span>
              <span>{product.returnPolicy}</span>
            </div>
          </div>
        </section>

        {/* Customer Reviews Section */}
        <section className="reviews-section">
          <h2>Customer Reviews ({product.reviews?.length})</h2>
          <div className="reviews-grid">
            {product.reviews?.map((r, i) => (
              <div key={i} className="review-card">
                <strong>{r.reviewerName}</strong> <span>★ {r.rating}</span>
                <p>{r.comment}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};

export default ProductPage;