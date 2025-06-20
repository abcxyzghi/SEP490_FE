import React from 'react';
import './Footer.css';
import { FaMapMarkerAlt, FaEnvelope, FaPhone } from 'react-icons/fa';
import logo from '../../../assets/logoSVG/Full_logo-Grdient.svg';
import StreetIcon from '../../../assets/Icon_fill/Pin_fill.svg';
import SendIcon from '../../../assets/Icon_fill/Send_fill.svg';
import PhoneIcon from '../../../assets/Icon_fill/Phone_fill.svg';
import AboutIcon from '../../../assets/icon/About_Icon.svg';
import InformationIcon from '../../../assets/icon/Information_Icon.svg';
const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-logo">
          <img src={logo} alt="Manga Mystery Box Logo" />
        </div>

        <div className="footer-about">
          <div className="footer-title">
            <img src={AboutIcon} alt="icon" className="icon" /> About
          </div>
          <div className="footer-info">
            <p> <img src={StreetIcon} alt="icon" className="icon" /> 7 D. D1, Long Thạnh Mỹ, Thủ Đức, Hồ Chí Minh</p>
            <p><img src={SendIcon} alt="icon" className="icon" /> MMB@gmail.com</p>
            <p><img src={PhoneIcon} alt="icon" className="icon" />0988776655</p>
          </div>
        </div>

        <div className="footer-info-links">
          <div className="footer-title">
            <img src={InformationIcon} alt="icon" className="icon" /> Information
          </div>
          <div className="footer-links">
            <div>
              <p>About</p>
              <p>Product</p>
              <p>Contact</p>
              <p>Help Center</p>
            </div>
            <div>
              <p>Terms Of Service</p>
              <p>Privacy Policy</p>
              <p>Copyright Policy</p>
            </div>
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        ©2025 MangaMysteryBox | All Rights Reserved
      </div>
    </footer>
  );
};

export default Footer;
