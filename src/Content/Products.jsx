import { useEffect, useState, useRef } from "react";
import ProductCard from "./ProductCard";
import "./Products.css";
import Loading from "../Loading";

const banners = [
  {
    title: "Discover Amazing Products",
    subtitle: "Shop electronics, beauty, fashion, groceries and more at the best prices. Everything you need in one place.",
    bg: "#1e293b",
    img: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1200&q=80"
  },
  {
    title: "Summer Sale is Live!",
    subtitle: "Get up to 50% off on all seasonal fashion and accessories. Refresh your wardrobe today.",
    bg: "#0f172a",
    img: "https://images.unsplash.com/photo-1523381235208-25917a12c349?auto=format&fit=crop&w=1200&q=80"
  },
  {
    title: "Next-Gen Tech",
    subtitle: "Explore the latest smartphones, laptops, and gadgets from top brands. Stay ahead with innovation.",
    bg: "#1e1b4b",
    img: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=1200&q=80"
  }
];

const funzoneBanners = [
  {
    title: "🎮 Gamer's Haven",
    subtitle: "Level up your setup with premium peripherals.",
    img: "https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=1200&q=80",
    bg: "#4338ca"
  },
  {
    title: "💄 Beauty Bliss",
    subtitle: "Glow up with our exclusive skincare collection.",
    img: "https://images.unsplash.com/photo-1596462502278-27bfdc4033c8?auto=format&fit=crop&w=1200&q=80",
    bg: "#db2777"
  }
];

const Products = ({ addToCart, cart, wishlist, toggleWishlist }) => {
  const [products, setProducts] = useState(() => {
    try {
      const saved = sessionStorage.getItem("products");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [loading, setLoading] = useState(products.length === 0);
  const [currentBanner, setCurrentBanner] = useState(0);
  const [showBannerText, setShowBannerText] = useState(true);

  useEffect(() => {
    const bannerInterval = setInterval(() => {
      setCurrentBanner((prev) => (prev + 1) % banners.length);
    }, 5000);
    return () => clearInterval(bannerInterval);
  }, []);

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

  const hotDeals = products.filter(p => p.discountPercentage > 15).slice(0, 15);

  if (loading) {
    return <Loading />;
  }

  const categoryEntries = Object.entries(groupedProducts);

  return (
    <div className="products-container">
      <div className="products-content-wrapper">
        
        {/* Hero Banner */}
        <div className="products-hero" style={{ backgroundColor: banners[currentBanner].bg }}>
          <img src={banners[currentBanner].img} alt="banner" className="hero-bg-img" />
          <div className="hero-overlay" />
          <div className={`products-hero-content ${showBannerText ? 'visible' : 'hidden'}`}>
            <h1>{banners[currentBanner].title}</h1>
            <p>{banners[currentBanner].subtitle}</p>
            <button className="banner-cta">Shop Collection</button>
          </div>
          
          <button className="banner-toggle-btn" onClick={() => setShowBannerText(!showBannerText)}>
            {showBannerText ? "Hide Text" : "Show Text"}
          </button>

          <div className="banner-indicators">
            {banners.map((_, i) => (
              <span key={i} className={`indicator ${i === currentBanner ? 'active' : ''}`} />
            ))}
          </div>
        </div>

        {/* Hot Deals Section */}
        {hotDeals.length > 0 && (
          <CategoryRow
            category="🔥 Hot Deals"
            products={hotDeals}
            addToCart={addToCart}
            cart={cart}
            wishlist={wishlist}
            toggleWishlist={toggleWishlist}
          />
        )}

        {/* Categories Grid Rows with Interstitial Banners */}
        {categoryEntries.map(([category, categoryProducts], index) => (
          <div key={category}>
            <CategoryRow
              category={category}
              products={categoryProducts}
              addToCart={addToCart}
              cart={cart}
              wishlist={wishlist}
              toggleWishlist={toggleWishlist}
            />
            {/* Inject a funzone banner every 4 categories */}
            {(index + 1) % 4 === 0 && funzoneBanners[Math.floor(index / 4) % funzoneBanners.length] && (
              <div className="funzone-banner" style={{ backgroundColor: funzoneBanners[Math.floor(index / 4) % funzoneBanners.length].bg }}>
                <img src={funzoneBanners[Math.floor(index / 4) % funzoneBanners.length].img} alt="funzone" />
                <div className="funzone-content">
                  <h2>{funzoneBanners[Math.floor(index / 4) % funzoneBanners.length].title}</h2>
                  <p>{funzoneBanners[Math.floor(index / 4) % funzoneBanners.length].subtitle}</p>
                  <button>Explore Funzone</button>
                </div>
              </div>
            )}
          </div>
        ))}

      </div>
    </div>
  );
};

function CategoryRow({ category, products, addToCart, cart, wishlist, toggleWishlist }) {
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
            cart={cart}
            wishlist={wishlist}
            toggleWishlist={toggleWishlist}
          />
        ))}
      </div>
    </section>
  );
}

export default Products;