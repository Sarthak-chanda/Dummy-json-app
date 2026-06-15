import { useState, useEffect, useMemo } from 'react';

/**
 * A custom hook to manage product data, filtering, and sorting.
 * Designed to be dynamic and work with any data structure once mapped.
 */
export const useProductManager = (apiUrl = 'https://dummyjson.com/products?limit=194') => {
  const [products, setProducts] = useState(() => {
    try {
      const saved = sessionStorage.getItem("products");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  
  const [loading, setLoading] = useState(products.length === 0);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (products.length > 0) {
      setLoading(false);
      return;
    }

    const fetchProducts = async () => {
      try {
        setLoading(true);
        const response = await fetch(apiUrl);
        if (!response.ok) throw new Error("Failed to fetch products");
        const data = await response.json();
        
        // Assuming data.products is the array. Adjust this if using a different API structure.
        const productList = data.products || data;
        
        setProducts(productList);
        sessionStorage.setItem("products", JSON.stringify(productList));
      } catch (err) {
        console.error("Error fetching marketplace catalog:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [apiUrl, products.length]);

  // Derived Data: Grouped by category
  const groupedProducts = useMemo(() => {
    return products.reduce((acc, product) => {
      const category = product.category || 'Uncategorized';
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(product);
      return acc;
    }, {});
  }, [products]);

  // Derived Data: Hot Deals (e.g., > 15% discount)
  const hotDeals = useMemo(() => {
    return products.filter(p => p.discountPercentage > 15).slice(0, 15);
  }, [products]);

  // Utility: Filter by price range
  const getProductsByPriceRange = (min, max) => {
    return products.filter(p => p.price >= min && p.price <= max).sort((a, b) => a.price - b.price);
  };

  // Utility: Generic sorting
  const sortProducts = (productList, sortBy = 'price-asc') => {
    const list = [...productList];
    switch (sortBy) {
      case 'price-asc': return list.sort((a, b) => a.price - b.price);
      case 'price-desc': return list.sort((a, b) => b.price - a.price);
      case 'rating': return list.sort((a, b) => (b.rating || 0) - (a.rating || 0));
      case 'reviews': return list.sort((a, b) => (b.reviews?.length || 0) - (a.reviews?.length || 0));
      case 'discount': return list.sort((a, b) => (b.discountPercentage || 0) - (a.discountPercentage || 0));
      case 'name-asc': return list.sort((a, b) => a.title.localeCompare(b.title));
      default: return list;
    }
  };

  return {
    products,
    loading,
    error,
    groupedProducts,
    hotDeals,
    getProductsByPriceRange,
    sortProducts
  };
};