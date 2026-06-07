import { useEffect, useState } from "react";
import ProductCard from "./ProductCard";
import "./Products.css";

const Products = ({ addToCart }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const groupedProducts = products.reduce((acc, product) => {
    const category = product.category;

    if (!acc[category]) {
      acc[category] = [];
    }

    acc[category].push(product);

    return acc;
  }, {});

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch(
          "https://dummyjson.com/products?limit=194"
        );

        const data = await response.json();

        setProducts(data.products);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  if (loading) {
    return (
      <div className="loading">
        Loading Products...
      </div>
    );
  }

  return (
    <div className="products-container">

      {/* Hero Banner */}

      <div className="products-hero">
        <div className="products-hero-content">
          <h1>Discover Amazing Products</h1>

          <p>
            Shop electronics, beauty,
            fashion, groceries and more
            at the best prices.
          </p>
        </div>
      </div>

      {/* Categories */}

      {Object.entries(groupedProducts).map(
        ([category, categoryProducts]) => (
          <CategoryRow
            key={category}
            category={category}
            products={categoryProducts}
            addToCart={addToCart}
          />
        )
      )}
    </div>
  );
};

function CategoryRow({
  category,
  products,
  addToCart,
}) {
  const [expanded, setExpanded] =
    useState(false);

  const displayedProducts = expanded
    ? products
    : products.slice(0, 12);

  return (
    <section className="category-group">

      <div className="category-header">

        <h1>
          {category.replace("-", " ")}
        </h1>

        {products.length > 12 && (
          <button
            className="category-toggle-btn"
            onClick={() =>
              setExpanded(!expanded)
            }
          >
            {expanded
              ? "Show Less"
              : "View All"}
          </button>
        )}

      </div>

      <div
        className={
          expanded
            ? "products-grid"
            : "products-row-container"
        }
      >
        {displayedProducts.map(
          (product) => (
            <ProductCard
              key={product.id}
              product={product}
              addToCart={addToCart}
            />
          )
        )}
      </div>

    </section>
  );
}

export default Products;