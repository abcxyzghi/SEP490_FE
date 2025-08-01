import React from 'react';
import { Link } from 'react-router-dom';
import { PATH_NAME } from '../../../router/Pathname';
import './Footer.css';
import logo from '../../../assets/logoSVG/Full_logo-Grdient.svg';
import StreetIcon from '../../../assets/Icon_fill/Pin_fill.svg';
import SendIcon from '../../../assets/Icon_fill/Send_fill.svg';
import PhoneIcon from '../../../assets/Icon_fill/Phone_fill.svg';
import AboutFooter from '../../../assets/others/about_ftr.svg';
import InfoFooter from '../../../assets/others/information_ftr.svg';

const Footer = () => {
  return (
    <div className="footer">
      <div className="footer-container">
        {/* Logo */}
        <div className="footer-logo">
          <img src={logo} alt="Manga Mystery Box Logo" />
        </div>

        {/* About Section */}
        <div className="footer-about">
          <div className="footer-title">
            <img src={AboutFooter} alt="icon" className="icon" /> About
          </div>
          <div className="footer-info">
            <p>
              <img src={StreetIcon} alt="icon" className="icon" /> 
              7 D. D1, Long Thanh My, Thu Duc, Ho Chi Minh
            </p>
            <p><img src={SendIcon} alt="icon" className="icon" /> MMB@gmail.com</p>
            <p><img src={PhoneIcon} alt="icon" className="icon" /> 0988776655</p>
          </div>
        </div>

        {/* Info Links */}
        <div className="footer-info-links">
          <div className="footer-title">
            <img src={InfoFooter} alt="icon" className="icon" /> Information
          </div>
          <div className="footer-links">
            <div>
              <Link to={PATH_NAME.ABOUT} className="footer-link">About</Link>
              <Link to={PATH_NAME.SHOP_PAGE} className="footer-link">Product</Link>
              <Link to={PATH_NAME.CONTACT} className="footer-link">Contact</Link>
              <Link to={PATH_NAME.HELPCENTER} className="footer-link">Help Center</Link>
            </div>
            <div>
              <Link to={PATH_NAME.TERM_OF_SERVICE} className="footer-link">Terms Of Service</Link>
              <Link to={PATH_NAME.PRIVACY_POLICY} className="footer-link">Privacy Policy</Link>
              <Link to={PATH_NAME.COPYRIGHT_POLICY} className="footer-link">Copyright Policy</Link>
            </div>
          </div>
        </div>
      </div>

      <div className="footer-bottom oxanium-regular">
        ©2025 MangaMysteryBox | All Rights Reserved
      </div>
    </div>
  );
};

export default Footer;
