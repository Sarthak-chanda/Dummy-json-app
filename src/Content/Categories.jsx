import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useProductManager } from '../hooks/useProductManager';
import Loading from '../Loading';
import './CategoryPage.css';
import './Categories.css';

const Categories = () => {
  const navigate = useNavigate();
  const { groupedProducts, loading } = useProductManager();

  if (loading) return <Loading />;

  const categories = Object.keys(groupedProducts);

  // Map of categories to emojis
  const categoryEmojis = {
    'beauty': '💄',
    'fragrances': '✨',
    'furniture': '🛋️',
    'groceries': '🍎',
    'home-decoration': '🏠',
    'kitchen-accessories': '🍳',
    'laptops': '💻',
    'men-shirts': '👔',
    'men-shoes': '👞',
    'men-watches': '⌚',
    'mobile-accessories': '🎧',
    'motorbikes': '🏍️',
    'skin-care': '🧖‍♀️',
    'smartphones': '📱',
    'sports-accessories': '🏀',
    'sunglasses': '🕶️',
    'tablets': '📟',
    'tops': '👕',
    'vehicle': '🚗',
    'womens-bags': '👜',
    'womens-dresses': '👗',
    'womens-jewellery': '💍',
    'womens-shoes': '👠',
    'womens-watches': '⌚'
  };

  return (
    <div className="category-page">
      <div className="category-page-container">
        <header className="category-page-header">
          <h1>All Categories</h1>
          <p>{categories.length} Categories Found</p>
        </header>

        <div className="categories-grid">
          {categories.map((category) => (
            <div 
              key={category} 
              className="category-item-card"
              onClick={() => navigate(`/category/${category}`)}
            >
              <div className="category-emoji">
                {categoryEmojis[category] || '📦'}
              </div>
              <h3>
                {category.replace('-', ' ')}
              </h3>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Categories;
