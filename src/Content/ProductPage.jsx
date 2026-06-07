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
    const fetchProduct = async () => {
      try {
        const response = await fetch(
          `https://dummyjson.com/products/${p_id}`
        );

        const data = await response.json();

        setProduct(data);

        if (data.images?.length) {
          setSelectedImage(data.images[0]);
        } else {
          setSelectedImage(data.thumbnail);
        }
      } catch (error) {
        console.log(error);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [p_id]);

  if (loading) {
    return (
      <div className="product-loading">
        <h1>Loading Product...</h1>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="product-loading">
        <h1>Product Not Found</h1>
      </div>
    );
  }

  return (
    <div className="product-page">
      <div className="product-container">

        <button
          className="back-btn"
          onClick={() => navigate(-1)}
        >
          ← Back
        </button>

        {/* HERO SECTION */}

        <section className="product-hero">

          <div className="gallery-section">

            <div className="main-image">
              <img
                src={selectedImage}
                alt={product.title}
              />
            </div>

            <div className="image-list">
              {product.images?.map((img, index) => (
                <img
                  key={index}
                  src={img}
                  alt={product.title}
                  className={
                    selectedImage === img
                      ? "active-thumb"
                      : ""
                  }
                  onClick={() =>
                    setSelectedImage(img)
                  }
                />
              ))}
            </div>

          </div>

          <div className="details-section">

            <span className="category-tag">
              {product.category}
            </span>

            <h1>{product.title}</h1>

            <h3>{product.brand}</h3>

            <div className="tags">
              {product.tags?.map((tag) => (
                <span key={tag}>{tag}</span>
              ))}
            </div>

            <div className="rating-stock">

              <span className="rating">
                ⭐ {product.rating}
              </span>

              <span
                className={
                  product.stock > 10
                    ? "stock in-stock"
                    : "stock low-stock"
                }
              >
                {product.availabilityStatus}
              </span>

            </div>

            <div className="price-container">

              <h2>${product.price}</h2>

              <span className="discount-badge">
                {product.discountPercentage}% OFF
              </span>

            </div>

            <p className="description">
              {product.description}
            </p>

            <div className="purchase-buttons">

              <button
                className="add-cart-btn"
                onClick={() => addToCart(product)}
              >
                Add To Cart
              </button>

              <button className="buy-now-btn">
                Buy Now
              </button>

            </div>

          </div>

        </section>

        {/* SPECIFICATIONS */}

        <section className="section-card">

          <h2>Specifications</h2>

          <div className="spec-grid">

            <div>
              <span>SKU</span>
              <p>{product.sku}</p>
            </div>

            <div>
              <span>Weight</span>
              <p>{product.weight} kg</p>
            </div>

            <div>
              <span>Width</span>
              <p>{product.dimensions?.width} cm</p>
            </div>

            <div>
              <span>Height</span>
              <p>{product.dimensions?.height} cm</p>
            </div>

            <div>
              <span>Depth</span>
              <p>{product.dimensions?.depth} cm</p>
            </div>

            <div>
              <span>Minimum Order</span>
              <p>{product.minimumOrderQuantity}</p>
            </div>

          </div>

        </section>

        {/* SHIPPING */}

        <section className="section-card">

          <h2>Shipping & Warranty</h2>

          <div className="info-grid">

            <div>
              <h4>Warranty</h4>
              <p>
                {product.warrantyInformation}
              </p>
            </div>

            <div>
              <h4>Shipping</h4>
              <p>
                {product.shippingInformation}
              </p>
            </div>

            <div>
              <h4>Return Policy</h4>
              <p>{product.returnPolicy}</p>
            </div>

          </div>

        </section>

        {/* META */}

        <section className="section-card">

          <h2>Product Information</h2>

          <div className="info-grid">

            <div>
              <h4>Barcode</h4>
              <p>{product.meta?.barcode}</p>
            </div>

            <div>
              <h4>Created At</h4>
              <p>
                {new Date(
                  product.meta?.createdAt
                ).toLocaleDateString()}
              </p>
            </div>

            <div>
              <h4>Updated At</h4>
              <p>
                {new Date(
                  product.meta?.updatedAt
                ).toLocaleDateString()}
              </p>
            </div>

          </div>

        </section>

        {/* REVIEWS */}

        <section className="section-card">

          <h2>
            Customer Reviews (
            {product.reviews?.length || 0})
          </h2>

          <div className="reviews-grid">

            {product.reviews?.map(
              (review, index) => (
                <div
                  className="review-card"
                  key={index}
                >
                  <div className="review-top">

                    <h4>
                      {review.reviewerName}
                    </h4>

                    <span>
                      ⭐ {review.rating}
                    </span>

                  </div>

                  <p>{review.comment}</p>

                  <small>
                    {new Date(
                      review.date
                    ).toLocaleDateString()}
                  </small>
                </div>
              )
            )}

          </div>

        </section>

      </div>
    </div>
  );
};

export default ProductPage;