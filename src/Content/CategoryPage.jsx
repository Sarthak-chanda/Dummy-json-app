import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import ProductCard from "./ProductCard";
import Loading from "../Loading";
import "./CategoryPage.css";

const CategoryPage = ({ addToCart, removeFromCart, cart, wishlist, toggleWishlist }) => {
  const { categoryName } = useParams();
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategoryProducts = async () => {
      try {
        setLoading(true);
        const response = await fetch(
          `https://dummyjson.com/products/category/${categoryName}`
        );
        const data = await response.json();
        setProducts(data.products);
      } catch (error) {
        console.error("Error fetching category products:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCategoryProducts();
    window.scrollTo(0, 0);
  }, [categoryName]);

  if (loading) return <Loading />;

  return (
    <div className="category-page">
      <div className="category-page-container">
        <header className="category-page-header">
          <h1>{categoryName.replace("-", " ")}</h1>
          <p>{products.length} Products Found</p>
        </header>

        <div className="category-products-grid">
          {products.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              addToCart={addToCart}
              removeFromCart={removeFromCart}
              cart={cart}
              wishlist={wishlist}
              toggleWishlist={toggleWishlist}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default CategoryPage;
