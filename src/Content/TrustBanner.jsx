import React from 'react';
import './TrustBanner.css';

const trustItems = [
  {
    id: 1,
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
        <circle cx="12" cy="10" r="3"></circle>
      </svg>
    ),
    title: 'Free Shipping',
    subtitle: 'On orders over $50'
  },
  {
    id: 2,
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
        <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
        <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
      </svg>
    ),
    title: 'Secure Payment',
    subtitle: '100% protected payments'
  },
  {
    id: 3,
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
        <polyline points="22 4 12 14.01 9 11.01"></polyline>
      </svg>
    ),
    title: 'Quality Guarantee',
    subtitle: '30-day return policy'
  },
  {
    id: 4,
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
      </svg>
    ),
    title: '24/7 Support',
    subtitle: 'Dedicated customer service'
  }
];

const TrustBanner = () => {
  return (
    <div className="trust-banner-section">
      <div className="trust-banner-container">
        {/* On desktop, this will be a grid/flex. On mobile, we double the items for infinite scroll */}
        <div className="trust-banner-track">
          {trustItems.map((item) => (
            <div key={`original-${item.id}`} className="trust-item">
              <div className="trust-icon-wrapper">{item.icon}</div>
              <div className="trust-text">
                <h4 className="trust-title">{item.title}</h4>
                <p className="trust-subtitle">{item.subtitle}</p>
              </div>
            </div>
          ))}
          {/* Duplicated items for seamless infinite scrolling on mobile */}
          {trustItems.map((item) => (
            <div key={`duplicate-${item.id}`} className="trust-item duplicate-item">
              <div className="trust-icon-wrapper">{item.icon}</div>
              <div className="trust-text">
                <h4 className="trust-title">{item.title}</h4>
                <p className="trust-subtitle">{item.subtitle}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TrustBanner;
