import { useMemo } from 'react';
import { offersConfig } from '../config/offersConfig';
import { useProductManager } from './useProductManager';

/**
 * A custom hook to manage fully populated offer objects.
 * It combines the static offersConfig with the dynamic product catalog.
 */
export const useOffersManager = () => {
  const { products, loading, sortProducts } = useProductManager();

  // Create fully populated offers with their associated products
  const offers = useMemo(() => {
    if (!products || products.length === 0) return [];
    
    return offersConfig.map(offer => {
      // Filter the products based on the offer's unique rule
      const matchingProducts = products.filter(offer.filterRule);
      
      return {
        ...offer,
        products: matchingProducts,
        productCount: matchingProducts.length
      };
    });
  }, [products]);

  // Utility to fetch a specific offer by ID
  const getOfferById = (id) => {
    return offers.find(o => o.id === id) || null;
  };

  return { 
    offers, 
    loading, 
    getOfferById,
    sortProducts 
  };
};