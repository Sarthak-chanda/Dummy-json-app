import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './DummyDisclaimerPage.css';

const DummyDisclaimerPage = () => {
  const navigate = useNavigate();

  // Scroll to top when page loads
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="dummy-disclaimer-container">
      <div className="disclaimer-content">
        <div className="icon-wrapper">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
            <line x1="12" y1="9" x2="12" y2="13"></line>
            <line x1="12" y1="17" x2="12.01" y2="17"></line>
          </svg>
        </div>
        
        <h1>Just a Heads Up!</h1>
        <h2>This is a Portfolio Demonstration Project</h2>
        
        <p className="disclaimer-text">
          Welcome to E-CART! We're thrilled to have you here. However, please note that this is a <strong>dummy application</strong> built purely for demonstration and portfolio purposes. 
        </p>

        <p className="disclaimer-text">
          Because this is not an actual functioning e-commerce business, certain services like real payment processing, actual shipping, live customer support, and legal policies (like Terms & Conditions or Privacy Policies) <strong>do not exist</strong>.
        </p>

        <div className="disclaimer-features">
          <h3>What you CAN do here:</h3>
          <ul>
            <li>Browse a wide variety of dummy products</li>
            <li>Add items to your Cart and Wishlist</li>
            <li>Create an account and manage your profile</li>
            <li>Experience a seamless, responsive UI/UX</li>
          </ul>
        </div>

        <div className="action-buttons">
          <button className="btn-primary" onClick={() => navigate('/')}>
            Back to Home
          </button>
          <button className="btn-secondary" onClick={() => navigate('/categories')}>
            Explore Products
          </button>
        </div>
      </div>
    </div>
  );
};

export default DummyDisclaimerPage;
