import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import './Navigation.css';
import { Pathname } from '../../../router/Pathname';
import NavigationDropdownMenu from '../NavigationDropdownMenu/NavigationDropdownMenu';
// Importing logos
import FullLogoGrD from '../../../assets/logoSVG/Full_logo-Grdient.svg';
import GrDLogo from '../../../assets/logoSVG/Logo-Grdient.svg';
// Importing icons
import HomeIcon from '../../../assets/Icon_fill/Home_fill.svg';
import ShopIcon from '../../../assets/Icon_fill/Shop.svg';
import AuctionIcon from '../../../assets/Icon_fill/Auction_fill.svg';
import CartIcon from '../../../assets/Icon_fill/Bag_fill.svg';
import ToDashboardIcon from '../../../assets/Icon_line/computer-dollar.svg';
import PlusIcon from '../../../assets/Icon_line/add-01.svg';
import ProfileIcon from '../../../assets/Icon_line/User_cicrle.svg';

import { useSelector, useDispatch } from 'react-redux';
import { setUser } from '../../../redux/features/authSlice';
import { fetchUserInfo } from '../../../services/api.auth';



export default function Navigation() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  // const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const user = useSelector(state => state.auth.user);
  const dispatch = useDispatch();

  const truncateNumber = (numStr, n) => {
    const str = String(numStr);
    return str.length > n ? str.slice(0, n - 1) + '…' : str;
  };

  const toggleCollapse = () => {
    setIsCollapsed(prev => !prev);
  };

  const navLinks = [
    { label: 'Home', path: Pathname('HOMEPAGE'), icon: HomeIcon },
    { label: 'Shop', path: Pathname('SHOP_PAGE'), icon: ShopIcon },
    { label: 'Auction', path: Pathname('AUNCTION_PAGE'), icon: AuctionIcon },
  ];


  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token && !user) {
      fetchUserInfo(token)
        .then(res => {
          if (res.status && res.data) {
            dispatch(setUser(res.data));
          }
        })
        .catch(err => {
          if (err.response?.status === 401) {
            localStorage.removeItem('token');
            dispatch(setUser(null));
            navigate('/login');
          } else {
            console.error('Lỗi fetch user info:', err);
          }
        });
    }
  }, [dispatch, user]);

  return (
    <div className={`nav-container ${isCollapsed ? 'collapsed' : ''}`}>
      {!isCollapsed && (
        <div className="nav-left">
          {navLinks.map(link => (
            <NavLink to={link.path} className="nav-item" key={link.label}>
              {({ isActive }) => (
                <div className={`nav-link-content ${isActive ? 'active' : ''}`}>
                  <div className="nav-icon-wrapper">
                    <img src={link.icon} alt={link.label} className="nav-icon" />
                  </div>
                  <span className="nav-label oxanium-bold">{link.label}</span>
                  <div className="nav-underline" />
                </div>
              )}
            </NavLink>
          ))}
        </div>
      )}

      <div className="nav-toggle" onClick={toggleCollapse}>
        <div className="nav-logo">
          <img
            src={isCollapsed ? GrDLogo : FullLogoGrD}
            alt="Toggle Logo"
            className="nav-logo-inner"
          />
        </div>
      </div>

      {!isCollapsed && (
        <div className="nav-right">
          {user ? (
            user.role === 'user' ? (
              <>
                {/* Cart page Navigation */}
                <NavLink to={Pathname('CART_PAGE')} className="nav-item">
                  {({ isActive }) => (
                    <div className={`nav-link-content ${isActive ? 'active' : ''}`}>
                      <div className="nav-icon-wrapper">
                        <img src={CartIcon} alt="Cart Icon" className="nav-icon" />
                      </div>
                      <span className="nav-label oxanium-bold">Cart</span>
                      <div className="nav-underline" />
                    </div>
                  )}
                </NavLink>

                {/* Add tooltip for currency bar */}
                <div className="nav-curency-container ml-2" onClick={() => navigate(Pathname('PAYMENT_PAGE'))}>
                  {/* <div class="nav-curency-digit oxanium-bold">{truncateNumber(`12.000.000.00${(user.wallet_amount / 1000).toFixed(3)}`, 10)} VND</div> */}
                  <div className="nav-curency-digit oxanium-bold">{truncateNumber((user.wallet_amount / 1000).toFixed(3), 10)} VND</div>
                </div>

                {/* Navigation dropdown menu */}
                <NavigationDropdownMenu />
              </>
            ) : user.role === 'moderator' ? (
              <NavLink to={Pathname('MODERATOR_DASHBOARD')} className="nav-item">
                {({ isActive }) => (
                  <div className={`nav-link-content ${isActive ? 'active' : ''}`}>
                    <div className="nav-icon-wrapper">
                      <img src={ToDashboardIcon} alt="Mdt Icon" className="nav-icon" />
                    </div>
                    <span className="nav-label oxanium-bold">Moderator Dashboard</span>
                    <div className="nav-underline" />
                  </div>
                )}
              </NavLink>
            ) : user.role === 'admin' ? (
              <NavLink to={Pathname('ADMIN_DASHBOARD')} className="nav-item">
                {({ isActive }) => (
                  <div className={`nav-link-content ${isActive ? 'active' : ''}`}>
                    <div className="nav-icon-wrapper">
                      <img src={ToDashboardIcon} alt="Ad Icon" className="nav-icon" />
                    </div>
                    <span className="nav-label oxanium-bold">Admin Dashboard</span>
                    <div className="nav-underline" />
                  </div>
                )}
              </NavLink>
            ) : null
          ) : (
            <>
              {/* Login button */}
              <button className="nav-auth-btn oxanium-bold" onClick={() => navigate(Pathname('LOGIN'))}>
                <img src={ProfileIcon} alt="Profile Icon" className="nav-login-icon" />
                Login
              </button>
              {/* Register button */}
              <button className="nav-auth-btn register oxanium-bold" onClick={() => navigate(Pathname('REGISTER'))}>
                <img src={PlusIcon} alt="Profile Icon" className="nav-register-icon" />
                Join the box party
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}
