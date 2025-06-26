import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import './Navigation.css';
import { PATH_NAME, Pathname } from '../../../router/Pathname';
// Importing logos
import FullLogoGrD from '../../../assets/logoSVG/Full_logo-Grdient.svg';
import GrDLogo from '../../../assets/logoSVG/Logo-Grdient.svg';
// Importing icons
import HomeIcon from '../../../assets/Icon_fill/Home_fill.svg';
import ShopIcon from '../../../assets/Icon_fill/Shop.svg';
import AuctionIcon from '../../../assets/Icon_fill/Auction_fill.svg';
import CartIcon from '../../../assets/Icon_fill/Bag_fill.svg';
import PlusIcon from '../../../assets/Icon_line/add-01.svg';
import ProfileIcon from '../../../assets/Icon_line/User_cicrle.svg';
// Importing other assets
import ArrowDropdown from '../../../assets/Icon_fill/Arrow_drop_down.svg';
import Chat from '../../../assets/Icon_fill/comment_fill.svg';
import Notification from '../../../assets/Icon_fill/Bell_fill.svg';
import Setting from '../../../assets/Icon_fill/Setting_fill.svg';
import Logout from '../../../assets/Icon_fill/Sign_out_squre_fill.svg';
import { useSelector, useDispatch } from 'react-redux';
import { setUser } from '../../../redux/features/authSlice';
import { fetchUserInfo } from '../../../services/api.auth';


export default function Navigation() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const navigate = useNavigate();
  const user = useSelector(state => state.auth.user);
  const dispatch = useDispatch();

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
      fetchUserInfo(token).then(res => {
        if (res.status && res.data) {
          dispatch(setUser(res.data));
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
            <div className="nav-profile">
              {/* <img
                src={`https://mmb-be-dotnet.onrender.com/api/ImageProxy/${user.profile_image}`}
                alt="Profile"
                className="nav-profile-img"
              /> */}
              <span className="nav-profile-name oxanium-bold">{user.username}</span>
              <span className="nav-profile-wallet oxanium-bold">Wallet: {user.wallet_amount}₫</span>
            </div>
          ) : (
            <>
              <button className="nav-auth-btn oxanium-bold" onClick={() => navigate(Pathname('LOGIN'))}>
                <img src={ProfileIcon} alt="Profile Icon" className="nav-login-icon" />
                Login
              </button>
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
