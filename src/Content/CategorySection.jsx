import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProductManager } from '../hooks/useProductManager';
import ProductCard from './ProductCard';
import './CategorySection.css';

const categoryData = [
  { 
    name: 'beauty', 
    icon: (
      <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 21C14.7614 21 17 18.7614 17 16V6H7V16C7 18.7614 9.23858 21 12 21Z" fill="currentColor" fillOpacity="0.3"/>
        <path d="M17 6H19V4H5V6H7M12 21C14.7614 21 17 18.7614 17 16V6H7V16C7 18.7614 9.23858 21 12 21ZM12 21V11" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <circle cx="12" cy="11" r="2" stroke="currentColor" strokeWidth="2"/>
      </svg>
    ), 
    gradient: 'linear-gradient(135deg, #FF69B4, #C71585)' 
  },
  { 
    name: 'fragrances', 
    icon: (
      <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M9 21H15V11L18 8V4H6V8L9 11V21Z" fill="currentColor" fillOpacity="0.3"/>
        <path d="M9 21H15V11L18 8V4H6V8L9 11V21Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M6 8H18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
        <path d="M12 11V16" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      </svg>
    ), 
    gradient: 'linear-gradient(135deg, #A855F7, #6D28D9)' 
  },
  { 
    name: 'furniture', 
    icon: (
      <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M4 18V21M20 18V21M18 11V18H6V11M18 11H6M18 11V7C18 5.89543 17.1046 5 16 5H8C6.89543 5 6 5.89543 6 7V11" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M6 14H18" fill="currentColor" fillOpacity="0.3" stroke="currentColor" strokeWidth="2"/>
      </svg>
    ), 
    gradient: 'linear-gradient(135deg, #F59E0B, #B45309)' 
  },
  { 
    name: 'groceries', 
    icon: (
      <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 2L15 6H9L12 2Z" fill="currentColor" fillOpacity="0.3"/>
        <path d="M3 6H21V20C21 21.1046 20.1046 22 19 22H5C3.89543 22 3 21.1046 3 20V6Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M9 6V22M15 6V22M3 10H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ), 
    gradient: 'linear-gradient(135deg, #10B981, #065F46)' 
  },
  { 
    name: 'home-decoration', 
    icon: (
      <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M3 9L12 2L21 9V20C21 21.1046 20.1046 22 19 22H5C3.89543 22 3 21.1046 3 20V9Z" fill="currentColor" fillOpacity="0.3"/>
        <path d="M3 9L12 2L21 9V20C21 21.1046 20.1046 22 19 22H5C3.89543 22 3 21.1046 3 20V9Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M9 22V12H15V22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ), 
    gradient: 'linear-gradient(135deg, #3B82F6, #1E40AF)' 
  },
  { 
    name: 'kitchen-accessories', 
    icon: (
      <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 2V22M6 4V10C6 11.6569 7.34315 13 9 13H15C16.6569 13 18 11.6569 18 10V4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M6 10C6 13.3137 8.68629 16 12 16C15.3137 16 18 13.3137 18 10" fill="currentColor" fillOpacity="0.3"/>
      </svg>
    ), 
    gradient: 'linear-gradient(135deg, #EF4444, #991B1B)' 
  },
  { 
    name: 'laptops', 
    icon: (
      <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="3" y="4" width="18" height="12" rx="2" stroke="currentColor" strokeWidth="2"/>
        <path d="M3 16H21L23 20H1L3 16Z" fill="currentColor" fillOpacity="0.3" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"/>
      </svg>
    ), 
    gradient: 'linear-gradient(135deg, #64748B, #334155)' 
  },
  { 
    name: 'smartphones', 
    icon: (
      <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="6" y="2" width="12" height="20" rx="3" fill="currentColor" fillOpacity="0.3" stroke="currentColor" strokeWidth="2"/>
        <path d="M11 18H13" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      </svg>
    ), 
    gradient: 'linear-gradient(135deg, #06B6D4, #0E7490)' 
  },
  { 
    name: 'motorbikes', 
    icon: (
      <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="6" cy="18" r="3" stroke="currentColor" strokeWidth="2"/>
        <circle cx="18" cy="18" r="3" stroke="currentColor" strokeWidth="2"/>
        <path d="M10 18H14L18 12H21L18 8H12L9 12L6 18" stroke="currentColor" strokeWidth="2" fill="currentColor" fillOpacity="0.3"/>
      </svg>
    ), 
    gradient: 'linear-gradient(135deg, #F43F5E, #9F1239)' 
  },
  { 
    name: 'skin-care', 
    icon: (
      <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 2C8.68629 2 6 4.68629 6 8V18C6 20.2091 7.79086 22 10 22H14C16.2091 22 18 20.2091 18 18V8C18 4.68629 15.3137 2 12 2Z" fill="currentColor" fillOpacity="0.3" stroke="currentColor" strokeWidth="2"/>
        <path d="M10 8H14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      </svg>
    ), 
    gradient: 'linear-gradient(135deg, #FB923C, #C2410C)' 
  },
  { 
    name: 'sports-accessories', 
    icon: (
      <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
        <path d="M12 2C12 2 15 5 15 12C15 19 12 22 12 22M12 2C12 2 9 5 9 12C9 19 12 22 12 22M2 12H22" stroke="currentColor" strokeWidth="2" fill="currentColor" fillOpacity="0.3"/>
      </svg>
    ), 
    gradient: 'linear-gradient(135deg, #6366F1, #3730A3)' 
  },
  { 
    name: 'sunglasses', 
    icon: (
      <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M3 14C3 15.6569 4.34315 17 6 17H9C10.6569 17 12 15.6569 12 14C12 15.6569 13.3431 17 15 17H18C19.6569 17 21 15.6569 21 14V11H3V14Z" fill="currentColor" fillOpacity="0.3" stroke="currentColor" strokeWidth="2"/>
        <path d="M3 11L5 7H19L21 11" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ), 
    gradient: 'linear-gradient(135deg, #22C55E, #166534)' 
  },
];

const CategorySection = ({ addToCart, cart, wishlist, toggleWishlist }) => {
  const navigate = useNavigate();
  const { groupedProducts, loading } = useProductManager();
  const [selectedCategory, setSelectedCategory] = useState(categoryData[0].name);

  // Dragging logic for product row
  const rowRef = useRef(null);
  const isDown = useRef(false);
  const startX = useRef(0);
  const scrollLeft = useRef(0);
  const [isDragging, setIsDragging] = useState(false);

  const handleMouseDown = (e) => {
    if (!rowRef.current) return;
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
    setTimeout(() => setIsDragging(false), 50);
  };

  const handleMouseMove = (e) => {
    if (!isDown.current || !rowRef.current) return;
    e.preventDefault();
    const x = e.pageX - rowRef.current.offsetLeft;
    const walk = (x - startX.current);
    if (Math.abs(walk) > 5 && !isDragging) setIsDragging(true);
    if (isDragging) rowRef.current.scrollLeft = scrollLeft.current - walk * 2;
  };

  // Products for the currently selected category
  const productsToShow = groupedProducts[selectedCategory] || [];
  const activeCategoryData = categoryData.find(cat => cat.name === selectedCategory) || categoryData[0];

  return (
    <div className="category-section">
      <div className="category-section-container">
        <div className="category-list">
          {categoryData.map((cat) => (
            <div 
              key={cat.name} 
              className={`category-item ${selectedCategory === cat.name ? 'active' : ''}`}
              onClick={() => setSelectedCategory(cat.name)}
              style={selectedCategory === cat.name ? { '--active-gradient': cat.gradient } : {}}
            >
              <div className="category-icon-circle" style={{ background: cat.gradient }}>
                <span className="category-icon-svg">{cat.icon}</span>
              </div>
              <span className="category-name">{cat.name.replace('-', ' ')}</span>
            </div>
          ))}
          
          <div 
            className="category-item more-item"
            onClick={() => navigate('/categories')}
          >
            <div className="category-icon-circle more-circle">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="1"></circle>
                <circle cx="19" cy="12" r="1"></circle>
                <circle cx="5" cy="12" r="1"></circle>
              </svg>
            </div>
            <span className="category-name">More</span>
          </div>
        </div>

        {/* Selected Category Products Container */}
        <div 
          className="selected-category-container"
          style={{ '--active-gradient': activeCategoryData.gradient }}
        >
          <div className="selected-category-header">
            <div className="header-title-wrapper">
              <div className="header-icon-small" style={{ background: activeCategoryData.gradient }}>
                {activeCategoryData.icon}
              </div>
              <h2>{selectedCategory.replace('-', ' ')}</h2>
            </div>
            <button className="view-all-btn" onClick={() => navigate(`/category/${selectedCategory}`)}>
              View All
            </button>
          </div>
          
          <div 
            ref={rowRef}
            className={`category-products-row ${isDragging ? "dragging" : ""}`}
            onMouseDown={handleMouseDown}
            onMouseLeave={handleMouseLeave}
            onMouseUp={handleMouseUp}
            onMouseMove={handleMouseMove}
          >
            {loading ? (
              <div className="category-loading">Loading products...</div>
            ) : productsToShow.length > 0 ? (
              productsToShow.slice(0, 12).map((product) => (
                <ProductCard 
                  key={product.id} 
                  product={product}
                  addToCart={addToCart}
                  cart={cart}
                  wishlist={wishlist}
                  toggleWishlist={toggleWishlist}
                />
              ))
            ) : (
              <div className="no-products">No products found for this category.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CategorySection;