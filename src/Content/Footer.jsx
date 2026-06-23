import React from "react";
import { Link } from "react-router-dom";
import "./Footer.css";
import logo from "../../image/logo.png";

const Footer = ({ userdet }) => {
  const isLogged = !!userdet?.id;
  const prefix = userdet?.emailPrefix || "guest";

  return (
    <footer className="footer">
      <div className="footer-main">
        <div className="footer-dominant-brand">
          <img src={logo} alt="DummyStore Logo" className="footer-dominant-logo" />
          <h2>E-CART</h2>
          <p style={{marginBottom: "15px", fontWeight: "600"}}>Sarthak Chanda</p>
          <div className="footer-contact-info" style={{display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.9rem', color: '#cbd5e1', marginTop: '10px'}}>
            <a href="tel:+918617447383" style={{color: 'inherit', textDecoration: 'none', display: 'flex', alignItems: 'center'}}>
              <svg viewBox="0 0 24 24" width="16" height="16" stroke="white" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" style={{marginRight: '8px'}}><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
              +91 8617447383
            </a>
            <a href="mailto:sarthakchanda1234@gmail.com" style={{color: 'inherit', textDecoration: 'none', display: 'flex', alignItems: 'center'}}>
              <svg viewBox="0 0 24 24" width="16" height="16" stroke="white" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" style={{marginRight: '8px'}}><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
              sarthakchanda1234@gmail.com
            </a>
          </div>
        </div>

        <div className="footer-links">
          <h3>Shop</h3>
          <Link to="/category/smartphones">Electronics</Link>
          <Link to="/category/womens-jewellery">Jewelry</Link>
          <Link to="/category/mens-shirts">Men's Clothing</Link>
          <Link to="/category/womens-dresses">Women's Clothing</Link>
        </div>

        <div className="footer-links">
          <h3>Customer Service</h3>
          <Link to="/disclaimer">Contact Us</Link>
          <Link to="/disclaimer">Shipping Policy</Link>
          <Link to="/disclaimer">Returns & Exchanges</Link>
          <Link to="/disclaimer">FAQs</Link>
        </div>

        <div className="footer-links">
          <h3>My Account</h3>
          {!isLogged && <Link to="/login">Sign In</Link>}
          <Link to={isLogged ? `/${prefix}/profile` : "/login"}>My Profile</Link>
          <Link to={`/${prefix}/cart`}>View Cart</Link>
          <Link to={`/${prefix}/wishlist`}>My Wishlist</Link>
        </div>

        <div className="footer-links">
          <h3>About Us</h3>
          <Link to="/disclaimer">Our Story</Link>
          <Link to="/disclaimer">Careers</Link>
          <Link to="/disclaimer">Privacy Policy</Link>
          <Link to="/disclaimer">Terms & Conditions</Link>
        </div>
      </div>

      <div className="footer-divider"></div>

      <div className="footer-bottom">
        <div className="footer-social">
          {/* Facebook */}
          <a href="https://www.facebook.com/share/1GjCGD9NWs/" target="_blank" rel="noopener noreferrer" aria-label="Facebook">
            <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path></svg>
          </a>
          {/* Instagram */}
          <a href="https://www.instagram.com/sarthakchanda1234?igsh=ODkyb3JqbTB2a2Nv" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
            <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
          </a>
          {/* LinkedIn */}
          <a href="https://www.linkedin.com/in/sarthak-chanda-910278270?utm_source=share_via&utm_content=profile&utm_medium=member_android" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn">
            <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path><rect x="2" y="9" width="4" height="12"></rect><circle cx="4" cy="4" r="2"></circle></svg>
          </a>
          {/* GitHub */}
          <a href="https://github.com/Sarthak-chanda" target="_blank" rel="noopener noreferrer" aria-label="GitHub">
            <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path></svg>
          </a>
        </div>

        <p>© Copyright All Rights Reserved</p>
      </div>

      <div className="footer-credit">
        Created with Dummy JSON API by Sarthak Chanda
      </div>
    </footer>
  );
};

export default Footer;
