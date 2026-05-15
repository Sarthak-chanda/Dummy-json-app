import { useEffect, useMemo, useRef, useState } from "react";
import ProductCard from "./ProductCard";

const PAGE_SIZE = 8;
const REQUEST_DELAY_MS = 250;

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const normalizeCategory = (item) => {
  if (!item) return null;

  if (typeof item === "string") {
    const slug = item.trim();
    return {
      slug,
      name: slug.replace(/-/g, " "),
      url: `https://dummyjson.com/products/category/${encodeURIComponent(slug)}`,
    };
  }

  const slug =
    item.slug ||
    item.name ||
    item.category ||
    item.id ||
    item.title ||
    item.value ||
    "";

  return {
    ...item,
    slug,
    name: item.name || item.title || slug,
    url:
      item.url ||
      `https://dummyjson.com/products/category/${encodeURIComponent(slug)}`,
  };
};

function CategoryRow({ category, addToCart }) {
  const rowRef = useRef(null);
  const drag = useRef({
    active: false,
    startX: 0,
    scrollLeft: 0,
    moved: false,
  });
  const blockClickRef = useRef(false);
  const [isDragging, setIsDragging] = useState(false);

  const onMouseDown = (e) => {
    if (!rowRef.current) return;
    if (e.button !== 0) return;

    const target = e.target;
    if (target.closest("button, a, input, textarea, select, label")) return;

    drag.current.active = true;
    drag.current.moved = false;
    drag.current.startX = e.pageX;
    drag.current.scrollLeft = rowRef.current.scrollLeft;
    setIsDragging(true);

    e.preventDefault();
  };

  useEffect(() => {
    const onMouseMove = (e) => {
      if (!drag.current.active || !rowRef.current) return;

      e.preventDefault();

      const walk = e.pageX - drag.current.startX;
      if (Math.abs(walk) > 5) {
        drag.current.moved = true;
      }

      rowRef.current.scrollLeft = drag.current.scrollLeft - walk;
    };

    const onMouseUp = () => {
      if (!drag.current.active) return;

      drag.current.active = false;
      setIsDragging(false);
      blockClickRef.current = drag.current.moved;

      window.setTimeout(() => {
        blockClickRef.current = false;
      }, 0);
    };

    document.addEventListener("mousemove", onMouseMove, { passive: false });
    document.addEventListener("mouseup", onMouseUp);

    return () => {
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseup", onMouseUp);
    };
  }, []);

  const displayedProducts = useMemo(() => {
    return category.products;
  }, [category.products]);

  return (
    <div
      ref={rowRef}
      className={`products-row-container ${isDragging ? "dragging" : ""}`}
      onMouseDown={onMouseDown}
      onClickCapture={(e) => {
        if (!blockClickRef.current) return;
        e.preventDefault();
        e.stopPropagation();
      }}
    >
      {displayedProducts.map((product) => (
        <ProductCard
          key={product.id}
          product={product}
          addToCart={addToCart}
          isRowCard
        />
      ))}
    </div>
  );
}

const Products = ({ addToCart }) => {
  const [allCategories, setAllCategories] = useState([]);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [loading, setLoading] = useState(true);
  const [expandedCategories, setExpandedCategories] = useState({});
  const [productsBySlug, setProductsBySlug] = useState({});

  const productsCacheRef = useRef({});
  const isLoadingMoreRef = useRef(false);

  useEffect(() => {
    productsCacheRef.current = productsBySlug;
  }, [productsBySlug]);

  useEffect(() => {
    const controller = new AbortController();

    const fetchCategories = async () => {
      try {
        setLoading(true);

        const res = await fetch(
          "https://dummyjson.com/products/category-list",
          { signal: controller.signal }
        );
        const list = await res.json();

        const normalized = Array.isArray(list)
          ? list.map(normalizeCategory).filter(Boolean)
          : [];

        setAllCategories(normalized);
        setVisibleCount(Math.min(PAGE_SIZE, normalized.length));
      } catch (error) {
        if (error.name !== "AbortError") {
          console.error(error);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();

    return () => controller.abort();
  }, []);

  useEffect(() => {
    if (!allCategories.length) return;

    let cancelled = false;

    const loadVisibleProducts = async () => {
      if (isLoadingMoreRef.current) return;
      isLoadingMoreRef.current = true;

      try {
        const batch = allCategories.slice(0, visibleCount);

        for (const category of batch) {
          if (cancelled) return;
          if (productsCacheRef.current[category.slug]) continue;

          try {
            const res = await fetch(category.url);
            const data = await res.json();

            const products = Array.isArray(data.products) ? data.products : [];

            if (cancelled) return;

            setProductsBySlug((prev) => ({
              ...prev,
              [category.slug]: products,
            }));

            await sleep(REQUEST_DELAY_MS);
          } catch (error) {
            console.error(error);
          }
        }
      } finally {
        isLoadingMoreRef.current = false;
      }
    };

    loadVisibleProducts();

    return () => {
      cancelled = true;
    };
  }, [allCategories, visibleCount]);

  useEffect(() => {
    const onScroll = () => {
      if (loading) return;
      if (visibleCount >= allCategories.length) return;

      const nearBottom =
        window.innerHeight + window.scrollY >=
        document.documentElement.scrollHeight - 500;

      if (nearBottom) {
        setVisibleCount((prev) =>
          Math.min(prev + PAGE_SIZE, allCategories.length)
        );
      }
    };

    window.addEventListener("scroll", onScroll, { passive: true });

    return () => window.removeEventListener("scroll", onScroll);
  }, [allCategories.length, loading, visibleCount]);

  if (loading) return <div className="loading">Loading products...</div>;

  const visibleCategories = allCategories.slice(0, visibleCount);

  return (
    <div className="products-container">
      {visibleCategories.map((cat) => {
        const products = productsBySlug[cat.slug] || [];
        const isExpanded = expandedCategories[cat.slug];
        const displayedProducts = isExpanded ? products : products.slice(0, 10);

        return (
          <section key={cat.slug} className="category-group">
            <div className="category-header">
              <h1 className="cart-page-title">{cat.name}</h1>

              {products.length > 10 && (
                <button
                  type="button"
                  onClick={() =>
                    setExpandedCategories((prev) => ({
                      ...prev,
                      [cat.slug]: !isExpanded,
                    }))
                  }
                  className="more-btn category-toggle-btn"
                >
                  {isExpanded ? "Show Less" : `See All (${products.length})`}
                </button>
              )}
            </div>

            <CategoryRow
              category={{ ...cat, products: displayedProducts }}
              addToCart={addToCart}
            />
          </section>
        );
      })}
    </div>
  );
};

export default Products;