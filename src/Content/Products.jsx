import { useEffect, useState, useRef } from "react";
import ProductCard from "./ProductCard";
import "./Products.css";
import Loading from "../Loading";

const Products = ({ addToCart }) => {
  const [products, setProducts] = useState(() => {
    try {
      const saved = sessionStorage.getItem("products");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [loading, setLoading] = useState(products.length === 0);

  useEffect(() => {
    if (products.length > 0) {
      setLoading(false);
      return;
    }

    const fetchProducts = async () => {
      try {
        setLoading(true);
        const response = await fetch(
          "https://dummyjson.com/products?limit=194"
        );
        const data = await response.json();

        setProducts(data.products);
        sessionStorage.setItem("products", JSON.stringify(data.products));
      } catch (error) {
        console.error("Error fetching marketplace catalog:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []); 

  const groupedProducts = products.reduce((acc, product) => {
    const category = product.category;
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(product);
    return acc;
  }, {});

  if (loading) {
    return <Loading />;
  }

  return (
    <div className="products-container">
      <div className="products-content-wrapper">
        
        {/* Hero Banner */}
        <div className="products-hero">
          <div className="products-hero-content">
            <h1>Discover Amazing Products</h1>
            <p>
              Shop electronics, beauty, fashion, groceries and more at the best
              prices.
            </p>
          </div>
        </div>

        {/* Categories Grid Rows */}
        {Object.entries(groupedProducts).map(([category, categoryProducts]) => (
          <CategoryRow
            key={category}
            category={category}
            products={categoryProducts}
            addToCart={addToCart}
          />
        ))}

      </div>
    </div>
  );
};

function CategoryRow({ category, products, addToCart }) {
  const [expanded, setExpanded] = useState(false);
  
  // Use Refs for tracking coordinates to prevent massive re-render spam
  const rowRef = useRef(null);
  const isDown = useRef(false);
  const startX = useRef(0);
  const scrollLeft = useRef(0);
  
  // Only trigger state when we are SURE it's a drag, not a click
  const [isDragging, setIsDragging] = useState(false); 

  const displayedProducts = expanded ? products : products.slice(0, 12);

  const handleMouseDown = (e) => {
    if (!rowRef.current || expanded) return;
    isDown.current = true;
    startX.current = e.pageX - rowRef.current.offsetLeft;
    scrollLeft.current = rowRef.current.scrollLeft;
  };

  const handleMouseLeave = () => {
    isDown.current = false;
    setIsDragging(false);
  };

  const handleMouseUp = () => {
    isDown.current = false;
    // Tiny timeout ensures the click event has time to fire before pointer-events are restored
    setTimeout(() => setIsDragging(false), 50);
  };

  const handleMouseMove = (e) => {
    if (!isDown.current || !rowRef.current || expanded) return;
    e.preventDefault();
    
    const x = e.pageX - rowRef.current.offsetLeft;
    const walk = (x - startX.current);
    
    // DRAG THRESHOLD: Only block clicks if the mouse actually moves more than 5 pixels
    if (Math.abs(walk) > 5 && !isDragging) {
      setIsDragging(true);
    }
    
    // If we passed the threshold, scroll the container
    if (isDragging) {
      rowRef.current.scrollLeft = scrollLeft.current - walk * 2;
    }
  };

  return (
    <section className="category-group">
      <div className="category-header">
        <h1>{category.replace("-", " ")}</h1>
        {products.length > 12 && (
          <button
            className="category-toggle-btn"
            onClick={() => setExpanded(!expanded)}
          >
            {expanded ? "Show Less" : "View All"}
          </button>
        )}
      </div>

      <div 
        ref={rowRef}
        className={`${expanded ? "products-grid" : "products-row-container"} ${isDragging ? "dragging" : ""}`}
        onMouseDown={handleMouseDown}
        onMouseLeave={handleMouseLeave}
        onMouseUp={handleMouseUp}
        onMouseMove={handleMouseMove}
      >
        {displayedProducts.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            addToCart={addToCart}
          />
        ))}
      </div>
    </section>
  );
}

export default Products;